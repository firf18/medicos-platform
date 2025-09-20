/**
 * ResponsibilityAnalyzer - Detects multiple concerns within single files using AST parsing
 * Identifies different types of responsibilities (UI, business logic, data access)
 */

import * as ts from 'typescript';
import { FileUtils } from './file-utils';
import type { 
  ResponsibilityAnalysis, 
  SeparationStrategy, 
  Issue, 
  Recommendation 
} from './types';

export interface ResponsibilityConfig {
  maxResponsibilities: number;
  enableHeuristics: boolean;
  strictMode: boolean;
}

export interface ResponsibilityResult {
  filePath: string;
  analysis: ResponsibilityAnalysis;
  issues: Issue[];
  recommendations: Recommendation[];
  confidence: number;
}

export interface ResponsibilityReport {
  totalFiles: number;
  filesWithMultipleResponsibilities: number;
  averageResponsibilities: number;
  results: ResponsibilityResult[];
  summary: {
    mostCommonIssues: string[];
    recommendedActions: string[];
  };
}

interface ResponsibilityIndicator {
  type: ResponsibilityType;
  description: string;
  location: {
    line: number;
    column: number;
  };
  confidence: number;
  evidence: string[];
}

type ResponsibilityType = 
  | 'ui-rendering'
  | 'ui-interaction' 
  | 'business-logic'
  | 'data-access'
  | 'validation'
  | 'state-management'
  | 'api-communication'
  | 'utility'
  | 'configuration'
  | 'testing';

export class ResponsibilityAnalyzer {
  private fileUtils: FileUtils;
  private config: ResponsibilityConfig;

  constructor(config: Partial<ResponsibilityConfig> = {}) {
    this.fileUtils = new FileUtils();
    this.config = {
      maxResponsibilities: 2, // Changed from 3 to 2 for stricter detection
      enableHeuristics: true,
      strictMode: false,
      ...config
    };
  }

  /**
   * Analyze a single file for multiple responsibilities
   */
  async analyzeFile(filePath: string): Promise<ResponsibilityResult> {
    const content = await this.fileUtils.readFile(filePath);
    if (!content) {
      return this.createEmptyResult(filePath, 'Failed to read file');
    }

    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const indicators = this.extractResponsibilityIndicators(sourceFile);
      const analysis = this.analyzeResponsibilities(indicators);
      const issues = this.identifyIssues(filePath, analysis, indicators);
      const recommendations = this.generateRecommendations(filePath, analysis, indicators);
      const confidence = this.calculateConfidence(indicators);

      return {
        filePath,
        analysis,
        issues,
        recommendations,
        confidence
      };
    } catch (error) {
      return this.createEmptyResult(filePath, `AST parsing failed: ${error}`);
    }
  }

  /**
   * Analyze multiple files and generate a comprehensive report
   */
  async analyzeFiles(filePaths: string[]): Promise<ResponsibilityReport> {
    const results: ResponsibilityResult[] = [];
    
    for (const filePath of filePaths) {
      const result = await this.analyzeFile(filePath);
      results.push(result);
    }

    return this.generateReport(results);
  }

  /**
   * Extract responsibility indicators from AST
   */
  private extractResponsibilityIndicators(sourceFile: ts.SourceFile): ResponsibilityIndicator[] {
    const indicators: ResponsibilityIndicator[] = [];

    const visit = (node: ts.Node) => {
      // UI Rendering indicators
      if (this.isJSXElement(node) || this.isReactComponent(node)) {
        indicators.push(this.createIndicator(
          'ui-rendering',
          'JSX/React component rendering',
          node,
          sourceFile,
          0.9,
          ['JSX elements', 'React component structure']
        ));
      }

      // UI Interaction indicators
      if (this.isEventHandler(node)) {
        indicators.push(this.createIndicator(
          'ui-interaction',
          'Event handling logic',
          node,
          sourceFile,
          0.8,
          ['Event handlers', 'User interaction logic']
        ));
      }

      // Business Logic indicators
      if (this.isBusinessLogic(node)) {
        indicators.push(this.createIndicator(
          'business-logic',
          'Business rule implementation',
          node,
          sourceFile,
          0.7,
          ['Complex calculations', 'Business rules', 'Domain logic']
        ));
      }

      // Data Access indicators - check this first as it's more specific
      if (this.isDataAccess(node)) {
        indicators.push(this.createIndicator(
          'data-access',
          'Database or API operations',
          node,
          sourceFile,
          0.9,
          ['Database queries', 'API calls', 'Data fetching']
        ));
      }

      // Validation indicators
      if (this.isValidation(node)) {
        indicators.push(this.createIndicator(
          'validation',
          'Input validation logic',
          node,
          sourceFile,
          0.8,
          ['Schema validation', 'Input checking', 'Data validation']
        ));
      }

      // State Management indicators
      if (this.isStateManagement(node)) {
        indicators.push(this.createIndicator(
          'state-management',
          'State management operations',
          node,
          sourceFile,
          0.8,
          ['State updates', 'Store operations', 'Context usage']
        ));
      }

      // API Communication indicators
      if (this.isApiCommunication(node)) {
        indicators.push(this.createIndicator(
          'api-communication',
          'External API communication',
          node,
          sourceFile,
          0.9,
          ['HTTP requests', 'API endpoints', 'Network operations']
        ));
      }

      // Utility indicators
      if (this.isUtility(node)) {
        indicators.push(this.createIndicator(
          'utility',
          'Utility function',
          node,
          sourceFile,
          0.6,
          ['Helper functions', 'Utility operations']
        ));
      }

      // Configuration indicators
      if (this.isConfiguration(node)) {
        indicators.push(this.createIndicator(
          'configuration',
          'Configuration or constants',
          node,
          sourceFile,
          0.7,
          ['Configuration objects', 'Constants', 'Settings']
        ));
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return indicators;
  }

  /**
   * Analyze responsibility indicators to determine file responsibilities
   */
  private analyzeResponsibilities(indicators: ResponsibilityIndicator[]): ResponsibilityAnalysis {
    // Group indicators by type
    const responsibilityGroups = new Map<ResponsibilityType, ResponsibilityIndicator[]>();
    
    for (const indicator of indicators) {
      if (!responsibilityGroups.has(indicator.type)) {
        responsibilityGroups.set(indicator.type, []);
      }
      responsibilityGroups.get(indicator.type)!.push(indicator);
    }

    // Calculate responsibility scores
    const responsibilities: string[] = [];
    const separationSuggestions: SeparationStrategy[] = [];

    for (const [type, typeIndicators] of responsibilityGroups) {
      const avgConfidence = typeIndicators.reduce((sum, ind) => sum + ind.confidence, 0) / typeIndicators.length;
      const weight = typeIndicators.length * avgConfidence;

      if (weight > 0.3) { // Lower threshold for considering a responsibility significant
        responsibilities.push(this.getResponsibilityDescription(type));
        
        if (typeIndicators.length > 1 || avgConfidence > 0.7) {
          separationSuggestions.push(this.createSeparationStrategy(type, typeIndicators));
        }
      }
    }

    const hasMultipleResponsibilities = responsibilities.length > this.config.maxResponsibilities;

    return {
      responsibilities,
      hasMultipleResponsibilities,
      separationSuggestions
    };
  }

  /**
   * Identify issues based on responsibility analysis
   */
  private identifyIssues(
    filePath: string, 
    analysis: ResponsibilityAnalysis, 
    indicators: ResponsibilityIndicator[]
  ): Issue[] {
    const issues: Issue[] = [];

    if (analysis.hasMultipleResponsibilities) {
      issues.push({
        type: 'responsibility',
        severity: analysis.responsibilities.length > 5 ? 'high' : 'medium',
        description: `File has ${analysis.responsibilities.length} different responsibilities: ${analysis.responsibilities.join(', ')}`,
        location: filePath
      });
    }

    // Check for specific problematic combinations
    const responsibilityTypes = new Set(indicators.map(i => i.type));
    
    if (responsibilityTypes.has('ui-rendering') && responsibilityTypes.has('data-access')) {
      issues.push({
        type: 'responsibility',
        severity: 'high',
        description: 'UI components should not directly handle data access operations',
        location: filePath
      });
    }

    if (responsibilityTypes.has('business-logic') && responsibilityTypes.has('ui-rendering')) {
      issues.push({
        type: 'responsibility',
        severity: 'medium',
        description: 'Business logic mixed with UI rendering logic',
        location: filePath
      });
    }

    return issues;
  }

  /**
   * Generate recommendations for responsibility separation
   */
  private generateRecommendations(
    filePath: string,
    analysis: ResponsibilityAnalysis,
    indicators: ResponsibilityIndicator[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!analysis.hasMultipleResponsibilities) {
      return recommendations;
    }

    // Generate specific recommendations based on responsibility combinations
    const responsibilityTypes = new Set(indicators.map(i => i.type));

    if (responsibilityTypes.has('ui-rendering') && responsibilityTypes.size > 1) {
      recommendations.push({
        type: 'split',
        priority: 8,
        description: 'Extract non-UI logic from React component',
        estimatedEffort: 'medium',
        benefits: [
          'Improved component reusability',
          'Easier testing of business logic',
          'Better separation of concerns'
        ],
        risks: [
          'May require prop drilling',
          'Potential performance impact if not optimized'
        ]
      });
    }

    if (responsibilityTypes.has('data-access')) {
      recommendations.push({
        type: 'split',
        priority: 9,
        description: 'Extract data access logic into separate service/repository',
        estimatedEffort: 'medium',
        benefits: [
          'Improved testability',
          'Better data layer abstraction',
          'Easier to mock for testing'
        ],
        risks: [
          'Additional abstraction complexity',
          'May require dependency injection setup'
        ]
      });
    }

    if (responsibilityTypes.has('validation')) {
      recommendations.push({
        type: 'split',
        priority: 6,
        description: 'Move validation logic to dedicated validation module',
        estimatedEffort: 'low',
        benefits: [
          'Reusable validation logic',
          'Centralized validation rules',
          'Easier to maintain validation consistency'
        ],
        risks: [
          'Minimal risk'
        ]
      });
    }

    return recommendations;
  }

  // AST Node Detection Methods

  private isJSXElement(node: ts.Node): boolean {
    return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node);
  }

  private isReactComponent(node: ts.Node): boolean {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
      // Check if function returns JSX
      const returnType = node.type;
      if (returnType && ts.isTypeReferenceNode(returnType)) {
        const typeName = returnType.typeName;
        if (ts.isIdentifier(typeName) && typeName.text.includes('JSX')) {
          return true;
        }
      }
    }
    return false;
  }

  private isEventHandler(node: ts.Node): boolean {
    if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
      const name = ts.isPropertyAssignment(node) ? node.name : node.name;
      if (ts.isIdentifier(name)) {
        const nameText = name.text.toLowerCase();
        return nameText.startsWith('on') || nameText.includes('handle') || nameText.includes('click');
      }
    }
    return false;
  }

  private isBusinessLogic(node: ts.Node): boolean {
    // Look for complex calculations, conditionals, and business rules
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
      const body = ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) ? 
        node.body : 
        (ts.isBlock(node.body) ? node.body : null);
        
      if (body && ts.isBlock(body)) {
        // Count complex statements
        let complexityScore = 0;
        body.statements.forEach(stmt => {
          if (ts.isIfStatement(stmt)) complexityScore++;
          if (ts.isForStatement(stmt) || ts.isWhileStatement(stmt)) complexityScore++;
          if (ts.isSwitchStatement(stmt)) complexityScore++;
        });
        return complexityScore > 1; // Lower threshold
      }
    }
    
    // Also check for variable declarations with complex arrow functions
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer)) {
      const body = node.initializer.body;
      if (ts.isBlock(body)) {
        let complexityScore = 0;
        body.statements.forEach(stmt => {
          if (ts.isIfStatement(stmt)) complexityScore++;
          if (ts.isForStatement(stmt) || ts.isWhileStatement(stmt)) complexityScore++;
          if (ts.isSwitchStatement(stmt)) complexityScore++;
        });
        return complexityScore > 1;
      }
    }
    
    return false;
  }

  private isDataAccess(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      
      // Check for method calls like supabase.from().select()
      if (ts.isPropertyAccessExpression(expression)) {
        const name = expression.name.text.toLowerCase();
        
        // Check if the object is supabase or similar
        let objectName = '';
        if (ts.isIdentifier(expression.expression)) {
          objectName = expression.expression.text.toLowerCase();
        } else if (ts.isPropertyAccessExpression(expression.expression)) {
          // Handle chained calls like supabase.from('table').select()
          const chainedExpr = expression.expression;
          if (ts.isIdentifier(chainedExpr.expression)) {
            objectName = chainedExpr.expression.text.toLowerCase();
          }
        }
        
        // Database operation methods
        const dbMethods = ['query', 'find', 'create', 'update', 'delete', 'save', 'fetch', 'select', 'insert', 'from', 'where', 'eq', 'single'];
        const dbObjects = ['supabase', 'prisma', 'db', 'database'];
        
        return dbMethods.some(keyword => name.includes(keyword)) || 
               dbObjects.some(keyword => objectName.includes(keyword));
      }
      
      // Check for direct function calls
      if (ts.isIdentifier(expression)) {
        const name = expression.text.toLowerCase();
        return ['supabase', 'prisma', 'fetch', 'axios', 'query'].some(keyword => 
          name.includes(keyword)
        );
      }
    }
    
    // Check for import statements that indicate data access
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const moduleName = moduleSpecifier.text.toLowerCase();
        return ['supabase', 'prisma', 'mongoose', 'sequelize'].some(keyword => 
          moduleName.includes(keyword)
        );
      }
    }
    
    // Check for variable declarations that might contain data access
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const text = node.initializer.getText().toLowerCase();
      return ['supabase', 'prisma', 'fetch', 'axios'].some(keyword => 
        text.includes(keyword)
      );
    }
    
    return false;
  }

  private isValidation(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isPropertyAccessExpression(expression)) {
        const name = expression.name.text.toLowerCase();
        return ['validate', 'parse', 'safeParse', 'check'].some(keyword => 
          name.includes(keyword)
        );
      }
    }
    return false;
  }

  private isStateManagement(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isIdentifier(expression)) {
        const name = expression.text;
        return ['useState', 'useReducer', 'useContext', 'useStore', 'useSelector'].includes(name);
      }
    }
    return false;
  }

  private isApiCommunication(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isPropertyAccessExpression(expression)) {
        const objectName = ts.isIdentifier(expression.expression) ? 
          expression.expression.text.toLowerCase() : '';
        const methodName = expression.name.text.toLowerCase();
        
        return ['fetch', 'axios', 'http'].some(api => objectName.includes(api)) ||
               ['get', 'post', 'put', 'delete', 'patch'].includes(methodName);
      }
    }
    return false;
  }

  private isUtility(node: ts.Node): boolean {
    if (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) {
      let name = '';
      
      if (ts.isFunctionDeclaration(node) && node.name) {
        name = node.name.text.toLowerCase();
      } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        name = node.name.text.toLowerCase();
      }
      
      return ['format', 'parse', 'convert', 'transform', 'helper', 'util'].some(keyword => 
        name.includes(keyword)
      );
    }
    
    // Also check for arrow functions assigned to variables
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer)) {
      if (ts.isIdentifier(node.name)) {
        const name = node.name.text.toLowerCase();
        return ['format', 'parse', 'convert', 'transform', 'helper', 'util'].some(keyword => 
          name.includes(keyword)
        );
      }
    }
    
    return false;
  }

  private isConfiguration(node: ts.Node): boolean {
    if (ts.isVariableDeclaration(node)) {
      if (ts.isIdentifier(node.name)) {
        const nameText = node.name.text;
        const lowerName = nameText.toLowerCase();
        
        // Check for configuration keywords or ALL_CAPS constants
        return ['config', 'constant', 'setting', 'option', 'default', 'api_', 'max_', 'min_'].some(keyword => 
          lowerName.includes(keyword)
        ) || (nameText === nameText.toUpperCase() && nameText.length > 2);
      }
    }
    
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
      const nameText = node.name.text;
      const lowerName = nameText.toLowerCase();
      
      return ['config', 'constant', 'setting', 'option', 'default'].some(keyword => 
        lowerName.includes(keyword)
      ) || (nameText === nameText.toUpperCase() && nameText.length > 2);
    }
    
    return false;
  }

  // Helper Methods

  private createIndicator(
    type: ResponsibilityType,
    description: string,
    node: ts.Node,
    sourceFile: ts.SourceFile,
    confidence: number,
    evidence: string[]
  ): ResponsibilityIndicator {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    
    return {
      type,
      description,
      location: {
        line: line + 1,
        column: character + 1
      },
      confidence,
      evidence
    };
  }

  private getResponsibilityDescription(type: ResponsibilityType): string {
    const descriptions: Record<ResponsibilityType, string> = {
      'ui-rendering': 'UI Rendering',
      'ui-interaction': 'User Interaction Handling',
      'business-logic': 'Business Logic',
      'data-access': 'Data Access',
      'validation': 'Input Validation',
      'state-management': 'State Management',
      'api-communication': 'API Communication',
      'utility': 'Utility Functions',
      'configuration': 'Configuration',
      'testing': 'Testing Logic'
    };
    
    return descriptions[type] || type;
  }

  private createSeparationStrategy(
    type: ResponsibilityType,
    indicators: ResponsibilityIndicator[]
  ): SeparationStrategy {
    const strategies: Record<ResponsibilityType, Partial<SeparationStrategy>> = {
      'ui-rendering': {
        type: 'layer',
        description: 'Extract UI components to separate presentation layer'
      },
      'ui-interaction': {
        type: 'feature',
        description: 'Move event handlers to custom hooks or separate handlers'
      },
      'business-logic': {
        type: 'domain',
        description: 'Extract business logic to domain services'
      },
      'data-access': {
        type: 'layer',
        description: 'Move data access to repository or service layer'
      },
      'validation': {
        type: 'feature',
        description: 'Extract validation to schema validation files'
      },
      'state-management': {
        type: 'feature',
        description: 'Move state logic to custom hooks or stores'
      },
      'api-communication': {
        type: 'layer',
        description: 'Extract API calls to service layer'
      },
      'utility': {
        type: 'feature',
        description: 'Move utilities to shared utility modules'
      },
      'configuration': {
        type: 'feature',
        description: 'Extract configuration to config files'
      },
      'testing': {
        type: 'feature',
        description: 'Move test utilities to test helper files'
      }
    };

    const baseStrategy = strategies[type] || {
      type: 'feature',
      description: 'Separate into focused modules'
    };

    return {
      type: baseStrategy.type as 'domain' | 'layer' | 'feature',
      targetFiles: [`${type}-extracted.ts`],
      description: baseStrategy.description!,
      estimatedEffort: indicators.length > 3 ? 'high' : 'medium'
    };
  }

  private calculateConfidence(indicators: ResponsibilityIndicator[]): number {
    if (indicators.length === 0) return 0;
    
    const avgConfidence = indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length;
    const diversityBonus = Math.min(indicators.length / 10, 0.2); // Bonus for having multiple indicators
    
    return Math.min(avgConfidence + diversityBonus, 1);
  }

  private createEmptyResult(filePath: string, error: string): ResponsibilityResult {
    return {
      filePath,
      analysis: {
        responsibilities: [],
        hasMultipleResponsibilities: false,
        separationSuggestions: []
      },
      issues: [{
        type: 'responsibility',
        severity: 'low',
        description: error,
        location: filePath
      }],
      recommendations: [],
      confidence: 0
    };
  }

  private generateReport(results: ResponsibilityResult[]): ResponsibilityReport {
    const totalFiles = results.length;
    const filesWithMultipleResponsibilities = results.filter(r => r.analysis.hasMultipleResponsibilities).length;
    const totalResponsibilities = results.reduce((sum, r) => sum + r.analysis.responsibilities.length, 0);
    const averageResponsibilities = totalFiles > 0 ? totalResponsibilities / totalFiles : 0;

    // Analyze common issues
    const issueTypes = new Map<string, number>();
    const recommendationTypes = new Map<string, number>();

    results.forEach(result => {
      result.issues.forEach(issue => {
        issueTypes.set(issue.description, (issueTypes.get(issue.description) || 0) + 1);
      });
      
      result.recommendations.forEach(rec => {
        recommendationTypes.set(rec.description, (recommendationTypes.get(rec.description) || 0) + 1);
      });
    });

    const mostCommonIssues = Array.from(issueTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);

    const recommendedActions = Array.from(recommendationTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action]) => action);

    return {
      totalFiles,
      filesWithMultipleResponsibilities,
      averageResponsibilities,
      results,
      summary: {
        mostCommonIssues,
        recommendedActions
      }
    };
  }
}