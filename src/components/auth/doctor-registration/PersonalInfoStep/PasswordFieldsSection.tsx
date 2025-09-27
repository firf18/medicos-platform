/**
 * PasswordFieldsSection Component - Red-Salud Platform
 * 
 * Subcomponente para campos de contraseña del registro médico.
 * Extraído de PersonalInfoStep para mejorar modularidad y mantenibilidad.
 * 
 * @compliance HIPAA-compliant password field handling
 * @version 1.0.0
 * @created 2024-01-15
 */

import React from 'react';
import { Lock, Shield } from 'lucide-react';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

// Tipos para el subcomponente
export interface PasswordFieldsData {
  password: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  score: number;
  isValid: boolean;
  errors: string[];
}

export interface PasswordFieldsProps {
  // Datos del formulario
  formData: PasswordFieldsData;
  
  // Callbacks de cambio
  onFieldChange: (field: keyof PasswordFieldsData, value: string) => void;
  onFieldBlur: (field: keyof PasswordFieldsData, value: string) => void;
  
  // Estado de campos tocados
  fieldTouched: {
    password?: boolean;
    confirmPassword?: boolean;
  };
  
  // Manejo de errores
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => JSX.Element | null;
  };
  
  // Estado de fortaleza de contraseña
  passwordStrength: PasswordStrength;
}

/**
 * Subcomponente para campos de contraseña
 */
export const PasswordFieldsSection: React.FC<PasswordFieldsProps> = ({
  formData,
  onFieldChange,
  onFieldBlur,
  fieldTouched,
  formErrors,
  passwordStrength
}) => {
  return (
    <div className="space-y-6">
      {/* Campos de Contraseña */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo de Contraseña */}
        <PasswordField
          id="password"
          placeholder="Crear contraseña segura"
          value={formData.password}
          onChange={(value) => onFieldChange('password', value)}
          onBlur={() => onFieldBlur('password', formData.password)}
          fieldName="password"
          fieldTouched={fieldTouched.password || false}
          hasError={formErrors?.hasFieldError('contraseña') || false}
          errorElement={fieldTouched.password ? formErrors?.getFieldErrorElement('contraseña') || null : null}
          icon={<Lock className="h-4 w-4 mr-2" />}
          label="Contraseña"
          isRequired
          autoComplete="new-password"
          isValid={passwordStrength.isValid}
        />

        {/* Campo de Confirmación de Contraseña */}
        <PasswordField
          id="confirmPassword"
          placeholder="Confirme su contraseña"
          value={formData.confirmPassword}
          onChange={(value) => onFieldChange('confirmPassword', value)}
          onBlur={() => onFieldBlur('confirmPassword', formData.confirmPassword)}
          fieldName="confirmPassword"
          fieldTouched={fieldTouched.confirmPassword || false}
          hasError={formErrors?.hasFieldError('confirmación de contraseña') || false}
          errorElement={fieldTouched.confirmPassword ? formErrors?.getFieldErrorElement('confirmación de contraseña') || null : null}
          icon={<Shield className="h-4 w-4 mr-2" />}
          label="Confirmar Contraseña"
          isRequired
          isConfirmation
          autoComplete="new-password"
          passwordToCompare={formData.password}
        />
      </div>

      {/* Indicador de fortaleza de contraseña */}
      <PasswordStrengthIndicator
        passwordStrength={passwordStrength}
        password={formData.password}
        fieldTouched={fieldTouched.password || false}
      />
    </div>
  );
};

export default PasswordFieldsSection;
