'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  LayoutDashboard, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Edit3,
  Save
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { getSpecialtyById, getDashboardFeatures } from '@/lib/medical-specialties';
import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import TermsModal from '@/components/auth/doctor-registration/TermsModal';

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
  isLoading: _, // Ignoramos esta prop ya que no la usamos directamente
  onFinalSubmit
}: FinalReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCompliance, setAgreedToCompliance] = useState(false);
  
  // Estados para edición en línea
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');
  
  // Estados para modales de términos
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();
  
  const specialty = getSpecialtyById(data.specialtyId);
  const selectedFeatures = getDashboardFeatures(data.specialtyId).filter(f => 
    data.selectedFeatures.includes(f.id)
  );

  // Contar días laborales
  const workingDays = Object.entries(data.workingHours).filter(([, schedule]) => 
    schedule.isWorkingDay
  ).length;

  // Función para iniciar la edición de un campo
  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setFieldValue(value);
  };

  // Función para guardar la edición de un campo
  const saveEditing = () => {
    if (editingField) {
      updateData({ [editingField]: fieldValue });
      setEditingField(null);
      setFieldValue('');
    }
  };

  // Función para cancelar la edición
  const cancelEditing = () => {
    setEditingField(null);
    setFieldValue('');
  };

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

  // Contenido de ejemplo para los términos y condiciones
  const termsContent = `Términos y Condiciones de Uso de Red-Salud

1. Aceptación de Términos
Al acceder y utilizar los servicios de Red-Salud, aceptas estos términos y condiciones de uso.

2. Descripción del Servicio
Red-Salud es una plataforma digital que conecta médicos con pacientes para facilitar la atención médica.

3. Registro de Médicos
Los médicos deben proporcionar información veraz y actualizada durante el proceso de registro.

4. Responsabilidades del Médico
Los médicos son responsables de mantener la confidencialidad de la información de los pacientes.

5. Cumplimiento Legal
Los usuarios deben cumplir con todas las leyes y regulaciones aplicables en su jurisdicción.`;

  const privacyContent = `Política de Privacidad de Red-Salud

1. Información que Recopilamos
Recopilamos información personal y médica necesaria para proporcionar nuestros servicios.

2. Uso de la Información
La información se utiliza para facilitar la conexión entre médicos y pacientes.

3. Protección de Datos
Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos.

4. Compartir Información
No compartimos información personal sin tu consentimiento, excepto cuando sea requerido por ley.

5. Derechos del Usuario
Tienes derecho a acceder, rectificar y eliminar tus datos personales.`;

  const complianceContent = `Normas de Compliance Médico de Red-Salud

1. Ética Profesional
Los médicos deben mantener los más altos estándares de ética profesional.

2. Confidencialidad
La información del paciente debe mantenerse estrictamente confidencial.

3. Calidad de la Atención
Los médicos deben proporcionar atención médica de la más alta calidad.

4. Actualización Profesional
Los médicos deben mantenerse actualizados en sus conocimientos y habilidades.

5. Cumplimiento Normativo
Los médicos deben cumplir con todas las normativas médicas aplicables.`;

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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </div>
            {editingField !== 'firstName' && editingField !== 'lastName' && editingField !== 'email' && editingField !== 'phone' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => startEditing('firstName', `${data.firstName} ${data.lastName}`)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre Completo</p>
              {editingField === 'firstName' || editingField === 'lastName' ? (
                <div className="flex space-x-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="Nombre y apellido"
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{data.firstName} {data.lastName}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              {editingField === 'email' ? (
                <div className="flex space-x-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{data.email}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              {editingField === 'phone' ? (
                <div className="flex space-x-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="+58XXXXXXXXX"
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{data.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información Profesional
            </div>
            {editingField !== 'licenseNumber' && editingField !== 'licenseState' && editingField !== 'licenseExpiry' && editingField !== 'yearsOfExperience' && editingField !== 'currentHospital' && editingField !== 'bio' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => startEditing('licenseNumber', data.licenseNumber)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cédula Profesional</p>
              {editingField === 'licenseNumber' ? (
                <div className="flex space-x-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="Número de cédula profesional"
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{data.licenseNumber}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado de Expedición</p>
              {editingField === 'licenseState' ? (
                <div className="flex space-x-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="Estado de expedición"
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{data.licenseState}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Años de Experiencia</p>
              {editingField === 'yearsOfExperience' ? (
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="Años de experiencia"
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{data.yearsOfExperience} años</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Vigencia</p>
              {editingField === 'licenseExpiry' ? (
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                  />
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{new Date(data.licenseExpiry).toLocaleDateString('es-MX')}</p>
              )}
            </div>
            {data.currentHospital && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Hospital/Institución Principal</p>
                {editingField === 'currentHospital' ? (
                  <div className="flex space-x-2">
                    <Input
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      placeholder="Hospital o institución principal"
                    />
                    <Button size="sm" onClick={saveEditing}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <p className="font-medium">{data.currentHospital}</p>
                )}
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
            {editingField === 'bio' ? (
              <div className="space-y-2">
                <Textarea
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Biografía profesional"
                  rows={4}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={saveEditing}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                {data.bio}
              </p>
            )}
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
                .filter(([, schedule]) => schedule.isWorkingDay)
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
                <button 
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowTermsModal(true)}
                >
                  Términos y Condiciones de Uso
                </button>{' '}
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
                <button 
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowPrivacyModal(true)}
                >
                  Política de Privacidad
                </button>{' '}
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
                <button 
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowComplianceModal(true)}
                >
                  Normas de Compliance Médico
                </button>{' '}
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

      {/* Modales de Términos y Condiciones */}
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={() => {
          setAgreedToTerms(true);
          setShowTermsModal(false);
        }}
        title="Términos y Condiciones de Uso"
        content={termsContent}
      />

      <TermsModal
        open={showPrivacyModal}
        onOpenChange={setShowPrivacyModal}
        onAccept={() => {
          setAgreedToPrivacy(true);
          setShowPrivacyModal(false);
        }}
        title="Política de Privacidad"
        content={privacyContent}
      />

      <TermsModal
        open={showComplianceModal}
        onOpenChange={setShowComplianceModal}
        onAccept={() => {
          setAgreedToCompliance(true);
          setShowComplianceModal(false);
        }}
        title="Normas de Compliance Médico"
        content={complianceContent}
      />
    </div>
  );
}