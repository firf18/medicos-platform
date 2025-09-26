/**
 * Contact Fields Section Component
 * @fileoverview Email and phone input fields for personal info
 * @compliance HIPAA-compliant contact information input with validation
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimplePhoneInput } from '@/components/ui/simple-phone-input';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { EmailVerification } from '@/components/auth/EmailVerification';
import {
  PersonalInfoFormData,
  PersonalInfoFormErrors,
  FieldTouchedState,
  EmailValidationResult,
  PhoneValidationResult
} from '../../types/personal-info.types';

interface ContactFieldsSectionProps {
  formData: Pick<PersonalInfoFormData, 'email' | 'phone'>;
  errors: Pick<PersonalInfoFormErrors, 'email' | 'phone'>;
  fieldTouched: Pick<FieldTouchedState, 'email' | 'phone'>;
  emailValidation: EmailValidationResult | null;
  phoneValidation: PhoneValidationResult | null;
  isCheckingEmail: boolean;
  isCheckingPhone: boolean;
  onFieldChange: (field: keyof PersonalInfoFormData, value: string) => void;
  onFieldTouch: (field: keyof PersonalInfoFormData) => void;
  onEmailVerified?: () => void;
  onEmailVerificationError?: (error: string) => void;
}

export const ContactFieldsSection: React.FC<ContactFieldsSectionProps> = ({
  formData,
  errors,
  fieldTouched,
  emailValidation,
  phoneValidation,
  isCheckingEmail,
  isCheckingPhone,
  onFieldChange,
  onFieldTouch,
  onEmailVerified,
  onEmailVerificationError
}) => {
  const getEmailFieldClassName = (baseClassName = '') => {
    let className = baseClassName;
    
    if (errors.email) {
      className += ' border-red-500 focus:border-red-500';
    } else if (emailValidation?.isAvailable === true && !errors.email) {
      className += ' border-green-500 focus:border-green-500';
    } else if (emailValidation?.isAvailable === false) {
      className += ' border-red-500 focus:border-red-500';
    }
    
    return className;
  };

  const getPhoneFieldClassName = (baseClassName = '') => {
    let className = baseClassName;
    
    if (errors.phone) {
      className += ' border-red-500 focus:border-red-500';
    } else if (phoneValidation?.isAvailable === true && !errors.phone) {
      className += ' border-green-500 focus:border-green-500';
    } else if (phoneValidation?.isAvailable === false) {
      className += ' border-red-500 focus:border-red-500';
    }
    
    return className;
  };

  const getEmailStatusIcon = () => {
    if (isCheckingEmail) {
      // No mostrar loader; mantener limpio mientras verifica
      return null;
    }
    
    if (emailValidation?.isAvailable === true && !errors.email) {
      return <CheckCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />;
    }
    
    // Invalid format or not available
    if (errors.email || emailValidation?.isAvailable === false) {
      return <XCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getPhoneStatusIcon = () => {
    if (isCheckingPhone) {
      // No mostrar loader; mantener limpio mientras verifica
      return null;
    }
    
    if (phoneValidation?.isAvailable === true && !errors.phone) {
      return <CheckCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />;
    }
    
    // Invalid format or not available
    if (errors.phone || phoneValidation?.isAvailable === false) {
      return <XCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getEmailStatusMessage = () => {
    if (isCheckingEmail) {
      return {
        variant: 'default' as const,
        message: 'Verificando disponibilidad del correo electrónico...'
      };
    }
    
    if (emailValidation?.isAvailable === true) {
      return {
        variant: 'default' as const,
        message: 'Correo electrónico disponible',
        className: 'border-green-200 bg-green-50 text-green-800'
      };
    }
    
    if (emailValidation?.isAvailable === false) {
      return {
        variant: 'destructive' as const,
        message: emailValidation.error || 'Este correo electrónico ya está registrado'
      };
    }
    
    if (errors.email && fieldTouched.email) {
      return {
        variant: 'destructive' as const,
        message: errors.email
      };
    }
    
    return null;
  };

  const getPhoneStatusMessage = () => {
    if (isCheckingPhone) {
      return {
        variant: 'default' as const,
        message: 'Verificando disponibilidad del número de teléfono...'
      };
    }
    
    if (phoneValidation?.isAvailable === true) {
      return {
        variant: 'default' as const,
        message: 'Número de teléfono disponible',
        className: 'border-green-200 bg-green-50 text-green-800'
      };
    }
    
    if (phoneValidation?.isAvailable === false) {
      return {
        variant: 'destructive' as const,
        message: phoneValidation.error || 'Este número de teléfono ya está registrado'
      };
    }
    
    if (errors.phone && fieldTouched.phone) {
      return {
        variant: 'destructive' as const,
        message: errors.phone
      };
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Información de Contacto</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Correo Electrónico <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => { onFieldChange('email', e.target.value); onFieldTouch('email'); }}
              onBlur={() => onFieldTouch('email')}
              placeholder="Ingrese su correo electrónico"
              className={getEmailFieldClassName('pr-10')}
              maxLength={255}
              autoComplete="email"
            />
            {getEmailStatusIcon()}
          </div>
          
          {(() => {
            const statusMessage = getEmailStatusMessage();
            if (statusMessage) {
              return (
                <Alert 
                  variant={statusMessage.variant}
                  className={statusMessage.className}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{statusMessage.message}</AlertDescription>
                </Alert>
              );
            }
            return null;
          })()}

          {/* Email Verification */}
          {emailValidation?.isAvailable === true && formData.email && (
            <EmailVerification
              email={formData.email}
              onVerificationComplete={onEmailVerified}
              onVerificationError={onEmailVerificationError}
            />
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Número de Teléfono <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <SimplePhoneInput
              value={formData.phone}
              onChange={(value) => { onFieldChange('phone', value); onFieldTouch('phone'); }}
              onBlur={() => onFieldTouch('phone')}
              placeholder="Número de teléfono"
              className={getPhoneFieldClassName('pr-10')}
            />
            {getPhoneStatusIcon()}
          </div>
          
          {(() => {
            const statusMessage = getPhoneStatusMessage();
            if (statusMessage) {
              return (
                <Alert 
                  variant={statusMessage.variant}
                  className={statusMessage.className}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{statusMessage.message}</AlertDescription>
                </Alert>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Contact Information Notice (removed per request) */}
    </div>
  );
};
