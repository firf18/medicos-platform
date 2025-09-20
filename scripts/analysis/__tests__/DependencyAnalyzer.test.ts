/**
 * Unit tests for DependencyAnalyzer
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DependencyAnalyzer, DependencyConfig } from '../DependencyAnalyzer';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
  },
  existsSync: vi.fn(),
}));

// Mock FileUtils
vi.mock('../file-utils', () => ({
  FileUtils: {
    readFile: vi.fn(),
  },
}));

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  let mockConfig: Partial<DependencyConfig>;

  beforeEach(() => {
    mockConfig = {
      maxCircularDepth: 5,
      excludePatterns: ['node_modules', '.next'],
      includeExternalDeps: false,
      unusedImportThreshold: 0,
    };
    analyzer = new DependencyAnalyzer(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  describe('parseImports', () => {
    it('should parse named imports correctly', async () => {
      const content = `
        import { useState, useEffect } from 'react';
        import { Button, Input } from '@/components/ui';
        import type { User } from '@/types/user';
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.imports).toHaveLength(3);
      expect(result.analysis.imports[0]).toMatchObject({
        source: 'react',
        imports: ['useState', 'useEffect'],
        line: 2
      });
      expect(result.analysis.imports[1]).toMatchObject({
        source: '@/components/ui',
        imports: ['Button', 'Input'],
        line: 3
      });
    });

    it('should parse default imports correctly', async () => {
      const content = `
        import React from 'react';
        import axios from 'axios';
        import MyComponent from './MyComponent';
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.imports).toHaveLength(3);
      expect(result.analysis.imports[0]).toMatchObject({
        source: 'react',
        imports: ['React'],
        line: 2
      });
    });

    it('should parse namespace imports correctly', async () => {
      const content = `
        import * as React from 'react';
        import * as utils from './utils';
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.imports).toHaveLength(2);
      expect(result.analysis.imports[0]).toMatchObject({
        source: 'react',
        imports: ['React'],
        line: 2
      });
    });

    it('should parse side-effect imports correctly', async () => {
      const content = `
        import './styles.css';
        import 'react-toastify/dist/ReactToastify.css';
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.imports).toHaveLength(2);
      expect(result.analysis.imports[0]).toMatchObject({
        source: './styles.css',
        imports: [],
        line: 2
      });
    });
  });

  describe('parseExports', () => {
    it('should parse named exports correctly', async () => {
      const content = `
        export const API_URL = 'https://api.example.com';
        export function fetchUser(id: string) { return null; }
        export class UserService { }
        export { Button, Input } from './components';
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/service.ts');
      
      expect(result.analysis.exports).toHaveLength(5);
      expect(result.analysis.exports[0]).toMatchObject({
        name: 'API_URL',
        type: 'named',
        line: 2
      });
      expect(result.analysis.exports[1]).toMatchObject({
        name: 'fetchUser',
        type: 'named',
        line: 3
      });
    });

    it('should parse default exports correctly', async () => {
      const content = `
        const MyComponent = () => <div>Hello</div>;
        export default MyComponent;
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.exports).toHaveLength(1);
      expect(result.analysis.exports[0]).toMatchObject({
        name: 'MyComponent',
        type: 'default',
        line: 3
      });
    });
  });

  describe('detectUnusedImports', () => {
    it('should detect unused imports correctly', async () => {
      const content = `
        import { useState, useEffect, useMemo } from 'react';
        import { Button } from '@/components/ui';
        import { formatDate } from '@/utils/date';
        
        export const MyComponent = () => {
          const [count, setCount] = useState(0);
          
          useEffect(() => {
            console.log('Component mounted');
          }, []);
          
          return <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>;
        };
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.unusedImports).toContain("useMemo from 'react'");
      expect(result.analysis.unusedImports).toContain("formatDate from '@/utils/date'");
      expect(result.analysis.unusedImports).not.toContain("useState from 'react'");
      expect(result.analysis.unusedImports).not.toContain("Button from '@/components/ui'");
    });

    it('should handle JSX component usage correctly', async () => {
      const content = `
        import { Card, CardHeader, CardContent } from '@/components/ui';
        
        export const MyCard = () => (
          <Card>
            <CardHeader>Title</CardHeader>
            <CardContent>Content</CardContent>
          </Card>
        );
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      expect(result.analysis.unusedImports).toHaveLength(0);
    });

    it('should handle TypeScript type usage correctly', async () => {
      const content = `
        import { User, ApiResponse } from '@/types';
        
        export const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
          return { data: null, error: null };
        };
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/service.ts');
      
      expect(result.analysis.unusedImports).toHaveLength(0);
    });
  });

  describe('detectCircularDependencies', () => {
    it('should detect simple circular dependencies', async () => {
      // Mock file system structure
      const mockFiles = {
        '/project/a.ts': `
          import { funcB } from './b';
          export const funcA = () => funcB();
        `,
        '/project/b.ts': `
          import { funcA } from './a';
          export const funcB = () => funcA();
        `
      };

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockImplementation((filePath: string) => {
        return Promise.resolve(mockFiles[filePath as keyof typeof mockFiles] || '');
      });

      vi.mocked(fs.promises.readdir).mockResolvedValue([
        { name: 'a.ts', isFile: () => true, isDirectory: () => false } as any,
        { name: 'b.ts', isFile: () => true, isDirectory: () => false } as any,
      ]);

      vi.mocked(fs.existsSync).mockImplementation((filePath: string) => {
        return Object.keys(mockFiles).includes(filePath as string);
      });

      const report = await analyzer.analyzeProject('/project');
      
      expect(report.circularDependencies).toBeGreaterThan(0);
      expect(report.results.some(r => 
        r.analysis.circularDependencies.length > 0
      )).toBe(true);
    });
  });

  describe('identifyIssues', () => {
    it('should identify unused import issues', async () => {
      const content = `
        import { unused1, unused2, used } from 'module';
        export const test = () => used();
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      const unusedImportIssue = result.issues.find(issue => 
        issue.type === 'dependency' && issue.description.includes('unused imports')
      );
      expect(unusedImportIssue).toBeDefined();
      expect(unusedImportIssue?.severity).toBe('medium');
    });

    it('should identify excessive dependency issues', async () => {
      // Create content with many imports
      const imports = Array.from({ length: 25 }, (_, i) => 
        `import { func${i} } from 'module${i}';`
      ).join('\n');
      
      const usage = Array.from({ length: 25 }, (_, i) => 
        `func${i}();`
      ).join(' ');

      const content = `
        ${imports}
        export const test = () => { ${usage} };
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      const excessiveDepsIssue = result.issues.find(issue => 
        issue.type === 'dependency' && issue.description.includes('dependencies, consider splitting')
      );
      expect(excessiveDepsIssue).toBeDefined();
      expect(excessiveDepsIssue?.severity).toBe('high');
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend removing unused imports', async () => {
      const content = `
        import { unused1, unused2, used } from 'module';
        export const test = () => used();
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      const removeRecommendation = result.recommendations.find(rec => 
        rec.type === 'remove' && rec.description.includes('unused imports')
      );
      expect(removeRecommendation).toBeDefined();
      expect(removeRecommendation?.estimatedEffort).toBe('low');
    });

    it('should recommend refactoring for heavy dependencies', async () => {
      // Create content with many imports
      const imports = Array.from({ length: 20 }, (_, i) => 
        `import { func${i} } from 'module${i}';`
      ).join('\n');
      
      const usage = Array.from({ length: 20 }, (_, i) => 
        `func${i}();`
      ).join(' ');

      const content = `
        ${imports}
        export const test = () => { ${usage} };
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      const result = await analyzer.analyzeFile('/test/component.tsx');
      
      const refactorRecommendation = result.recommendations.find(rec => 
        rec.type === 'refactor' && rec.description.includes('splitting file or reducing dependencies')
      );
      expect(refactorRecommendation).toBeDefined();
      expect(refactorRecommendation?.estimatedEffort).toBe('medium');
    });
  });

  describe('generateVisualizationData', () => {
    it('should generate nodes and edges for visualization', async () => {
      const mockFiles = {
        '/project/a.ts': `
          import { funcB } from './b';
          export const funcA = () => funcB();
        `,
        '/project/b.ts': `
          export const funcB = () => 'hello';
        `
      };

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockImplementation((filePath: string) => {
        return Promise.resolve(mockFiles[filePath as keyof typeof mockFiles] || '');
      });

      vi.mocked(fs.promises.readdir).mockResolvedValue([
        { name: 'a.ts', isFile: () => true, isDirectory: () => false } as any,
        { name: 'b.ts', isFile: () => true, isDirectory: () => false } as any,
      ]);

      vi.mocked(fs.existsSync).mockImplementation((filePath: string) => {
        return Object.keys(mockFiles).includes(filePath as string);
      });

      await analyzer.analyzeProject('/project');
      const vizData = analyzer.generateVisualizationData();
      
      expect(vizData.nodes).toHaveLength(2);
      expect(vizData.nodes[0]).toHaveProperty('id');
      expect(vizData.nodes[0]).toHaveProperty('label');
      expect(vizData.nodes[0]).toHaveProperty('group');
      expect(vizData.nodes[0]).toHaveProperty('size');
      
      expect(vizData.edges.length).toBeGreaterThanOrEqual(0);
      if (vizData.edges.length > 0) {
        expect(vizData.edges[0]).toHaveProperty('from');
        expect(vizData.edges[0]).toHaveProperty('to');
        expect(vizData.edges[0]).toHaveProperty('weight');
      }
    });
  });

  describe('exportToDot', () => {
    it('should export dependency graph in DOT format', async () => {
      const mockFiles = {
        '/project/component.tsx': `
          import { utils } from './utils';
          export const Component = () => utils.format('hello');
        `,
        '/project/utils.ts': `
          export const utils = { format: (s: string) => s };
        `
      };

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockImplementation((filePath: string) => {
        return Promise.resolve(mockFiles[filePath as keyof typeof mockFiles] || '');
      });

      vi.mocked(fs.promises.readdir).mockResolvedValue([
        { name: 'component.tsx', isFile: () => true, isDirectory: () => false } as any,
        { name: 'utils.ts', isFile: () => true, isDirectory: () => false } as any,
      ]);

      vi.mocked(fs.existsSync).mockImplementation((filePath: string) => {
        return Object.keys(mockFiles).includes(filePath as string);
      });

      await analyzer.analyzeProject('/project');
      const dotOutput = analyzer.exportToDot();
      
      expect(dotOutput).toContain('digraph Dependencies');
      expect(dotOutput).toContain('rankdir=LR');
      expect(dotOutput).toContain('component.tsx');
      expect(dotOutput).toContain('utils.ts');
    });
  });

  describe('cache management', () => {
    it('should cache analysis results', async () => {
      const content = `
        import { test } from 'module';
        export const func = () => test();
      `;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      // First analysis
      await analyzer.analyzeFile('/test/component.tsx');
      expect(FileUtils.readFile).toHaveBeenCalledTimes(1);

      // Second analysis should use cache
      await analyzer.analyzeFile('/test/component.tsx');
      expect(FileUtils.readFile).toHaveBeenCalledTimes(1);

      // Verify cache contains the result
      const cachedResults = analyzer.getCachedResults();
      expect(cachedResults.has('/test/component.tsx')).toBe(true);
    });

    it('should clear cache when requested', async () => {
      const content = `export const test = 'hello';`;

      const { FileUtils } = await import('../file-utils');
      vi.mocked(FileUtils.readFile).mockResolvedValue(content);

      await analyzer.analyzeFile('/test/component.tsx');
      expect(analyzer.getCachedResults().size).toBe(1);

      analyzer.clearCache();
      expect(analyzer.getCachedResults().size).toBe(0);
    });
  });
});