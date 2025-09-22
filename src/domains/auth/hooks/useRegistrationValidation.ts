/**
 * Registration Validation Hook
 * @fileoverview Step-by-step validation for doctor registration process
 * @compliance HIPAA-compliant validation with security audit trail
 */

import { useCallback } from 'react';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { personalInfoSchema, validatePasswordStrength } from '@/lib/validations/personal-info.validations';
import { professionalInfoSchema, validateDocumentFormat } from '@/lib/validations/professional-info.validations';
import { specialtySelectionSchema } from '@/lib/validations/specialty.validations';
import { licenseVerificationSchema } from '@/lib/validations/license-verification.validations';
import { identityVerificationSchema } from '@/lib/validations/identity-verification.validations';
import { dashboardConfigurationSchema } from '@/lib/validations/dashboard-config.validations';
import { completeDoctorRegistrationSchema } from '@/lib/validations/index';
import { validateDataSensitivity, sanitizeInput, logSecurityEvent } from '@/lib/validations/security.validations';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { logger } from '@/lib/logging/logger';
import { ZodError } from 'zod';

export const useRegistrationValidation = () => {
  const formErrors = useDoctorRegistrationErrors();

  /**
   * Validate personal information step
   */
  const validatePersonalInfo = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();
      
      // Validate required fields
      const validationData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        password: data.password || '',
        confirmPassword: data.confirmPassword || ''
      };

      // Sanitize inputs
      // Normalizar teléfono al formato esperado por el schema (+58XXXXXXXXXX sin espacios)
      const digitsOnly = (validationData.phone || '').replace(/\D/g, '');
      let normalizedPhone = validationData.phone;
      if (/^58\d{10}$/.test(digitsOnly)) {
        normalizedPhone = `+${digitsOnly}`;
      } else if (/^(412|414|416|424|426|2\d{2})\d{7}$/.test(digitsOnly)) {
        normalizedPhone = `+58${digitsOnly}`; // móviles y fijos sin 58
      }

      const sanitizedData = {
        firstName: sanitizeInput(validationData.firstName),
        lastName: sanitizeInput(validationData.lastName),
        email: sanitizeInput(validationData.email).toLowerCase(),
        phone: sanitizeInput(normalizedPhone),
        password: validationData.password, // Don't sanitize passwords
        confirmPassword: validationData.confirmPassword
      };

      // Validate with schema
      const result = await personalInfoSchema.parseAsync(sanitizedData);

      // Additional password strength validation
      const passwordStrength = validatePasswordStrength(result.password);
      if (!passwordStrength.isValid) {
        formErrors.setFieldError('password', 'La contraseña no cumple con los requisitos de seguridad');
        return { isValid: false, errors: passwordStrength.errors };
      }

      // Validate data sensitivity
      const sensitivityCheck = validateDataSensitivity(result);
      if (!sensitivityCheck.isValid) {
        // Log security event instead of warning to avoid console noise
        logSecurityEvent('sensitive_data_detected', {
          step: 'personal_info',
          riskLevel: sensitivityCheck.riskLevel,
          issueCount: sensitivityCheck.issues?.length || 0
        });
      }

      // Log successful validation
      logSecurityEvent('personal_info_validated', {
        email: result.email,
        hasStrongPassword: passwordStrength.score >= 4
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error.issues ?? error.errors) as typeof error.issues;
        const errorMessages = issues.map(err => `${err.path.join('.')}: ${err.message}`);

        // Set field-specific errors
        issues.forEach(err => {
          const fieldName = (err.path?.[0] as string) || 'form';
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'Personal info validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate professional information step
   */
  const validateProfessionalInfo = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        // licenseNumber eliminado - ahora se obtiene automáticamente de SACS
        yearsOfExperience: data.yearsOfExperience || 0,
        bio: data.bio || '',
        university: data.university || '',
        graduationYear: data.graduationYear || '',
        medicalBoard: data.medicalBoard || '',
        documentType: data.documentType,
        documentNumber: data.documentNumber || ''
      };

      // Validate document format if provided
      if (validationData.documentType && validationData.documentNumber) {
        const documentValidation = validateDocumentFormat(
          validationData.documentNumber, 
          validationData.documentType
        );
        
        if (!documentValidation.isValid) {
          formErrors.setFieldError('documentNumber', documentValidation.error || 'Formato de documento inválido');
          return { isValid: false, errors: [documentValidation.error || 'Formato de documento inválido'] };
        }
      }

      // Validate with schema
      const result = await professionalInfoSchema.parseAsync(validationData);

      // Log successful validation
      logSecurityEvent('professional_info_validated', {
        // licenseNumber eliminado - ya no se requiere en el formulario
        yearsOfExperience: result.yearsOfExperience,
        university: result.university,
        graduationYear: result.graduationYear?.substring(6) || '', // Solo el año para logging
        medicalBoard: result.medicalBoard
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error.issues ?? error.errors) as typeof error.issues;
        const errorMessages = issues.map(err => `${err.path.join('.')}: ${err.message}`);
        
        issues.forEach(err => {
          const fieldName = (err.path?.[0] as string) || 'form';
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'Professional info validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate specialty selection step
   */
  const validateSpecialtySelection = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        specialtyId: data.specialtyId || '',
        subSpecialties: data.subSpecialties || []
      };

      const result = await specialtySelectionSchema.parseAsync(validationData);

      logSecurityEvent('specialty_selection_validated', {
        specialtyId: result.specialtyId,
        subSpecialtiesCount: result.subSpecialties.length
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error.issues ?? error.errors) as typeof error.issues;
        const errorMessages = issues.map(err => `${err.path.join('.')}: ${err.message}`);
        
        issues.forEach(err => {
          const fieldName = (err.path?.[0] as string) || 'form';
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'Specialty selection validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate license verification step
   */
  const validateLicenseVerification = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        licenseNumber: data.licenseNumber || '',
        licenseState: data.licenseState || '',
        licenseExpiry: data.licenseExpiry || ''
      };

      const result = await licenseVerificationSchema.parseAsync(validationData);

      // Additional license expiry validation
      const expiryDate = new Date(result.licenseExpiry);
      const now = new Date();
      
      if (expiryDate <= now) {
        formErrors.setFieldError('licenseExpiry', 'La licencia médica ha expirado');
        return { 
          isValid: false, 
          errors: ['La licencia médica ha expirado'] 
        };
      }

      logSecurityEvent('license_verification_validated', {
        licenseNumber: result.licenseNumber.replace(/\d/g, 'X'),
        licenseState: result.licenseState,
        isValid: true
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error.issues ?? error.errors) as typeof error.issues;
        const errorMessages = issues.map(err => `${err.path.join('.')}: ${err.message}`);
        
        issues.forEach(err => {
          const fieldName = (err.path?.[0] as string) || 'form';
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'License verification validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate identity verification step
   */
  const validateIdentityVerification = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        documentType: data.documentType,
        documentNumber: data.documentNumber || ''
      };

      const result = await identityVerificationSchema.parseAsync(validationData);

      // Validate document format
      const documentValidation = validateDocumentFormat(
        result.documentNumber,
        result.documentType
      );

      if (!documentValidation.isValid) {
        formErrors.setFieldError('documentNumber', documentValidation.error || 'Formato de documento inválido');
        return { 
          isValid: false, 
          errors: [documentValidation.error || 'Formato de documento inválido'] 
        };
      }

      logSecurityEvent('identity_verification_validated', {
        documentType: result.documentType,
        documentNumber: result.documentNumber.replace(/\d/g, 'X')
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error.issues ?? error.errors) as typeof error.issues;
        const errorMessages = issues.map(err => `${err.path.join('.')}: ${err.message}`);
        
        issues.forEach(err => {
          const fieldName = (err.path?.[0] as string) || 'form';
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'Identity verification validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate dashboard configuration step
   */
  const validateDashboardConfiguration = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        selectedFeatures: data.selectedFeatures || [],
        workingHours: data.workingHours || {}
      };

      const result = await dashboardConfigurationSchema.parseAsync(validationData);

      logSecurityEvent('dashboard_configuration_validated', {
        selectedFeaturesCount: result.selectedFeatures.length,
        hasWorkingHours: Object.keys(result.workingHours).length > 0
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error.issues ?? error.errors) as typeof error.issues;
        const errorMessages = issues.map(err => `${err.path.join('.')}: ${err.message}`);
        
        issues.forEach(err => {
          const fieldName = (err.path?.[0] as string) || 'form';
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'Dashboard configuration validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate complete registration
   */
  const validateCompleteRegistration = useCallback(async (
    data: DoctorRegistrationData
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const result = await completeDoctorRegistrationSchema.parseAsync(data);

      logSecurityEvent('complete_registration_validated', {
        email: result.email,
        specialtyId: result.specialtyId,
        licenseNumber: result.licenseNumber.replace(/\d/g, 'X')
      });

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string;
          formErrors.setFieldError(fieldName, err.message);
        });

        return { isValid: false, errors: errorMessages };
      }

      logger.error('registration', 'Complete registration validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  /**
   * Validate step by name
   */
  const validateStep = useCallback(async (
    step: RegistrationStep,
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    switch (step) {
      case 'personal_info':
        return validatePersonalInfo(data);
      case 'professional_info':
        return validateProfessionalInfo(data);
      case 'specialty_selection':
        return validateSpecialtySelection(data);
      case 'license_verification':
        return validateLicenseVerification(data);
      case 'identity_verification':
        return validateIdentityVerification(data);
      case 'dashboard_configuration':
        return validateDashboardConfiguration(data);
      default:
        return { isValid: false, errors: ['Paso de validación desconocido'] };
    }
  }, [
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateLicenseVerification,
    validateIdentityVerification,
    validateDashboardConfiguration
  ]);

  return {
    // Step validations
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateLicenseVerification,
    validateIdentityVerification,
    validateDashboardConfiguration,
    validateCompleteRegistration,
    
    // Generic validation
    validateStep,
    
    // Form errors access
    formErrors
  };
};
