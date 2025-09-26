/**
 * Specialty Selection Validation Hook
 * @fileoverview Specialized hook for specialty selection validation
 * @compliance HIPAA-compliant specialty validation with audit trail
 */

import { useCallback } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { specialtySelectionSchema } from '@/lib/validations/specialty.validations';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { logger } from '@/lib/logging/logger';
import { ZodError } from 'zod';

export const useSpecialtySelectionValidation = () => {
  const formErrors = useDoctorRegistrationErrors();

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

      logSecurityEvent('data_modification', 'specialty_selection_validated');

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

      logger.error('registration', 'Specialty selection validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  return {
    validateSpecialtySelection,
    formErrors
  };
};
