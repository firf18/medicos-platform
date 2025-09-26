/**
 * Venezuelan Document Validation Service
 * @fileoverview Comprehensive validation for Venezuelan identity documents
 * @compliance HIPAA-compliant document validation with check digit verification
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Venezuelan document types
 */
export type VenezuelanDocumentType = 
  | 'cedula_identidad'
  | 'cedula_extranjeria'
  | 'pasaporte'
  | 'cedula_profesional'
  | 'licencia_conducir'
  | 'partida_nacimiento'
  | 'certificado_nacimiento';

/**
 * Document validation result
 */
export interface DocumentValidationResult {
  isValid: boolean;
  documentType: VenezuelanDocumentType;
  format: string;
  checkDigitValid: boolean;
  age?: number;
  isExpired: boolean;
  expirationDate?: string;
  issuingAuthority?: string;
  errors: string[];
  warnings: string[];
  confidence: 'high' | 'medium' | 'low';
  lastValidated: string;
}

/**
 * Document format configuration
 */
export interface DocumentFormatConfig {
  type: VenezuelanDocumentType;
  pattern: RegExp;
  example: string;
  description: string;
  checkDigitAlgorithm: 'cedula_venezolana' | 'cedula_extranjera' | 'pasaporte' | 'none';
  length: number;
  prefix: string;
}

/**
 * Venezuelan document validation service
 */
export class VenezuelanDocumentValidationService {
  
  /**
   * Document format configurations
   */
  private static readonly DOCUMENT_FORMATS: Record<VenezuelanDocumentType, DocumentFormatConfig> = {
    cedula_identidad: {
      type: 'cedula_identidad',
      pattern: /^[VJEG]-\d{7,8}$/,
      example: 'V-12345678',
      description: 'Cédula de Identidad Venezolana',
      checkDigitAlgorithm: 'cedula_venezolana',
      length: 8,
      prefix: 'V'
    },
    cedula_extranjeria: {
      type: 'cedula_extranjeria',
      pattern: /^E-\d{7,8}$/,
      example: 'E-12345678',
      description: 'Cédula de Extranjería',
      checkDigitAlgorithm: 'cedula_extranjera',
      length: 8,
      prefix: 'E'
    },
    pasaporte: {
      type: 'pasaporte',
      pattern: /^VE\d{7}$/,
      example: 'VE1234567',
      description: 'Pasaporte Venezolano',
      checkDigitAlgorithm: 'pasaporte',
      length: 9,
      prefix: 'VE'
    },
    cedula_profesional: {
      type: 'cedula_profesional',
      pattern: /^[VJEG]-\d{7,8}$/,
      example: 'V-12345678',
      description: 'Cédula Profesional',
      checkDigitAlgorithm: 'cedula_venezolana',
      length: 8,
      prefix: 'V'
    },
    licencia_conducir: {
      type: 'licencia_conducir',
      pattern: /^LC\d{8}$/,
      example: 'LC12345678',
      description: 'Licencia de Conducir',
      checkDigitAlgorithm: 'none',
      length: 10,
      prefix: 'LC'
    },
    partida_nacimiento: {
      type: 'partida_nacimiento',
      pattern: /^PN\d{10}$/,
      example: 'PN1234567890',
      description: 'Partida de Nacimiento',
      checkDigitAlgorithm: 'none',
      length: 12,
      prefix: 'PN'
    },
    certificado_nacimiento: {
      type: 'certificado_nacimiento',
      pattern: /^CN\d{10}$/,
      example: 'CN1234567890',
      description: 'Certificado de Nacimiento',
      checkDigitAlgorithm: 'none',
      length: 12,
      prefix: 'CN'
    }
  };

  /**
   * Validate Venezuelan document
   */
  static async validateDocument(
    documentNumber: string,
    documentType?: VenezuelanDocumentType,
    birthDate?: string
  ): Promise<DocumentValidationResult> {
    try {
      const result: DocumentValidationResult = {
        isValid: false,
        documentType: 'cedula_identidad',
        format: '',
        checkDigitValid: false,
        isExpired: false,
        errors: [],
        warnings: [],
        confidence: 'low',
        lastValidated: new Date().toISOString()
      };

      // Normalize document number
      const normalizedDoc = documentNumber.toUpperCase().trim();
      result.format = normalizedDoc;

      // Determine document type if not provided
      if (!documentType) {
        documentType = this.determineDocumentType(normalizedDoc);
      }

      result.documentType = documentType;

      // Validate format
      const formatConfig = this.DOCUMENT_FORMATS[documentType];
      if (!formatConfig.pattern.test(normalizedDoc)) {
        result.errors.push(`Formato inválido para ${documentType}`);
        return result;
      }

      // Validate check digit
      result.checkDigitValid = this.validateCheckDigit(normalizedDoc, formatConfig.checkDigitAlgorithm);
      if (!result.checkDigitValid) {
        result.errors.push('Dígito verificador inválido');
      }

      // Calculate age if birth date is provided
      if (birthDate) {
        result.age = this.calculateAge(birthDate);
        if (result.age < 0 || result.age > 120) {
          result.warnings.push('Edad fuera del rango normal');
        }
      }

      // Check for expiration (for documents that expire)
      if (this.documentExpires(documentType)) {
        result.isExpired = this.isDocumentExpired(normalizedDoc, documentType);
        if (result.isExpired) {
          result.warnings.push('Documento vencido');
        }
      }

      // Set issuing authority
      result.issuingAuthority = this.getIssuingAuthority(documentType);

      // Determine confidence level
      result.confidence = this.determineConfidence(result);

      // Final validation
      result.isValid = result.errors.length === 0;

      // Log validation
      logSecurityEvent('venezuelan_document_validated', {
        documentType,
        isValid: result.isValid,
        checkDigitValid: result.checkDigitValid,
        confidence: result.confidence,
        timestamp: result.lastValidated
      });

      return result;

    } catch (error) {
      logSecurityEvent('venezuelan_document_validation_error', {
        documentNumber: documentNumber.substring(0, 5) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        isValid: false,
        documentType: 'cedula_identidad',
        format: documentNumber,
        checkDigitValid: false,
        errors: ['Error en validación de documento'],
        warnings: [],
        confidence: 'low',
        lastValidated: new Date().toISOString()
      };
    }
  }

  /**
   * Determine document type from number
   */
  private static determineDocumentType(documentNumber: string): VenezuelanDocumentType {
    const normalized = documentNumber.toUpperCase().trim();

    if (normalized.startsWith('VE')) {
      return 'pasaporte';
    } else if (normalized.startsWith('E-')) {
      return 'cedula_extranjeria';
    } else if (normalized.startsWith('LC')) {
      return 'licencia_conducir';
    } else if (normalized.startsWith('PN')) {
      return 'partida_nacimiento';
    } else if (normalized.startsWith('CN')) {
      return 'certificado_nacimiento';
    } else if (/^[VJG]-\d{7,8}$/.test(normalized)) {
      return 'cedula_identidad';
    } else {
      return 'cedula_identidad'; // Default
    }
  }

  /**
   * Validate check digit
   */
  private static validateCheckDigit(
    documentNumber: string,
    algorithm: 'cedula_venezolana' | 'cedula_extranjera' | 'pasaporte' | 'none'
  ): boolean {
    try {
      switch (algorithm) {
        case 'cedula_venezolana':
          return this.validateCedulaVenezolana(documentNumber);
        case 'cedula_extranjera':
          return this.validateCedulaExtranjera(documentNumber);
        case 'pasaporte':
          return this.validatePasaporte(documentNumber);
        case 'none':
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Validate Venezuelan ID card check digit
   */
  private static validateCedulaVenezolana(documentNumber: string): boolean {
    try {
      // Extract letter and number
      const match = documentNumber.match(/^([VJEG])-(\d{7,8})$/);
      if (!match) return false;

      const letter = match[1];
      const number = match[2];

      // Validate letter
      const validLetters = ['V', 'J', 'G', 'E'];
      if (!validLetters.includes(letter)) return false;

      // Validate number length
      if (number.length < 7 || number.length > 8) return false;

      // Calculate check digit
      const digits = number.split('').map(Number);
      let sum = 0;
      
      for (let i = 0; i < digits.length - 1; i++) {
        sum += digits[i] * (digits.length - i);
      }
      
      const checkDigit = sum % 10;
      return checkDigit === digits[digits.length - 1];

    } catch {
      return false;
    }
  }

  /**
   * Validate foreigner ID card check digit
   */
  private static validateCedulaExtranjera(documentNumber: string): boolean {
    try {
      const match = documentNumber.match(/^E-(\d{7,8})$/);
      if (!match) return false;

      const number = match[1];

      // Foreigner cards typically have 8 digits
      if (number.length !== 8) return false;

      // Simple validation for foreigner cards
      const digits = number.split('').map(Number);
      let sum = 0;
      
      for (let i = 0; i < digits.length - 1; i++) {
        sum += digits[i] * (i + 1);
      }
      
      const checkDigit = sum % 10;
      return checkDigit === digits[digits.length - 1];

    } catch {
      return false;
    }
  }

  /**
   * Validate passport check digit
   */
  private static validatePasaporte(documentNumber: string): boolean {
    try {
      const match = documentNumber.match(/^VE(\d{7})$/);
      if (!match) return false;

      const number = match[1];

      // Passport validation algorithm
      const digits = number.split('').map(Number);
      let sum = 0;
      
      for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * (i + 1);
      }
      
      const checkDigit = sum % 10;
      return checkDigit === 0; // Passports typically end in 0

    } catch {
      return false;
    }
  }

  /**
   * Calculate age from birth date
   */
  private static calculateAge(birthDate: string): number {
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Check if document type expires
   */
  private static documentExpires(documentType: VenezuelanDocumentType): boolean {
    const expiringDocuments: VenezuelanDocumentType[] = [
      'pasaporte',
      'licencia_conducir'
    ];
    
    return expiringDocuments.includes(documentType);
  }

  /**
   * Check if document is expired
   */
  private static isDocumentExpired(documentNumber: string, documentType: VenezuelanDocumentType): boolean {
    // This would typically check against a database or external service
    // For now, we'll implement basic logic
    
    if (documentType === 'pasaporte') {
      // Passports typically expire after 10 years
      // Extract year from document number (simplified)
      const yearMatch = documentNumber.match(/\d{2}/);
      if (yearMatch) {
        const year = parseInt('20' + yearMatch[0]);
        const currentYear = new Date().getFullYear();
        return (currentYear - year) > 10;
      }
    }
    
    return false;
  }

  /**
   * Get issuing authority for document type
   */
  private static getIssuingAuthority(documentType: VenezuelanDocumentType): string {
    const authorities: Record<VenezuelanDocumentType, string> = {
      cedula_identidad: 'SAIME (Servicio Administrativo de Identificación, Migración y Extranjería)',
      cedula_extranjeria: 'SAIME (Servicio Administrativo de Identificación, Migración y Extranjería)',
      pasaporte: 'SAIME (Servicio Administrativo de Identificación, Migración y Extranjería)',
      cedula_profesional: 'Colegio de Profesionales correspondiente',
      licencia_conducir: 'INTT (Instituto Nacional de Transporte Terrestre)',
      partida_nacimiento: 'Registro Civil',
      certificado_nacimiento: 'Registro Civil'
    };
    
    return authorities[documentType];
  }

  /**
   * Determine confidence level
   */
  private static determineConfidence(result: DocumentValidationResult): 'high' | 'medium' | 'low' {
    let score = 0;
    
    if (result.checkDigitValid) score += 3;
    if (result.errors.length === 0) score += 2;
    if (result.warnings.length === 0) score += 1;
    if (result.age !== undefined && result.age >= 0 && result.age <= 120) score += 1;
    if (!result.isExpired) score += 1;
    
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Validate multiple documents
   */
  static async validateMultipleDocuments(
    documents: Array<{ number: string; type?: VenezuelanDocumentType; birthDate?: string }>
  ): Promise<DocumentValidationResult[]> {
    const results: DocumentValidationResult[] = [];
    
    for (const doc of documents) {
      try {
        const result = await this.validateDocument(doc.number, doc.type, doc.birthDate);
        results.push(result);
      } catch (error) {
        results.push({
          isValid: false,
          documentType: 'cedula_identidad',
          format: doc.number,
          checkDigitValid: false,
          errors: ['Error en validación'],
          warnings: [],
          confidence: 'low',
          lastValidated: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * Get all supported document types
   */
  static getSupportedDocumentTypes(): Record<VenezuelanDocumentType, DocumentFormatConfig> {
    return this.DOCUMENT_FORMATS;
  }

  /**
   * Get document validation service status
   */
  static getStatus(): {
    initialized: boolean;
    supportedTypes: number;
    checkDigitAlgorithms: string[];
  } {
    return {
      initialized: true,
      supportedTypes: Object.keys(this.DOCUMENT_FORMATS).length,
      checkDigitAlgorithms: ['cedula_venezolana', 'cedula_extranjera', 'pasaporte', 'none']
    };
  }
}
