/**
 * Componente Principal de Información Personal - Refactorizado
 * 
 * Componente optimizado que maneja solo la presentación y coordinación
 * de los campos de información personal del registro médico.
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

// Componentes especializados
import { PersonalInfoFields } from './PersonalInfoFields';
import { ContactInfoFields } from './ContactInfoFields';
import { PasswordFields } from './PasswordFields';

// Hooks y tipos
import { usePersonalInfoForm } from '../../hooks/usePersonalInfoForm';
import type { PersonalInfoStepProps } from '../../types/doctor-registration';

export const PersonalInfoForm: React.FC<PersonalInfoStepProps> = ({
  data,
  onDataChange,
  onStepComplete,
  onStepError,
  formErrors,
  isLoading = false
}) => {
  const {
    formData,
    fieldTouched,
    emailValidation,
    passwordStrength,
    handleInputChange,
    handleFieldBlur,
    validateAllFields,
    isFormValid
  } = usePersonalInfoForm({
    initialData: data,
    onDataChange,
    onStepComplete,
    onStepError,
    formErrors
  });

  return (
    <div className="space-y-6">
      {/* Información Personal Básica */}
      <PersonalInfoFields
        formData={formData}
        fieldTouched={fieldTouched}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onFieldBlur={handleFieldBlur}
        isLoading={isLoading}
      />

      {/* Información de Contacto */}
      <ContactInfoFields
        formData={formData}
        fieldTouched={fieldTouched}
        formErrors={formErrors}
        emailValidation={emailValidation}
        onInputChange={handleInputChange}
        onFieldBlur={handleFieldBlur}
        isLoading={isLoading}
      />

      {/* Campos de Contraseña */}
      <PasswordFields
        formData={formData}
        fieldTouched={fieldTouched}
        formErrors={formErrors}
        passwordStrength={passwordStrength}
        onInputChange={handleInputChange}
        onFieldBlur={handleFieldBlur}
        isLoading={isLoading}
      />

      {/* Información de Seguridad */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-green-800">
          <span className="font-medium">Seguridad médica:</span> Todos los datos se encriptan y cumplen con 
          estándares internacionales de protección de información médica (HIPAA, GDPR).
        </AlertDescription>
      </Alert>

      {/* Debug Info - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Form Valid: {isFormValid ? 'Yes' : 'No'}</p>
          <p>Email Valid: {emailValidation.isValid ? 'Yes' : 'No'}</p>
          <p>Email Available: {emailValidation.isAvailable?.toString() || 'Unknown'}</p>
          <p>Password Valid: {passwordStrength.isValid ? 'Yes' : 'No'}</p>
          <p>Password Score: {passwordStrength.score}/4</p>
        </div>
      )}
    </div>
  );
};