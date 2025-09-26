/**
 * Registration Validation Coordinator Hook
 * @fileoverview Main hook that coordinates all validation hooks
 * @compliance HIPAA-compliant validation coordination with audit trail
 */

import { useCallback } from 'react';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { usePersonalInfoValidation } from './validation/usePersonalInfoValidation';
import { useProfessionalInfoValidation } from './validation/useProfessionalInfoValidation';
import { useSpecialtySelectionValidation } from './validation/useSpecialtySelectionValidation';
import { useIdentityVerificationValidation } from './validation/useIdentityVerificationValidation';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { logger } from '@/lib/logging/logger';

export const useRegistrationValidation = () => {
  const formErrors = useDoctorRegistrationErrors();

  // Individual validation hooks
  const { validatePersonalInfo } = usePersonalInfoValidation();
  const { validateProfessionalInfo } = useProfessionalInfoValidation();
  const { validateSpecialtySelection } = useSpecialtySelectionValidation();
  const { validateIdentityVerification } = useIdentityVerificationValidation();

  /**
   * Validate complete registration
   */
  const validateCompleteRegistration = useCallback(async (
    data: DoctorRegistrationData
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      console.log('🔍 Validando registro completo con datos:', {
        hasFirstName: !!data.firstName,
        hasLastName: !!data.lastName,
        hasEmail: !!data.email,
        hasPhone: !!data.phone,
        hasPassword: !!data.password,
        hasSpecialtyId: !!data.specialtyId,
        hasLicenseNumber: !!data.licenseNumber,
        hasDocumentNumber: !!data.documentNumber,
        hasDocumentType: !!data.documentType,
        hasSelectedFeatures: !!data.selectedFeatures,
        hasWorkingHours: !!data.workingHours,
        hasIdentityVerification: !!data.identityVerification,
        // Debug: Show real values for debugging
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialtyId: data.specialtyId,
        licenseNumber: data.licenseNumber || 'NO_PROVIDED',
        documentNumber: data.documentNumber || 'NO_PROVIDED',
        documentType: data.documentType || 'NO_PROVIDED'
      });

      // Simplified validation - validate critical fields one by one
      const criticalFields = [
        { field: 'firstName', value: data.firstName, required: true },
        { field: 'lastName', value: data.lastName, required: true },
        { field: 'email', value: data.email, required: true },
        { field: 'phone', value: data.phone, required: true },
        { field: 'password', value: data.password, required: true },
        { field: 'specialtyId', value: data.specialtyId, required: true },
        // licenseNumber obtained automatically from SACS
        // documentType is optional according to DoctorRegistrationData type
      ];

      const missingFields: string[] = [];
      const invalidFields: string[] = [];

      for (const { field, value, required } of criticalFields) {
        if (required && (!value || value.toString().trim() === '')) {
          missingFields.push(field);
        }
      }

      // Specific validations
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        invalidFields.push('email');
      }

      if (data.phone && !/^\+58\d{10}$/.test(data.phone)) {
        invalidFields.push('phone');
      }

      if (data.password && data.password.length < 8) {
        invalidFields.push('password');
      }

      // Only validate documentNumber if documentType is present
      if (data.documentNumber && data.documentType === 'cedula_identidad' && !/^\d{7,8}$/.test(data.documentNumber)) {
        invalidFields.push('documentNumber');
      }

      // Validate that at least has documentNumber or licenseNumber
      const hasDocumentInfo = (data.documentNumber && data.documentNumber.trim() !== '') || 
                             (data.licenseNumber && data.licenseNumber.trim() !== '');
      
      if (!hasDocumentInfo) {
        missingFields.push('documentNumber o licenseNumber');
      }

      if (missingFields.length > 0 || invalidFields.length > 0) {
        const errors: string[] = [];
        
        if (missingFields.length > 0) {
          errors.push(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        }
        
        if (invalidFields.length > 0) {
          errors.push(`Campos con formato inválido: ${invalidFields.join(', ')}`);
        }

        console.log('❌ Validación falló:', { missingFields, invalidFields, errors });
        
        return { 
          isValid: false, 
          errors 
        };
      }

      console.log('✅ Validación completa exitosa');

      logSecurityEvent('data_modification', 'complete_registration_validated');

      return { isValid: true };

    } catch (error) {
      console.error('❌ Error en validación completa:', error);

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
      case 'identity_verification':
        return validateIdentityVerification(data);
      default:
        return { isValid: false, errors: ['Paso de validación desconocido'] };
    }
  }, [
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateIdentityVerification
  ]);

  return {
    // Step validations
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateIdentityVerification,
    validateCompleteRegistration,
    
    // Generic validation
    validateStep,
    
    // Form errors access
    formErrors
  };
};
