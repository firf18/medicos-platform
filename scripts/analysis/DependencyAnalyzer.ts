/**
 * DependencyAnalyzer - Analyzes import/export relationships and dependencies
 * 
 * This class provides comprehensive dependency analysis including:
 * - Import/export mapping
 * - Unused import detection
 * - Circular dependency detection
 * - Dependency graph visualization utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileUtils } from './file-utils';
import {
  DependencyAnalysis,
  ImportInfo,
  ExportInfo,
  CircularDependency,
  Issue,
  Recommendation
} from './types';

export interface DependencyConfig {
  /** Maximum depth for circular dependency detection */
  maxCircularDepth: number;
  /** Patterns to exclude from analysis */
  excludePatterns: string[];
  /** Whether to analyze external dependencies */
  includeExternalDeps: boolean;
  /** Threshold for unused import warnings */
  unusedImportThreshold: number;
}

export interface DependencyResult {
  filePath: string;
  analysis: DependencyAnalysis;
  issues: Issue[];
  recommendations: Recommendation[];
  dependencyGraph: DependencyNode;
}

export interface DependencyNode {
  filePath: string;
  imports: string[];
  exports: string[];
  dependencies: DependencyNode[];
  dependents: string[];
}

export interface DependencyReport {
  totalFiles: number;
  totalImports: number;
  totalExports: number;
  unusedImports: number;
  circularDependencies: number;
  results: DependencyResult[];
  dependencyGraph: Map<string, DependencyNode>;
  summary: {
    mostImported: Array<{ file: string; count: number }>;
    mostExporting: Array<{ file: string; count: number }>;
    heaviestFiles: Array<{ file: string; dependencyCount: number }>;
    orphanedFiles: string[];
  };
}

export class DependencyAnalyzer {
  private config: DependencyConfig;
  private dependencyCache: Map<string, DependencyResult> = new Map();
  private globalDependencyGraph: Map<string, DependencyNode> = new Map();

  constructor(config: Partial<DependencyConfig> = {}) {
    this.config = {
      maxCircularDepth: 10,
      excludePatterns: [
        'node_modules',
        '.next',
        'dist',
        'build',
        '.git'
      ],
      includeExternalDeps: false,
      unusedImportThreshold: 0,
      ...config
    };
  }

  /**
   * Analyze dependencies for a single file
   */
  async analyzeFile(filePath: string): Promise<DependencyResult> {
    // Check cache first
    if (this.dependencyCache.has(filePath)) {
      return this.dependencyCache.get(filePath)!;
    }

    try {
      const content = await FileUtils.readFile(filePath);
      const analysis = this.analyzeDependencies(content, filePath);
      const issues = this.identifyIssues(analysis, filePath);
      const recommendations = this.generateRecommendations(analysis, issues, filePath);
      const dependencyGraph = this.buildDependencyNode(filePath, analysis);

      const result: DependencyResult = {
        filePath,
        analysis,
        issues,
        recommendations,
        dependencyGraph
      };

      // Cache the result
      this.dependencyCache.set(filePath, result);
      this.globalDependencyGraph.set(filePath, dependencyGraph);

      return result;
    } catch (error) {
      throw new Error(`Failed to analyze dependencies for ${filePath}: ${error}`);
    }
  }

  /**
   * Analyze dependencies for multiple files
   */
  async analyzeProject(projectPath: string): Promise<DependencyReport> {
    const files = await this.discoverSourceFiles(projectPath);
    const results: DependencyResult[] = [];

    // Analyze each file
    for (const file of files) {
      try {
        const result = await this.analyzeFile(file);
        results.push(result);
      } catch (error) {
        console.warn(`Skipping ${file}: ${error}`);
      }
    }

    // Detect circular dependencies across the project
    const circularDependencies = this.detectCircularDependencies();
    
    // Update results with circular dependency information
    this.updateResultsWithCircularDeps(results, circularDependencies);

    // Generate summary statistics
    const summary = this.generateSummary(results);

    return {
      totalFiles: results.length,
      totalImports: results.reduce((sum, r) => sum + r.analysis.imports.length, 0),
      totalExports: results.reduce((sum, r) => sum + r.analysis.exports.length, 0),
      unusedImports: results.reduce((sum, r) => sum + r.analysis.unusedImports.length, 0),
      circularDependencies: circularDependencies.length,
      results,
      dependencyGraph: this.globalDependencyGraph,
      summary
    };
  }

  /**
   * Parse imports and exports from file content
   */
  private analyzeDependencies(content: string, filePath: string): DependencyAnalysis {
    const imports = this.parseImports(content);
    const exports = this.parseExports(content);
    const unusedImports = this.detectUnusedImports(content, imports);

    return {
      imports,
      exports,
      unusedImports,
      circularDependencies: [] // Will be populated during project analysis
    };
  }

  /**
   * Parse import statements from file content
   */
  private parseImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const lines = content.split('\n');

    // Regular expressions for different import patterns
    const importPatterns = [
      // import { named } from 'module'
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"`]([^'"`]+)['"`]/g,
      // import defaultImport from 'module'
      /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s*['"`]([^'"`]+)['"`]/g,
      // import * as namespace from 'module'
      /import\s*\*\s*as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s*['"`]([^'"`]+)['"`]/g,
      // import 'module' (side effect)
      /import\s*['"`]([^'"`]+)['"`]/g
    ];

    lines.forEach((line, lineNumber) => {
      importPatterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        
        while ((match = regex.exec(line)) !== null) {
          const source = match[match.length - 1]; // Last capture group is always the source
          let importNames: string[] = [];

          if (match.length === 3) {
            // Named imports or default import
            if (match[1].includes(',') || match[1].includes('{')) {
              // Named imports
              importNames = match[1]
                .split(',')
                .map(name => name.trim().replace(/[{}]/g, ''))
                .filter(name => name.length > 0);
            } else {
              // Default import or namespace import
              importNames = [match[1].trim()];
            }
          }

          imports.push({
            source,
            imports: importNames,
            isUsed: true, // Will be determined by usage analysis
            line: lineNumber + 1
          });
        }
      });
    });

    return imports;
  }

  /**
   * Parse export statements from file content
   */
  private parseExports(content: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    const lines = content.split('\n');

    // Regular expressions for different export patterns
    const exportPatterns = [
      // export { named }
      /export\s*\{\s*([^}]+)\s*\}/g,
      // export default
      /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // export const/let/var/function/class
      /export\s+(const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      // export * from 'module'
      /export\s*\*\s*from\s*['"`]([^'"`]+)['"`]/g
    ];

    lines.forEach((line, lineNumber) => {
      exportPatterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        
        while ((match = regex.exec(line)) !== null) {
          if (match[0].includes('default')) {
            exports.push({
              name: match[1] || 'default',
              type: 'default',
              isUsed: false, // Will be determined by usage analysis
              line: lineNumber + 1
            });
          } else if (match[1] && match[2]) {
            // Named export with declaration
            exports.push({
              name: match[2],
              type: 'named',
              isUsed: false,
              line: lineNumber + 1
            });
          } else if (match[1] && match[1].includes(',')) {
            // Multiple named exports
            const names = match[1]
              .split(',')
              .map(name => name.trim().replace(/[{}]/g, ''))
              .filter(name => name.length > 0);
            
            names.forEach(name => {
              exports.push({
                name,
                type: 'named',
                isUsed: false,
                line: lineNumber + 1
              });
            });
          }
        }
      });
    });

    return exports;
  } 
 /**
   * Detect unused imports by analyzing actual usage in the file
   */
  private detectUnusedImports(content: string, imports: ImportInfo[]): string[] {
    conseng
th > this.config.unusedImportThreshold) {
      issues.push({
        type: 'dependency',
        severity: 'medium',
        description: `Found ${analysis.unusedImports.length} unused imports`,
        location: filePath
      });
    }

    // Check for excessive dependencies
    const totalDeps = analysis.imports.length;
    if (totalDeps > 20) {
      issues.push({
        type: 'dependency',
        severity: 'high',
        description: `File has ${totalDeps} dependencies, consider splitting`,
        location: filePath
      });
    } else if (totalDeps > 10) {
      issues.push({
        type: 'dependency',
        severity: 'medium',
        description: `File has ${totalDeps} dependencies, monitor complexity`,
        location: filePath
      });
    }

    // Check for external dependencies in components
    if (filePath.includes('/components/')) {
      const externalDeps = analysis.imports.filter(imp => 
        !imp.source.startsWith('.') && !imp.source.startsWith('/')
      );
      
      if (externalDeps.length > 5) {
        issues.push({
          type: 'dependency',
          severity: 'medium',
          description: `Component has ${externalDeps.length} external dependencies, consider abstraction`,
          location: filePath
        });
      }
    }

    return issues;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    analysis: DependencyAnalysis, 
    issues: Issue[], 
    filePath: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Recommend removing unused imports
    if (analysis.unusedImports.length > 0) {
      recommendations.push({
        type: 'remove',
        priority: 6,
        description: `Remove ${analysis.unusedImports.length} unused imports to clean up dependencies`,
        estimatedEffort: 'low',
        benefits: ['Cleaner code', 'Smaller bundle size', 'Better performance'],
        risks: ['Minimal risk if imports are truly unused']
      });
    }

    // Recommend dependency reduction for heavy files
    const totalDeps = analysis.imports.length;
    if (totalDeps > 15) {
      recommendations.push({
        type: 'refactor',
        priority: 7,
        description: `Consider splitting file or reducing dependencies (currently ${totalDeps})`,
        estimatedEffort: 'medium',
        benefits: ['Better maintainability', 'Reduced coupling', 'Easier testing'],
        risks: ['Requires careful refactoring', 'May need architecture changes']
      });
    }

    // Recommend barrel exports for multiple exports
    if (analysis.exports.length > 5) {
      recommendations.push({
        type: 'refactor',
        priority: 4,
        description: `Consider using barrel exports (index.ts) for ${analysis.exports.length} exports`,
        estimatedEffort: 'low',
        benefits: ['Cleaner imports', 'Better organization', 'Easier refactoring'],
        risks: ['Additional indirection', 'Potential circular dependencies']
      });
    }

    return recommendations;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(results: DependencyResult[]): DependencyReport['summary'] {
    // Count imports per file
    const importCounts = new Map<string, number>();
    const exportCounts = new Map<string, number>();
    const dependencyCounts = new Map<string, number>();

    results.forEach(result => {
      // Count how many times each file is imported
      result.analysis.imports.forEach(imp => {
        const resolvedPath = this.resolveImportPath(imp.source, result.filePath);
        if (resolvedPath) {
          importCounts.set(resolvedPath, (importCounts.get(resolvedPath) || 0) + 1);
        }
      });

      // Count exports per file
      exportCounts.set(result.filePath, result.analysis.exports.length);

      // Count total dependencies per file
      dependencyCounts.set(result.filePath, result.analysis.imports.length);
    });

    // Sort and get top files
    const mostImported = Array.from(importCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));

    const mostExporting = Array.from(exportCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));

    const heaviestFiles = Array.from(dependencyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, dependencyCount]) => ({ file, dependencyCount }));

    // Find orphaned files (no imports, no exports used)
    const orphanedFiles = results
      .filter(result => 
        result.analysis.exports.length === 0 && 
        !importCounts.has(result.filePath)
      )
      .map(result => result.filePath);

    return {
      mostImported,
      mostExporting,
      heaviestFiles,
      orphanedFiles
    };
  }

  /**
   * Generate dependency graph visualization data
   */
  generateVisualizationData(): {
    nodes: Array<{ id: string; label: string; group: string; size: number }>;
    edges: Array<{ from: string; to: string; weight: number }>;
  } {
    const nodes: Array<{ id: string; label: string; group: string; size: number }> = [];
    const edges: Array<{ from: string; to: string; weight: number }> = [];
    const edgeWeights = new Map<string, number>();

    // Create nodes
    for (const [filePath, node] of this.globalDependencyGraph) {
      const fileName = path.basename(filePath);
      const fileType = this.getFileType(filePath);
      
      nodes.push({
        id: filePath,
        label: fileName,
        group: fileType,
        size: node.imports.length + node.exports.length
      });
    }

    // Create edges
    for (const [filePath, node] of this.globalDependencyGraph) {
      node.imports.forEach(importSource => {
        const resolvedPath = this.resolveImportPath(importSource, filePath);
        if (resolvedPath && this.globalDependencyGraph.has(resolvedPath)) {
          const edgeKey = `${filePath}->${resolvedPath}`;
          const weight = (edgeWeights.get(edgeKey) || 0) + 1;
          edgeWeights.set(edgeKey, weight);
        }
      });
    }

    // Convert edge weights to edges array
    for (const [edgeKey, weight] of edgeWeights) {
      const [from, to] = edgeKey.split('->');
      edges.push({ from, to, weight });
    }

    return { nodes, edges };
  }

  /**
   * Get file type for visualization grouping
   */
  private getFileType(filePath: string): string {
    const path = filePath.toLowerCase();
    
    if (path.includes('/components/')) return 'component';
    if (path.includes('/hooks/')) return 'hook';
    if (path.includes('/utils/') || path.includes('/lib/')) return 'utility';
    if (path.includes('/types/')) return 'types';
    if (path.includes('/api/')) return 'api';
    if (path.includes('/pages/') || path.includes('/app/')) return 'page';
    if (path.includes('/test/') || path.includes('/__tests__/')) return 'test';
    
    return 'other';
  }

  /**
   * Export dependency graph as DOT format for Graphviz
   */
  exportToDot(): string {
    let dot = 'digraph Dependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add nodes with colors based on file type
    const colors = {
      component: 'lightblue',
      hook: 'lightgreen',
      utility: 'lightyellow',
      types: 'lightpink',
      api: 'lightcoral',
      page: 'lightgray',
      test: 'lightsteelblue',
      other: 'white'
    };

    for (const [filePath, node] of this.globalDependencyGraph) {
      const fileName = path.basename(filePath);
      const fileType = this.getFileType(filePath);
      const color = colors[fileType as keyof typeof colors] || colors.other;
      
      dot += `  "${filePath}" [label="${fileName}", fillcolor="${color}", style="filled"];\n`;
    }

    dot += '\n';

    // Add edges
    for (const [filePath, node] of this.globalDependencyGraph) {
      node.imports.forEach(importSource => {
        const resolvedPath = this.resolveImportPath(importSource, filePath);
        if (resolvedPath && this.globalDependencyGraph.has(resolvedPath)) {
          dot += `  "${filePath}" -> "${resolvedPath}";\n`;
        }
      });
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.dependencyCache.clear();
    this.globalDependencyGraph.clear();
  }

  /**
   * Get cached results
   */
  getCachedResults(): Map<string, DependencyResult> {
    return new Map(this.dependencyCache);
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph(): Map<string, DependencyNode> {
    return new Map(this.globalDependencyGraph);
  }
}

// Export default configuration
export const DEFAULT_DEPENDENCY_CONFIG: DependencyConfig = {
  maxCircularDepth: 10,
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '.git',
    'coverage'
  ],
  includeExternalDeps: false,
  unusedImportThreshold: 0
};