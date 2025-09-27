/**
 * ContactFieldsSection Component - Red-Salud Platform
 * 
 * Subcomponente para campos de contacto (email y teléfono) del registro médico.
 * Extraído de PersonalInfoStep para mejorar modularidad y mantenibilidad.
 * 
 * @compliance HIPAA-compliant contact field handling
 * @version 1.0.0
 * @created 2024-01-15
 */

import React from 'react';
import { Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import FormField from './FormField';
import { validateEmail, validateVenezuelanPhone } from './utils';

// Tipos para el subcomponente
export interface ContactFieldsData {
  email: string;
  phone: string;
}

export interface ContactFieldsProps {
  // Datos del formulario
  formData: ContactFieldsData;
  
  // Callbacks de cambio
  onFieldChange: (field: keyof ContactFieldsData, value: string) => void;
  onFieldBlur: (field: keyof ContactFieldsData, value: string) => void;
  onFieldPaste?: (field: keyof ContactFieldsData, event: React.ClipboardEvent<HTMLInputElement>) => void;
  
  // Estado de campos tocados
  fieldTouched: {
    email?: boolean;
    phone?: boolean;
  };
  
  // Manejo de errores
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => JSX.Element | null;
  };
  
  // Estado de verificación
  isEmailAvailable: boolean | null;
  isEmailVerified: boolean;
  isPhoneAvailable: boolean | null;
  isPhoneVerified: boolean;
  
  // Callbacks de verificación
  onStartEmailVerification?: () => void;
}

/**
 * Subcomponente para campos de contacto (email y teléfono)
 */
export const ContactFieldsSection: React.FC<ContactFieldsProps> = ({
  formData,
  onFieldChange,
  onFieldBlur,
  onFieldPaste,
  fieldTouched,
  formErrors,
  isEmailAvailable,
  isEmailVerified,
  isPhoneVerified,
  onStartEmailVerification
}) => {
  return (
    <div className="space-y-6">
      {/* Campos de Email y Teléfono en la misma fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo de Email */}
        <div className="space-y-2">
          <FormField
            id="email"
            type="email"
            placeholder="Ingrese su correo electrónico"
            value={formData.email}
            onChange={(value) => onFieldChange('email', value)}
            onBlur={() => onFieldBlur('email', formData.email)}
            onPaste={onFieldPaste ? (e) => onFieldPaste('email', e) : undefined}
            fieldName="email"
            fieldTouched={fieldTouched.email || false}
            hasError={formErrors?.hasFieldError('correo electrónico') || false}
            errorElement={fieldTouched.email ? formErrors?.getFieldErrorElement('correo electrónico') || null : null}
            icon={<Mail className="h-4 w-4 mr-2" />}
            label="Correo Electrónico"
            isRequired
            isValid={validateEmail(formData.email) && isEmailAvailable === true}
            showValidIndicator={false}
            rightElement={
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isEmailAvailable === true && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {isEmailAvailable === false && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {isEmailAvailable === null && formData.email && validateEmail(formData.email) && (fieldTouched.email || formData.email) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
            }
          />
          
          {/* Indicadores de estado del email */}
          {formData.email && validateEmail(formData.email) && isEmailAvailable === true && !isEmailVerified && onStartEmailVerification && (
            <div className="space-y-1">
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Email disponible
              </p>
              <button
                type="button"
                onClick={onStartEmailVerification}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Verificar correo electrónico
              </button>
            </div>
          )}

          {formData.email && validateEmail(formData.email) && isEmailVerified && (
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Email verificado correctamente
            </p>
          )}
        </div>

        {/* Campo de Teléfono */}
        <div className="space-y-2">
          <FormField
            id="phone"
            type="tel"
            placeholder="Número de teléfono"
            value={formData.phone}
            onChange={(value) => onFieldChange('phone', value)}
            onBlur={() => onFieldBlur('phone', formData.phone)}
            fieldName="phone"
            fieldTouched={fieldTouched.phone || false}
            hasError={formErrors?.hasFieldError('teléfono') || false}
            errorElement={fieldTouched.phone ? formErrors?.getFieldErrorElement('teléfono') || null : null}
            icon={<Phone className="h-4 w-4 mr-2" />}
            label="Número de Teléfono"
            isRequired
            isValid={validateVenezuelanPhone(formData.phone)}
            prefix="+58"
          />
          
          {/* Indicador de teléfono verificado */}
          {formData.phone && validateVenezuelanPhone(formData.phone) && isPhoneVerified && (
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Teléfono verificado correctamente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactFieldsSection;
