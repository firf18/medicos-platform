/**
 * NameFieldsSection Component - Red-Salud Platform
 * 
 * Subcomponente para campos de nombre y apellido del registro médico.
 * Extraído de PersonalInfoStep para mejorar modularidad y mantenibilidad.
 * 
 * @compliance HIPAA-compliant name field handling
 * @version 1.0.0
 * @created 2024-01-15
 */

import React from 'react';
import { User } from 'lucide-react';
import FormField from './FormField';
import { validateName } from './utils';

// Tipos para el subcomponente
export interface NameFieldsData {
  firstName: string;
  lastName: string;
}

export interface NameFieldsProps {
  // Datos del formulario
  formData: NameFieldsData;
  
  // Callbacks de cambio
  onFieldChange: (field: keyof NameFieldsData, value: string) => void;
  onFieldBlur: (field: keyof NameFieldsData, value: string) => void;
  
  // Estado de campos tocados
  fieldTouched: {
    firstName?: boolean;
    lastName?: boolean;
  };
  
  // Manejo de errores
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => JSX.Element | null;
  };
}

/**
 * Subcomponente para campos de nombre y apellido
 */
export const NameFieldsSection: React.FC<NameFieldsProps> = ({
  formData,
  onFieldChange,
  onFieldBlur,
  fieldTouched,
  formErrors
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Campo de Nombre */}
      <FormField
        id="firstName"
        type="text"
        placeholder="Ej: María José, Juan Carlos"
        value={formData.firstName}
        onChange={(value) => onFieldChange('firstName', value)}
        onBlur={() => onFieldBlur('firstName', formData.firstName)}
        fieldName="firstName"
        fieldTouched={fieldTouched.firstName || false}
        hasError={formErrors?.hasFieldError('nombre') || false}
        errorElement={fieldTouched.firstName ? formErrors?.getFieldErrorElement('nombre') || null : null}
        icon={<User className="h-4 w-4 mr-2" />}
        label="Nombre"
        isRequired
        isValid={validateName(formData.firstName)}
      />

      {/* Campo de Apellido */}
      <FormField
        id="lastName"
        type="text"
        placeholder="Ej: González Pérez, Rodríguez López"
        value={formData.lastName}
        onChange={(value) => onFieldChange('lastName', value)}
        onBlur={() => onFieldBlur('lastName', formData.lastName)}
        fieldName="lastName"
        fieldTouched={fieldTouched.lastName || false}
        hasError={formErrors?.hasFieldError('apellido') || false}
        errorElement={fieldTouched.lastName ? formErrors?.getFieldErrorElement('apellido') || null : null}
        icon={<User className="h-4 w-4 mr-2" />}
        label="Apellido"
        isRequired
        isValid={validateName(formData.lastName)}
      />
    </div>
  );
};

export default NameFieldsSection;
