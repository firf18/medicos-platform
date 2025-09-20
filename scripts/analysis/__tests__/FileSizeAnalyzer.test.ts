/**
 * Unit tests for FileSizeAnalyzer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileSizeAnalyzer } from '../FileSizeAnalyzer';
import { FileUtils } from '../file-utils';

// Mock FileUtils
vi.mock('../file-utils');

describe('FileSizeAnalyzer', () => {
  let analyzer: FileSizeAnalyzer;
  let mockFileUtils: vi.Mocked<FileUtils>;

  beforeEach(() => {
    mockFileUtils = {
      readFile: vi.fn(),
    } as any;
    
    analyzer = new FileSizeAnalyzer({}, mockFileUtils);
  });

  describe('analyzeFile', () => {
    it('should return zero line count for non-existent file', async () => {
      mockFileUtils.readFile.mockResolvedValue(null);

      const result = await analyzer.analyzeFile('non-existent.ts');

      expect(result).toEqual({
        lineCount: 0,
        exceedsThreshold: false,
        splitSuggestions: []
      });
    });

    it('should count effective lines excluding comments and empty lines', async () => {
      const content = `
// This is a comment
import React from 'react';

/**
 * Multi-line comment
 * should be excluded
 */
export const Component = () => {
  // Another comment
  const value = 'test';
  
  return <div>{value}</div>;
};

/* Single line comment */
export default Component;
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('test.tsx');

      // Should count: import, export const, const value, return, export default, closing brace = 6 lines
      expect(result.lineCount).toBe(6);
      expect(result.exceedsThreshold).toBe(false);
    });

    it('should identify files exceeding threshold', async () => {
      // Create content with more than 400 lines
      const lines = Array.from({ length: 450 }, (_, i) => `const line${i} = ${i};`);
      const content = lines.join('\n');

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('large-file.ts');

      expect(result.lineCount).toBe(450);
      expect(result.exceedsThreshold).toBe(true);
      expect(result.splitSuggestions.length).toBeGreaterThan(0);
    });

    it('should handle multi-line comments correctly', async () => {
      const content = `
const before = 'code';
/*
This is a multi-line comment
that spans multiple lines
and should be excluded
*/
const after = 'more code';
/* inline comment */ const inline = 'test';
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('test.ts');

      // Should count: const before, const after, const inline = 3 lines
      expect(result.lineCount).toBe(3);
    });

    it('should exclude imports when configured', async () => {
      const analyzer = new FileSizeAnalyzer({ 
        excludeImports: true 
      }, mockFileUtils);

      const content = `
import React from 'react';
import { useState } from 'react';
const Component = require('./Component');

const value = 'test';
export const MyComponent = () => value;
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('test.tsx');

      // Should count: const value, export const = 2 lines (imports excluded, but export const is kept)
      expect(result.lineCount).toBe(2);
    });
  });

  describe('split suggestions', () => {
    it('should suggest component splits for React files with multiple components', async () => {
      const content = `
export const ComponentA = () => <div>A</div>;
export const ComponentB = () => <div>B</div>;
export const ComponentC = () => <div>C</div>;
${Array.from({ length: 450 }, (_, i) => `const line${i} = ${i};`).join('\n')}
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('components.tsx');

      expect(result.exceedsThreshold).toBe(true);
      const componentSplit = result.splitSuggestions.find(s => s.type === 'component');
      expect(componentSplit).toBeDefined();
      expect(componentSplit?.targetFiles.length).toBeGreaterThan(1);
    });

    it('should suggest hook extraction for files with custom hooks', async () => {
      const content = `
const useCustomHook = () => useState(null);
const useAnotherHook = () => useEffect(() => {}, []);
${Array.from({ length: 450 }, (_, i) => `const line${i} = ${i};`).join('\n')}
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('hooks.tsx');

      expect(result.exceedsThreshold).toBe(true);
      const hookSplit = result.splitSuggestions.find(s => s.type === 'hook');
      expect(hookSplit).toBeDefined();
      expect(hookSplit?.targetFiles.length).toBe(2);
    });

    it('should suggest utility splits for files with many functions', async () => {
      const content = `
export function utilA() { return 'a'; }
export function utilB() { return 'b'; }
export function utilC() { return 'c'; }
export function utilD() { return 'd'; }
export function utilE() { return 'e'; }
export function utilF() { return 'f'; }
${Array.from({ length: 450 }, (_, i) => `const line${i} = ${i};`).join('\n')}
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('utils.ts');

      expect(result.exceedsThreshold).toBe(true);
      const utilitySplit = result.splitSuggestions.find(s => s.type === 'utility');
      expect(utilitySplit).toBeDefined();
    });

    it('should suggest type extraction for TypeScript files with many types', async () => {
      const content = `
interface TypeA { a: string; }
interface TypeB { b: number; }
interface TypeC { c: boolean; }
interface TypeD { d: object; }
type TypeE = string | number;
enum TypeF { A, B, C }
${Array.from({ length: 450 }, (_, i) => `const line${i} = ${i};`).join('\n')}
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('types.ts');

      expect(result.exceedsThreshold).toBe(true);
      const typeSplit = result.splitSuggestions.find(s => s.type === 'type');
      expect(typeSplit).toBeDefined();
      expect(typeSplit?.targetFiles[0]).toContain('.types.ts');
    });

    it('should provide generic split for files without specific patterns', async () => {
      const content = Array.from({ length: 450 }, (_, i) => `const line${i} = ${i};`).join('\n');

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('generic.ts');

      expect(result.exceedsThreshold).toBe(true);
      expect(result.splitSuggestions.length).toBeGreaterThan(0);
      
      const genericSplit = result.splitSuggestions[0];
      expect(genericSplit.targetFiles.length).toBeGreaterThan(1);
      expect(genericSplit.description).toContain('450 lines');
    });
  });

  describe('analyzeFiles', () => {
    it('should analyze multiple files and generate summary report', async () => {
      const files = ['file1.ts', 'file2.ts', 'file3.ts'];
      const contents = [
        Array.from({ length: 100 }, (_, i) => `const line${i} = ${i};`).join('\n'),
        Array.from({ length: 500 }, (_, i) => `const line${i} = ${i};`).join('\n'),
        Array.from({ length: 200 }, (_, i) => `const line${i} = ${i};`).join('\n')
      ];

      mockFileUtils.readFile
        .mockResolvedValueOnce(contents[0])
        .mockResolvedValueOnce(contents[1])
        .mockResolvedValueOnce(contents[2]);

      const report = await analyzer.analyzeFiles(files);

      expect(report.results).toHaveLength(3);
      expect(report.summary.totalFiles).toBe(3);
      expect(report.summary.oversizedFiles).toBe(1); // Only file2.ts exceeds 400 lines
      expect(report.summary.averageFileSize).toBe(Math.round((100 + 500 + 200) / 3));
      expect(report.summary.threshold).toBe(400);
    });
  });

  describe('configuration', () => {
    it('should use custom threshold', async () => {
      const customAnalyzer = new FileSizeAnalyzer({ 
        threshold: 100 
      }, mockFileUtils);

      const content = Array.from({ length: 150 }, (_, i) => `const line${i} = ${i};`).join('\n');
      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await customAnalyzer.analyzeFile('test.ts');

      expect(result.exceedsThreshold).toBe(true);
    });

    it('should allow configuration updates', () => {
      const initialConfig = analyzer.getConfig();
      expect(initialConfig.threshold).toBe(400);

      analyzer.updateConfig({ threshold: 300 });
      
      const updatedConfig = analyzer.getConfig();
      expect(updatedConfig.threshold).toBe(300);
    });

    it('should include comments when excludeComments is false', async () => {
      const analyzer = new FileSizeAnalyzer({ 
        excludeComments: false 
      }, mockFileUtils);

      const content = `
// This comment should be counted
const value = 'test';
/* This comment should also be counted */
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('test.ts');

      // Should count all non-empty lines including comments
      expect(result.lineCount).toBe(3);
    });

    it('should include empty lines when excludeEmptyLines is false', async () => {
      const analyzer = new FileSizeAnalyzer({ 
        excludeEmptyLines: false 
      }, mockFileUtils);

      const content = `
const value = 'test';

const another = 'value';

`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('test.ts');

      // Should count empty lines too
      expect(result.lineCount).toBeGreaterThan(2);
    });
  });

  describe('edge cases', () => {
    it('should handle files with only comments', async () => {
      const content = `
// Only comments here
/* 
 * More comments
 */
// And more comments
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('comments-only.ts');

      expect(result.lineCount).toBe(0);
      expect(result.exceedsThreshold).toBe(false);
    });

    it('should handle empty files', async () => {
      mockFileUtils.readFile.mockResolvedValue('');

      const result = await analyzer.analyzeFile('empty.ts');

      expect(result.lineCount).toBe(0);
      expect(result.exceedsThreshold).toBe(false);
    });

    it('should handle files with mixed comment styles', async () => {
      const content = `
// Single line comment
const value = 'test'; // Inline comment
/*
 * Multi-line comment
 */
const another = 'value'; /* inline block comment */
/**
 * JSDoc comment
 * @param test
 */
function testFunc() {
  return 'test';
}
`;

      mockFileUtils.readFile.mockResolvedValue(content);

      const result = await analyzer.analyzeFile('mixed-comments.ts');

      // Should count: const value, const another, function testFunc, return, closing brace = 5 lines
      expect(result.lineCount).toBe(5);
    });
  });
});