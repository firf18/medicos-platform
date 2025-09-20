// Componente para campos de contraseña
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { getFieldClassName } from './utils';

interface PasswordFieldProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  fieldName: string;
  fieldTouched: boolean;
  hasError: boolean;
  errorElement: JSX.Element | null;
  icon: React.ReactNode;
  label: string;
  isRequired?: boolean;
  isValid?: boolean;
  showValidIndicator?: boolean;
  isConfirmation?: boolean;
  passwordToCompare?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  fieldName,
  fieldTouched,
  hasError,
  errorElement,
  icon,
  label,
  isRequired = false,
  isValid,
  showValidIndicator = true,
  isConfirmation = false,
  passwordToCompare = ''
}) => {
  // Estado para controlar si se muestra la contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si las contraseñas coinciden (solo para confirmación)
  const doPasswordsMatch = isConfirmation && passwordToCompare && value === passwordToCompare;

  // Determinar si el campo es válido (incluyendo coincidencia de contraseñas)
  const fieldIsValid = isValid || (isConfirmation && doPasswordsMatch);

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className="flex items-center text-sm font-medium text-gray-700"
      >
        {icon}
        {label} {isRequired && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={getFieldClassName(fieldName, { [fieldName]: fieldTouched }, hasError, fieldIsValid)}
        />
        
        {/* Botón para mostrar/ocultar contraseña */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        
        {/* Indicador de validación (para confirmación de contraseña) */}
        {showValidIndicator && isConfirmation && fieldTouched && doPasswordsMatch && !hasError && (
          <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>
      {errorElement}
    </div>
  );
};

export default PasswordField;