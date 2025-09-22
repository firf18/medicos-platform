/**
 * Servicio de Validación para Registro de Médicos
 * 
 * Centraliza todas las validaciones del proceso de registro médico,
 * siguiendo el principio de responsabilidad única.
 */

import {
  personalInfoSchema,
  professionalInfoSchema,
  specialtySelectionSchema,
  licenseVerificationSchema,
  identityVerificationSchema,
  dashboardConfigurationSchema,
  completeDoctorRegistrationSchema,
  validateDataSensitivity,
  sanitizeInput,
  validatePasswordStrength,
  validateDocumentFormat
} from '@/lib/validations';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class DoctorRegistrationValidationService {
  /**
   * Valida información personal del médico
   */
  static async validatePersonalInfo(data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating personal info', {
        hasFirstName: !!data.firstName,
        hasLastName: !!data.lastName,
        hasEmail: !!data.email,
        hasPhone: !!data.phone
      });

      const personalData = {
        firstName: sanitizeInput(data.firstName || ''),
        lastName: sanitizeInput(data.lastName || ''),
        email: data.email || '',
        phone: data.phone || '',
        password: data.password || '',
        confirmPassword: data.confirmPassword || ''
      };

      // Validar con Zod
      await personalInfoSchema.parseAsync(personalData);

      // Validaciones adicionales de seguridad
      const sensitivityCheck = validateDataSensitivity(personalData);
      if (!sensitivityCheck.isValid) {
        return {
          isValid: false,
          errors: sensitivityCheck.errors
        };
      }

      // Validar fortaleza de contraseña
      const passwordValidation = validatePasswordStrength(personalData.password);
      if (!passwordValidation.isValid) {
        return {
          isValid: false,
          errors: [passwordValidation.error || 'Contraseña no válida']
        };
      }

      // Log de seguridad
      logSecurityEvent('personal_info_validated', {
        email: personalData.email,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'Personal info validation successful', {
        email: personalData.email
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('personal_info_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email,
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'Personal info validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida información profesional del médico
   */
  static async validateProfessionalInfo(data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating professional info', {
        hasLicenseNumber: !!data.licenseNumber,
        hasSpecialtyId: !!data.specialtyId,
        hasYearsOfExperience: !!data.yearsOfExperience
      });

      const professionalData = {
        licenseNumber: sanitizeInput(data.licenseNumber || ''),
        licenseState: data.licenseState || '',
        licenseExpiry: data.licenseExpiry || '',
        specialtyId: data.specialtyId || '',
        subSpecialties: data.subSpecialties || [],
        yearsOfExperience: data.yearsOfExperience || 0,
        currentHospital: data.currentHospital || '',
        clinicAffiliations: data.clinicAffiliations || [],
        bio: sanitizeInput(data.bio || '')
      };

      // Validar con Zod
      await professionalInfoSchema.parseAsync(professionalData);

      // Log de seguridad
      logSecurityEvent('professional_info_validated', {
        licenseNumber: professionalData.licenseNumber,
        specialtyId: professionalData.specialtyId,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'Professional info validation successful', {
        licenseNumber: professionalData.licenseNumber,
        specialtyId: professionalData.specialtyId
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('professional_info_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        licenseNumber: data.licenseNumber,
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'Professional info validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        licenseNumber: data.licenseNumber
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida selección de especialidad
   */
  static async validateSpecialtySelection(data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating specialty selection', {
        hasSpecialtyId: !!data.specialtyId,
        hasSubSpecialties: !!(data.subSpecialties && data.subSpecialties.length > 0)
      });

      const specialtyData = {
        specialtyId: data.specialtyId || '',
        subSpecialties: data.subSpecialties || []
      };

      // Validar con Zod
      await specialtySelectionSchema.parseAsync(specialtyData);

      // Log de seguridad
      logSecurityEvent('specialty_selection_validated', {
        specialtyId: specialtyData.specialtyId,
        subSpecialtiesCount: specialtyData.subSpecialties.length,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'Specialty selection validation successful', {
        specialtyId: specialtyData.specialtyId,
        subSpecialtiesCount: specialtyData.subSpecialties.length
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('specialty_selection_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        specialtyId: data.specialtyId,
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'Specialty selection validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        specialtyId: data.specialtyId
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida verificación de licencia
   */
  static async validateLicenseVerification(data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating license verification', {
        hasLicenseNumber: !!data.licenseNumber,
        hasLicenseState: !!data.licenseState,
        hasLicenseExpiry: !!data.licenseExpiry
      });

      const licenseData = {
        licenseNumber: data.licenseNumber || '',
        licenseState: data.licenseState || '',
        licenseExpiry: data.licenseExpiry || '',
        licenseDocument: data.licenseDocument || null
      };

      // Validar con Zod
      await licenseVerificationSchema.parseAsync(licenseData);

      // Validar formato de documento si existe
      if (licenseData.licenseDocument) {
        const documentValidation = validateDocumentFormat(licenseData.licenseDocument);
        if (!documentValidation.isValid) {
          return {
            isValid: false,
            errors: [documentValidation.error || 'Documento de licencia no válido']
          };
        }
      }

      // Log de seguridad
      logSecurityEvent('license_verification_validated', {
        licenseNumber: licenseData.licenseNumber,
        licenseState: licenseData.licenseState,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'License verification validation successful', {
        licenseNumber: licenseData.licenseNumber,
        licenseState: licenseData.licenseState
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('license_verification_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        licenseNumber: data.licenseNumber,
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'License verification validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        licenseNumber: data.licenseNumber
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida verificación de identidad
   */
  static async validateIdentityVerification(data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating identity verification', {
        hasIdentityVerification: !!data.identityVerification,
        verificationId: data.identityVerification?.verificationId
      });

      const identityData = {
        identityVerification: data.identityVerification || {
          verificationId: '',
          status: 'pending',
          documents: []
        }
      };

      // Validar con Zod
      await identityVerificationSchema.parseAsync(identityData);

      // Log de seguridad
      logSecurityEvent('identity_verification_validated', {
        verificationId: data.identityVerification?.verificationId,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'Identity verification validation successful', {
        verificationId: data.identityVerification?.verificationId
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('identity_verification_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        verificationId: data.identityVerification?.verificationId,
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'Identity verification validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        verificationId: data.identityVerification?.verificationId
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida configuración del dashboard
   */
  static async validateDashboardConfiguration(data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating dashboard configuration', {
        hasSelectedFeatures: !!data.selectedFeatures,
        hasWorkingHours: !!data.workingHours
      });

      const dashboardData = {
        selectedFeatures: data.selectedFeatures || [],
        workingHours: data.workingHours || {}
      };

      // Validar con Zod
      await dashboardConfigurationSchema.parseAsync(dashboardData);

      // Log de seguridad
      logSecurityEvent('dashboard_configuration_validated', {
        selectedFeatures: dashboardData.selectedFeatures,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'Dashboard configuration validation successful', {
        selectedFeaturesCount: dashboardData.selectedFeatures.length
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('dashboard_configuration_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'Dashboard configuration validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida el registro completo
   */
  static async validateCompleteRegistration(data: DoctorRegistrationData): Promise<ValidationResult> {
    try {
      logger.debug('validation', 'Validating complete registration', {
        email: data.email,
        licenseNumber: data.licenseNumber
      });

      // Validar con Zod
      await completeDoctorRegistrationSchema.parseAsync(data);

      // Log de seguridad
      logSecurityEvent('complete_registration_validated', {
        email: data.email,
        licenseNumber: data.licenseNumber,
        timestamp: new Date().toISOString()
      });

      logger.info('validation', 'Complete registration validation successful', {
        email: data.email,
        licenseNumber: data.licenseNumber
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('complete_registration_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email,
        timestamp: new Date().toISOString()
      });

      logger.warn('validation', 'Complete registration validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Valida un paso específico del registro
   */
  static async validateStep(step: RegistrationStep, data: Partial<DoctorRegistrationData>): Promise<ValidationResult> {
    switch (step) {
      case 'personal_info':
        return this.validatePersonalInfo(data);
      case 'professional_info':
        return this.validateProfessionalInfo(data);
      case 'specialty_selection':
        return this.validateSpecialtySelection(data);
      case 'license_verification':
        return this.validateLicenseVerification(data);
      case 'identity_verification':
        return this.validateIdentityVerification(data);
      case 'dashboard_configuration':
        return this.validateDashboardConfiguration(data);
      default:
        return {
          isValid: false,
          errors: [`Paso de validación desconocido: ${step}`]
        };
    }
  }
}