/**
 * Componente de Campos de Contraseña
 * 
 * Maneja los campos de contraseña y confirmación con
 * indicador de fortaleza y validación en tiempo real.
 */

import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { PasswordField } from '../../../shared/components/forms/PasswordField';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface PasswordStrength {
  score: number;
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

interface PasswordFieldsProps {
  formData: {
    password: string;
    confirmPassword: string;
  };
  fieldTouched: Record<string, boolean>;
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => React.ReactNode;
  };
  passwordStrength: PasswordStrength;
  onInputChange: (field: string, value: string) => void;
  onFieldBlur: (field: string) => void;
  isLoading?: boolean;
}

export const PasswordFields: React.FC<PasswordFieldsProps> = ({
  formData,
  fieldTouched,
  formErrors,
  passwordStrength,
  onInputChange,
  onFieldBlur,
  isLoading = false
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <Lock className="h-5 w-5 mr-2" />
        Seguridad de la Cuenta
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contraseña */}
        <div className="space-y-4">
          <PasswordField
            id="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(value) => onInputChange('password', value)}
            onBlur={() => onFieldBlur('password')}
            fieldName="password"
            fieldTouched={fieldTouched.password || false}
            hasError={formErrors?.hasFieldError('contraseña') || false}
            errorElement={fieldTouched.password ? formErrors?.getFieldErrorElement('contraseña') || null : null}
            icon={<Lock className="h-4 w-4 mr-2" />}
            label="Contraseña"
            isRequired
            isValid={passwordStrength.isValid}
            disabled={isLoading}
            autoComplete="new-password"
          />

          {/* Confirmar Contraseña */}
          <PasswordField
            id="confirmPassword"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={(value) => onInputChange('confirmPassword', value)}
            onBlur={() => onFieldBlur('confirmPassword')}
            fieldName="confirmPassword"
            fieldTouched={fieldTouched.confirmPassword || false}
            hasError={formErrors?.hasFieldError('confirmación de contraseña') || false}
            errorElement={fieldTouched.confirmPassword ? formErrors?.getFieldErrorElement('confirmación de contraseña') || null : null}
            icon={<Shield className="h-4 w-4 mr-2" />}
            label="Confirmar Contraseña"
            isRequired
            isConfirmation
            passwordToCompare={formData.password}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        {/* Indicador de fortaleza de contraseña */}
        <div className="space-y-4">
          <PasswordStrengthIndicator
            passwordStrength={passwordStrength}
            password={formData.password}
            fieldTouched={fieldTouched.password || false}
          />
          
          {/* Consejos de seguridad */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Consejos para una contraseña segura:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Al menos 8 caracteres de longitud</li>
              <li>• Incluye mayúsculas y minúsculas</li>
              <li>• Agrega números y símbolos</li>
              <li>• Evita información personal</li>
              <li>• No uses contraseñas comunes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Información adicional de seguridad */}
      {passwordStrength.suggestions && passwordStrength.suggestions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">
            Sugerencias para mejorar tu contraseña:
          </h4>
          <ul className="text-xs text-yellow-800 space-y-1">
            {passwordStrength.suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};