/**
 * Componente PasswordField Compartido
 * 
 * Componente especializado para campos de contraseña con
 * funcionalidad de mostrar/ocultar y validación.
 */

import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  fieldName: string;
  fieldTouched: boolean;
  hasError: boolean;
  errorElement?: React.ReactNode;
  icon?: React.ReactNode;
  label: string;
  isRequired?: boolean;
  isValid?: boolean;
  isConfirmation?: boolean;
  passwordToCompare?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  fieldName,
  fieldTouched,
  hasError,
  errorElement,
  icon,
  label,
  isRequired = false,
  isValid = false,
  isConfirmation = false,
  passwordToCompare = '',
  disabled = false,
  autoComplete,
  className = '',
  inputClassName = '',
  labelClassName = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getValidationStatus = () => {
    if (!fieldTouched) return null;
    
    if (isConfirmation) {
      return value === passwordToCompare && value.length > 0;
    }
    
    return isValid;
  };

  const validationStatus = getValidationStatus();

  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 py-2 pr-20 border rounded-md focus:outline-none focus:ring-2 transition-colors';
    const iconPadding = icon ? 'pl-10' : '';
    
    let statusClasses = '';
    if (fieldTouched) {
      if (hasError) {
        statusClasses = 'border-red-500 focus:ring-red-500 focus:border-red-500';
      } else if (validationStatus) {
        statusClasses = 'border-green-500 focus:ring-green-500 focus:border-green-500';
      } else {
        statusClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
      }
    } else {
      statusClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    }

    const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';

    return `${baseClasses} ${iconPadding} ${statusClasses} ${disabledClasses} ${inputClassName}`.trim();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={id} 
        className={`flex items-center text-sm font-medium text-gray-700 ${labelClassName}`}
      >
        {icon}
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          name={fieldName}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          autoComplete={autoComplete}
          className={getInputClasses()}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />

        {/* Right Elements */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Validation Indicator */}
          {fieldTouched && (
            <>
              {validationStatus && !hasError && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {hasError && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </>
          )}

          {/* Show/Hide Password Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:cursor-not-allowed"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {fieldTouched && errorElement && (
        <div id={`${id}-error`} role="alert">
          {errorElement}
        </div>
      )}

      {/* Password Match Indicator for Confirmation Fields */}
      {isConfirmation && fieldTouched && value && (
        <div className="text-xs">
          {value === passwordToCompare ? (
            <span className="text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Las contraseñas coinciden
            </span>
          ) : (
            <span className="text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Las contraseñas no coinciden
            </span>
          )}
        </div>
      )}
    </div>
  );
};