/**
 * Input Sanitization Service
 * @fileoverview Service responsible for sanitizing user inputs to prevent injection attacks
 * @compliance HIPAA-compliant input sanitization with audit trail
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Sanitization patterns and rules
 */
const SANITIZATION_PATTERNS = {
  // HTML/XML tags
  htmlTags: /<[^>]*>/g,
  
  // SQL injection patterns
  sqlInjection: [
    /('|(\\')|(;)|(\\;)|(--)|(\/\*)|(\*\/))/gi,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
    /(xp_|sp_|fn_)/gi
  ],
  
  // Script injection patterns
  scriptInjection: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ],
  
  // Special characters that could be dangerous
  dangerousChars: /[<>'"&;]/g,
  
  // Multiple spaces
  multipleSpaces: /\s+/g,
  
  // Leading/trailing whitespace
  trimWhitespace: /^\s+|\s+$/g
};

/**
 * Input sanitization service
 */
export class InputSanitizationService {
  
  /**
   * Sanitize general text input
   */
  static sanitizeText(input: string): string {
    try {
      if (!input || typeof input !== 'string') {
        return '';
      }

      let sanitized = input;

      // Remove HTML tags
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.htmlTags, '');

      // Remove script injections
      SANITIZATION_PATTERNS.scriptInjection.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      // Remove dangerous characters
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.dangerousChars, '');

      // Normalize whitespace
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.multipleSpaces, ' ');
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.trimWhitespace, '');

      // Log if significant changes were made
      if (sanitized !== input) {
        logSecurityEvent('input_sanitization_applied', {
          originalLength: input.length,
          sanitizedLength: sanitized.length,
          changesApplied: true,
          timestamp: new Date().toISOString()
        });
      }

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
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string | null {
    try {
      if (!email || typeof email !== 'string') {
        return null;
      }

      let sanitized = email.toLowerCase().trim();

      // Remove dangerous characters but preserve email format
      sanitized = sanitized.replace(/[<>'"&;]/g, '');

      // Remove multiple consecutive dots
      sanitized = sanitized.replace(/\.{2,}/g, '.');

      // Remove leading/trailing dots
      sanitized = sanitized.replace(/^\.+|\.+$/g, '');

      // Basic email format validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!emailRegex.test(sanitized)) {
        return null;
      }

      return sanitized;

    } catch (error) {
      logSecurityEvent('email_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(phone: string): string | null {
    try {
      if (!phone || typeof phone !== 'string') {
        return null;
      }

      // Remove all non-digit characters except + and -
      let sanitized = phone.replace(/[^\d+\-]/g, '');

      // Remove multiple consecutive + or -
      sanitized = sanitized.replace(/[+\-]{2,}/g, '+');

      // Ensure it starts with + if it contains country code
      if (sanitized.startsWith('58') && !sanitized.startsWith('+58')) {
        sanitized = '+' + sanitized;
      }

      return sanitized;

    } catch (error) {
      logSecurityEvent('phone_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Sanitize license number input
   */
  static sanitizeLicenseNumber(licenseNumber: string): string | null {
    try {
      if (!licenseNumber || typeof licenseNumber !== 'string') {
        return null;
      }

      // Remove all non-alphanumeric characters except hyphens
      let sanitized = licenseNumber.replace(/[^a-zA-Z0-9\-]/g, '');

      // Normalize to uppercase
      sanitized = sanitized.toUpperCase();

      // Remove multiple consecutive hyphens
      sanitized = sanitized.replace(/-{2,}/g, '-');

      // Remove leading/trailing hyphens
      sanitized = sanitized.replace(/^-+|-+$/g, '');

      return sanitized;

    } catch (error) {
      logSecurityEvent('license_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Sanitize document number input
   */
  static sanitizeDocumentNumber(documentNumber: string): string | null {
    try {
      if (!documentNumber || typeof documentNumber !== 'string') {
        return null;
      }

      // Remove all non-alphanumeric characters except hyphens
      let sanitized = documentNumber.replace(/[^a-zA-Z0-9\-]/g, '');

      // Normalize to uppercase
      sanitized = sanitized.toUpperCase();

      // Remove multiple consecutive hyphens
      sanitized = sanitized.replace(/-{2,}/g, '-');

      // Remove leading/trailing hyphens
      sanitized = sanitized.replace(/^-+|-+$/g, '');

      return sanitized;

    } catch (error) {
      logSecurityEvent('document_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Sanitize name input (first name, last name)
   */
  static sanitizeName(name: string): string | null {
    try {
      if (!name || typeof name !== 'string') {
        return null;
      }

      let sanitized = name;

      // Remove HTML tags
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.htmlTags, '');

      // Remove dangerous characters but preserve accented characters
      sanitized = sanitized.replace(/[<>'"&;]/g, '');

      // Keep only letters, spaces, and common name characters
      sanitized = sanitized.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]/g, '');

      // Normalize whitespace
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.multipleSpaces, ' ');
      sanitized = sanitized.replace(SANITIZATION_PATTERNS.trimWhitespace, '');

      // Capitalize first letter of each word
      sanitized = sanitized.replace(/\b\w/g, l => l.toUpperCase());

      return sanitized;

    } catch (error) {
      logSecurityEvent('name_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Sanitize password input (minimal sanitization to preserve security)
   */
  static sanitizePassword(password: string): string | null {
    try {
      if (!password || typeof password !== 'string') {
        return null;
      }

      // Only remove null bytes and control characters
      let sanitized = password.replace(/[\x00-\x1F\x7F]/g, '');

      // Remove extremely long passwords (potential DoS)
      if (sanitized.length > 128) {
        sanitized = sanitized.substring(0, 128);
      }

      return sanitized;

    } catch (error) {
      logSecurityEvent('password_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Check if input contains potentially malicious content
   */
  static containsMaliciousContent(input: string): boolean {
    try {
      if (!input || typeof input !== 'string') {
        return false;
      }

      // Check for SQL injection patterns
      for (const pattern of SANITIZATION_PATTERNS.sqlInjection) {
        if (pattern.test(input)) {
          logSecurityEvent('malicious_content_detected', {
            type: 'sql_injection',
            inputLength: input.length,
            timestamp: new Date().toISOString()
          });
          return true;
        }
      }

      // Check for script injection patterns
      for (const pattern of SANITIZATION_PATTERNS.scriptInjection) {
        if (pattern.test(input)) {
          logSecurityEvent('malicious_content_detected', {
            type: 'script_injection',
            inputLength: input.length,
            timestamp: new Date().toISOString()
          });
          return true;
        }
      }

      return false;

    } catch (error) {
      logSecurityEvent('malicious_content_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return true; // Err on the side of caution
    }
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: string): string | null {
    try {
      if (!input || typeof input !== 'string') {
        return null;
      }

      // Parse and re-stringify to remove any potential malicious content
      const parsed = JSON.parse(input);
      const sanitized = JSON.stringify(parsed);

      return sanitized;

    } catch (error) {
      logSecurityEvent('json_sanitization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }
}

// Export individual sanitization functions for convenience
export const sanitizeText = InputSanitizationService.sanitizeText;
export const sanitizeEmail = InputSanitizationService.sanitizeEmail;
export const sanitizePhone = InputSanitizationService.sanitizePhone;
export const sanitizeLicenseNumber = InputSanitizationService.sanitizeLicenseNumber;
export const sanitizeDocumentNumber = InputSanitizationService.sanitizeDocumentNumber;
export const sanitizeName = InputSanitizationService.sanitizeName;
export const sanitizePassword = InputSanitizationService.sanitizePassword;
export const containsMaliciousContent = InputSanitizationService.containsMaliciousContent;
export const sanitizeJson = InputSanitizationService.sanitizeJson;
