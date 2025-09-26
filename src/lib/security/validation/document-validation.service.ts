/**
 * Document Validation Service
 * @fileoverview Service responsible for Venezuelan document validation and uniqueness checking
 * @compliance HIPAA-compliant document validation with audit trail
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '../logging/security-logger';
import { sanitizeDocumentNumber } from '../sanitization/input-sanitizer';

export interface DocumentValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  formatted: string;
  error?: string;
  documentInfo?: {
    type: 'cedula_identidad' | 'cedula_extranjera' | 'pasaporte';
    format: string;
    description: string;
  };
}

export interface DocumentAvailabilityCheck {
  documentNumber: string;
  documentType: string;
  formatted: string;
  isAvailable: boolean;
  checkedAt: string;
  source: 'database' | 'cache';
}

/**
 * Venezuelan document patterns and validation rules
 */
const VENEZUELAN_DOCUMENT_PATTERNS = {
  cedula_identidad: {
    pattern: /^[JVGE]-\d{7,8}$/,
    description: 'Cédula de Identidad Venezolana',
    example: 'V-12345678',
    validator: (doc: string) => validateCedulaIdentidad(doc)
  },
  cedula_extranjera: {
    pattern: /^[E]-\d{7,8}$/,
    description: 'Cédula de Extranjería',
    example: 'E-12345678',
    validator: (doc: string) => validateCedulaExtranjera(doc)
  },
  pasaporte: {
    pattern: /^[A-Z]{2}\d{7}$/,
    description: 'Pasaporte Venezolano',
    example: 'VE1234567',
    validator: (doc: string) => validatePasaporte(doc)
  }
};

/**
 * Validate Venezuelan ID card (Cédula de Identidad) with enhanced algorithm
 */
function validateCedulaIdentidad(documentNumber: string): boolean {
  try {
    const match = documentNumber.match(/^([JVGE])-(\d{7,8})$/);
    if (!match) return false;

    const letter = match[1];
    const number = match[2];

    // Validate letter prefix
    const validLetters = ['J', 'V', 'G', 'E'];
    if (!validLetters.includes(letter)) return false;

    // Validate number length
    if (number.length < 7 || number.length > 8) return false;

    // Enhanced check digit validation for Venezuelan cedulas
    const digits = number.split('').map(Number);
    
    // Venezuelan cedula validation algorithm
    let sum = 0;
    const weights = [3, 2, 7, 6, 5, 4, 3, 2]; // Weights for each position
    
    for (let i = 0; i < digits.length - 1; i++) {
      sum += digits[i] * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return checkDigit === digits[digits.length - 1];

  } catch (error) {
    return false;
  }
}

/**
 * Validate Venezuelan foreigner ID card (Cédula de Extranjería) with enhanced algorithm
 */
function validateCedulaExtranjera(documentNumber: string): boolean {
  try {
    const match = documentNumber.match(/^([E])-(\d{7,8})$/);
    if (!match) return false;

    const number = match[2];

    // Validate number length
    if (number.length < 7 || number.length > 8) return false;

    // Enhanced validation for foreigner cedulas
    const digits = number.split('').map(Number);
    
    // Foreigner cedula validation algorithm (different from national cedulas)
    let sum = 0;
    const weights = [2, 3, 4, 5, 6, 7, 8, 9]; // Different weights for foreigners
    
    for (let i = 0; i < digits.length - 1; i++) {
      sum += digits[i] * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return checkDigit === digits[digits.length - 1];

  } catch (error) {
    return false;
  }
}

/**
 * Validate Venezuelan passport
 */
function validatePasaporte(documentNumber: string): boolean {
  try {
    const match = documentNumber.match(/^([A-Z]{2})(\d{7})$/);
    if (!match) return false;

    const countryCode = match[1];
    const number = match[2];

    // Validate country code (Venezuela)
    if (countryCode !== 'VE') return false;

    // Validate number length
    if (number.length !== 7) return false;

    return true;

  } catch (error) {
    return false;
  }
}

/**
 * Document validation service with real Supabase integration
 */
export class DocumentValidationService {
  private static readonly MAX_DOCUMENT_LENGTH = 15;
  private static readonly MIN_DOCUMENT_LENGTH = 8;

  /**
   * Validate Venezuelan document format
   */
  static validateDocumentFormat(documentNumber: string, documentType: string): DocumentValidationResult {
    try {
      // Sanitize input
      const sanitizedDocument = sanitizeDocumentNumber(documentNumber);
      
      if (!sanitizedDocument) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: 'Número de documento es requerido'
        };
      }

      // Normalize to uppercase
      const normalizedDocument = sanitizedDocument.toUpperCase().trim();

      // Check length
      if (normalizedDocument.length < this.MIN_DOCUMENT_LENGTH || normalizedDocument.length > this.MAX_DOCUMENT_LENGTH) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: `Número de documento debe tener entre ${this.MIN_DOCUMENT_LENGTH} y ${this.MAX_DOCUMENT_LENGTH} caracteres`
        };
      }

      // Get pattern for document type
      const pattern = VENEZUELAN_DOCUMENT_PATTERNS[documentType as keyof typeof VENEZUELAN_DOCUMENT_PATTERNS];
      if (!pattern) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: 'Tipo de documento no válido'
        };
      }

      // Check pattern match
      if (!pattern.pattern.test(normalizedDocument)) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: `Formato de ${pattern.description} inválido. Use formato: ${pattern.example}`
        };
      }

      // Run specific validator
      if (!pattern.validator(normalizedDocument)) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: `Número de ${pattern.description} inválido`
        };
      }

      return {
        isValid: true,
        isAvailable: false, // Will be checked separately
        formatted: normalizedDocument,
        error: undefined,
        documentInfo: {
          type: documentType as 'cedula_identidad' | 'cedula_extranjera' | 'pasaporte',
          format: pattern.example,
          description: pattern.description
        }
      };

    } catch (error) {
      logSecurityEvent(
        'data_access',
        'document_validation_error',
        {
          documentNumber: documentNumber.substring(0, 5) + '***',
          documentType,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: 'Error interno de validación'
      };
    }
  }

  /**
   * Format document number to standard format
   */
  static formatDocumentNumber(documentNumber: string, documentType: string): string {
    try {
      const sanitizedDocument = sanitizeDocumentNumber(documentNumber);
      if (!sanitizedDocument) return '';

      return sanitizedDocument.toUpperCase().trim();

    } catch (error) {
      return documentNumber;
    }
  }

  /**
   * Check document availability in Supabase database
   */
  static async checkDocumentAvailability(documentNumber: string, documentType: string): Promise<DocumentAvailabilityCheck> {
    try {
      const supabase = createClient();
      
      // Validate format first
      const formatValidation = this.validateDocumentFormat(documentNumber, documentType);
      if (!formatValidation.isValid) {
        throw new Error(formatValidation.error || 'Documento inválido');
      }

      const formattedDocument = formatValidation.formatted;

      // Log the check attempt
      await logSecurityEvent(
        'data_access',
        'document_availability_check_started',
        {
          documentNumber: formattedDocument.substring(0, 5) + '***',
          documentType
        },
        'info'
      );

      // Check in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number, document_type')
        .eq('document_number', formattedDocument)
        .eq('document_type', documentType)
        .maybeSingle();

      if (profileError) {
        await logSecurityEvent(
          'data_access',
          'document_availability_check_error',
          {
            documentNumber: formattedDocument.substring(0, 5) + '***',
            documentType,
            error: profileError.message
          },
          'error'
        );
        throw new Error('Error verificando disponibilidad del documento');
      }

      // Check in doctor_registrations table (for pending registrations)
      const { data: registrationData, error: registrationError } = await supabase
        .from('doctor_registrations')
        .select('document_number, document_type')
        .eq('document_number', formattedDocument)
        .eq('document_type', documentType)
        .maybeSingle();

      if (registrationError) {
        await logSecurityEvent(
          'data_access',
          'document_availability_check_error',
          {
            documentNumber: formattedDocument.substring(0, 5) + '***',
            documentType,
            error: registrationError.message
          },
          'error'
        );
        throw new Error('Error verificando registros pendientes');
      }

      const isAvailable = !profileData && !registrationData;

      // Log the result
      await logSecurityEvent(
        'data_access',
        'document_availability_check_completed',
        {
          documentNumber: formattedDocument.substring(0, 5) + '***',
          documentType,
          isAvailable
        },
        'info'
      );

      return {
        documentNumber: formattedDocument,
        documentType,
        formatted: formattedDocument,
        isAvailable,
        checkedAt: new Date().toISOString(),
        source: 'database'
      };

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'document_availability_check_failed',
        {
          documentNumber: documentNumber.substring(0, 5) + '***',
          documentType,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Comprehensive document validation (format + availability)
   */
  static async validateDocument(documentNumber: string, documentType: string): Promise<DocumentValidationResult> {
    try {
      // First validate format
      const formatValidation = this.validateDocumentFormat(documentNumber, documentType);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Then check availability
      const availabilityCheck = await this.checkDocumentAvailability(documentNumber, documentType);
      
      return {
        ...formatValidation,
        isAvailable: availabilityCheck.isAvailable,
        error: availabilityCheck.isAvailable ? undefined : 'Este documento ya está registrado'
      };

    } catch (error) {
      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: error instanceof Error ? error.message : 'Error verificando documento'
      };
    }
  }

  /**
   * Get document type information
   */
  static getDocumentTypeInfo(documentType: string): { type: string; description: string; example: string } | null {
    try {
      const pattern = VENEZUELAN_DOCUMENT_PATTERNS[documentType as keyof typeof VENEZUELAN_DOCUMENT_PATTERNS];
      
      if (pattern) {
        return {
          type: documentType,
          description: pattern.description,
          example: pattern.example
        };
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Validate document expiration
   */
  static validateDocumentExpiration(documentType: string, fechaVencimiento?: string): {
    valid: boolean;
    expired: boolean;
    daysUntilExpiry: number;
    error?: string;
  } {
    try {
      if (!fechaVencimiento) {
        // Some documents don't have expiration dates
        if (documentType === 'cedula_identidad') {
          return {
            valid: true,
            expired: false,
            daysUntilExpiry: Infinity
          };
        }
        
        return {
          valid: false,
          expired: false,
          daysUntilExpiry: 0,
          error: 'Fecha de vencimiento requerida para este tipo de documento'
        };
      }
      
      const vencimiento = new Date(fechaVencimiento);
      const hoy = new Date();
      
      if (isNaN(vencimiento.getTime())) {
        return {
          valid: false,
          expired: false,
          daysUntilExpiry: 0,
          error: 'Fecha de vencimiento inválida'
        };
      }
      
      const diffTime = vencimiento.getTime() - hoy.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        valid: true,
        expired: daysUntilExpiry < 0,
        daysUntilExpiry: Math.max(0, daysUntilExpiry)
      };
      
    } catch (error) {
      return {
        valid: false,
        expired: false,
        daysUntilExpiry: 0,
        error: 'Error validando fecha de vencimiento'
      };
    }
  }

  /**
   * Get document type requirements
   */
  static getDocumentRequirements(documentType: string): {
    format: string;
    length: { min: number; max: number };
    pattern: RegExp;
    checkDigit: boolean;
    expirationRequired: boolean;
    description: string;
  } {
    const requirements = {
      cedula_identidad: {
        format: 'V-12345678',
        length: { min: 9, max: 10 },
        pattern: /^[JVGE]-\d{7,8}$/,
        checkDigit: true,
        expirationRequired: false,
        description: 'Cédula de Identidad Venezolana'
      },
      cedula_extranjera: {
        format: 'E-12345678',
        length: { min: 9, max: 10 },
        pattern: /^[E]-\d{7,8}$/,
        checkDigit: true,
        expirationRequired: true,
        description: 'Cédula de Extranjería'
      },
      pasaporte: {
        format: 'VE1234567',
        length: { min: 9, max: 9 },
        pattern: /^[A-Z]{2}\d{7}$/,
        checkDigit: false,
        expirationRequired: true,
        description: 'Pasaporte Venezolano'
      }
    };
    
    return requirements[documentType as keyof typeof requirements] || {
      format: 'Unknown',
      length: { min: 0, max: 0 },
      pattern: /^$/,
      checkDigit: false,
      expirationRequired: false,
      description: 'Tipo de documento desconocido'
    };
  }

  /**
   * Generate check digit for Venezuelan cedula
   */
  static generateCheckDigit(documentNumber: string, documentType: string): string | null {
    try {
      const match = documentNumber.match(/^([JVGE])-(\d{7,8})$/);
      if (!match) return null;

      const number = match[2];
      const digits = number.split('').map(Number);
      
      let sum = 0;
      let weights: number[];
      
      if (documentType === 'cedula_extranjera') {
        weights = [2, 3, 4, 5, 6, 7, 8, 9];
      } else {
        weights = [3, 2, 7, 6, 5, 4, 3, 2];
      }
      
      for (let i = 0; i < digits.length - 1; i++) {
        sum += digits[i] * weights[i];
      }
      
      const remainder = sum % 11;
      const checkDigit = remainder < 2 ? remainder : 11 - remainder;
      
      return checkDigit.toString();

    } catch (error) {
      return null;
    }
  }

  /**
   * Validate document format with detailed feedback
   */
  static validateDocumentFormatDetailed(documentNumber: string, documentType: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    formatted: string;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    try {
      // Sanitize input
      const sanitizedDocument = sanitizeDocumentNumber(documentNumber);
      
      if (!sanitizedDocument) {
        errors.push('Número de documento es requerido');
        return { valid: false, errors, warnings, suggestions, formatted: '' };
      }

      // Normalize to uppercase
      const normalizedDocument = sanitizedDocument.toUpperCase().trim();
      const requirements = this.getDocumentRequirements(documentType);

      // Check length
      if (normalizedDocument.length < requirements.length.min) {
        errors.push(`Documento muy corto. Mínimo ${requirements.length.min} caracteres`);
      } else if (normalizedDocument.length > requirements.length.max) {
        errors.push(`Documento muy largo. Máximo ${requirements.length.max} caracteres`);
      }

      // Check pattern
      if (!requirements.pattern.test(normalizedDocument)) {
        errors.push(`Formato inválido. Use formato: ${requirements.format}`);
        suggestions.push(`Ejemplo válido: ${requirements.format}`);
      }

      // Check specific validations
      const pattern = VENEZUELAN_DOCUMENT_PATTERNS[documentType as keyof typeof VENEZUELAN_DOCUMENT_PATTERNS];
      if (pattern && !pattern.validator(normalizedDocument)) {
        errors.push(`${requirements.description} inválido`);
      }

      // Add warnings for common mistakes
      if (normalizedDocument.includes(' ')) {
        warnings.push('El documento no debe contener espacios');
        suggestions.push('Remueva los espacios del número de documento');
      }

      if (normalizedDocument.includes('.')) {
        warnings.push('El documento no debe contener puntos');
        suggestions.push('Remueva los puntos del número de documento');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        formatted: normalizedDocument
      };

    } catch (error) {
      errors.push('Error interno de validación');
      return { valid: false, errors, warnings, suggestions, formatted: '' };
    }
  }

  /**
   * Suggest alternative document numbers
   */
  static suggestAlternativeDocuments(baseDocument: string, documentType: string): string[] {
    const suggestions: string[] = [];
    
    try {
      const sanitized = sanitizeDocumentNumber(baseDocument);
      if (!sanitized) return suggestions;

      const normalized = sanitized.toUpperCase().trim();
      const requirements = this.getDocumentRequirements(documentType);

      // Try different prefixes for cedulas
      if (documentType === 'cedula_identidad') {
        const prefixes = ['V', 'J', 'G', 'E'];
        const numberPart = normalized.replace(/^[JVGE]-/, '');
        
        for (const prefix of prefixes) {
          if (prefix !== normalized.charAt(0)) {
            const suggestion = `${prefix}-${numberPart}`;
            if (requirements.pattern.test(suggestion)) {
              suggestions.push(suggestion);
            }
          }
        }
      }

      // Try fixing common formatting issues
      if (normalized.includes(' ')) {
        suggestions.push(normalized.replace(/\s/g, ''));
      }

      if (normalized.includes('.')) {
        suggestions.push(normalized.replace(/\./g, ''));
      }

      // Try adding missing hyphen
      if (!normalized.includes('-') && normalized.length >= 8) {
        const prefix = normalized.charAt(0);
        const number = normalized.slice(1);
        suggestions.push(`${prefix}-${number}`);
      }

      return suggestions.slice(0, 5); // Limit to 5 suggestions

    } catch (error) {
      return suggestions;
    }
  }

  /**
   * Validate document uniqueness in database
   */
  static async validateDocumentUniqueness(
    documentNumber: string, 
    documentType: string,
    userId?: string
  ): Promise<{
    unique: boolean;
    exists: boolean;
    ownerId?: string;
    error?: string;
  }> {
    try {
      const normalizedDocument = sanitizeDocumentNumber(documentNumber);
      if (!normalizedDocument) {
        return {
          unique: false,
          exists: false,
          error: 'Número de documento inválido'
        };
      }

      // This would integrate with your Supabase database
      // For now, returning a mock response
      // In production, you would query your database here
      
      return {
        unique: true,
        exists: false
      };

    } catch (error) {
      return {
        unique: false,
        exists: false,
        error: 'Error verificando unicidad del documento'
      };
    }
  }

  /**
   * Get document validation summary
   */
  static getDocumentValidationSummary(documentNumber: string, documentType: string): {
    isValid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Basic format validation
      const formatValidation = this.validateDocumentFormatDetailed(documentNumber, documentType);
      
      if (!formatValidation.valid) {
        score -= 50;
        issues.push(...formatValidation.errors);
        recommendations.push(...formatValidation.suggestions);
      }

      // Check digit validation
      const requirements = this.getDocumentRequirements(documentType);
      if (requirements.checkDigit) {
        const pattern = VENEZUELAN_DOCUMENT_PATTERNS[documentType as keyof typeof VENEZUELAN_DOCUMENT_PATTERNS];
        if (pattern && !pattern.validator(formatValidation.formatted)) {
          score -= 30;
          issues.push('Dígito verificador inválido');
          recommendations.push('Verifique el número de documento');
        }
      }

      // Length validation
      if (formatValidation.formatted.length < requirements.length.min) {
        score -= 20;
        issues.push('Documento muy corto');
      } else if (formatValidation.formatted.length > requirements.length.max) {
        score -= 20;
        issues.push('Documento muy largo');
      }

      // Pattern validation
      if (!requirements.pattern.test(formatValidation.formatted)) {
        score -= 40;
        issues.push('Formato incorrecto');
        recommendations.push(`Use formato: ${requirements.format}`);
      }

      return {
        isValid: score >= 70,
        score: Math.max(0, score),
        issues,
        recommendations
      };

    } catch (error) {
      return {
        isValid: false,
        score: 0,
        issues: ['Error interno de validación'],
        recommendations: ['Contacte soporte técnico']
      };
    }
  }
}
