/**
 * Personal Info Step Component - Legacy Wrapper
 * @fileoverview Wrapper component to maintain backward compatibility
 * @deprecated Use PersonalInfoStep from domains/auth/components instead
 */

'use client';

import { PersonalInfoStep as NewPersonalInfoStep } from '@/domains/auth/components/personal-info';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { FormattedError } from '@/lib/error-handling/zod-error-formatter';

interface PersonalInfoStepProps {
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

/**
 * Legacy wrapper component for backward compatibility
 * @deprecated Use the new modular PersonalInfoStep from domains/auth/components
 */
export default function PersonalInfoStep(props: PersonalInfoStepProps) {
  return <NewPersonalInfoStep {...props} />;
}
