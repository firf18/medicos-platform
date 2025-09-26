/**
 * Advanced Input Sanitization Service
 * @fileoverview Service responsible for advanced input sanitization and validation
 * @compliance HIPAA-compliant input sanitization with audit trail
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeLicenseNumber, sanitizeDocumentNumber, sanitizeName, sanitizePassword, containsMaliciousContent } from './sanitization/input-sanitizer';

/**
 * Sanitization rules
 */
export interface SanitizationRule {
  field: string;
  type: 'text' | 'email' | 'phone' | 'license' | 'document' | 'name' | 'password' | 'json' | 'html' | 'sql' | 'xss';
  required: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
  customSanitizer?: (value: string) => string;
}

/**
 * Sanitization result
 */
export interface SanitizationResult {
  valid: boolean;
  sanitized: Record<string, unknown>;
  errors: string[];
  warnings: string[];
  original: Record<string, unknown>;
  sanitizedFields: string[];
  removedFields: string[];
}

/**
 * Advanced input sanitization service
 */
export class AdvancedInputSanitizationService {
  private static readonly DEFAULT_RULES: SanitizationRule[] = [
    // Personal information
    { field: 'firstName', type: 'name', required: true, maxLength: 50, minLength: 1 },
    { field: 'lastName', type: 'name', required: true, maxLength: 50, minLength: 1 },
    { field: 'middleName', type: 'name', required: false, maxLength: 50 },
    { field: 'email', type: 'email', required: true, maxLength: 254 },
    { field: 'phone', type: 'phone', required: true, maxLength: 15 },
    { field: 'address', type: 'text', required: false, maxLength: 500 },
    { field: 'city', type: 'text', required: false, maxLength: 100 },
    { field: 'state', type: 'text', required: false, maxLength: 100 },
    { field: 'zipCode', type: 'text', required: false, maxLength: 20 },
    { field: 'country', type: 'text', required: false, maxLength: 100 },
    
    // Document information
    { field: 'documentNumber', type: 'document', required: true, maxLength: 20 },
    { field: 'documentType', type: 'text', required: true, maxLength: 50 },
    { field: 'licenseNumber', type: 'license', required: false, maxLength: 20 },
    
    // Medical information
    { field: 'specialty', type: 'text', required: false, maxLength: 100 },
    { field: 'medicalLicense', type: 'license', required: false, maxLength: 20 },
    { field: 'hospitalAffiliation', type: 'text', required: false, maxLength: 200 },
    { field: 'yearsOfExperience', type: 'text', required: false, maxLength: 10 },
    
    // Authentication
    { field: 'password', type: 'password', required: false, minLength: 8, maxLength: 128 },
    { field: 'confirmPassword', type: 'password', required: false, minLength: 8, maxLength: 128 },
    { field: 'currentPassword', type: 'password', required: false, minLength: 8, maxLength: 128 },
    
    // Medical records
    { field: 'diagnosis', type: 'text', required: false, maxLength: 1000 },
    { field: 'treatment', type: 'text', required: false, maxLength: 1000 },
    { field: 'medications', type: 'text', required: false, maxLength: 1000 },
    { field: 'allergies', type: 'text', required: false, maxLength: 500 },
    { field: 'notes', type: 'text', required: false, maxLength: 2000 },
    { field: 'symptoms', type: 'text', required: false, maxLength: 1000 },
    { field: 'vitalSigns', type: 'text', required: false, maxLength: 500 },
    { field: 'labValues', type: 'text', required: false, maxLength: 1000 },
    
    // Insurance information
    { field: 'insuranceProvider', type: 'text', required: false, maxLength: 100 },
    { field: 'policyNumber', type: 'text', required: false, maxLength: 50 },
    { field: 'groupNumber', type: 'text', required: false, maxLength: 50 },
    { field: 'subscriberId', type: 'text', required: false, maxLength: 50 },
    
    // Payment information
    { field: 'cardNumber', type: 'text', required: false, maxLength: 19 },
    { field: 'expiryDate', type: 'text', required: false, maxLength: 7 },
    { field: 'cvv', type: 'text', required: false, maxLength: 4 },
    { field: 'billingAddress', type: 'text', required: false, maxLength: 500 },
    
    // Emergency contacts
    { field: 'emergencyContactName', type: 'name', required: false, maxLength: 100 },
    { field: 'emergencyContactPhone', type: 'phone', required: false, maxLength: 15 },
    { field: 'emergencyContactRelationship', type: 'text', required: false, maxLength: 50 },
    
    // General fields
    { field: 'description', type: 'text', required: false, maxLength: 2000 },
    { field: 'comments', type: 'text', required: false, maxLength: 1000 },
    { field: 'reason', type: 'text', required: false, maxLength: 500 },
    { field: 'purpose', type: 'text', required: false, maxLength: 200 },
    { field: 'status', type: 'text', required: false, maxLength: 50 },
    { field: 'type', type: 'text', required: false, maxLength: 50 },
    { field: 'category', type: 'text', required: false, maxLength: 100 },
    { field: 'tags', type: 'text', required: false, maxLength: 500 }
  ];

  private static rules = this.DEFAULT_RULES;

  /**
   * Configure sanitization rules
   */
  static configureRules(rules: SanitizationRule[]): void {
    this.rules = rules;
  }

  /**
   * Add custom sanitization rule
   */
  static addRule(rule: SanitizationRule): void {
    this.rules.push(rule);
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(data: Record<string, unknown>, context?: string): SanitizationResult {
    try {
      const sanitized: Record<string, unknown> = {};
      const errors: string[] = [];
      const warnings: string[] = [];
      const sanitizedFields: string[] = [];
      const removedFields: string[] = [];

      // Log sanitization start
      logSecurityEvent('input_sanitization_started', {
        context: context || 'unknown',
        fieldCount: Object.keys(data).length,
        timestamp: new Date().toISOString()
      });

      // Process each field
      for (const [fieldName, value] of Object.entries(data)) {
        try {
          // Find rule for this field
          const rule = this.rules.find(r => r.field === fieldName);
          
          if (!rule) {
            // No rule defined, apply basic sanitization
            const sanitizedValue = this.basicSanitize(value);
            if (sanitizedValue !== null) {
              sanitized[fieldName] = sanitizedValue;
              sanitizedFields.push(fieldName);
            } else {
              removedFields.push(fieldName);
              warnings.push(`Field '${fieldName}' removed due to invalid content`);
            }
            continue;
          }

          // Validate required fields
          if (rule.required && (value === null || value === undefined || value === '')) {
            errors.push(`Field '${fieldName}' is required`);
            continue;
          }

          // Skip empty optional fields
          if (!rule.required && (value === null || value === undefined || value === '')) {
            continue;
          }

          // Convert value to string for sanitization
          const stringValue = String(value);

          // Apply field-specific sanitization
          const sanitizedValue = this.applyFieldSanitization(fieldName, stringValue, rule);
          
          if (sanitizedValue === null) {
            removedFields.push(fieldName);
            warnings.push(`Field '${fieldName}' removed due to invalid content`);
            continue;
          }

          // Validate length constraints
          if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
            errors.push(`Field '${fieldName}' exceeds maximum length of ${rule.maxLength} characters`);
            continue;
          }

          if (rule.minLength && sanitizedValue.length < rule.minLength) {
            errors.push(`Field '${fieldName}' is below minimum length of ${rule.minLength} characters`);
            continue;
          }

          // Validate pattern
          if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
            errors.push(`Field '${fieldName}' does not match required pattern`);
            continue;
          }

          // Apply custom validator
          if (rule.customValidator && !rule.customValidator(sanitizedValue)) {
            errors.push(`Field '${fieldName}' failed custom validation`);
            continue;
          }

          // Store sanitized value
          sanitized[fieldName] = sanitizedValue;
          sanitizedFields.push(fieldName);

        } catch (error) {
          errors.push(`Error processing field '${fieldName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const result: SanitizationResult = {
        valid: errors.length === 0,
        sanitized,
        errors,
        warnings,
        original: data,
        sanitizedFields,
        removedFields
      };

      // Log sanitization result
      logSecurityEvent('input_sanitization_completed', {
        context: context || 'unknown',
        valid: result.valid,
        sanitizedFields: result.sanitizedFields.length,
        removedFields: result.removedFields.length,
        errors: result.errors.length,
        warnings: result.warnings.length,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      logSecurityEvent('input_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });

      return {
        valid: false,
        sanitized: {},
        errors: ['Input sanitization failed'],
        warnings: [],
        original: data,
        sanitizedFields: [],
        removedFields: []
      };
    }
  }

  /**
   * Apply field-specific sanitization
   */
  private static applyFieldSanitization(fieldName: string, value: string, rule: SanitizationRule): string | null {
    try {
      // Check for malicious content first
      if (containsMaliciousContent(value)) {
        return null;
      }

      // Apply custom sanitizer if provided
      if (rule.customSanitizer) {
        return rule.customSanitizer(value);
      }

      // Apply type-specific sanitization
      switch (rule.type) {
        case 'email':
          return sanitizeEmail(value);
        
        case 'phone':
          return sanitizePhone(value);
        
        case 'license':
          return sanitizeLicenseNumber(value);
        
        case 'document':
          return sanitizeDocumentNumber(value);
        
        case 'name':
          return sanitizeName(value);
        
        case 'password':
          return sanitizePassword(value);
        
        case 'text':
          return sanitizeText(value);
        
        case 'json':
          return this.sanitizeJson(value);
        
        case 'html':
          return this.sanitizeHtml(value);
        
        case 'sql':
          return this.sanitizeSql(value);
        
        case 'xss':
          return this.sanitizeXss(value);
        
        default:
          return sanitizeText(value);
      }

    } catch (error) {
      return null;
    }
  }

  /**
   * Basic sanitization for fields without specific rules
   */
  private static basicSanitize(value: unknown): string | null {
    try {
      if (value === null || value === undefined) {
        return null;
      }

      const stringValue = String(value);
      
      // Check for malicious content
      if (containsMaliciousContent(stringValue)) {
        return null;
      }

      // Apply basic text sanitization
      return sanitizeText(stringValue);

    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize JSON data
   */
  private static sanitizeJson(value: string): string | null {
    try {
      // Parse and re-stringify to remove any potential malicious content
      const parsed = JSON.parse(value);
      const sanitized = JSON.stringify(parsed);
      
      // Check for malicious content in the sanitized JSON
      if (containsMaliciousContent(sanitized)) {
        return null;
      }

      return sanitized;

    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize HTML content
   */
  private static sanitizeHtml(value: string): string | null {
    try {
      // Remove HTML tags
      let sanitized = value.replace(/<[^>]*>/g, '');
      
      // Remove script tags and their content
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      
      // Remove javascript: URLs
      sanitized = sanitized.replace(/javascript:/gi, '');
      
      // Remove event handlers
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
      
      // Check for malicious content
      if (containsMaliciousContent(sanitized)) {
        return null;
      }

      return sanitized;

    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize SQL content
   */
  private static sanitizeSql(value: string): string | null {
    try {
      // Remove SQL injection patterns
      let sanitized = value;
      
      // Remove SQL keywords
      const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'EXECUTE', 'UNION'];
      sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        sanitized = sanitized.replace(regex, '');
      });
      
      // Remove SQL operators
      sanitized = sanitized.replace(/['";]/g, '');
      
      // Check for malicious content
      if (containsMaliciousContent(sanitized)) {
        return null;
      }

      return sanitized;

    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize XSS content
   */
  private static sanitizeXss(value: string): string | null {
    try {
      let sanitized = value;
      
      // Remove script tags
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      
      // Remove javascript: URLs
      sanitized = sanitized.replace(/javascript:/gi, '');
      
      // Remove event handlers
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
      
      // Remove dangerous characters
      sanitized = sanitized.replace(/[<>'"&;]/g, '');
      
      // Check for malicious content
      if (containsMaliciousContent(sanitized)) {
        return null;
      }

      return sanitized;

    } catch (error) {
      return null;
    }
  }

  /**
   * Validate sanitized data
   */
  static validateSanitizedData(data: Record<string, unknown>, rules?: SanitizationRule[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const validationRules = rules || this.rules;

      for (const rule of validationRules) {
        const value = data[rule.field];
        
        if (rule.required && (value === null || value === undefined || value === '')) {
          errors.push(`Field '${rule.field}' is required`);
        }

        if (value && typeof value === 'string') {
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`Field '${rule.field}' exceeds maximum length`);
          }

          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`Field '${rule.field}' is below minimum length`);
          }

          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`Field '${rule.field}' does not match required pattern`);
          }

          if (rule.customValidator && !rule.customValidator(value)) {
            errors.push(`Field '${rule.field}' failed custom validation`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: ['Validation failed'],
        warnings: []
      };
    }
  }

  /**
   * Get sanitization rules
   */
  static getRules(): SanitizationRule[] {
    return this.rules;
  }

  /**
   * Get sanitization service status
   */
  static getStatus(): {
    initialized: boolean;
    totalRules: number;
    requiredFields: number;
    optionalFields: number;
    supportedTypes: string[];
  } {
    return {
      initialized: true,
      totalRules: this.rules.length,
      requiredFields: this.rules.filter(r => r.required).length,
      optionalFields: this.rules.filter(r => !r.required).length,
      supportedTypes: ['text', 'email', 'phone', 'license', 'document', 'name', 'password', 'json', 'html', 'sql', 'xss']
    };
  }
}
