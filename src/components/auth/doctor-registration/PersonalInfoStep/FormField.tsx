// Componente reutilizable para campos de formulario
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getFieldClassName } from './utils';

interface FormFieldProps {
  id: string;
  type: string;
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
  rightElement?: React.ReactNode;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  type,
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
  rightElement,
  onPaste
}) => {
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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onPaste={onPaste}
          className={getFieldClassName(fieldName, { [fieldName]: fieldTouched }, hasError, isValid)}
        />
        
        {/* Indicador de validación */}
        {showValidIndicator && fieldTouched && isValid && !hasError && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        
        {/* Indicador de error */}
        {showValidIndicator && fieldTouched && hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
        
        {/* Elemento personalizado a la derecha */}
        {rightElement}
      </div>
      {errorElement}
    </div>
  );
};

export default FormField;