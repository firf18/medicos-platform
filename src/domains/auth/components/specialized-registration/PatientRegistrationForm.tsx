/**
 * Patient Registration Form Component
 * @fileoverview Registration form specifically for patient users
 * @compliance HIPAA-compliant patient data collection
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PatientRegistrationData, RegistrationFormErrors } from '../../types/specialized-registration.types';

interface PatientRegistrationFormProps {
  data: Partial<PatientRegistrationData>;
  errors: RegistrationFormErrors;
  onChange: (field: keyof PatientRegistrationData, value: string) => void;
  onBlur: (field: keyof PatientRegistrationData) => void;
}

export const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  data,
  errors,
  onChange,
  onBlur
}) => {
  const getFieldClassName = (fieldName: keyof RegistrationFormErrors) => {
    return errors[fieldName] ? 'border-red-500 focus:border-red-500' : '';
  };

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            value={data.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
            onBlur={() => onBlur('firstName')}
            className={getFieldClassName('firstName')}
            placeholder="Tu nombre"
            maxLength={50}
          />
          {errors.firstName && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.firstName}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Apellido <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            value={data.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
            onBlur={() => onBlur('lastName')}
            className={getFieldClassName('lastName')}
            placeholder="Tu apellido"
            maxLength={50}
          />
          {errors.lastName && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.lastName}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Correo Electrónico <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => onBlur('email')}
            className={getFieldClassName('email')}
            placeholder="tu@email.com"
            autoComplete="email"
          />
          {errors.email && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.email}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Teléfono (Opcional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            className={getFieldClassName('phone')}
            placeholder="+58 412 123 4567"
          />
          {errors.phone && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.phone}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">
          Fecha de Nacimiento <span className="text-red-500">*</span>
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={data.dateOfBirth || ''}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          onBlur={() => onBlur('dateOfBirth')}
          className={getFieldClassName('dateOfBirth')}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.dateOfBirth && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.dateOfBirth}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={data.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            onBlur={() => onBlur('password')}
            className={getFieldClassName('password')}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
          {errors.password && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.password}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={data.confirmPassword || ''}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            onBlur={() => onBlur('confirmPassword')}
            className={getFieldClassName('confirmPassword')}
            placeholder="Repetir contraseña"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.confirmPassword}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Emergency Contact Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900">
          Contacto de Emergencia (Opcional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">
              Nombre del Contacto
            </Label>
            <Input
              id="emergencyContactName"
              type="text"
              value={data.emergencyContactName || ''}
              onChange={(e) => onChange('emergencyContactName', e.target.value)}
              onBlur={() => onBlur('emergencyContactName')}
              className={getFieldClassName('emergencyContactName')}
              placeholder="Nombre completo"
            />
            {errors.emergencyContactName && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.emergencyContactName}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">
              Teléfono del Contacto
            </Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={data.emergencyContactPhone || ''}
              onChange={(e) => onChange('emergencyContactPhone', e.target.value)}
              onBlur={() => onBlur('emergencyContactPhone')}
              className={getFieldClassName('emergencyContactPhone')}
              placeholder="+58 412 123 4567"
            />
            {errors.emergencyContactPhone && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.emergencyContactPhone}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Medical Conditions */}
      <div className="space-y-2">
        <Label htmlFor="medicalConditions">
          Condiciones Médicas Actuales (Opcional)
        </Label>
        <Textarea
          id="medicalConditions"
          value={data.medicalConditions || ''}
          onChange={(e) => onChange('medicalConditions', e.target.value)}
          onBlur={() => onBlur('medicalConditions')}
          placeholder="Describe brevemente cualquier condición médica actual, alergias o medicamentos que tomas..."
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          Esta información ayudará a los médicos a brindarte mejor atención
        </p>
      </div>

      {/* Privacy Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Privacidad Médica:</strong> Tu información está protegida según estándares 
          médicos internacionales. Solo será compartida con profesionales de salud autorizados 
          para tu atención.
        </AlertDescription>
      </Alert>
    </div>
  );
};
