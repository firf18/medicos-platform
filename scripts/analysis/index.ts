/**
 * Main entry point for code analysis infrastructure
 * Exports all core utilities and types for the analysis system
 */

// Export all types
export * from './types';

// Export file utilities
export { FileUtils } from './file-utils';
export type { FileOperationResult, FileStats } from './file-utils';

// Export analyzers
export { FileSizeAnalyzer } from './FileSizeAnalyzer';
export type { FileSizeConfig, FileSizeResult, FileSizeReport } from './FileSizeAnalyzer';

export { ResponsibilityAnalyzer } from './ResponsibilityAnalyzer';
export type { 
  ResponsibilityConfig, 
  ResponsibilityResult, 
  ResponsibilityReport 
} from './ResponsibilityAnalyzer';

// DependencyAnalyzer removed due to corruption - can be recreated if needed

// Export analysis configuration
export const DEFAULT_ANALYSIS_CONFIG = {
  maxFileSize: 400, // lines
  excludePatterns: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/.analysis-backup/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.map'
  ],
  includePatterns: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx'
  ],
  thresholds: {
    lineCount: 400,
    responsibilityCount: 3,
    dependencyCount: 20
  }
};

// Export utility functions
export const AnalysisUtils = {
  /**
   * Check if a file should be analyzed based on patterns
   */
  shouldAnalyzeFile(filePath: string, config = DEFAULT_ANALYSIS_CONFIG): boolean {
    const { includePatterns, excludePatterns } = config;
    
    // Check exclude patterns first
    for (const pattern of excludePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return false;
      }
    }
    
    // Check include patterns
    for (const pattern of includePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return true;
      }
    }
    
    return false;
  },

  /**
   * Simple glob pattern matching
   */
  matchesPattern(filePath: string, pattern: string): boolean {
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
        .replace(/\./g, '\\.')
    );
    return regex.test(filePath);
  },

  /**
   * Get file category based on path and content
   */
  getFileCategory(filePath: string): string {
    const path = filePath.toLowerCase();
    
    if (path.includes('/components/')) return 'component';
    if (path.includes('/hooks/')) return 'hook';
    if (path.includes('/utils/') || path.includes('/lib/')) return 'utility';
    if (path.includes('/types/')) return 'types';
    if (path.includes('/api/')) return 'api';
    if (path.includes('/pages/') || path.includes('/app/')) return 'page';
    if (path.includes('/styles/')) return 'styles';
    if (path.includes('/test/') || path.includes('/__tests__/')) return 'test';
    if (path.includes('/config/')) return 'config';
    
    return 'other';
  },

  /**
   * Estimate complexity based on file characteristics
   */
  estimateComplexity(lineCount: number, dependencyCount: number, responsibilityCount: number): 'low' | 'medium' | 'high' {
    const complexityScore = (lineCount / 100) + (dependencyCount / 5) + (responsibilityCount * 2);
    
    if (complexityScore < 3) return 'low';
    if (complexityScore < 8) return 'medium';
    return 'high';
  },

  /**
   * Generate unique identifier for analysis results
   */
  generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  /**
   * Calculate priority score for recommendations
   */
  calculatePriority(
    impact: 'low' | 'medium' | 'high',
    effort: 'low' | 'medium' | 'high',
    risk: 'low' | 'medium' | 'high'
  ): number {
    const impactScore = { low: 1, medium: 3, high: 5 }[impact];
    const effortScore = { low: 1, medium: 2, high: 3 }[effort];
    const riskScore = { low: 1, medium: 2, high: 3 }[risk];
    
    // Higher impact, lower effort, lower risk = higher priority
    return (impactScore * 2) - effortScore - (riskScore * 0.5);
  }
};

// Export version information
export const ANALYSIS_VERSION = '1.0.0';
export const ANALYSIS_TIMESTAMP = new Date().toISOString();