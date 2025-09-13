'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  LayoutDashboard, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Lock
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { getSpecialtyById, getDashboardFeatures } from '@/lib/medical-specialties';
import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';

interface FinalReviewStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'final_review') => void;
  onStepError: (step: 'final_review', error: string) => void;
  isLoading: boolean;
  onFinalSubmit?: () => Promise<void>;
}

export default function FinalReviewStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  onFinalSubmit
}: FinalReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCompliance, setAgreedToCompliance] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();
  
  const specialty = getSpecialtyById(data.specialtyId);
  const selectedFeatures = getDashboardFeatures(data.specialtyId).filter(f => 
    data.selectedFeatures.includes(f.id)
  );

  // Contar días laborales
  const workingDays = Object.entries(data.workingHours).filter(([_, schedule]) => 
    schedule.isWorkingDay
  ).length;

  // Función para enviar el registro
  const handleSubmitRegistration = async () => {
    if (!agreedToTerms || !agreedToPrivacy || !agreedToCompliance) {
      onStepError('final_review', 'Debes aceptar todos los términos y condiciones');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Si hay una función de envío personalizada, usarla
      if (onFinalSubmit) {
        await onFinalSubmit();
      } else {
        // Preparar datos para Supabase
        const registrationPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: 'doctor' as const,
        
        // Información médica
        specialtyId: data.specialtyId,
        subSpecialties: data.subSpecialties,
        licenseNumber: data.licenseNumber,
        licenseState: data.licenseState,
        licenseExpiry: data.licenseExpiry,
        
        // Información profesional
        yearsOfExperience: data.yearsOfExperience,
        currentHospital: data.currentHospital,
        clinicAffiliations: data.clinicAffiliations,
        bio: data.bio,
        
        // Configuración del dashboard
        selectedFeatures: data.selectedFeatures,
        workingHours: data.workingHours,
        
        // Verificación de identidad
        identityVerification: data.identityVerification,
        
        // Metadatos de registro
        registrationCompletedAt: new Date().toISOString(),
        termsAcceptedAt: new Date().toISOString(),
        privacyAcceptedAt: new Date().toISOString(),
        complianceAcceptedAt: new Date().toISOString()
      };

      // Registrar con Supabase Auth
      const { error: signUpError } = await signUp(
        data.email,
        data.password,
        registrationPayload
      );

      if (signUpError) {
        throw new Error(signUpError.message);
      }

        // Marcar como completado
        onStepComplete('final_review');
        
        // Redirigir a verificación de email
        router.push('/auth/verify-email');
      }
      
    } catch (error: any) {
      console.error('Error al registrar médico:', error);
      onStepError('final_review', error.message || 'Error al completar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisión Final
        </h2>
        <p className="text-gray-600">
          Revisa toda tu información antes de completar el registro. Una vez enviado, 
          recibirás un email de verificación para activar tu cuenta.
        </p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre Completo</p>
              <p className="font-medium">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-medium">{data.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Información Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cédula Profesional</p>
              <p className="font-medium">{data.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado de Expedición</p>
              <p className="font-medium">{data.licenseState}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Años de Experiencia</p>
              <p className="font-medium">{data.yearsOfExperience} años</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vigencia</p>
              <p className="font-medium">{new Date(data.licenseExpiry).toLocaleDateString('es-MX')}</p>
            </div>
            {data.currentHospital && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Hospital/Institución Principal</p>
                <p className="font-medium">{data.currentHospital}</p>
              </div>
            )}
            {data.clinicAffiliations && data.clinicAffiliations.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Clínicas Afiliadas</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.clinicAffiliations.map((clinic, index) => (
                    <Badge key={index} variant="secondary">{clinic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Biografía Profesional</p>
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
              {data.bio}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Especialidad Médica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2" />
            Especialidad Médica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-${specialty?.color}-100`}>
              <Stethoscope className={`h-6 w-6 text-${specialty?.color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{specialty?.name}</h3>
              <p className="text-gray-600 text-sm">{specialty?.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{specialty?.complexity}</Badge>
                <Badge variant="outline">{specialty?.estimatedPatients} volumen</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verificación de Identidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Verificación de Identidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Verificación Completada</p>
              <p className="text-sm text-green-600">
                ID de verificación: {data.identityVerification?.verificationId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LayoutDashboard className="h-5 w-5 mr-2" />
            Configuración del Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Características Seleccionadas ({selectedFeatures.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    feature.priority === 'essential' ? 'bg-red-500' :
                    feature.priority === 'important' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Horarios de Trabajo ({workingDays} días)
            </p>
            <div className="text-sm text-gray-700">
              {Object.entries(data.workingHours)
                .filter(([_, schedule]) => schedule.isWorkingDay)
                .map(([day, schedule]) => {
                  const dayLabels: Record<string, string> = {
                    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
                    thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
                  };
                  return `${dayLabels[day]}: ${schedule.startTime}-${schedule.endTime}`;
                })
                .join(', ')
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Términos y Condiciones */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <Lock className="h-5 w-5 mr-2" />
            Términos y Condiciones
          </CardTitle>
          <CardDescription>
            Para completar tu registro, debes aceptar los siguientes términos:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="text-sm">
              <label htmlFor="terms" className="cursor-pointer">
                Acepto los{' '}
                <a href="/terminos" target="_blank" className="text-blue-600 hover:underline">
                  Términos y Condiciones de Uso <ExternalLink className="h-3 w-3 inline" />
                </a>{' '}
                de Red-Salud
              </label>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="privacy"
              checked={agreedToPrivacy}
              onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
            />
            <div className="text-sm">
              <label htmlFor="privacy" className="cursor-pointer">
                Acepto la{' '}
                <a href="/privacidad" target="_blank" className="text-blue-600 hover:underline">
                  Política de Privacidad <ExternalLink className="h-3 w-3 inline" />
                </a>{' '}
                y el tratamiento de mis datos personales
              </label>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="compliance"
              checked={agreedToCompliance}
              onCheckedChange={(checked) => setAgreedToCompliance(checked as boolean)}
            />
            <div className="text-sm">
              <label htmlFor="compliance" className="cursor-pointer">
                Acepto cumplir con las{' '}
                <a href="/compliance-medico" target="_blank" className="text-blue-600 hover:underline">
                  Normas de Compliance Médico <ExternalLink className="h-3 w-3 inline" />
                </a>{' '}
                y las regulaciones de Red-Salud
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de envío */}
      <div className="space-y-4">
        <Button
          onClick={handleSubmitRegistration}
          disabled={!agreedToTerms || !agreedToPrivacy || !agreedToCompliance || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Completando Registro...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Registro
            </>
          )}
        </Button>

        {(!agreedToTerms || !agreedToPrivacy || !agreedToCompliance) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Debes aceptar todos los términos y condiciones para completar tu registro.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Información final */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">¿Qué sigue después del registro?</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Recibirás un email de verificación en {data.email}</li>
              <li>• Tu cuenta será revisada por nuestro equipo de compliance</li>
              <li>• Una vez aprobada, podrás acceder a tu dashboard personalizado</li>
              <li>• Podrás comenzar a gestionar pacientes y usar todas las herramientas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
