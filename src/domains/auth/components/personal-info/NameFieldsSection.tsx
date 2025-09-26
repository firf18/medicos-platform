/**
 * Name Fields Section Component
 * @fileoverview First name and last name input fields for personal info
 * @compliance HIPAA-compliant personal name data input
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import {
  PersonalInfoFormData,
  PersonalInfoFormErrors,
  FieldTouchedState
} from '../../types/personal-info.types';

interface NameFieldsSectionProps {
  formData: Pick<PersonalInfoFormData, 'firstName' | 'lastName'>;
  errors: Pick<PersonalInfoFormErrors, 'firstName' | 'lastName'>;
  fieldTouched: Pick<FieldTouchedState, 'firstName' | 'lastName'>;
  onFieldChange: (field: keyof PersonalInfoFormData, value: string) => void;
  onFieldTouch: (field: keyof PersonalInfoFormData) => void;
}

export const NameFieldsSection: React.FC<NameFieldsSectionProps> = ({
  formData,
  errors,
  fieldTouched,
  onFieldChange,
  onFieldTouch
}) => {
  // Normaliza a MAYÚSCULAS y solo letras/espacios (incluye acentos y Ñ)
  // Permite espacios para nombres compuestos como "María José"
  const toUpperLettersOnly = (value: string): string => {
    // Siempre convertir a mayúsculas y aplicar transformaciones necesarias
    let processedValue = value.toUpperCase();
    
    // Solo aplicar filtrado si hay caracteres no válidos o múltiples espacios
    if (/[^A-ZÁÉÍÓÚÑ\s]/.test(processedValue) || /\s{2,}/.test(processedValue)) {
      processedValue = processedValue
        .replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '') // Permite letras, acentos y espacios
        .replace(/\s+/g, ' '); // Normaliza múltiples espacios a uno solo
    }
    
    return processedValue;
  };
  const getFieldClassName = (field: 'firstName' | 'lastName', baseClassName = '') => {
    let className = baseClassName;
    
    if (errors[field]) {
      className += ' border-red-500 focus:border-red-500';
    } else if (fieldTouched[field] && formData[field]) {
      className += ' border-green-500 focus:border-green-500';
    }
    
    return className;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Información Personal</h3>
      </div>
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => {
                const transformed = toUpperLettersOnly(e.target.value);
                // Refleja de inmediato en el DOM para evitar parpadeos
                e.currentTarget.value = transformed;
                onFieldChange('firstName', transformed);
                onFieldTouch('firstName');
              }}
              onBlur={() => onFieldTouch('firstName')}
              placeholder="Ej: María José, Juan Carlos"
              className={getFieldClassName('firstName', 'pr-10')}
              maxLength={50}
            />
            {fieldTouched.firstName && formData.firstName && !errors.firstName && (
              <CheckCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.firstName && fieldTouched.firstName && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.firstName}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Apellido <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => {
                const transformed = toUpperLettersOnly(e.target.value);
                e.currentTarget.value = transformed;
                onFieldChange('lastName', transformed);
                onFieldTouch('lastName');
              }}
              onBlur={() => onFieldTouch('lastName')}
              placeholder="Ej: González Pérez, Rodríguez López"
              className={getFieldClassName('lastName', 'pr-10')}
              maxLength={50}
            />
            {fieldTouched.lastName && formData.lastName && !errors.lastName && (
              <CheckCircle className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.lastName && fieldTouched.lastName && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.lastName}</AlertDescription>
            </Alert>
          )}
          
        </div>
      </div>
    </div>
  );
};
