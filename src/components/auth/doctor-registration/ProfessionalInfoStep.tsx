'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Award, 
  Building, 
  AlertCircle, 
  CheckCircle,
  Upload,
  X
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';

interface ProfessionalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'professional_info') => void;
  onStepError: (step: 'professional_info', error: string) => void;
  isLoading: boolean;
}

const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
  'Ciudad de México'
];

export default function ProfessionalInfoStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}: ProfessionalInfoStepProps) {
  const [formData, setFormData] = useState({
    licenseNumber: data.licenseNumber || '',
    licenseState: data.licenseState || '',
    licenseExpiry: data.licenseExpiry || '',
    yearsOfExperience: data.yearsOfExperience || 0,
    currentHospital: data.currentHospital || '',
    clinicAffiliations: data.clinicAffiliations || [],
    bio: data.bio || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAffiliation, setNewAffiliation] = useState('');

  // Función para validar cédula profesional mexicana
  const validateLicenseNumber = (license: string): boolean => {
    // Formato básico: números de 7-8 dígitos
    const licenseRegex = /^\d{7,8}$/;
    return licenseRegex.test(license);
  };

  // Función para validar fecha de expiración
  const validateExpiryDate = (date: string): boolean => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    return expiryDate > today;
  };

  // Manejar cambios en los campos
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateData({ [field]: value });
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Agregar afiliación clínica
  const addClinicAffiliation = () => {
    if (newAffiliation.trim() && !formData.clinicAffiliations.includes(newAffiliation.trim())) {
      const updatedAffiliations = [...formData.clinicAffiliations, newAffiliation.trim()];
      setFormData(prev => ({ ...prev, clinicAffiliations: updatedAffiliations }));
      updateData({ clinicAffiliations: updatedAffiliations });
      setNewAffiliation('');
    }
  };

  // Remover afiliación clínica
  const removeClinicAffiliation = (affiliation: string) => {
    const updatedAffiliations = formData.clinicAffiliations.filter(a => a !== affiliation);
    setFormData(prev => ({ ...prev, clinicAffiliations: updatedAffiliations }));
    updateData({ clinicAffiliations: updatedAffiliations });
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar número de cédula
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'La cédula profesional es requerida';
    } else if (!validateLicenseNumber(formData.licenseNumber)) {
      newErrors.licenseNumber = 'Ingresa un número de cédula válido (7-8 dígitos)';
    }

    // Validar estado de expedición
    if (!formData.licenseState) {
      newErrors.licenseState = 'Selecciona el estado de expedición';
    }

    // Validar fecha de expiración
    if (!formData.licenseExpiry) {
      newErrors.licenseExpiry = 'La fecha de expiración es requerida';
    } else if (!validateExpiryDate(formData.licenseExpiry)) {
      newErrors.licenseExpiry = 'La cédula debe estar vigente';
    }

    // Validar años de experiencia
    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Los años de experiencia no pueden ser negativos';
    } else if (formData.yearsOfExperience > 60) {
      newErrors.yearsOfExperience = 'Ingresa un número realista de años de experiencia';
    }

    // Validar biografía
    if (!formData.bio.trim()) {
      newErrors.bio = 'La biografía profesional es requerida';
    } else if (formData.bio.trim().length < 50) {
      newErrors.bio = 'La biografía debe tener al menos 50 caracteres';
    } else if (formData.bio.trim().length > 1000) {
      newErrors.bio = 'La biografía no debe exceder los 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Efecto para validar cuando cambian los datos
  useEffect(() => {
    const isValid = validateForm();
    if (isValid) {
      onStepComplete('professional_info');
    } else {
      onStepError('professional_info', 'Complete todos los campos correctamente');
    }
  }, [formData, onStepComplete, onStepError]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Profesional
        </h2>
        <p className="text-gray-600">
          Ingresa tu información médica profesional para verificar tus credenciales.
        </p>
      </div>

      {/* Información de Cédula Profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Cédula Profesional
          </CardTitle>
          <CardDescription>
            Información de tu cédula profesional médica expedida por la SEP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de cédula */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                Número de Cédula *
              </Label>
              <Input
                id="licenseNumber"
                type="text"
                placeholder="1234567"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                className={errors.licenseNumber ? 'border-red-500' : ''}
                maxLength={8}
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.licenseNumber}
                </p>
              )}
            </div>

            {/* Estado de expedición */}
            <div className="space-y-2">
              <Label htmlFor="licenseState">
                Estado de Expedición *
              </Label>
              <Select 
                value={formData.licenseState} 
                onValueChange={(value) => handleInputChange('licenseState', value)}
              >
                <SelectTrigger className={errors.licenseState ? 'border-red-500' : ''}>
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
              {errors.licenseState && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.licenseState}
                </p>
              )}
            </div>
          </div>

          {/* Fecha de expiración */}
          <div className="space-y-2">
            <Label htmlFor="licenseExpiry" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Fecha de Expiración *
            </Label>
            <Input
              id="licenseExpiry"
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
              className={errors.licenseExpiry ? 'border-red-500' : ''}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.licenseExpiry && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.licenseExpiry}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experiencia Profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Experiencia Profesional
          </CardTitle>
          <CardDescription>
            Información sobre tu experiencia y afiliaciones médicas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Años de experiencia */}
          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">
              Años de Experiencia *
            </Label>
            <Input
              id="yearsOfExperience"
              type="number"
              placeholder="5"
              value={formData.yearsOfExperience || ''}
              onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
              className={errors.yearsOfExperience ? 'border-red-500' : ''}
              min="0"
              max="60"
            />
            {errors.yearsOfExperience && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.yearsOfExperience}
              </p>
            )}
          </div>

          {/* Hospital actual */}
          <div className="space-y-2">
            <Label htmlFor="currentHospital" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Hospital/Institución Principal (Opcional)
            </Label>
            <Input
              id="currentHospital"
              type="text"
              placeholder="Hospital General de México"
              value={formData.currentHospital}
              onChange={(e) => handleInputChange('currentHospital', e.target.value)}
            />
          </div>

          {/* Afiliaciones clínicas */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Clínicas Afiliadas (Opcional)
            </Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Nombre de la clínica"
                value={newAffiliation}
                onChange={(e) => setNewAffiliation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addClinicAffiliation())}
              />
              <Button 
                type="button" 
                onClick={addClinicAffiliation}
                disabled={!newAffiliation.trim()}
                size="sm"
              >
                Agregar
              </Button>
            </div>
            
            {/* Lista de afiliaciones */}
            {formData.clinicAffiliations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.clinicAffiliations.map((affiliation, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center">
                    {affiliation}
                    <button
                      onClick={() => removeClinicAffiliation(affiliation)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Biografía Profesional */}
      <Card>
        <CardHeader>
          <CardTitle>Biografía Profesional</CardTitle>
          <CardDescription>
            Describe tu experiencia, especialidades y enfoque médico. Esta información será visible para tus pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">
              Biografía Profesional * (50-1000 caracteres)
            </Label>
            <Textarea
              id="bio"
              placeholder="Soy un médico especializado en... Mi enfoque se centra en... Tengo experiencia en..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className={`min-h-[120px] ${errors.bio ? 'border-red-500' : ''}`}
              maxLength={1000}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formData.bio.length}/1000 caracteres</span>
              {formData.bio.length >= 50 && (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Longitud adecuada
                </span>
              )}
            </div>
            {errors.bio && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.bio}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información importante */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Importante:</span> Toda la información profesional será verificada 
          durante el proceso de validación de identidad. Asegúrate de que todos los datos sean correctos 
          y estén actualizados.
        </AlertDescription>
      </Alert>
    </div>
  );
}
