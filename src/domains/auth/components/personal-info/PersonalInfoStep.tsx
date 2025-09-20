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
    passwordValidation,
    isCheckingEmail,
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

  const getOverallValidationStatus = () => {
    const hasFormErrors = Object.keys(errors).length > 0;
    const emailNotAvailable = emailValidation?.isAvailable === false;
    const stillChecking = isCheckingEmail;

    if (hasFormErrors || emailNotAvailable) {
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
                          passwordValidation?.isValid;

    if (allFieldsValid) {
      return { isValid: true, type: 'success' as const };
    }

    return { isValid: false, type: 'incomplete' as const };
  };

  const validationStatus = getOverallValidationStatus();

  // Auto-complete step when form is valid (without submitting)
  // Guard against repeated calls by tracking last completion state
  const lastCompletedRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    const ready = canSubmit && validationStatus.isValid && validationStatus.type === 'success';
    if (ready && !lastCompletedRef.current) {
      lastCompletedRef.current = true;
      onStepComplete('personal_info');
    }
    if (!ready && lastCompletedRef.current) {
      // reset when conditions are not met anymore
      lastCompletedRef.current = false;
    }
  }, [canSubmit, validationStatus.isValid, validationStatus.type, onStepComplete]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Información Personal
        </h2>
        <p className="text-gray-600">
          Complete su información personal para crear su cuenta médica segura
        </p>
      </div>

      {/* Overall Status Alert */}
      {validationStatus.type === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Información Completa:</strong> Todos los campos han sido validados correctamente.
          </AlertDescription>
        </Alert>
      )}

      {validationStatus.type === 'checking' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Verificando:</strong> Validando disponibilidad del correo electrónico...
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-8">
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
              isCheckingEmail={isCheckingEmail}
              onFieldChange={handleInputChange}
              onFieldTouch={markFieldTouched}
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
        </CardContent>
      </Card>

      {/* Errors globales removidos por solicitud */}
    </div>
  );
};

export default PersonalInfoStep;
