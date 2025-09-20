/**
 * Auth Domain Hooks Index
 * @fileoverview Export all authentication-related hooks
 * @compliance Organized exports for medical authentication hooks
 */

// Main registration hook
export { useDoctorRegistration } from './useDoctorRegistration';

// Specialized registration hooks
export { useRegistrationState } from './useRegistrationState';
export { useRegistrationValidation } from './useRegistrationValidation';
export { useRegistrationNavigation } from './useRegistrationNavigation';

// Form-specific hooks
export { usePersonalInfoForm } from './usePersonalInfoForm';
export { useProfessionalInfoForm } from './useProfessionalInfoForm';

// Re-export types for convenience
export type {
  PersonalInfoFormData,
  PersonalInfoFormErrors,
  PersonalInfoStepProps,
  EmailValidationResult,
  PasswordValidationResult
} from '../types/personal-info.types';

export type {
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  ProfessionalInfoStepProps,
  LicenseVerificationResult,
  DocumentType
} from '../types/professional-info.types';
