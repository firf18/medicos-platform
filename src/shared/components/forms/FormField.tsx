/**
 * Componente FormField Compartido
 * 
 * Componente reutilizable para campos de formulario con
 * validación, iconos y estados visuales consistentes.
 */

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  fieldName: string;
  fieldTouched: boolean;
  hasError: boolean;
  errorElement?: React.ReactNode;
  icon?: React.ReactNode;
  label: string;
  isRequired?: boolean;
  isValid?: boolean;
  showValidIndicator?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  rightElement?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  onPaste,
  fieldName,
  fieldTouched,
  hasError,
  errorElement,
  icon,
  label,
  isRequired = false,
  isValid = false,
  showValidIndicator = true,
  disabled = false,
  autoComplete,
  maxLength,
  rightElement,
  className = '',
  inputClassName = '',
  labelClassName = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
    const iconPadding = icon ? 'pl-10' : '';
    const rightPadding = (rightElement || (showValidIndicator && fieldTouched)) ? 'pr-10' : '';
    
    let statusClasses = '';
    if (fieldTouched) {
      if (hasError) {
        statusClasses = 'border-red-500 focus:ring-red-500 focus:border-red-500';
      } else if (isValid && showValidIndicator) {
        statusClasses = 'border-green-500 focus:ring-green-500 focus:border-green-500';
      } else {
        statusClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
      }
    } else {
      statusClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    }

    const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';

    return `${baseClasses} ${iconPadding} ${rightPadding} ${statusClasses} ${disabledClasses} ${inputClassName}`.trim();
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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onPaste={onPaste}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={getInputClasses()}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />

        {/* Right Element or Validation Indicator */}
        {rightElement || (showValidIndicator && fieldTouched && (isValid || hasError)) ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement || (
              <>
                {isValid && !hasError && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {hasError && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Error Message */}
      {fieldTouched && errorElement && (
        <div id={`${id}-error`} role="alert">
          {errorElement}
        </div>
      )}

      {/* Character Count */}
      {maxLength && value && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};