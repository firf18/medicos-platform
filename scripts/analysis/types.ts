/**
 * TypeScript interfaces for code analysis results and recommendations
 */

// Core analysis result types
export interface FileAnalysisResult {
  filePath: string;
  size: {
    lineCount: number;
    exceedsThreshold: boolean;
  };
  responsibilities: {
    count: number;
    descriptions: string[];
    needsSeparation: boolean;
  };
  dependencies: {
    imports: string[];
    exports: string[];
    unusedImports: string[];
    circularDependencies: string[];
  };
  issues: Issue[];
  recommendations: Recommendation[];
}

export interface Issue {
  type: 'size' | 'responsibility' | 'dependency' | 'structure';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
}

export interface Recommendation {
  type: 'split' | 'move' | 'remove' | 'refactor';
  priority: number;
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  benefits: string[];
  risks: string[];
}

// Size analysis interfaces
export interface SizeAnalysis {
  lineCount: number;
  exceedsThreshold: boolean;
  splitSuggestions: SplitStrategy[];
}

export interface SplitStrategy {
  type: 'component' | 'utility' | 'type' | 'hook';
  targetFiles: string[];
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

// Responsibility analysis interfaces
export interface ResponsibilityAnalysis {
  responsibilities: string[];
  hasMultipleResponsibilities: boolean;
  separationSuggestions: SeparationStrategy[];
}

export interface SeparationStrategy {
  type: 'domain' | 'layer' | 'feature';
  targetFiles: string[];
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

// Dependency analysis interfaces
export interface DependencyAnalysis {
  imports: ImportInfo[];
  exports: ExportInfo[];
  unusedImports: string[];
  circularDependencies: CircularDependency[];
}

export interface ImportInfo {
  source: string;
  imports: string[];
  isUsed: boolean;
  line: number;
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  isUsed: boolean;
  line: number;
}

export interface CircularDependency {
  files: string[];
  description: string;
}

// Structure analysis interfaces
export interface StructureAnalysis {
  followsConventions: boolean;
  issues: StructureIssue[];
  recommendations: StructureRecommendation[];
}

export interface StructureIssue {
  type: 'misplaced' | 'naming' | 'organization';
  description: string;
  filePath: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StructureRecommendation {
  type: 'move' | 'rename' | 'reorganize';
  description: string;
  targetPath?: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

// Directory analysis interfaces
export interface MisplacedFile {
  currentPath: string;
  suggestedPath: string;
  reason: string;
  confidence: number;
}

export interface DuplicateFile {
  files: string[];
  similarity: number;
  consolidationSuggestion: string;
}

// Reorganization planning interfaces
export interface ReorganizationPlan {
  filesToSplit: FileSplitPlan[];
  filesToMove: FileMovePlan[];
  filesToRemove: FileRemovalPlan[];
  directoriesToCreate: DirectoryCreationPlan[];
}

export interface FileSplitPlan {
  sourceFile: string;
  targetFiles: string[];
  strategy: SplitStrategy;
  priority: number;
}

export interface FileMovePlan {
  sourceFile: string;
  targetFile: string;
  reason: string;
  priority: number;
}

export interface FileRemovalPlan {
  file: string;
  reason: string;
  safetyChecks: string[];
  priority: number;
}

export interface DirectoryCreationPlan {
  path: string;
  purpose: string;
  priority: number;
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'breaking_change' | 'compilation_error' | 'import_resolution';
  description: string;
  affectedFiles: string[];
}

export interface ValidationWarning {
  type: 'potential_issue' | 'performance' | 'maintainability';
  description: string;
  affectedFiles: string[];
}

// Analysis configuration
export interface AnalysisConfig {
  maxFileSize: number;
  excludePatterns: string[];
  includePatterns: string[];
  thresholds: {
    lineCount: number;
    responsibilityCount: number;
    dependencyCount: number;
  };
}

// Progress reporting
export interface AnalysisProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  phase: 'discovery' | 'analysis' | 'planning' | 'validation';
  startTime: Date;
  estimatedCompletion?: Date;
}