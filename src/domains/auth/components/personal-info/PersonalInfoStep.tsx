/**
 * Personal Info Step Component - Refactored
 * @fileoverview Main personal information step component using modular sub-components
 * @compliance HIPAA-compliant personal data collection with audit trail
 */

'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { PersonalInfoStepProps } from '../../types/personal-info.types';
import { usePersonalInfoForm } from '../../hooks/usePersonalInfoForm';
import { NameFieldsSection } from './NameFieldsSection';
import { ContactFieldsSection } from './ContactFieldsSection';
import { PasswordFieldsSection } from './PasswordFieldsSection';

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  updateData,
  onStepComplete,
  onStepError,
  formErrors
}) => {
  const {
    formData,
    errors,
    fieldTouched,
    passwordVisibility,
    emailValidation,
    phoneValidation,
    passwordValidation,
    isCheckingEmail,
    isCheckingPhone,
    handleInputChange,
    markFieldTouched,
    togglePasswordVisibility,
    validateForm,
    submitForm,
    canSubmit,
    getFieldError,
    hasFieldError,
    isFieldTouched
  } = usePersonalInfoForm({
    initialData: data,
    onDataChange: updateData,
    onStepComplete,
    onStepError
  });

  const [emailVerified, setEmailVerified] = React.useState(false);

  const getOverallValidationStatus = () => {
    const hasFormErrors = Object.keys(errors).length > 0;
    const emailNotAvailable = emailValidation?.isAvailable === false;
    const phoneNotAvailable = phoneValidation?.isAvailable === false;
    const stillChecking = isCheckingEmail || isCheckingPhone;

    if (hasFormErrors || emailNotAvailable || phoneNotAvailable) {
      return { isValid: false, type: 'error' as const };
    }

    if (stillChecking) {
      return { isValid: false, type: 'checking' as const };
    }

    const allFieldsValid = formData.firstName && 
                          formData.lastName && 
                          formData.email && 
                          formData.phone && 
                          formData.password && 
                          formData.confirmPassword &&
                          emailValidation?.isAvailable === true &&
                          phoneValidation?.isAvailable === true &&
                          passwordValidation?.isValid &&
                          emailVerified;

    if (allFieldsValid) {
      return { isValid: true, type: 'success' as const };
    }

    return { isValid: false, type: 'incomplete' as const };
  };

  const handleEmailVerified = React.useCallback(() => {
    setEmailVerified(true);
  }, []);

  const handleEmailVerificationError = React.useCallback((error: string) => {
    // Only log non-rate-limiting errors
    if (!error.includes('Demasiados intentos') && !error.includes('Rate limit')) {
      console.error('Email verification error:', error);
    }
    
    // For rate limiting errors, the EmailVerification component handles the UI
    // We just need to ensure the step doesn't complete
    if (error.includes('Demasiados intentos') || error.includes('Rate limit')) {
      setEmailVerified(false);
    } else {
      // For other errors, we could show a toast or other notification
      console.warn('Email verification failed:', error);
      setEmailVerified(false);
    }
  }, []);

  const validationStatus = getOverallValidationStatus();

  // Removed auto-complete logic - step completion should only happen when user clicks "Siguiente"

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Información Personal
          </h2>
          <p className="text-gray-600 text-lg">
            Complete su información personal para crear su cuenta médica segura
          </p>
        </div>
      </div>

      {/* Overall Status Alert mejorado */}


      {/* Formulario unificado sin divisiones */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="space-y-6">
          {/* Name Fields Section */}
          <NameFieldsSection
            formData={formData}
            errors={errors}
            fieldTouched={fieldTouched}
            onFieldChange={handleInputChange}
            onFieldTouch={markFieldTouched}
          />

          {/* Contact Fields Section */}
          <ContactFieldsSection
            formData={formData}
            errors={errors}
            fieldTouched={fieldTouched}
            emailValidation={emailValidation}
            phoneValidation={phoneValidation}
            isCheckingEmail={isCheckingEmail}
            isCheckingPhone={isCheckingPhone}
            onFieldChange={handleInputChange}
            onFieldTouch={markFieldTouched}
            onEmailVerified={handleEmailVerified}
            onEmailVerificationError={handleEmailVerificationError}
          />

          {/* Password Fields Section */}
          <PasswordFieldsSection
            formData={formData}
            errors={errors}
            fieldTouched={fieldTouched}
            passwordVisibility={passwordVisibility}
            passwordValidation={passwordValidation}
            onFieldChange={handleInputChange}
            onFieldTouch={markFieldTouched}
            onTogglePasswordVisibility={togglePasswordVisibility}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
