/**
 * Personal Info Types
 * @fileoverview Types specific to doctor personal information step
 * @compliance HIPAA-compliant personal data structures
 */

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { FormattedError } from '@/lib/error-handling/zod-error-formatter';
import { PasswordStrengthResult } from '@/lib/validations/personal-info.validations';

// Form data interface for personal info step
export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Validation result interfaces
export interface EmailValidationResult {
  isValid: boolean;
  isAvailable: boolean | null;
  error?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrengthResult;
  error?: string;
}

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

export interface NameValidationResult {
  isValid: boolean;
  error?: string;
}

// Form errors interface
export interface PersonalInfoFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

// Component props interface
export interface PersonalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'personal_info') => void;
  onStepError: (step: 'personal_info', error: string) => void;
  formErrors?: {
    errors: FormattedError[];
    warnings: FormattedError[];
    hasErrors: boolean;
    hasWarnings: boolean;
    hasCriticalErrors: boolean;
    errorSummary: string;
    errorsByField: Record<string, FormattedError[]>;
    getFieldError: (field: string) => string | null;
    hasFieldError: (field: string) => boolean;
    getFieldClassName: (field: string, baseClassName?: string) => string;
    getFieldErrorElement: (field: string) => JSX.Element | null;
    clearAllErrors: () => void;
    clearFieldError: (field: string) => void;
    setFieldError: (field: string, message: string, severity?: 'error' | 'warning' | 'info') => void;
    validateEmail: (email: string) => void;
    validatePhone: (phone: string) => void;
    validatePassword: (password: string) => void;
    validatePasswordMatch: (password: string, confirmPassword: string) => void;
    validateName: (name: string, field: 'nombre' | 'apellido') => void;
  };
}

// Field validation status
export interface FieldValidationStatus {
  isValid: boolean;
  isValidating: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'success' | 'info';
}

// Form validation context
export interface ValidationContext {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Validation constants
export const NAME_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  PATTERN: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/
} as const;

export const EMAIL_VALIDATION = {
  PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_LENGTH: 255
} as const;

export const PHONE_VALIDATION = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 15,
  VENEZUELA_PATTERN: /^(\+58|0058|58)?[-.\s]?[24]\d{2}[-.\s]?\d{3}[-.\s]?\d{4}$/
} as const;

export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
} as const;

// Field touch state
export type FieldTouchedState = Record<keyof PersonalInfoFormData, boolean>;

// Password visibility state
export interface PasswordVisibilityState {
  password: boolean;
  confirmPassword: boolean;
}
