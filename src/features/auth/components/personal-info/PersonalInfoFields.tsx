/**
 * Componente de Campos de Información Personal Básica
 * 
 * Maneja únicamente los campos de nombre y apellido
 * con validación en tiempo real.
 */

import React from 'react';
import { User } from 'lucide-react';
import { FormField } from '../../../shared/components/forms/FormField';
import { validateName } from '../../utils/validation-utils';

interface PersonalInfoFieldsProps {
  formData: {
    firstName: string;
    lastName: string;
  };
  fieldTouched: Record<string, boolean>;
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => React.ReactNode;
  };
  onInputChange: (field: string, value: string) => void;
  onFieldBlur: (field: string) => void;
  isLoading?: boolean;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  formData,
  fieldTouched,
  formErrors,
  onInputChange,
  onFieldBlur,
  isLoading = false
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <User className="h-5 w-5 mr-2" />
        Información Personal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <FormField
          id="firstName"
          type="text"
          placeholder="Ingresa tu nombre"
          value={formData.firstName}
          onChange={(value) => onInputChange('firstName', value)}
          onBlur={() => onFieldBlur('firstName')}
          fieldName="firstName"
          fieldTouched={fieldTouched.firstName || false}
          hasError={formErrors?.hasFieldError('nombre') || false}
          errorElement={fieldTouched.firstName ? formErrors?.getFieldErrorElement('nombre') || null : null}
          icon={<User className="h-4 w-4 mr-2" />}
          label="Nombre"
          isRequired
          isValid={validateName(formData.firstName)}
          showValidIndicator={true}
          disabled={isLoading}
          autoComplete="given-name"
          maxLength={50}
        />

        {/* Apellido */}
        <FormField
          id="lastName"
          type="text"
          placeholder="Ingresa tu apellido"
          value={formData.lastName}
          onChange={(value) => onInputChange('lastName', value)}
          onBlur={() => onFieldBlur('lastName')}
          fieldName="lastName"
          fieldTouched={fieldTouched.lastName || false}
          hasError={formErrors?.hasFieldError('apellido') || false}
          errorElement={fieldTouched.lastName ? formErrors?.getFieldErrorElement('apellido') || null : null}
          icon={<User className="h-4 w-4 mr-2" />}
          label="Apellido"
          isRequired
          isValid={validateName(formData.lastName)}
          showValidIndicator={true}
          disabled={isLoading}
          autoComplete="family-name"
          maxLength={50}
        />
      </div>
    </div>
  );
};