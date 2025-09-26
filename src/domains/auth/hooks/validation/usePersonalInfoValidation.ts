/**
 * Personal Info Validation Hook
 * @fileoverview Specialized hook for personal information validation
 * @compliance HIPAA-compliant personal data validation with audit trail
 */

import { useCallback } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { personalInfoSchema, validatePasswordStrength } from '@/lib/validations/personal-info.validations';
import { validateDataSensitivity, sanitizeInput, logSecurityEvent } from '@/lib/validations/security.validations';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { logger } from '@/lib/logging/logger';
import { ZodError } from 'zod';

export const usePersonalInfoValidation = () => {
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
      // Normalize phone to expected format (+58XXXXXXXXXX without spaces)
      const digitsOnly = (validationData.phone || '').replace(/\D/g, '');
      let normalizedPhone = validationData.phone;
      if (/^58\d{10}$/.test(digitsOnly)) {
        normalizedPhone = `+${digitsOnly}`;
      } else if (/^(412|414|416|424|426|2\d{2})\d{7}$/.test(digitsOnly)) {
        normalizedPhone = `+58${digitsOnly}`; // mobile and landline without 58
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
        logSecurityEvent('suspicious_activity', 'sensitive_data_detected');
      }

      // Check if email verification is required and completed
      // This would need to be passed from the component or stored in a global state
      // For now, we'll assume email verification is handled separately
      
      // Log successful validation
      logSecurityEvent('data_modification', 'personal_info_validated');

      return { isValid: true };

    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues;
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

  return {
    validatePersonalInfo,
    formErrors
  };
};
