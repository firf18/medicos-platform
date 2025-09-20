/**
 * Doctor Registration Form Component
 * @fileoverview Registration form specifically for doctor users
 * @compliance HIPAA-compliant medical professional data collection
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DoctorRegistrationData, RegistrationFormErrors } from '../../types/specialized-registration.types';

interface DoctorRegistrationFormProps {
  data: Partial<DoctorRegistrationData>;
  errors: RegistrationFormErrors;
  onChange: (field: keyof DoctorRegistrationData, value: string | number) => void;
  onBlur: (field: keyof DoctorRegistrationData) => void;
  specialties: Array<{ id: string; name: string }>;
}

export const DoctorRegistrationForm: React.FC<DoctorRegistrationFormProps> = ({
  data,
  errors,
  onChange,
  onBlur,
  specialties
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

      {/* Professional Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900">
          Información Profesional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">
              Número de Matrícula Médica <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseNumber"
              type="text"
              value={data.licenseNumber || ''}
              onChange={(e) => onChange('licenseNumber', e.target.value)}
              onBlur={() => onBlur('licenseNumber')}
              className={getFieldClassName('licenseNumber')}
              placeholder="12345"
              maxLength={8}
            />
            {errors.licenseNumber && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.licenseNumber}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialtyId">
              Especialidad <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.specialtyId || ''}
              onValueChange={(value) => onChange('specialtyId', value)}
            >
              <SelectTrigger 
                id="specialtyId"
                className={getFieldClassName('specialtyId')}
                onBlur={() => onBlur('specialtyId')}
              >
                <SelectValue placeholder="Selecciona tu especialidad" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialtyId && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.specialtyId}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">
            Años de Experiencia (Opcional)
          </Label>
          <Input
            id="yearsOfExperience"
            type="number"
            value={data.yearsOfExperience || ''}
            onChange={(e) => onChange('yearsOfExperience', parseInt(e.target.value) || 0)}
            onBlur={() => onBlur('yearsOfExperience')}
            className={getFieldClassName('yearsOfExperience')}
            placeholder="5"
            min="0"
            max="50"
          />
          {errors.yearsOfExperience && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.yearsOfExperience}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">
            Biografía Profesional (Opcional)
          </Label>
          <Textarea
            id="bio"
            value={data.bio || ''}
            onChange={(e) => onChange('bio', e.target.value)}
            onBlur={() => onBlur('bio')}
            placeholder="Describe tu experiencia profesional, áreas de especialización..."
            rows={3}
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground">
            {data.bio?.length || 0}/500 caracteres
          </p>
        </div>
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

      {/* Professional Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Verificación Profesional:</strong> Tu matrícula médica será verificada con 
          las autoridades competentes para garantizar la seguridad de los pacientes.
        </AlertDescription>
      </Alert>
    </div>
  );
};
