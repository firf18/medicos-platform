'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search,
  Shield,
  IdCard
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { toast } from '@/hooks/use-toast';

interface LicenseVerificationStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'license_verification') => void;
  onStepError: (step: 'license_verification', error: string) => void;
  isLoading: boolean;
}

export default function LicenseVerificationStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}: LicenseVerificationStepProps) {
  const [formData, setFormData] = useState({
    documentType: data.documentType || 'cedula_identidad',
    documentNumber: data.documentNumber || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    isVerified: boolean;
    doctorName?: string;
    licenseStatus?: string;
    profession?: string;
    specialty?: string;
    analysis?: any;
  } | null>(null);

  // Validar formato del número de documento según tipo
  const validateDocumentNumber = (type: string, number: string): boolean => {
    switch (type) {
      case 'cedula_identidad':
        return /^V-\d{7,8}$/.test(number);
      case 'cedula_extranjera':
        return /^E-\d{7,8}$/.test(number);
      default:
        return false;
    }
  };

  // Obtener mensaje de error de formato según tipo de documento
  const getDocumentFormatError = (type: string): string => {
    switch (type) {
      case 'cedula_identidad':
        return 'Formato inválido. Debe ser V-XXXXXXXX';
      case 'cedula_extranjera':
        return 'Formato inválido. Debe ser E-XXXXXXXX';
      default:
        return 'Formato de documento inválido';
    }
  };

  // Validar formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar tipo de documento
    if (!formData.documentType) {
      newErrors.documentType = 'Selecciona el tipo de documento';
    }

    // Validar número de documento
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    } else if (!validateDocumentNumber(formData.documentType, formData.documentNumber)) {
      newErrors.documentNumber = getDocumentFormatError(formData.documentType);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Manejar cambios en los campos
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateData({ [field]: value });
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Limpiar resultado de verificación si cambia el número
    if (field === 'documentNumber') {
      setVerificationResult(null);
    }
  };

  // Verificar licencia profesional
  const verifyLicense = async () => {
    if (!validateForm()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/license-verification-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al verificar la licencia');
      }

      if (!result.success) {
        throw new Error(result.error || 'No se pudo verificar la licencia');
      }

      setVerificationResult(result.result);

      if (result.result?.isValid) {
        // Actualizar datos del registro con la información verificada
        updateData({
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          // Si se obtuvo el nombre del médico, actualizarlo
          ...(result.result.doctorName && {
            firstName: result.result.doctorName.split(' ')[0] || data.firstName,
            lastName: result.result.doctorName.split(' ').slice(1).join(' ') || data.lastName,
          })
        });

        toast({
          title: 'Verificación Exitosa',
          description: 'La licencia profesional ha sido verificada correctamente.',
        });

        onStepComplete('license_verification');
      } else {
        toast({
          title: 'Verificación Fallida',
          description: 'No se pudo verificar la licencia profesional. Verifica que los datos sean correctos.',
          variant: 'destructive',
        });

        onStepError('license_verification', 'No se pudo verificar la licencia profesional');
      }
    } catch (error) {
      console.error('Error verificando licencia:', error);
      
      toast({
        title: 'Error de Verificación',
        description: error instanceof Error ? error.message : 'Ocurrió un error al verificar la licencia',
        variant: 'destructive',
      });

      onStepError('license_verification', error instanceof Error ? error.message : 'Error al verificar la licencia');
    } finally {
      setIsVerifying(false);
    }
  };

  // Efecto para validar cuando cambian los datos
  useEffect(() => {
    // Solo validar si hay datos y no estamos en estado de carga
    if (isLoading) return;
    
    // Verificar si el usuario ha interactuado con el formulario
    const hasUserInteracted = Object.values(formData).some(value => {
      if (typeof value === 'string') return value.trim() !== '';
      return false;
    });
    
    if (!hasUserInteracted) return;
    
    validateForm();
    // No marcamos automáticamente como completado, el usuario debe hacer clic en verificar
  }, [formData, isLoading, validateForm]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verificación de Licencia Profesional
        </h2>
        <p className="text-gray-600">
          Verifica tu licencia profesional médica para continuar con el registro.
        </p>
      </div>

      {/* Información de Documento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IdCard className="h-5 w-5 mr-2" />
            Documento de Identificación Profesional
          </CardTitle>
          <CardDescription>
            Ingresa uno de los siguientes documentos para verificar tu identidad profesional.
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
                disabled={isVerifying}
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
              <Input
                id="documentNumber"
                type="text"
                placeholder={getDocumentPlaceholder(formData.documentType)}
                value={formData.documentNumber}
                onChange={(e) => handleInputChange('documentNumber', e.target.value.toUpperCase())}
                className={errors.documentNumber ? 'border-red-500' : ''}
                disabled={isVerifying}
                maxLength={30}
              />
              {errors.documentNumber && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.documentNumber}
                </p>
              )}
            </div>
          </div>

          {/* Botón de verificación */}
          <div className="pt-4">
            <Button 
              onClick={verifyLicense}
              disabled={isVerifying || !formData.documentNumber.trim()}
              className="w-full md:w-auto"
            >
              {isVerifying ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Verificar Licencia
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado de verificación */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {verificationResult.isValid ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              )}
              Resultado de Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estado:</span>
                <span className={verificationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                  {verificationResult.isValid ? 'Verificado' : 'No Verificado'}
                </span>
              </div>
              
              {verificationResult.doctorName && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Médico:</span>
                  <span>{verificationResult.doctorName}</span>
                </div>
              )}
              
              {verificationResult.profession && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Profesión:</span>
                  <span>{verificationResult.profession}</span>
                </div>
              )}
              
              {verificationResult.specialty && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Especialidad:</span>
                  <span>{verificationResult.specialty}</span>
                </div>
              )}
              
              {verificationResult.licenseStatus && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado de Licencia:</span>
                  <span>{verificationResult.licenseStatus}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de seguridad */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Seguridad:</span> Toda la información proporcionada será verificada 
          mediante scraping de sitios web oficiales del gobierno venezolano. 
          Tus datos están protegidos y no serán compartidos con terceros.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Función auxiliar para obtener placeholder según tipo de documento
function getDocumentPlaceholder(type: string): string {
  switch (type) {
    case 'cedula_identidad':
      return 'V-12345678';
    case 'cedula_extranjera':
      return 'E-12345678';
    default:
      return 'Número de documento';
  }
}