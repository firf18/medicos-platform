/**
 * Personal Info Components Index
 * @fileoverview Export all personal info related components
 * @compliance Organized exports for medical authentication components
 */

export { PersonalInfoStep } from './PersonalInfoStep';
export { NameFieldsSection } from './NameFieldsSection';
export { ContactFieldsSection } from './ContactFieldsSection';
export { PasswordFieldsSection } from './PasswordFieldsSection';

// Re-export types for convenience
export type {
  PersonalInfoStepProps,
  PersonalInfoFormData,
  PersonalInfoFormErrors,
  EmailValidationResult,
  PasswordValidationResult,
  FieldTouchedState,
  PasswordVisibilityState
} from '../../types/personal-info.types';
