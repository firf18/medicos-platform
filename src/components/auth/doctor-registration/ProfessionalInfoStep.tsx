'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Award, 
  Building, 
  AlertCircle, 
  CheckCircle,
  GraduationCap,
  IdCard,
  Search,
  Clock
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';

// Lista de universidades venezolanas
const VENEZUELAN_UNIVERSITIES = [
  'Universidad Central de Venezuela (UCV)',
  'Universidad del Zulia (LUZ)',
  'Universidad de Los Andes (ULA)',
  'Universidad de Carabobo (UC)',
  'Universidad de Oriente (UDO)',
  'Universidad Centroccidental Lisandro Alvarado (UCLA)',
  'Universidad Nacional Experimental Rómulo Gallegos (UNERG)',
  'Universidad Nacional Experimental Francisco de Miranda (UNEFM)',
  'Universidad de las Ciencias de la Salud "Hugo Chávez Frías" (UCS)',
  'Universidad Bolivariana de Venezuela (UBV)'
];

// Lista de colegios de médicos por estado
const MEDICAL_COLLEGES = [
  'Colegio de Médicos del Estado Anzoátegui',
  'Colegio de Médicos del Estado Apure',
  'Colegio de Médicos del Estado Aragua',
  'Colegio de Médicos del Estado Barinas',
  'Colegio de Médicos del Estado Bolívar',
  'Colegio de Médicos del Estado Carabobo',
  'Colegio de Médicos del Distrito Federal',
  'Colegio de Médicos del Estado Cojedes',
  'Colegio de Médicos del Estado Delta Amacuro',
  'Colegio de Médicos del Estado Falcón',
  'Colegio de Médicos del Estado Guárico',
  'Colegio de Médicos del Estado Lara',
  'Colegio de Médicos del Estado Mérida',
  'Colegio de Médicos del Estado Miranda',
  'Colegio de Médicos del Estado Monagas',
  'Colegio de Médicos del Estado Nueva Esparta',
  'Colegio de Médicos del Estado Portuguesa',
  'Colegio de Médicos del Estado Sucre',
  'Colegio de Médicos del Estado Táchira',
  'Colegio de Médicos del Estado Trujillo',
  'Colegio de Médicos del Estado Vargas',
  'Colegio de Médicos del Estado Yaracuy',
  'Colegio de Médicos del Estado Zulia'
];

interface ProfessionalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'professional_info') => void;
  onStepError: (step: 'professional_info', error: string) => void;
  isLoading: boolean;
  onNext?: () => void; // Nueva prop para manejar navegación manual
  onPrevious?: () => void; // Nueva prop para manejar navegación manual
}

// Interfaces para tipar los estados y errores
interface FormData {
  yearsOfExperience: number;
  bio: string;
  licenseNumber: string;
  documentType: 'cedula_identidad' | 'cedula_extranjera';
  documentNumber: string;
  university: string;
  graduationYear: number | undefined;
  medicalBoard: string;
}

interface FormErrors {
  yearsOfExperience?: string;
  bio?: string;
  licenseNumber?: string;
  documentType?: string;
  documentNumber?: string;
  university?: string;
  graduationYear?: string;
  medicalBoard?: string;
}

export default function ProfessionalInfoStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  onNext,
  onPrevious
}: ProfessionalInfoStepProps) {
  const [formData, setFormData] = useState<FormData>({
    yearsOfExperience: data.yearsOfExperience || 0,
    bio: data.bio || '',
    licenseNumber: data.licenseNumber || '',
    documentType: data.documentType || 'cedula_identidad',
    documentNumber: data.documentNumber || '',
    university: data.university || '',
    graduationYear: data.graduationYear || undefined,
    medicalBoard: data.medicalBoard || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    isVerified: boolean;
    doctorName?: string;
    licenseStatus?: string;
    profession?: string;
    specialty?: string;
    error?: string;
    analysis?: {
      isValidMedicalProfessional: boolean;
      specialty: string;
      dashboardAccess: {
        primaryDashboard: string;
        allowedDashboards: string[];
        reason: string;
        requiresApproval: boolean;
      };
      nameVerification: {
        matches: boolean;
        confidence: number;
      };
      recommendations: string[];
    };
  } | null>(null);

  // Ref para evitar bucles infinitos
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para obtener el placeholder según el tipo de documento
  const getDocumentPlaceholder = (documentType: string) => {
    switch (documentType) {
      case 'cedula_identidad':
        return 'V-12345678';
      case 'cedula_extranjera':
        return 'E-12345678';
      default:
        return 'V-12345678';
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = useCallback((field: keyof FormData, value: string | number) => {
    // Si cambia el tipo de documento, limpiar el número de documento
    if (field === 'documentType') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value as 'cedula_identidad' | 'cedula_extranjera',
        documentNumber: '' // Limpiar el campo
      }));
      updateData({ 
        [field]: value as 'cedula_identidad' | 'cedula_extranjera',
        documentNumber: '' // Limpiar también en el estado global
      });
      
      // Limpiar resultado de verificación anterior
      setVerificationResult(null);
      return;
    }

    // Si cambia el número de documento, validar formato según tipo
    if (field === 'documentNumber' && typeof value === 'string') {
      const documentType = formData.documentType;
      let processedValue = value.toUpperCase();
      
      // Validar formato según tipo de documento
      if (documentType === 'cedula_identidad' || documentType === 'cedula_extranjera') {
        // Solo permitir números después del prefijo V- o E-
        if (processedValue.startsWith('V-') || processedValue.startsWith('E-')) {
          const numberPart = processedValue.substring(2);
          // Solo números
          const numbersOnly = numberPart.replace(/[^0-9]/g, '');
          processedValue = processedValue.substring(0, 2) + numbersOnly;
        } else if (processedValue.length > 0 && !processedValue.startsWith('V-') && !processedValue.startsWith('E-')) {
          // Si no tiene prefijo, agregarlo automáticamente
          const numbersOnly = processedValue.replace(/[^0-9]/g, '');
          if (documentType === 'cedula_identidad') {
            processedValue = 'V-' + numbersOnly;
          } else {
            processedValue = 'E-' + numbersOnly;
          }
        }
      }
      
      setFormData(prev => ({ ...prev, [field]: processedValue }));
      updateData({ [field]: processedValue });
      
      // Limpiar error del campo al escribir
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }

      // Si el número es válido, iniciar verificación automática con debounce
      if (processedValue.length > 5) {
        // Cancelar verificación anterior si existe
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
        }
        
        // Programar nueva verificación con debounce de 1 segundo
        verificationTimeoutRef.current = setTimeout(() => {
          verifyLicenseAutomatically(processedValue);
        }, 1000);
      }
      
      return;
    }

    // Para otros campos, comportamiento normal
    setFormData(prev => ({ ...prev, [field]: value }));
    updateData({ [field]: value });
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors, updateData, formData.documentType]);

  // Verificación automática de licencia con SACs
  const verifyLicenseAutomatically = useCallback(async (documentNumber: string) => {
    if (!documentNumber || documentNumber.length < 6) return;

    setIsVerifyingLicense(true);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/license-verification-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: formData.documentType,
          documentNumber: documentNumber,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.result?.isValid) {
        setVerificationResult(result.result);
        
        // Actualizar datos del registro con la información verificada
        updateData({
          documentType: formData.documentType,
          documentNumber: documentNumber,
          licenseNumber: documentNumber,
          // Si se obtuvo el nombre del médico, actualizarlo
          ...(result.result.doctorName && {
            firstName: result.result.doctorName.split(' ')[0] || data.firstName,
            lastName: result.result.doctorName.split(' ').slice(1).join(' ') || data.lastName,
          }),
          // Guardar datos del análisis
          ...(result.result.analysis && {
            sacsData: result.result,
            dashboardAccess: result.result.analysis.dashboardAccess,
            nameVerification: result.result.analysis.nameVerification
          })
        });
      } else {
        const errorMessage = result.error || 'No se pudo verificar la licencia';
        setVerificationResult({ 
          isValid: false, 
          isVerified: false,
          error: errorMessage
        });
        
        // Mostrar error específico
        setErrors(prev => ({
          ...prev,
          documentNumber: errorMessage
        }));
      }
    } catch (error) {
      console.error('Error verificando licencia:', error);
      setVerificationResult({ isValid: false, isVerified: false });
    } finally {
      setIsVerifyingLicense(false);
    }
  }, [formData.documentType]); // Simplificadas las dependencias

  // Validar formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validar años de experiencia
    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Los años de experiencia no pueden ser negativos';
    } else if (formData.yearsOfExperience > 60) {
      newErrors.yearsOfExperience = 'Ingresa un número realista de años de experiencia';
    }

    // Validar número de documento
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    } else if (formData.documentNumber.length < 6) {
      newErrors.documentNumber = 'El número de documento debe tener al menos 6 caracteres';
    }

    // Validar biografía
    if (!formData.bio.trim()) {
      newErrors.bio = 'La biografía profesional es requerida';
    } else if (formData.bio.trim().length < 100) {
      newErrors.bio = 'La biografía debe tener al menos 100 caracteres';
    } else if (formData.bio.trim().length > 1000) {
      newErrors.bio = 'La biografía no debe exceder los 1000 caracteres';
    }

    // Validar universidad
    if (!formData.university.trim()) {
      newErrors.university = 'Debes seleccionar tu universidad de graduación';
    }

    // Validar colegio médico
    if (!formData.medicalBoard.trim()) {
      newErrors.medicalBoard = 'Debes seleccionar tu colegio médico';
    }

    // Verificar que la licencia esté verificada
    if (!verificationResult?.isValid) {
      newErrors.documentNumber = 'La licencia profesional debe ser verificada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, verificationResult]);

  // Efecto para validar cuando cambian los datos (solo para mostrar errores)
  useEffect(() => {
    // Solo validar si hay datos y no estamos en estado de carga
    if (isLoading) return;
    
    // Verificar si el usuario ha interactuado con el formulario
    const hasUserInteracted = Object.values(formData).some(value => {
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return value > 0;
      if (Array.isArray(value)) return value.length > 0;
      return false;
    });
    
    if (!hasUserInteracted) return;
    
    // Solo validar para mostrar errores, NO llamar onStepComplete automáticamente
    validateForm();
  }, [formData, isLoading, validateForm]);

  // Función para manejar navegación manual
  const handleManualNext = useCallback(() => {
    console.log('🎯 ProfessionalInfoStep.handleManualNext() llamado');
    
    const isValid = validateForm();
    console.log(`🔍 Validación del formulario: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    
    if (isValid) {
      console.log('📝 Guardando datos antes de avanzar...');
      // Guardar datos antes de avanzar
      updateData({
        yearsOfExperience: formData.yearsOfExperience,
        bio: formData.bio,
        licenseNumber: formData.licenseNumber,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        university: formData.university,
        graduationYear: formData.graduationYear,
        medicalBoard: formData.medicalBoard
      });
      
      console.log('✅ Marcando paso como completado...');
      // Marcar paso como completado
      onStepComplete('professional_info');
      
      console.log('➡️ Llamando función de navegación del hook...');
      // Llamar función de navegación si está disponible
      if (onNext) {
        onNext();
        console.log('✅ Función onNext ejecutada');
      } else {
        console.log('❌ Función onNext no está disponible');
      }
    } else {
      console.log('❌ Error: Formulario inválido');
      onStepError('professional_info', 'Complete todos los campos correctamente');
    }
  }, [formData, validateForm, updateData, onStepComplete, onStepError, onNext]);

  // Función para manejar navegación hacia atrás
  const handleManualPrevious = useCallback(() => {
    // Guardar datos antes de retroceder
    updateData({
      yearsOfExperience: formData.yearsOfExperience,
      bio: formData.bio,
      licenseNumber: formData.licenseNumber,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      university: formData.university,
      graduationYear: formData.graduationYear,
      medicalBoard: formData.medicalBoard
    });
    
    // Llamar función de navegación si está disponible
    if (onPrevious) {
      onPrevious();
    }
  }, [formData, updateData, onPrevious]);

  // Exponer funciones de navegación al componente padre
  useEffect(() => {
    // Exponer funciones globalmente para que el componente padre pueda acceder
    (window as any).professional_infoStepNavigation = {
      handleNext: handleManualNext,
      handlePrevious: handleManualPrevious,
      isValid: () => validateForm()
    };
    
    return () => {
      // Limpiar al desmontar
      delete (window as any).professional_infoStepNavigation;
    };
  }, [handleManualNext, handleManualPrevious, validateForm]);

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Profesional
        </h2>
        <p className="text-gray-600">
          Ingresa tu información médica profesional.
        </p>
      </div>

      {/* Verificación de Cédula Profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IdCard className="h-5 w-5 mr-2" />
            Verificación de Cédula Profesional
          </CardTitle>
          <CardDescription>
            Ingresa tu cédula profesional para verificación automática con SACs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de documento */}
            <div className="space-y-2">
              <Label htmlFor="documentType">
                Tipo de Documento *
              </Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value) => handleInputChange('documentType', value)}
                disabled={isVerifyingLicense}
              >
                <SelectTrigger className={errors.documentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona el tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cedula_identidad">Cédula de Identidad Venezolana</SelectItem>
                  <SelectItem value="cedula_extranjera">Cédula de Identidad Extranjera</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.documentType}
                </p>
              )}
            </div>

            {/* Número de documento */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber">
                Número de Documento *
              </Label>
              <div className="relative">
                  <Input
                    id="documentNumber"
                    type="text"
                    placeholder={getDocumentPlaceholder(formData.documentType)}
                    value={formData.documentNumber}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value.toUpperCase())}
                    className={errors.documentNumber ? 'border-red-500' : ''}
                    disabled={isVerifyingLicense}
                    maxLength={30}
                  />
                {isVerifyingLicense && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Clock className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              {errors.documentNumber && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.documentNumber}
                </p>
              )}
            </div>
          </div>

          {/* Resultado de verificación */}
          {verificationResult && (
            <div className={`p-4 rounded-lg border ${
              verificationResult.isValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.isValid 
                      ? 'Licencia verificada correctamente' 
                      : 'No se pudo verificar la licencia'
                    }
                  </p>
                  
                  {verificationResult.doctorName && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Médico:</strong> {verificationResult.doctorName}
                    </p>
                  )}
                  
                  {verificationResult.profession && (
                    <p className="text-sm text-gray-600">
                      <strong>Profesión:</strong> {verificationResult.profession}
                    </p>
                  )}
                  
                  {verificationResult.specialty && (
                    <p className="text-sm text-gray-600">
                      <strong>Especialidad:</strong> {verificationResult.specialty}
                    </p>
                  )}
                  
                  {/* Mostrar información del análisis si está disponible */}
                  {verificationResult.analysis && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Dashboard asignado:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {verificationResult.analysis.dashboardAccess?.primaryDashboard || 'general-medicine'}
                        </span>
                      </div>
                      
                      {verificationResult.analysis.nameVerification && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Verificación de nombre:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            verificationResult.analysis.nameVerification.matches 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {verificationResult.analysis.nameVerification.matches ? 'Coincide' : 'Requiere verificación'}
                          </span>
                        </div>
                      )}
                      
                      {verificationResult.analysis.recommendations && verificationResult.analysis.recommendations.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Recomendaciones:</span>
                          <ul className="mt-1 space-y-1">
                            {verificationResult.analysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-xs text-gray-600">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {verificationResult.error && (
                    <p className="text-sm text-red-600 mt-2">
                      <strong>Error:</strong> {verificationResult.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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
            <input
              id="yearsOfExperience"
              type="number"
              placeholder="5"
              value={formData.yearsOfExperience || ''}
              onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}
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

          {/* Información adicional de experiencia */}
          <div className="space-y-4">
            <Label className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Información Académica y Profesional
            </Label>
            
            {/* Universidad */}
            <div className="space-y-2">
              <Label htmlFor="university">
                Universidad de Graduación *
              </Label>
              <Select 
                value={formData.university} 
                onValueChange={(value) => handleInputChange('university', value)}
              >
                <SelectTrigger className={errors.university ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona tu universidad" />
                </SelectTrigger>
                <SelectContent>
                  {VENEZUELAN_UNIVERSITIES.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.university && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.university}
                </p>
              )}
            </div>

            {/* Año de graduación */}
            <div className="space-y-2">
              <Label htmlFor="graduationYear">
                Año de Graduación
              </Label>
              <Input
                id="graduationYear"
                type="number"
                placeholder="2015"
                value={formData.graduationYear || ''}
                onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value) || undefined)}
                className={errors.graduationYear ? 'border-red-500' : ''}
                min="1950"
                max={new Date().getFullYear()}
              />
              {errors.graduationYear && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.graduationYear}
                </p>
              )}
            </div>

            {/* Colegio médico */}
            <div className="space-y-2">
              <Label htmlFor="medicalBoard">
                Colegio Médico *
              </Label>
              <Select 
                value={formData.medicalBoard} 
                onValueChange={(value) => handleInputChange('medicalBoard', value)}
              >
                <SelectTrigger className={errors.medicalBoard ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona tu colegio médico" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICAL_COLLEGES.map((college) => (
                    <SelectItem key={college} value={college}>
                      {college}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.medicalBoard && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.medicalBoard}
                </p>
              )}
            </div>
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
              Biografía Profesional * (100-1000 caracteres)
            </Label>
            <Textarea
              id="bio"
              placeholder="Soy un médico especializado en... Mi enfoque se centra en... Tengo experiencia en..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className={`min-h-[120px] ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
              maxLength={1000}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formData.bio.length}/1000 caracteres</span>
              {formData.bio.length >= 100 && (
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