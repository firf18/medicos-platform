/**
 * FileSizeAnalyzer - Analyzes file sizes and identifies oversized files
 * Implements line counting logic that excludes comments and empty lines
 */

import { FileUtils } from './file-utils';
import { SizeAnalysis, SplitStrategy, AnalysisConfig } from './types';

export interface FileSizeConfig {
  threshold: number;
  excludeComments: boolean;
  excludeEmptyLines: boolean;
  excludeImports: boolean;
}

export class FileSizeAnalyzer {
  private fileUtils: FileUtils;
  private config: FileSizeConfig;

  constructor(
    config: Partial<FileSizeConfig> = {},
    fileUtils?: FileUtils
  ) {
    this.fileUtils = fileUtils || new FileUtils();
    this.config = {
      threshold: 400,
      excludeComments: true,
      excludeEmptyLines: true,
      excludeImports: false,
      ...config
    };
  }

  /**
   * Analyze a single file for size issues
   */
  async analyzeFile(filePath: string): Promise<SizeAnalysis> {
    const content = await this.fileUtils.readFile(filePath);
    if (!content) {
      return {
        lineCount: 0,
        exceedsThreshold: false,
        splitSuggestions: []
      };
    }

    const lineCount = this.countEffectiveLines(content);
    const exceedsThreshold = lineCount > this.config.threshold;
    const splitSuggestions = exceedsThreshold 
      ? await this.generateSplitSuggestions(filePath, content, lineCount)
      : [];

    return {
      lineCount,
      exceedsThreshold,
      splitSuggestions
    };
  }

  /**
   * Count effective lines excluding comments, empty lines, and optionally imports
   */
  private countEffectiveLines(content: string): number {
    const lines = content.split('\n');
    let effectiveLines = 0;
    let inMultiLineComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (this.config.excludeEmptyLines && trimmed === '') {
        continue;
      }

      // Handle multi-line comments
      if (this.config.excludeComments) {
        // Check for start of multi-line comment
        if (trimmed.includes('/*') && !inMultiLineComment) {
          // Check if there's code before the comment
          const beforeComment = trimmed.split('/*')[0]?.trim();
          if (beforeComment && beforeComment !== '') {
            effectiveLines++;
          }
          
          inMultiLineComment = true;
          // If comment starts and ends on same line
          if (trimmed.includes('*/')) {
            inMultiLineComment = false;
            // Check if there's code after the comment
            const afterComment = trimmed.split('*/').pop()?.trim();
            if (afterComment && afterComment !== '') {
              effectiveLines++;
            }
          }
          continue;
        }

        // Check for end of multi-line comment
        if (inMultiLineComment) {
          if (trimmed.includes('*/')) {
            inMultiLineComment = false;
            // Check if there's code after the comment
            const afterComment = trimmed.split('*/').pop()?.trim();
            if (afterComment && afterComment !== '') {
              effectiveLines++;
            }
          }
          continue;
        }

        // Skip single-line comments
        if (trimmed.startsWith('//') || 
            trimmed.startsWith('#') ||
            trimmed.startsWith('*') ||
            trimmed.startsWith('/**') ||
            trimmed.startsWith('*/')) {
          continue;
        }
      }

      // Skip imports if configured
      if (this.config.excludeImports) {
        if (trimmed.startsWith('import ') || 
            trimmed.match(/^(const|let|var)\s+.*=\s*require\(/)) {
          continue;
        }
        // Skip export statements that are just re-exports
        if (trimmed.startsWith('export ') && !trimmed.includes('=') && !trimmed.includes('const') && !trimmed.includes('function')) {
          continue;
        }
      }

      effectiveLines++;
    }

    return effectiveLines;
  }

  /**
   * Generate split suggestions for oversized files
   */
  private async generateSplitSuggestions(
    filePath: string, 
    content: string, 
    lineCount: number
  ): Promise<SplitStrategy[]> {
    const suggestions: SplitStrategy[] = [];
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    
    // Analyze file content to determine split strategies
    if (fileExtension === 'tsx' || fileExtension === 'jsx') {
      suggestions.push(...this.generateReactComponentSplits(filePath, content));
    }
    
    if (fileExtension === 'ts' || fileExtension === 'js') {
      suggestions.push(...this.generateUtilitySplits(filePath, content));
    }

    // Always suggest type extraction for TypeScript files
    if (fileExtension === 'ts' || fileExtension === 'tsx') {
      const typeSplit = this.generateTypeSplit(filePath, content);
      if (typeSplit) {
        suggestions.push(typeSplit);
      }
    }

    // If no specific suggestions, provide generic split
    if (suggestions.length === 0) {
      suggestions.push(this.generateGenericSplit(filePath, lineCount));
    }

    return suggestions;
  }

  /**
   * Generate split suggestions for React components
   */
  private generateReactComponentSplits(filePath: string, content: string): SplitStrategy[] {
    const suggestions: SplitStrategy[] = [];
    
    // Look for multiple component definitions
    const componentMatches = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:\(|=)/g);
    if (componentMatches && componentMatches.length > 1) {
      const baseName = filePath.replace(/\.(tsx|jsx)$/, '');
      const targetFiles = componentMatches.map((_, index) => 
        `${baseName}-${index + 1}.${filePath.split('.').pop()}`
      );

      suggestions.push({
        type: 'component',
        targetFiles,
        description: `Split into ${componentMatches.length} separate component files`,
        estimatedEffort: componentMatches.length > 3 ? 'high' : 'medium'
      });
    }

    // Look for custom hooks that could be extracted
    const hookMatches = content.match(/const\s+(use[A-Z][a-zA-Z0-9]*)\s*=/g);
    if (hookMatches && hookMatches.length > 0) {
      const hooksDir = filePath.replace(/\/[^/]+$/, '/hooks');
      const targetFiles = hookMatches.map(match => {
        const hookName = match.match(/use[A-Z][a-zA-Z0-9]*/)?.[0] || 'useHook';
        return `${hooksDir}/${hookName}.ts`;
      });

      suggestions.push({
        type: 'hook',
        targetFiles,
        description: `Extract ${hookMatches.length} custom hooks to separate files`,
        estimatedEffort: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Generate split suggestions for utility files
   */
  private generateUtilitySplits(filePath: string, content: string): SplitStrategy[] {
    const suggestions: SplitStrategy[] = [];
    
    // Look for multiple function exports
    const functionMatches = content.match(/export\s+(?:function|const)\s+([a-zA-Z][a-zA-Z0-9]*)/g);
    if (functionMatches && functionMatches.length > 5) {
      const baseName = filePath.replace(/\.(ts|js)$/, '');
      const targetFiles = [
        `${baseName}-core.${filePath.split('.').pop()}`,
        `${baseName}-helpers.${filePath.split('.').pop()}`
      ];

      suggestions.push({
        type: 'utility',
        targetFiles,
        description: `Split ${functionMatches.length} utility functions into focused modules`,
        estimatedEffort: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Generate type extraction suggestion
   */
  private generateTypeSplit(filePath: string, content: string): SplitStrategy | null {
    const typeMatches = content.match(/(?:interface|type|enum)\s+[A-Z][a-zA-Z0-9]*/g);
    
    if (typeMatches && typeMatches.length > 3) {
      const baseName = filePath.replace(/\.(ts|tsx)$/, '');
      const targetFile = `${baseName}.types.ts`;

      return {
        type: 'type',
        targetFiles: [targetFile],
        description: `Extract ${typeMatches.length} type definitions to separate types file`,
        estimatedEffort: 'low'
      };
    }

    return null;
  }

  /**
   * Generate generic split suggestion
   */
  private generateGenericSplit(filePath: string, lineCount: number): SplitStrategy {
    const baseName = filePath.replace(/\.[^.]+$/, '');
    const extension = filePath.split('.').pop();
    const suggestedParts = Math.ceil(lineCount / this.config.threshold);
    
    const targetFiles = Array.from({ length: suggestedParts }, (_, index) => 
      `${baseName}-part${index + 1}.${extension}`
    );

    return {
      type: 'utility',
      targetFiles,
      description: `Split large file (${lineCount} lines) into ${suggestedParts} smaller files`,
      estimatedEffort: lineCount > 800 ? 'high' : 'medium'
    };
  }

  /**
   * Analyze multiple files and generate a summary report
   */
  async analyzeFiles(filePaths: string[]): Promise<FileSizeReport> {
    const results: FileSizeResult[] = [];
    let totalFiles = 0;
    let oversizedFiles = 0;
    let totalLines = 0;
    let totalSuggestions = 0;

    for (const filePath of filePaths) {
      const analysis = await this.analyzeFile(filePath);
      const result: FileSizeResult = {
        filePath,
        ...analysis
      };
      
      results.push(result);
      totalFiles++;
      totalLines += analysis.lineCount;
      
      if (analysis.exceedsThreshold) {
        oversizedFiles++;
        totalSuggestions += analysis.splitSuggestions.length;
      }
    }

    return {
      results,
      summary: {
        totalFiles,
        oversizedFiles,
        averageFileSize: Math.round(totalLines / totalFiles),
        totalSuggestions,
        threshold: this.config.threshold
      }
    };
  }

  /**
   * Get configuration
   */
  getConfig(): FileSizeConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FileSizeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export interface FileSizeResult {
  filePath: string;
  lineCount: number;
  exceedsThreshold: boolean;
  splitSuggestions: SplitStrategy[];
}

export interface FileSizeReport {
  results: FileSizeResult[];
  summary: {
    totalFiles: number;
    oversizedFiles: number;
    averageFileSize: number;
    totalSuggestions: number;
    threshold: number;
  };
}