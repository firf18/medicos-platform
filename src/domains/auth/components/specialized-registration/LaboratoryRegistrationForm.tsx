/**
 * Laboratory Registration Form Component
 * @fileoverview Registration form specifically for laboratory users
 * @compliance HIPAA-compliant laboratory data collection
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LaboratoryRegistrationData, RegistrationFormErrors, VENEZUELAN_STATES } from '../../types/specialized-registration.types';

interface LaboratoryRegistrationFormProps {
  data: Partial<LaboratoryRegistrationData>;
  errors: RegistrationFormErrors;
  onChange: (field: keyof LaboratoryRegistrationData, value: string) => void;
  onBlur: (field: keyof LaboratoryRegistrationData) => void;
}

export const LaboratoryRegistrationForm: React.FC<LaboratoryRegistrationFormProps> = ({
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
      {/* Laboratory Information */}
      <div className="space-y-2">
        <Label htmlFor="labName">
          Nombre del Laboratorio <span className="text-red-500">*</span>
        </Label>
        <Input
          id="labName"
          type="text"
          value={data.labName || ''}
          onChange={(e) => onChange('labName', e.target.value)}
          onBlur={() => onBlur('labName')}
          className={getFieldClassName('labName')}
          placeholder="Laboratorio Clínico Ejemplo"
          maxLength={100}
        />
        {errors.labName && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.labName}</AlertDescription>
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
            placeholder="administrador@laboratorio.com"
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
            Teléfono del Laboratorio <span className="text-red-500">*</span>
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
          Ubicación del Laboratorio
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
            placeholder="Av. Principal #123, Torre Médica"
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
          placeholder="https://www.laboratorioejemplo.com"
        />
        {errors.website && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.website}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="certifications">
          Certificaciones (Opcional)
        </Label>
        <Textarea
          id="certifications"
          value={data.certifications || ''}
          onChange={(e) => onChange('certifications', e.target.value)}
          onBlur={() => onBlur('certifications')}
          placeholder="ISO 15189, CAP, etc."
          rows={2}
          maxLength={300}
        />
        {errors.certifications && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.certifications}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="services">
          Servicios que Ofrece (Opcional)
        </Label>
        <Textarea
          id="services"
          value={data.services || ''}
          onChange={(e) => onChange('services', e.target.value)}
          onBlur={() => onBlur('services')}
          placeholder="Hematología, Química sanguínea, Microbiología, etc."
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          {data.services?.length || 0}/500 caracteres
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

      {/* Laboratory Registration Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Integración con Laboratorios:</strong> Podrás recibir órdenes de exámenes 
          directamente de los médicos registrados y enviar resultados de forma segura.
        </AlertDescription>
      </Alert>
    </div>
  );
};
