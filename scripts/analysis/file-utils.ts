/**
 * File system utilities for safe file operations during code analysis
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface FileOperationResult {
  success: boolean;
  error?: string;
  backupPath?: string;
}

export interface FileStats {
  path: string;
  size: number;
  lineCount: number;
  isDirectory: boolean;
  lastModified: Date;
  extension: string;
}

export class FileUtils {
  private backupDir: string;

  constructor(backupDir: string = '.analysis-backup') {
    this.backupDir = backupDir;
  }

  /**
   * Safely read a file with error handling
   */
  async readFile(filePath: string): Promise<string | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.warn(`Failed to read file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get file statistics including line count
   */
  async getFileStats(filePath: string): Promise<FileStats | null> {
    try {
      const stats = await fs.stat(filePath);
      const content = await this.readFile(filePath);
      const lineCount = content ? content.split('\n').length : 0;
      
      return {
        path: filePath,
        size: stats.size,
        lineCount,
        isDirectory: stats.isDirectory(),
        lastModified: stats.mtime,
        extension: path.extname(filePath)
      };
    } catch (error) {
      console.warn(`Failed to get stats for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Recursively scan directory for files matching patterns
   */
  async scanDirectory(
    dirPath: string,
    options: {
      includePatterns?: string[];
      excludePatterns?: string[];
      maxDepth?: number;
    } = {}
  ): Promise<string[]> {
    const {
      includePatterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      excludePatterns = ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.git/**'],
      maxDepth = 10
    } = options;

    const files: string[] = [];
    
    const scanRecursive = async (currentPath: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;

      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relativePath = path.relative(process.cwd(), fullPath);

          // Check exclude patterns
          if (this.matchesPatterns(relativePath, excludePatterns)) {
            continue;
          }

          if (entry.isDirectory()) {
            await scanRecursive(fullPath, depth + 1);
          } else if (entry.isFile()) {
            // Check include patterns
            if (this.matchesPatterns(relativePath, includePatterns)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${currentPath}:`, error);
      }
    };

    await scanRecursive(dirPath, 0);
    return files;
  }

  /**
   * Create backup of a file before modification
   */
  async createBackup(filePath: string): Promise<FileOperationResult> {
    try {
      await this.ensureDirectoryExists(this.backupDir);
      
      const relativePath = path.relative(process.cwd(), filePath);
      const backupPath = path.join(this.backupDir, relativePath);
      
      await this.ensureDirectoryExists(path.dirname(backupPath));
      await this.copyFile(filePath, backupPath);
      
      return {
        success: true,
        backupPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create backup: ${error}`
      };
    }
  }

  /**
   * Safely copy a file
   */
  async copyFile(source: string, destination: string): Promise<FileOperationResult> {
    try {
      await this.ensureDirectoryExists(path.dirname(destination));
      await pipeline(
        createReadStream(source),
        createWriteStream(destination)
      );
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to copy file: ${error}`
      };
    }
  }

  /**
   * Safely move a file with backup
   */
  async moveFile(source: string, destination: string): Promise<FileOperationResult> {
    try {
      // Create backup first
      const backupResult = await this.createBackup(source);
      if (!backupResult.success) {
        return backupResult;
      }

      // Copy to destination
      const copyResult = await this.copyFile(source, destination);
      if (!copyResult.success) {
        return copyResult;
      }

      // Remove source
      await fs.unlink(source);
      
      return {
        success: true,
        backupPath: backupResult.backupPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to move file: ${error}`
      };
    }
  }

  /**
   * Safely delete a file with backup
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      // Create backup first
      const backupResult = await this.createBackup(filePath);
      if (!backupResult.success) {
        return backupResult;
      }

      // Delete the file
      await fs.unlink(filePath);
      
      return {
        success: true,
        backupPath: backupResult.backupPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete file: ${error}`
      };
    }
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get relative path from project root
   */
  getRelativePath(filePath: string): string {
    return path.relative(process.cwd(), filePath);
  }

  /**
   * Check if path matches any of the given patterns
   */
  private matchesPatterns(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Simple glob pattern matching
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '[^/]')
      );
      return regex.test(filePath);
    });
  }

  /**
   * Count lines in a file, excluding empty lines and comments
   */
  async countEffectiveLines(filePath: string): Promise<number> {
    const content = await this.readFile(filePath);
    if (!content) return 0;

    const lines = content.split('\n');
    let effectiveLines = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (trimmed === '') continue;
      
      // Skip single-line comments
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;
      
      // Skip JSDoc comments
      if (trimmed.startsWith('*') || trimmed.startsWith('/**') || trimmed.startsWith('*/')) continue;
      
      effectiveLines++;
    }

    return effectiveLines;
  }

  /**
   * Extract imports from a TypeScript/JavaScript file
   */
  async extractImports(filePath: string): Promise<string[]> {
    const content = await this.readFile(filePath);
    if (!content) return [];

    const imports: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match import statements
      const importMatch = trimmed.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }

      // Match require statements
      const requireMatch = trimmed.match(/require\(['"]([^'"]+)['"]\)/);
      if (requireMatch) {
        imports.push(requireMatch[1]);
      }
    }

    return imports;
  }

  /**
   * Extract exports from a TypeScript/JavaScript file
   */
  async extractExports(filePath: string): Promise<string[]> {
    const content = await this.readFile(filePath);
    if (!content) return [];

    const exports: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match named exports
      const namedExportMatch = trimmed.match(/^export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/);
      if (namedExportMatch) {
        exports.push(namedExportMatch[1]);
      }

      // Match default exports
      if (trimmed.startsWith('export default')) {
        exports.push('default');
      }

      // Match export statements
      const exportMatch = trimmed.match(/^export\s*\{\s*([^}]+)\s*\}/);
      if (exportMatch) {
        const exportedNames = exportMatch[1].split(',').map(name => name.trim());
        exports.push(...exportedNames);
      }
    }

    return exports;
  }

  /**
   * Clean up backup directory
   */
  async cleanupBackups(): Promise<void> {
    try {
      await fs.rm(this.backupDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup backups:`, error);
    }
  }
}