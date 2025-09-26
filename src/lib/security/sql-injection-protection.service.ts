/**
 * SQL/NoSQL Injection Protection Service
 * @fileoverview Service responsible for preventing SQL and NoSQL injection attacks
 * @compliance HIPAA-compliant injection protection with audit trail
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  // Basic SQL keywords
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT)\b)/gi,
  
  // SQL operators and functions
  /(\b(AND|OR|NOT|IN|EXISTS|LIKE|BETWEEN|IS\s+NULL|IS\s+NOT\s+NULL)\b)/gi,
  
  // SQL injection characters
  /(['";]|\-\-|\/\*|\*\/|xp_|sp_|fn_)/gi,
  
  // SQL injection techniques
  /(1=1|1\s*=\s*1|'='|"="|admin'--|admin"--|\bor\s+1\s*=\s*1\b)/gi,
  
  // Database function calls
  /(\b(WAITFOR|DELAY|BENCHMARK|SLEEP|USER|VERSION|DATABASE|SCHEMA|TABLE|COLUMN)\b)/gi,
  
  // SQL comments
  /(--|\#|\/\*|\*\/)/gi,
  
  // Union-based injection
  /(\bunion\s+(all\s+)?select\b)/gi,
  
  // Error-based injection
  /(\bextractvalue\b|\bupdatexml\b|\bxpath\b)/gi,
  
  // Time-based injection
  /(\bwaitfor\s+delay\b|\bbenchmark\b|\bsleep\b)/gi,
  
  // Boolean-based injection
  /(\band\s+\d+\s*=\s*\d+|\bor\s+\d+\s*=\s*\d+)/gi
];

/**
 * NoSQL injection patterns
 */
const NOSQL_INJECTION_PATTERNS = [
  // MongoDB injection
  /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$or|\$and|\$not|\$nor|\$exists|\$regex)/gi,
  
  // JavaScript injection in MongoDB
  /(function\s*\(|this\.|sleep\(|benchmark\()/gi,
  
  // Object injection
  /(\{[\s]*\$)/gi,
  
  // Array injection
  /(\[[\s]*\$)/gi,
  
  // RegExp injection
  /(\$regex|\$options)/gi,
  
  // Aggregation pipeline injection
  /(\$match|\$group|\$sort|\$limit|\$skip|\$project|\$unwind|\$lookup)/gi
];

/**
 * Dangerous function patterns
 */
const DANGEROUS_FUNCTION_PATTERNS = [
  // JavaScript functions
  /(eval\s*\(|setTimeout\s*\(|setInterval\s*\(|Function\s*\(|require\s*\()/gi,
  
  // System functions
  /(system\s*\(|exec\s*\(|shell_exec\s*\(|passthru\s*\(|popen\s*\()/gi,
  
  // File functions
  /(file_get_contents\s*\(|file_put_contents\s*\(|fopen\s*\(|fwrite\s*\(|include\s*\(|require\s*\()/gi,
  
  // Network functions
  /(curl_exec\s*\(|file_get_contents\s*\(|fsockopen\s*\(|socket_create\s*\()/gi
];

/**
 * SQL/NoSQL injection protection service
 */
export class SQLInjectionProtectionService {
  
  /**
   * Check for SQL injection in input
   */
  static containsSQLInjection(input: string): boolean {
    try {
      if (!input || typeof input !== 'string') {
        return false;
      }

      // Normalize input
      const normalizedInput = input.toLowerCase().trim();

      // Check against SQL injection patterns
      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(normalizedInput)) {
          logSecurityEvent('sql_injection_detected', {
            pattern: pattern.source,
            inputLength: input.length,
            timestamp: new Date().toISOString()
          });
          return true;
        }
      }

      return false;

    } catch (error) {
      logSecurityEvent('sql_injection_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return true; // Err on the side of caution
    }
  }

  /**
   * Check for NoSQL injection in input
   */
  static containsNoSQLInjection(input: string): boolean {
    try {
      if (!input || typeof input !== 'string') {
        return false;
      }

      // Normalize input
      const normalizedInput = input.toLowerCase().trim();

      // Check against NoSQL injection patterns
      for (const pattern of NOSQL_INJECTION_PATTERNS) {
        if (pattern.test(normalizedInput)) {
          logSecurityEvent('nosql_injection_detected', {
            pattern: pattern.source,
            inputLength: input.length,
            timestamp: new Date().toISOString()
          });
          return true;
        }
      }

      return false;

    } catch (error) {
      logSecurityEvent('nosql_injection_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return true; // Err on the side of caution
    }
  }

  /**
   * Check for dangerous functions in input
   */
  static containsDangerousFunctions(input: string): boolean {
    try {
      if (!input || typeof input !== 'string') {
        return false;
      }

      // Check against dangerous function patterns
      for (const pattern of DANGEROUS_FUNCTION_PATTERNS) {
        if (pattern.test(input)) {
          logSecurityEvent('dangerous_function_detected', {
            pattern: pattern.source,
            inputLength: input.length,
            timestamp: new Date().toISOString()
          });
          return true;
        }
      }

      return false;

    } catch (error) {
      logSecurityEvent('dangerous_function_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return true; // Err on the side of caution
    }
  }

  /**
   * Comprehensive injection check
   */
  static containsInjectionAttack(input: string): {
    hasInjection: boolean;
    type: 'sql' | 'nosql' | 'function' | 'multiple' | 'none';
    patterns: string[];
  } {
    try {
      if (!input || typeof input !== 'string') {
        return {
          hasInjection: false,
          type: 'none',
          patterns: []
        };
      }

      const detectedPatterns: string[] = [];
      let hasSQLInjection = false;
      let hasNoSQLInjection = false;
      let hasDangerousFunctions = false;

      // Check SQL injection
      if (this.containsSQLInjection(input)) {
        hasSQLInjection = true;
        detectedPatterns.push('SQL injection');
      }

      // Check NoSQL injection
      if (this.containsNoSQLInjection(input)) {
        hasNoSQLInjection = true;
        detectedPatterns.push('NoSQL injection');
      }

      // Check dangerous functions
      if (this.containsDangerousFunctions(input)) {
        hasDangerousFunctions = true;
        detectedPatterns.push('Dangerous functions');
      }

      // Determine type
      let type: 'sql' | 'nosql' | 'function' | 'multiple' | 'none' = 'none';
      
      if (detectedPatterns.length > 1) {
        type = 'multiple';
      } else if (hasSQLInjection) {
        type = 'sql';
      } else if (hasNoSQLInjection) {
        type = 'nosql';
      } else if (hasDangerousFunctions) {
        type = 'function';
      }

      const hasInjection = detectedPatterns.length > 0;

      if (hasInjection) {
        logSecurityEvent('injection_attack_detected', {
          type,
          patterns: detectedPatterns,
          inputLength: input.length,
          timestamp: new Date().toISOString()
        });
      }

      return {
        hasInjection,
        type,
        patterns: detectedPatterns
      };

    } catch (error) {
      logSecurityEvent('injection_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        hasInjection: true,
        type: 'multiple',
        patterns: ['Error during check']
      };
    }
  }

  /**
   * Sanitize input to prevent injection
   */
  static sanitizeInput(input: string): string {
    try {
      if (!input || typeof input !== 'string') {
        return '';
      }

      let sanitized = input;

      // Remove SQL injection patterns
      SQL_INJECTION_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      // Remove NoSQL injection patterns
      NOSQL_INJECTION_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      // Remove dangerous function patterns
      DANGEROUS_FUNCTION_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      // Remove common injection characters
      sanitized = sanitized.replace(/['";]|\-\-|\/\*|\*\//g, '');

      // Remove multiple spaces
      sanitized = sanitized.replace(/\s+/g, ' ').trim();

      return sanitized;

    } catch (error) {
      logSecurityEvent('input_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return '';
    }
  }

  /**
   * Validate database query parameters
   */
  static validateQueryParameters(params: Record<string, unknown>): {
    valid: boolean;
    errors: string[];
    sanitizedParams: Record<string, unknown>;
  } {
    try {
      const errors: string[] = [];
      const sanitizedParams: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
          const injectionCheck = this.containsInjectionAttack(value);
          
          if (injectionCheck.hasInjection) {
            errors.push(`Parameter '${key}' contains ${injectionCheck.type} injection: ${injectionCheck.patterns.join(', ')}`);
          } else {
            sanitizedParams[key] = this.sanitizeInput(value);
          }
        } else {
          sanitizedParams[key] = value;
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedParams
      };

    } catch (error) {
      logSecurityEvent('query_parameter_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        valid: false,
        errors: ['Error validating query parameters'],
        sanitizedParams: {}
      };
    }
  }

  /**
   * Create middleware for injection protection
   */
  static createMiddleware() {
    return async (request: Request) => {
      try {
        // Check request body for injections
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          const body = await request.text();
          
          if (body) {
            const injectionCheck = this.containsInjectionAttack(body);
            
            if (injectionCheck.hasInjection) {
              logSecurityEvent('injection_attack_blocked', {
                method: request.method,
                url: request.url,
                type: injectionCheck.type,
                patterns: injectionCheck.patterns,
                timestamp: new Date().toISOString()
              });

              return new Response(
                JSON.stringify({
                  error: 'Injection attack detected',
                  type: injectionCheck.type,
                  patterns: injectionCheck.patterns
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
          }
        }

        return null; // Allow request to continue

      } catch (error) {
        logSecurityEvent('injection_middleware_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });

        return null; // Allow request on error
      }
    };
  }

  /**
   * Get injection protection patterns
   */
  static getPatterns(): {
    sql: RegExp[];
    nosql: RegExp[];
    functions: RegExp[];
  } {
    return {
      sql: SQL_INJECTION_PATTERNS,
      nosql: NOSQL_INJECTION_PATTERNS,
      functions: DANGEROUS_FUNCTION_PATTERNS
    };
  }

  /**
   * Get injection protection service status
   */
  static getStatus(): {
    initialized: boolean;
    sqlPatterns: number;
    nosqlPatterns: number;
    functionPatterns: number;
    totalPatterns: number;
  } {
    return {
      initialized: true,
      sqlPatterns: SQL_INJECTION_PATTERNS.length,
      nosqlPatterns: NOSQL_INJECTION_PATTERNS.length,
      functionPatterns: DANGEROUS_FUNCTION_PATTERNS.length,
      totalPatterns: SQL_INJECTION_PATTERNS.length + NOSQL_INJECTION_PATTERNS.length + DANGEROUS_FUNCTION_PATTERNS.length
    };
  }
}