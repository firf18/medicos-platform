/**
 * Clinic Registration Form Component
 * @fileoverview Registration form specifically for clinic users
 * @compliance HIPAA-compliant clinic data collection
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ClinicRegistrationData, RegistrationFormErrors, VENEZUELAN_STATES } from '../../types/specialized-registration.types';

interface ClinicRegistrationFormProps {
  data: Partial<ClinicRegistrationData>;
  errors: RegistrationFormErrors;
  onChange: (field: keyof ClinicRegistrationData, value: string) => void;
  onBlur: (field: keyof ClinicRegistrationData) => void;
}

export const ClinicRegistrationForm: React.FC<ClinicRegistrationFormProps> = ({
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
      {/* Clinic Information */}
      <div className="space-y-2">
        <Label htmlFor="clinicName">
          Nombre de la Clínica <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clinicName"
          type="text"
          value={data.clinicName || ''}
          onChange={(e) => onChange('clinicName', e.target.value)}
          onBlur={() => onBlur('clinicName')}
          className={getFieldClassName('clinicName')}
          placeholder="Centro Médico Ejemplo"
          maxLength={100}
        />
        {errors.clinicName && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.clinicName}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Administrator Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Nombre del Administrador <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            value={data.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
            onBlur={() => onBlur('firstName')}
            className={getFieldClassName('firstName')}
            placeholder="Nombre"
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
            Apellido del Administrador <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            value={data.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
            onBlur={() => onBlur('lastName')}
            className={getFieldClassName('lastName')}
            placeholder="Apellido"
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
            placeholder="administrador@clinica.com"
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
            Teléfono de la Clínica <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            className={getFieldClassName('phone')}
            placeholder="+58 212 123 4567"
          />
          {errors.phone && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.phone}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900">
          Ubicación de la Clínica
        </h3>

        <div className="space-y-2">
          <Label htmlFor="address">
            Dirección <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            type="text"
            value={data.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            onBlur={() => onBlur('address')}
            className={getFieldClassName('address')}
            placeholder="Av. Principal #123, Sector Norte"
            maxLength={200}
          />
          {errors.address && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.address}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              Ciudad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              type="text"
              value={data.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              onBlur={() => onBlur('city')}
              className={getFieldClassName('city')}
              placeholder="Caracas"
              maxLength={50}
            />
            {errors.city && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.city}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.state || ''}
              onValueChange={(value) => onChange('state', value)}
            >
              <SelectTrigger 
                id="state"
                className={getFieldClassName('state')}
                onBlur={() => onBlur('state')}
              >
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                {VENEZUELAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.state}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-2">
        <Label htmlFor="website">
          Sitio Web (Opcional)
        </Label>
        <Input
          id="website"
          type="url"
          value={data.website || ''}
          onChange={(e) => onChange('website', e.target.value)}
          onBlur={() => onBlur('website')}
          className={getFieldClassName('website')}
          placeholder="https://www.clinicaejemplo.com"
        />
        {errors.website && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.website}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción de la Clínica (Opcional)
        </Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          onBlur={() => onBlur('description')}
          placeholder="Describe los servicios que ofrece tu clínica..."
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          {data.description?.length || 0}/500 caracteres
        </p>
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

      {/* Clinic Registration Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Registro de Clínica:</strong> Una vez registrada, podrás gestionar múltiples 
          médicos, citas y servicios desde un solo panel administrativo.
        </AlertDescription>
      </Alert>
    </div>
  );
};
