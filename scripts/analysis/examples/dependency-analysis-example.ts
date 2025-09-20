/**
 * Example usage of DependencyAnalyzer
 * 
 * This example demonstrates how to use the DependencyAnalyzer to:
 * - Analyze dependencies in a single file
 * - Analyze dependencies across an entire project
 * - Generate dependency visualization data
 * - Export dependency graph in DOT format
 * - Detect circular dependencies and unused imports
 */

import * as path from 'path';
import * as fs from 'fs';
import { DependencyAnalyzer, DependencyConfig } from '../DependencyAnalyzer';

async function runDependencyAnalysisExample() {
  console.log('🔍 Dependency Analysis Example\n');

  // Configure the analyzer
  const config: Partial<DependencyConfig> = {
    maxCircularDepth: 10,
    excludePatterns: [
      'node_modules',
      '.next',
      'dist',
      'build',
      '.git',
      'coverage',
      '__tests__'
    ],
    includeExternalDeps: false,
    unusedImportThreshold: 0
  };

  const analyzer = new DependencyAnalyzer(config);

  try {
    // Example 1: Analyze a single file
    console.log('📄 Analyzing single file...');
    const singleFileResult = await analyzer.analyzeFile('src/components/ui/Button.tsx');
    
    console.log(`File: ${singleFileResult.filePath}`);
    console.log(`Imports: ${singleFileResult.analysis.imports.length}`);
    console.log(`Exports: ${singleFileResult.analysis.exports.length}`);
    console.log(`Unused imports: ${singleFileResult.analysis.unusedImports.length}`);
    console.log(`Issues: ${singleFileResult.issues.length}`);
    console.log(`Recommendations: ${singleFileResult.recommendations.length}\n`);

    // Show detailed import information
    if (singleFileResult.analysis.imports.length > 0) {
      console.log('📥 Imports:');
      singleFileResult.analysis.imports.forEach(imp => {
        console.log(`  - ${imp.imports.join(', ')} from '${imp.source}' (line ${imp.line})`);
      });
      console.log();
    }

    // Show unused imports
    if (singleFileResult.analysis.unusedImports.length > 0) {
      console.log('⚠️  Unused imports:');
      singleFileResult.analysis.unusedImports.forEach(unused => {
        console.log(`  - ${unused}`);
      });
      console.log();
    }

    // Show issues
    if (singleFileResult.issues.length > 0) {
      console.log('🚨 Issues:');
      singleFileResult.issues.forEach(issue => {
        console.log(`  - [${issue.severity.toUpperCase()}] ${issue.description}`);
      });
      console.log();
    }

    // Show recommendations
    if (singleFileResult.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      singleFileResult.recommendations.forEach(rec => {
        console.log(`  - [${rec.type.toUpperCase()}] ${rec.description}`);
        console.log(`    Effort: ${rec.estimatedEffort}, Priority: ${rec.priority}`);
      });
      console.log();
    }

    // Example 2: Analyze entire project
    console.log('📁 Analyzing entire project...');
    const projectReport = await analyzer.analyzeProject('src');
    
    console.log(`Total files analyzed: ${projectReport.totalFiles}`);
    console.log(`Total imports: ${projectReport.totalImports}`);
    console.log(`Total exports: ${projectReport.totalExports}`);
    console.log(`Unused imports: ${projectReport.unusedImports}`);
    console.log(`Circular dependencies: ${projectReport.circularDependencies}\n`);

    // Show summary statistics
    console.log('📊 Summary Statistics:');
    
    if (projectReport.summary.mostImported.length > 0) {
      console.log('Most imported files:');
      projectReport.summary.mostImported.slice(0, 5).forEach(item => {
        const fileName = path.basename(item.file);
        console.log(`  - ${fileName}: ${item.count} imports`);
      });
      console.log();
    }

    if (projectReport.summary.mostExporting.length > 0) {
      console.log('Files with most exports:');
      projectReport.summary.mostExporting.slice(0, 5).forEach(item => {
        const fileName = path.basename(item.file);
        console.log(`  - ${fileName}: ${item.count} exports`);
      });
      console.log();
    }

    if (projectReport.summary.heaviestFiles.length > 0) {
      console.log('Files with most dependencies:');
      projectReport.summary.heaviestFiles.slice(0, 5).forEach(item => {
        const fileName = path.basename(item.file);
        console.log(`  - ${fileName}: ${item.dependencyCount} dependencies`);
      });
      console.log();
    }

    if (projectReport.summary.orphanedFiles.length > 0) {
      console.log('⚠️  Orphaned files (no imports/exports):');
      projectReport.summary.orphanedFiles.slice(0, 5).forEach(file => {
        const fileName = path.basename(file);
        console.log(`  - ${fileName}`);
      });
      console.log();
    }

    // Show circular dependencies
    if (projectReport.circularDependencies > 0) {
      console.log('🔄 Circular Dependencies:');
      projectReport.results.forEach(result => {
        result.analysis.circularDependencies.forEach(circular => {
          console.log(`  - ${circular.description}`);
        });
      });
      console.log();
    }

    // Example 3: Generate visualization data
    console.log('📈 Generating visualization data...');
    const vizData = analyzer.generateVisualizationData();
    
    console.log(`Nodes: ${vizData.nodes.length}`);
    console.log(`Edges: ${vizData.edges.length}`);
    
    // Show node distribution by type
    const nodesByType = vizData.nodes.reduce((acc, node) => {
      acc[node.group] = (acc[node.group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Node distribution by type:');
    Object.entries(nodesByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} files`);
    });
    console.log();

    // Example 4: Export to DOT format
    console.log('📄 Exporting dependency graph to DOT format...');
    const dotOutput = analyzer.exportToDot();
    
    // Save to file
    const outputPath = path.join(process.cwd(), 'dependency-graph.dot');
    await fs.promises.writeFile(outputPath, dotOutput);
    console.log(`Dependency graph exported to: ${outputPath}`);
    console.log('You can visualize this with Graphviz: dot -Tpng dependency-graph.dot -o dependency-graph.png\n');

    // Example 5: Show detailed analysis for problematic files
    console.log('🔍 Detailed analysis for files with issues...');
    const problematicFiles = projectReport.results.filter(result => 
      result.issues.length > 0 || result.recommendations.length > 0
    );

    if (problematicFiles.length > 0) {
      console.log(`Found ${problematicFiles.length} files with issues or recommendations:`);
      
      problematicFiles.slice(0, 3).forEach(result => {
        const fileName = path.basename(result.filePath);
        console.log(`\n📄 ${fileName}:`);
        
        if (result.issues.length > 0) {
          console.log('  Issues:');
          result.issues.forEach(issue => {
            console.log(`    - [${issue.severity.toUpperCase()}] ${issue.description}`);
          });
        }
        
        if (result.recommendations.length > 0) {
          console.log('  Recommendations:');
          result.recommendations.forEach(rec => {
            console.log(`    - [${rec.type.toUpperCase()}] ${rec.description}`);
          });
        }
      });
    } else {
      console.log('✅ No files with issues found!');
    }

    // Example 6: Cache management
    console.log('\n💾 Cache management...');
    const cachedResults = analyzer.getCachedResults();
    console.log(`Cached results: ${cachedResults.size} files`);
    
    // Clear cache
    analyzer.clearCache();
    console.log('Cache cleared');

  } catch (error) {
    console.error('❌ Error during dependency analysis:', error);
  }
}

// Helper function to create a sample project structure for testing
async function createSampleProject() {
  const sampleFiles = {
    'src/components/Button.tsx': `
import React from 'react';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/types/ui';

export const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button className={cn('btn', className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
    `,
    'src/components/Input.tsx': `
import React from 'react';
import { cn } from '@/lib/utils';
import { InputProps } from '@/types/ui';

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return <input className={cn('input', className)} {...props} />;
};
    `,
    'src/lib/utils.ts': `
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// Unused export
export const unusedFunction = () => {
  console.log('This function is never used');
};
    `,
    'src/types/ui.ts': `
export interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface InputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
    `,
    'src/hooks/useCounter.ts': `
import { useState, useCallback } from 'react';

export const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
};
    `
  };

  // Create directories and files
  for (const [filePath, content] of Object.entries(sampleFiles)) {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    await fs.promises.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.promises.writeFile(fullPath, content.trim());
  }

  console.log('📁 Sample project structure created');
}

// Run the example
if (require.main === module) {
  runDependencyAnalysisExample().catch(console.error);
}

export { runDependencyAnalysisExample, createSampleProject };