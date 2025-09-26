/**
 * Laboratory Registration Form Component
 * @fileoverview Registration form specifically for laboratory users
 * @compliance HIPAA-compliant laboratory data collection and Mexican medical regulations
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Building, FileText, Shield, Clock } from 'lucide-react';
import { LaboratoryRegistrationData, RegistrationFormErrors } from '../../types/specialized-registration.types';

// Mexican states for laboratory registration
const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

// Laboratory types according to Mexican regulations
const LABORATORY_TYPES = [
  { value: 'laboratorio_clinico', label: 'Laboratorio Clínico' },
  { value: 'laboratorio_patologico', label: 'Laboratorio Patológico' },
  { value: 'laboratorio_genetico', label: 'Laboratorio Genético' },
  { value: 'laboratorio_toxicologico', label: 'Laboratorio Toxicológico' },
  { value: 'laboratorio_microbiologico', label: 'Laboratorio Microbiológico' }
];

// Business types
const BUSINESS_TYPES = [
  { value: 'individual', label: 'Persona Física' },
  { value: 'corporation', label: 'Sociedad Anónima' },
  { value: 'partnership', label: 'Sociedad de Responsabilidad Limitada' },
  { value: 'cooperative', label: 'Cooperativa' }
];

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
            placeholder="+52 55 1234 5678"
          />
          {errors.phone && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.phone}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Legal Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Información Legal y Regulatoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="legalName">
              Nombre Legal/Razón Social <span className="text-red-500">*</span>
            </Label>
            <Input
              id="legalName"
              type="text"
              value={data.legalName || ''}
              onChange={(e) => onChange('legalName', e.target.value)}
              onBlur={() => onBlur('legalName')}
              className={getFieldClassName('legalName')}
              placeholder="Laboratorio Clínico Ejemplo S.A. de C.V."
              maxLength={200}
            />
            {errors.legalName && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.legalName}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">
              Tipo de Empresa <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.businessType || ''}
              onValueChange={(value) => onChange('businessType', value)}
            >
              <SelectTrigger 
                id="businessType"
                className={getFieldClassName('businessType')}
                onBlur={() => onBlur('businessType')}
              >
                <SelectValue placeholder="Selecciona el tipo de empresa" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.businessType}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rfc">
              RFC <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rfc"
              type="text"
              value={data.rfc || ''}
              onChange={(e) => onChange('rfc', e.target.value.toUpperCase())}
              onBlur={() => onBlur('rfc')}
              className={getFieldClassName('rfc')}
              placeholder="XAXX010101000"
              maxLength={13}
            />
            {errors.rfc && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.rfc}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="curp">
              CURP (Opcional para personas físicas)
            </Label>
            <Input
              id="curp"
              type="text"
              value={data.curp || ''}
              onChange={(e) => onChange('curp', e.target.value.toUpperCase())}
              onBlur={() => onBlur('curp')}
              className={getFieldClassName('curp')}
              placeholder="XXXX000000XXXXXXXX"
              maxLength={18}
            />
            {errors.curp && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.curp}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">
              Número de Licencia Sanitaria <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseNumber"
              type="text"
              value={data.licenseNumber || ''}
              onChange={(e) => onChange('licenseNumber', e.target.value)}
              onBlur={() => onBlur('licenseNumber')}
              className={getFieldClassName('licenseNumber')}
              placeholder="LS123456789"
              maxLength={20}
            />
            {errors.licenseNumber && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.licenseNumber}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseType">
              Tipo de Laboratorio <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.licenseType || ''}
              onValueChange={(value) => onChange('licenseType', value)}
            >
              <SelectTrigger 
                id="licenseType"
                className={getFieldClassName('licenseType')}
                onBlur={() => onBlur('licenseType')}
              >
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {LABORATORY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.licenseType && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.licenseType}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseExpiryDate">
              Vencimiento de Licencia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseExpiryDate"
              type="date"
              value={data.licenseExpiryDate || ''}
              onChange={(e) => onChange('licenseExpiryDate', e.target.value)}
              onBlur={() => onBlur('licenseExpiryDate')}
              className={getFieldClassName('licenseExpiryDate')}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.licenseExpiryDate && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.licenseExpiryDate}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseIssuer">
              Emisor de la Licencia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseIssuer"
              type="text"
              value={data.licenseIssuer || ''}
              onChange={(e) => onChange('licenseIssuer', e.target.value)}
              onBlur={() => onBlur('licenseIssuer')}
              className={getFieldClassName('licenseIssuer')}
              placeholder="COFEPRIS, Secretaría de Salud Estatal"
              maxLength={100}
            />
            {errors.licenseIssuer && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.licenseIssuer}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cofeprisRegistration">
              Registro COFEPRIS (Opcional)
            </Label>
            <Input
              id="cofeprisRegistration"
              type="text"
              value={data.cofeprisRegistration || ''}
              onChange={(e) => onChange('cofeprisRegistration', e.target.value)}
              onBlur={() => onBlur('cofeprisRegistration')}
              className={getFieldClassName('cofeprisRegistration')}
              placeholder="CFP123456789"
              maxLength={20}
            />
            {errors.cofeprisRegistration && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.cofeprisRegistration}</AlertDescription>
              </Alert>
            )}
          </div>
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
              placeholder="Ciudad de México"
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
                {MEXICAN_STATES.map((state) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">
              Código Postal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postalCode"
              type="text"
              value={data.postalCode || ''}
              onChange={(e) => onChange('postalCode', e.target.value)}
              onBlur={() => onBlur('postalCode')}
              className={getFieldClassName('postalCode')}
              placeholder="01000"
              maxLength={5}
              pattern="[0-9]{5}"
            />
            {errors.postalCode && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.postalCode}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryPhone">
              Teléfono Secundario (Opcional)
            </Label>
            <Input
              id="secondaryPhone"
              type="tel"
              value={data.secondaryPhone || ''}
              onChange={(e) => onChange('secondaryPhone', e.target.value)}
              onBlur={() => onBlur('secondaryPhone')}
              className={getFieldClassName('secondaryPhone')}
              placeholder="+52 55 1234 5678"
            />
            {errors.secondaryPhone && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.secondaryPhone}</AlertDescription>
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
