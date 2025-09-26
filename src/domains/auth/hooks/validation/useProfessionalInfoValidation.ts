/**
 * Professional Info Validation Hook
 * @fileoverview Specialized hook for professional information validation
 * @compliance HIPAA-compliant professional data validation with audit trail
 */

import { useCallback } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { professionalInfoSchema, validateDocumentFormat } from '@/lib/validations/professional-info.validations';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { logger } from '@/lib/logging/logger';
import { ZodError } from 'zod';

export const useProfessionalInfoValidation = () => {
  const formErrors = useDoctorRegistrationErrors();

  /**
   * Validate professional information step
   */
  const validateProfessionalInfo = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        // licenseNumber removed - now obtained automatically from SACS
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
      logSecurityEvent('data_modification', 'professional_info_validated');

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues;
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

  return {
    validateProfessionalInfo,
    formErrors
  };
};
