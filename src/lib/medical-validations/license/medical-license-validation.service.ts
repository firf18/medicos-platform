/**
 * Medical License Validation Service
 * @fileoverview Comprehensive medical license validation for Venezuelan healthcare professionals
 * @compliance HIPAA-compliant license validation with SACS integration
 */

import { SACSScrapingService, SACSMedicalData } from '../scraping/sacs-scraping.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { createClient } from '@/lib/supabase/client';

/**
 * Venezuelan professional license types
 */
export type VenezuelanLicenseType = 
  | 'cedula_profesional_medico'
  | 'cedula_profesional_veterinario'
  | 'cedula_profesional_odontologo'
  | 'licencia_medica'
  | 'registro_profesional'
  | 'certificado_especialidad';

/**
 * License validation result
 */
export interface LicenseValidationResult {
  isValid: boolean;
  isActive: boolean;
  licenseType: VenezuelanLicenseType;
  professionalType: 'medico' | 'veterinario' | 'odontologo' | 'otro';
  specialty?: string;
  subSpecialty?: string;
  expirationDate?: string;
  issuingInstitution?: string;
  verificationSource: 'sacs' | 'database' | 'manual';
  confidence: 'high' | 'medium' | 'low';
  errors: string[];
  warnings: string[];
  sacsData?: SACSMedicalData;
  lastVerified: string;
}

/**
 * License format validation
 */
export interface LicenseFormatValidation {
  isValid: boolean;
  format: string;
  pattern: RegExp;
  example: string;
  description: string;
}

/**
 * Medical license validation service
 */
export class MedicalLicenseValidationService {
  
  /**
   * Venezuelan license patterns
   */
  private static readonly LICENSE_PATTERNS: Record<VenezuelanLicenseType, LicenseFormatValidation> = {
    cedula_profesional_medico: {
      isValid: false,
      format: 'V-12345678',
      pattern: /^V-\d{7,8}$/,
      example: 'V-12345678',
      description: 'Cédula Profesional de Médico'
    },
    cedula_profesional_veterinario: {
      isValid: false,
      format: 'V-12345678',
      pattern: /^V-\d{7,8}$/,
      example: 'V-12345678',
      description: 'Cédula Profesional de Veterinario'
    },
    cedula_profesional_odontologo: {
      isValid: false,
      format: 'V-12345678',
      pattern: /^V-\d{7,8}$/,
      example: 'V-12345678',
      description: 'Cédula Profesional de Odontólogo'
    },
    licencia_medica: {
      isValid: false,
      format: 'LM-12345678',
      pattern: /^LM-\d{6,8}$/,
      example: 'LM-12345678',
      description: 'Licencia Médica'
    },
    registro_profesional: {
      isValid: false,
      format: 'RP-12345678',
      pattern: /^RP-\d{6,8}$/,
      example: 'RP-12345678',
      description: 'Registro Profesional'
    },
    certificado_especialidad: {
      isValid: false,
      format: 'CE-12345678',
      pattern: /^CE-\d{6,8}$/,
      example: 'CE-12345678',
      description: 'Certificado de Especialidad'
    }
  };

  /**
   * Validate license format
   */
  static validateLicenseFormat(licenseNumber: string): LicenseFormatValidation & { matchedType?: VenezuelanLicenseType } {
    try {
      const normalizedLicense = licenseNumber.toUpperCase().trim();

      for (const [type, pattern] of Object.entries(this.LICENSE_PATTERNS)) {
        if (pattern.pattern.test(normalizedLicense)) {
          return {
            ...pattern,
            isValid: true,
            matchedType: type as VenezuelanLicenseType
          };
        }
      }

      return {
        isValid: false,
        format: 'unknown',
        pattern: /^$/,
        example: 'V-12345678',
        description: 'Formato de licencia no reconocido'
      };

    } catch (error) {
      logSecurityEvent('license_format_validation_error', {
        licenseNumber: licenseNumber.substring(0, 5) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        isValid: false,
        format: 'error',
        pattern: /^$/,
        example: 'V-12345678',
        description: 'Error en validación de formato'
      };
    }
  }

  /**
   * Comprehensive license validation
   */
  static async validateMedicalLicense(
    licenseNumber: string,
    cedula?: string,
    specialty?: string
  ): Promise<LicenseValidationResult> {
    const startTime = Date.now();
    
    try {
      // Initialize result
      const result: LicenseValidationResult = {
        isValid: false,
        isActive: false,
        licenseType: 'cedula_profesional_medico',
        professionalType: 'medico',
        verificationSource: 'manual',
        confidence: 'low',
        errors: [],
        warnings: [],
        lastVerified: new Date().toISOString()
      };

      // Validate format
      const formatValidation = this.validateLicenseFormat(licenseNumber);
      if (!formatValidation.isValid) {
        result.errors.push('Formato de licencia inválido');
        return result;
      }

      result.licenseType = formatValidation.matchedType || 'cedula_profesional_medico';

      // If cedula is provided, verify with SACS
      if (cedula) {
        try {
          const sacsResult = await SACSScrapingService.verifyMedicalLicense(cedula);
          
          if (sacsResult.success && sacsResult.found && sacsResult.data) {
            result.sacsData = sacsResult.data;
            result.verificationSource = 'sacs';
            result.confidence = 'high';
            
            // Validate license against SACS data
            this.validateAgainstSACSData(result, sacsResult.data, licenseNumber, specialty);
          } else {
            result.warnings.push('No se pudo verificar con SACS');
            result.confidence = 'medium';
          }
        } catch (error) {
          result.warnings.push('Error en verificación SACS');
          result.confidence = 'medium';
        }
      }

      // Check database for additional validation
      const dbValidation = await this.validateAgainstDatabase(licenseNumber);
      if (dbValidation) {
        this.mergeDatabaseValidation(result, dbValidation);
      }

      // Final validation
      result.isValid = result.errors.length === 0;
      result.isActive = result.isValid && this.isLicenseActive(result);

      // Log validation
      logSecurityEvent('medical_license_validated', {
        licenseNumber: licenseNumber.substring(0, 5) + '***',
        isValid: result.isValid,
        isActive: result.isActive,
        confidence: result.confidence,
        verificationSource: result.verificationSource,
        processingTime: Date.now() - startTime,
        timestamp: result.lastVerified
      });

      return result;

    } catch (error) {
      logSecurityEvent('medical_license_validation_error', {
        licenseNumber: licenseNumber.substring(0, 5) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

      return {
        isValid: false,
        isActive: false,
        licenseType: 'cedula_profesional_medico',
        professionalType: 'medico',
        verificationSource: 'manual',
        confidence: 'low',
        errors: ['Error en validación de licencia'],
        warnings: [],
        lastVerified: new Date().toISOString()
      };
    }
  }

  /**
   * Validate license against SACS data
   */
  private static validateAgainstSACSData(
    result: LicenseValidationResult,
    sacsData: SACSMedicalData,
    licenseNumber: string,
    specialty?: string
  ): void {
    // Set professional type
    result.professionalType = sacsData.tipoProfesional;

    // Set specialty information
    if (sacsData.especialidad) {
      result.specialty = sacsData.especialidad;
    }
    if (sacsData.subEspecialidad) {
      result.subSpecialty = sacsData.subEspecialidad;
    }

    // Set expiration date
    if (sacsData.fechaVencimiento) {
      result.expirationDate = sacsData.fechaVencimiento;
    }

    // Set issuing institution
    if (sacsData.institucionExpedidora) {
      result.issuingInstitution = sacsData.institucionExpedidora;
    }

    // Validate license status
    if (sacsData.estadoLicencia === 'vencida') {
      result.errors.push('Licencia vencida');
    } else if (sacsData.estadoLicencia === 'suspendida') {
      result.errors.push('Licencia suspendida');
    } else if (sacsData.estadoLicencia === 'cancelada') {
      result.errors.push('Licencia cancelada');
    }

    // Validate specialty match
    if (specialty && sacsData.especialidad && specialty.toLowerCase() !== sacsData.especialidad.toLowerCase()) {
      result.warnings.push(`Especialidad no coincide: esperada ${specialty}, encontrada ${sacsData.especialidad}`);
    }

    // Check professional status
    if (sacsData.estadoColegiado === 'inactivo') {
      result.warnings.push('Profesional inactivo en colegio');
    } else if (sacsData.estadoColegiado === 'suspendido') {
      result.errors.push('Profesional suspendido en colegio');
    }

    // Add observations
    if (sacsData.observaciones && sacsData.observaciones.length > 0) {
      result.warnings.push(...sacsData.observaciones);
    }
  }

  /**
   * Validate against database
   */
  private static async validateAgainstDatabase(licenseNumber: string): Promise<any> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('medical_licenses')
        .select('*')
        .eq('license_number', licenseNumber)
        .single();

      if (error || !data) {
        return null;
      }

      return data;

    } catch (error) {
      return null;
    }
  }

  /**
   * Merge database validation results
   */
  private static mergeDatabaseValidation(result: LicenseValidationResult, dbData: any): void {
    if (dbData.is_active === false) {
      result.errors.push('Licencia inactiva en base de datos');
    }

    if (dbData.expiration_date && new Date(dbData.expiration_date) < new Date()) {
      result.errors.push('Licencia expirada según base de datos');
    }

    if (dbData.specialty && result.specialty && dbData.specialty !== result.specialty) {
      result.warnings.push('Discrepancia en especialidad con base de datos');
    }
  }

  /**
   * Check if license is active
   */
  private static isLicenseActive(result: LicenseValidationResult): boolean {
    if (!result.isValid) {
      return false;
    }

    if (result.expirationDate) {
      const expirationDate = new Date(result.expirationDate);
      const now = new Date();
      
      if (expirationDate <= now) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate specialty requirements
   */
  static validateSpecialtyRequirements(
    specialty: string,
    professionalType: 'medico' | 'veterinario' | 'odontologo' | 'otro'
  ): { valid: boolean; requirements: string[]; errors: string[] } {
    const requirements: string[] = [];
    const errors: string[] = [];

    // Define specialty requirements
    const specialtyRequirements: Record<string, string[]> = {
      'cardiologia': ['licencia_medica', 'certificado_especialidad'],
      'neurologia': ['licencia_medica', 'certificado_especialidad'],
      'pediatria': ['licencia_medica', 'certificado_especialidad'],
      'ginecologia': ['licencia_medica', 'certificado_especialidad'],
      'cirugia': ['licencia_medica', 'certificado_especialidad'],
      'medicina_interna': ['licencia_medica'],
      'medicina_general': ['licencia_medica'],
      'veterinaria_clinica': ['cedula_profesional_veterinario'],
      'veterinaria_cirugia': ['cedula_profesional_veterinario', 'certificado_especialidad'],
      'odontologia_general': ['cedula_profesional_odontologo'],
      'ortodoncia': ['cedula_profesional_odontologo', 'certificado_especialidad'],
      'endodoncia': ['cedula_profesional_odontologo', 'certificado_especialidad']
    };

    const specialtyKey = specialty.toLowerCase().replace(/\s+/g, '_');
    const requiredLicenses = specialtyRequirements[specialtyKey];

    if (!requiredLicenses) {
      errors.push(`Especialidad '${specialtyKey}' no reconocida`);
      return { valid: false, requirements: [], errors };
    }

    // Check professional type compatibility
    if (professionalType === 'medico' && !requiredLicenses.some(license => license.includes('medica'))) {
      errors.push(`Especialidad '${specialtyKey}' no es compatible con tipo profesional 'médico'`);
    } else if (professionalType === 'veterinario' && !requiredLicenses.some(license => license.includes('veterinario'))) {
      errors.push(`Especialidad '${specialtyKey}' no es compatible con tipo profesional 'veterinario'`);
    } else if (professionalType === 'odontologo' && !requiredLicenses.some(license => license.includes('odontologo'))) {
      errors.push(`Especialidad '${specialtyKey}' no es compatible con tipo profesional 'odontólogo'`);
    }

    return {
      valid: errors.length === 0,
      requirements: requiredLicenses,
      errors
    };
  }

  /**
   * Get all supported license types
   */
  static getSupportedLicenseTypes(): Record<VenezuelanLicenseType, LicenseFormatValidation> {
    return this.LICENSE_PATTERNS;
  }

  /**
   * Get license validation service status
   */
  static getStatus(): {
    initialized: boolean;
    supportedTypes: number;
    sacsIntegration: boolean;
  } {
    return {
      initialized: true,
      supportedTypes: Object.keys(this.LICENSE_PATTERNS).length,
      sacsIntegration: true
    };
  }
}
