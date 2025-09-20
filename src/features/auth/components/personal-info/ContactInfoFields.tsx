/**
 * Componente de Campos de Información de Contacto
 * 
 * Maneja los campos de email y teléfono con validación
 * especializada y verificación de disponibilidad.
 */

import React from 'react';
import { Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import SimplePhoneInput from 'react-simple-phone-input';
import { FormField } from '../../../shared/components/forms/FormField';
import { validateEmail, validateVenezuelanPhone } from '../../utils/validation-utils';

interface EmailValidation {
  isValid: boolean;
  isAvailable: boolean | null;
  isChecking?: boolean;
}

interface ContactInfoFieldsProps {
  formData: {
    email: string;
    phone: string;
  };
  fieldTouched: Record<string, boolean>;
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => React.ReactNode;
  };
  emailValidation: EmailValidation;
  onInputChange: (field: string, value: string) => void;
  onFieldBlur: (field: string) => void;
  isLoading?: boolean;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({
  formData,
  fieldTouched,
  formErrors,
  emailValidation,
  onInputChange,
  onFieldBlur,
  isLoading = false
}) => {
  const handleEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = e.clipboardData.getData('text').trim();
    if (pastedValue) {
      setTimeout(() => {
        onInputChange('email', pastedValue);
        onFieldBlur('email');
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <Mail className="h-5 w-5 mr-2" />
        Información de Contacto
      </h3>
      
      <div className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <FormField
            id="email"
            type="email"
            placeholder="doctor@ejemplo.com"
            value={formData.email}
            onChange={(value) => onInputChange('email', value)}
            onBlur={() => onFieldBlur('email')}
            onPaste={handleEmailPaste}
            fieldName="email"
            fieldTouched={fieldTouched.email || false}
            hasError={formErrors?.hasFieldError('correo electrónico') || false}
            errorElement={fieldTouched.email ? formErrors?.getFieldErrorElement('correo electrónico') || null : null}
            icon={<Mail className="h-4 w-4 mr-2" />}
            label="Correo Electrónico"
            isRequired
            isValid={validateEmail(formData.email) && emailValidation.isAvailable === true}
            showValidIndicator={false}
            disabled={isLoading}
            autoComplete="email"
            rightElement={
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {emailValidation.isAvailable === true && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {emailValidation.isAvailable === false && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {emailValidation.isChecking && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
                {/* Debug info - remover en producción */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 whitespace-nowrap">
                    {emailValidation.isChecking ? 'Checking' : 
                     emailValidation.isAvailable === true ? 'Available' : 
                     emailValidation.isAvailable === false ? 'Taken' : 'Unknown'}
                  </div>
                )}
              </div>
            }
          />
          
          {/* Mensaje de disponibilidad de email */}
          {emailValidation.isAvailable === true && (
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Email disponible
            </p>
          )}
          {emailValidation.isAvailable === false && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Este email ya está registrado
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700">
            <Phone className="h-4 w-4 mr-2" />
            Teléfono *
          </label>
          <div className="relative">
            <SimplePhoneInput
              value={formData.phone}
              onChange={(value) => onInputChange('phone', value || '')}
              onBlur={() => onFieldBlur('phone')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                fieldTouched.phone && formErrors?.hasFieldError('teléfono') 
                  ? 'border-red-500 focus:ring-red-500' 
                  : fieldTouched.phone && validateVenezuelanPhone(formData.phone) 
                    ? 'border-green-500 focus:ring-green-500' 
                    : 'border-gray-300'
              }`}
              placeholder="+58 xxx xxx xx xx"
              disabled={isLoading}
            />
            
            {/* Indicador de validación para teléfono */}
            {fieldTouched.phone && validateVenezuelanPhone(formData.phone) && !formErrors?.hasFieldError('teléfono') && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          
          {/* Error de teléfono */}
          {fieldTouched.phone && formErrors?.getFieldErrorElement('teléfono')}
          
          {/* Ayuda para formato de teléfono */}
          <p className="text-xs text-gray-500">
            Formato: +58 seguido de 10 dígitos (ej: +58 412 123 4567)
          </p>
        </div>
      </div>
    </div>
  );
};