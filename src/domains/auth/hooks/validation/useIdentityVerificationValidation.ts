/**
 * Identity Verification Validation Hook
 * @fileoverview Specialized hook for identity verification validation
 * @compliance HIPAA-compliant identity validation with audit trail
 */

import { useCallback } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { identityVerificationSchema } from '@/lib/validations/identity-verification.validations';
import { validateDocumentFormat } from '@/lib/validations/professional-info.validations';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { logger } from '@/lib/logging/logger';
import { ZodError } from 'zod';

export const useIdentityVerificationValidation = () => {
  const formErrors = useDoctorRegistrationErrors();

  /**
   * Validate identity verification step
   */
  const validateIdentityVerification = useCallback(async (
    data: Partial<DoctorRegistrationData>
  ): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      formErrors.clearAllErrors();

      const validationData = {
        identityVerification: {
          verificationId: data.identityVerification?.verificationId || '',
          status: data.identityVerification?.status || 'pending',
          documentType: data.documentType || '',
          documentNumber: data.documentNumber || '',
          verifiedAt: new Date().toISOString(),
          verificationResults: {},
          verificationProvider: 'didit'
        }
      };

      const result = await identityVerificationSchema.parseAsync(validationData);

      // Validate document format
      const documentValidation = validateDocumentFormat(
        result.identityVerification.documentType,
        result.identityVerification.documentNumber
      );

      if (!documentValidation.isValid) {
        formErrors.setFieldError('documentNumber', documentValidation.error || 'Formato de documento inválido');
        return { 
          isValid: false, 
          errors: [documentValidation.error || 'Formato de documento inválido'] 
        };
      }

      logSecurityEvent('data_modification', 'identity_verification_validated');

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

      logger.error('registration', 'Identity verification validation error', { error });
      return { 
        isValid: false, 
        errors: ['Error de validación inesperado'] 
      };
    }
  }, [formErrors]);

  return {
    validateIdentityVerification,
    formErrors
  };
};
