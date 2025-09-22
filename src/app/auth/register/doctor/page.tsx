'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Importar componentes de los pasos de registro
import PersonalInfoStep from '@/components/auth/doctor-registration/PersonalInfoStep';
import ProfessionalInfoStep from '@/components/auth/doctor-registration/ProfessionalInfoStep';
import LicenseVerificationStep from '@/components/auth/doctor-registration/LicenseVerificationStep';
import SpecialtySelectionStep from '@/components/auth/doctor-registration/SpecialtySelectionStep';
import DiditVerificationStep from '@/components/auth/doctor-registration/DiditVerificationStep';
import DashboardConfigurationStep from '@/components/auth/doctor-registration/DashboardConfigurationStep';
import FinalReviewStep from '@/components/auth/doctor-registration/FinalReviewStep';

import { RegistrationStep } from '@/types/medical/specialties';
import { getSpecialtyById } from '@/lib/medical-specialties/specialty-utils';
import { useDoctorRegistration } from '@/domains/auth/hooks/useDoctorRegistration';
import { useAutoCleanup } from '@/hooks/useAutoCleanup';

const REGISTRATION_STEPS: { step: RegistrationStep; title: string; description: string }[] = [
  {
    step: 'personal_info',
    title: 'Información Personal',
    description: 'Datos básicos y de contacto'
  },
  {
    step: 'professional_info',
    title: 'Información Profesional',
    description: 'Licencia médica y experiencia'
  },
  {
    step: 'specialty_selection',
    title: 'Especialidad Médica',
    description: 'Selecciona tu especialidad y servicios'
  },
  {
    step: 'identity_verification',
    title: 'Verificación de Identidad',
    description: 'Validación biométrica con Didit.me'
  },
  {
    step: 'dashboard_configuration',
    title: 'Configuración del Dashboard',
    description: 'Personaliza tu espacio de trabajo'
  },
  {
    step: 'final_review',
    title: 'Revisión Final',
    description: 'Confirma tu información antes de enviar'
  }
];

export default function DoctorRegistrationPage() {
  // Usar el hook personalizado para el registro de médicos
  const {
    registrationData,
    progress,
    isSubmitting,
    updateData,
    goToNextStep,
    goToPreviousStep,
    handleStepComplete,
    handleStepError,
    submitRegistration,
    canProceedNext,
    formErrors
  } = useDoctorRegistration({
    onRegistrationComplete: (data) => {
      console.log('Registro completado:', data);
    },
    onRegistrationError: (error) => {
      console.error('Error en registro:', error);
    }
  });

  // Limpieza automática de datos
  useAutoCleanup({
    onCleanup: () => {
      // Limpiar datos de registro cuando el usuario sale del proceso
      localStorage.removeItem('doctor_registration_progress');
      localStorage.removeItem('doctor_registration_step_progress');
      localStorage.removeItem('doctor_registration_session_timestamp');
      console.log('[CLEANUP] Datos de registro limpiados automáticamente');
    },
    enabled: true
  });

  // Calcular progreso actual
  const currentStepIndex = REGISTRATION_STEPS.findIndex(s => s.step === progress.currentStep);
  const progressPercentage = ((currentStepIndex + 1) / REGISTRATION_STEPS.length) * 100;

  // Wrapper para onFinalSubmit que ignora el return value
  const handleFinalSubmitWrapper = async (): Promise<void> => {
    await submitRegistration();
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    const commonProps = {
      data: registrationData,
      updateData,
      onStepComplete: handleStepComplete,
      onStepError: handleStepError,
      isLoading: isSubmitting,
      onFinalSubmit: handleFinalSubmitWrapper,
      formErrors,
      onNext: goToNextStep,
      onPrevious: goToPreviousStep
    };

    switch (progress.currentStep) {
      case 'personal_info':
        return <PersonalInfoStep {...commonProps} />;
      case 'professional_info':
        return <ProfessionalInfoStep {...commonProps} />;
      case 'license_verification':
        return <LicenseVerificationStep {...commonProps} />;
      case 'specialty_selection':
        return <SpecialtySelectionStep {...commonProps} />;
      case 'identity_verification':
        return <DiditVerificationStep {...commonProps} />;
      case 'dashboard_configuration':
        return <DashboardConfigurationStep {...commonProps} />;
      case 'final_review':
        return <FinalReviewStep {...commonProps} />;
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  // Obtener información de la especialidad seleccionada
  const selectedSpecialty = registrationData.specialtyId 
    ? getSpecialtyById(registrationData.specialtyId)
    : null;

  // Detectar si estamos en la fase 3 (selección de especialidad) para usar layout especial
  const isSpecialtySelection = currentStepIndex === 2; // Índice 2 = Fase 3

  if (isSpecialtySelection) {
    // Layout de pantalla completa para selección de especialidad
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header compacto solo para fases especiales */}
        <div className="bg-white border-b px-6 py-3 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Registro Médico</h1>
              <p className="text-sm text-gray-600">Fase 3: Especialidad Médica - {Math.round(progressPercentage)}% completado</p>
            </div>
            
            {/* Progress mini */}
            <div className="flex items-center gap-2">
              {REGISTRATION_STEPS.map((step, index) => {
                const isCompleted = progress.completedSteps.includes(step.step);
                const isCurrent = progress.currentStep === step.step;
                
                return (
                  <div 
                    key={step.step}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }
                    `}
                    title={step.title}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                );
              })}
            </div>

            {/* Volver */}
            <Link href="/auth/register">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>

        {/* Contenido de pantalla completa */}
        <div className="flex-1 overflow-y-auto pb-20">
          {renderCurrentStep()}
        </div>

        {/* Navegación en el bottom */}
        <div className="bg-white border-t px-6 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex justify-between">
            {currentStepIndex > 0 ? (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            ) : (
              <div></div>
            )}

            <Button
              onClick={goToNextStep}
              disabled={isSubmitting}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Layout normal para otras fases
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registro Médico 
              </h1>
              <p className="text-gray-600 mt-1">
                Completa tu registro profesional paso a paso
              </p>
            </div>
            <Link href="/auth/register">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso del registro</span>
              <span>{Math.round(progressPercentage)}% completado</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Especialidad seleccionada */}
          {selectedSpecialty && (
            <div className="mt-4 flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Especialidad seleccionada:</span>
                <span className="font-semibold">{selectedSpecialty.name}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Indicador de pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {REGISTRATION_STEPS.map((step, index) => {
              const isCompleted = progress.completedSteps.includes(step.step);
              const isCurrent = progress.currentStep === step.step;
              const hasError = progress.errors[step.step];

              return (
                <div 
                  key={step.step}
                  className="flex items-center"
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < REGISTRATION_STEPS.length - 1 && (
                    <div 
                      className={`
                        flex-1 h-0.5 mx-4 mt-5 
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `} 
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="flex justify-between">
          {/* Solo mostrar botón Anterior si no estamos en el primer paso */}
          {currentStepIndex > 0 ? (
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          ) : (
            <div></div>
          )}

          <Button
            onClick={goToNextStep}
            disabled={isSubmitting}
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

      </div>
    </div>
  );
}