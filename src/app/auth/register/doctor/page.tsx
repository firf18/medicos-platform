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
import SpecialtySelectionStep from '@/components/auth/doctor-registration/SpecialtySelectionStep';
import IdentityVerificationStep from '@/components/auth/doctor-registration/IdentityVerificationStep';
import DashboardConfigurationStep from '@/components/auth/doctor-registration/DashboardConfigurationStep';
import FinalReviewStep from '@/components/auth/doctor-registration/FinalReviewStep';

import { RegistrationStep } from '@/types/medical/specialties';
import { getSpecialtyById } from '@/lib/medical-specialties';
import { useDoctorRegistration } from '@/hooks/useDoctorRegistration';

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
    updateRegistrationData,
    nextStep,
    prevStep,
    markStepAsCompleted,
    setStepError,
    handleFinalSubmission,
    formErrors
  } = useDoctorRegistration({
    onRegistrationComplete: (data) => {
      console.log('Registro completado:', data);
    },
    onRegistrationError: (error) => {
      console.error('Error en registro:', error);
    }
  });

  // Calcular progreso actual
  const currentStepIndex = REGISTRATION_STEPS.findIndex(s => s.step === progress.currentStep);
  const progressPercentage = ((currentStepIndex + 1) / REGISTRATION_STEPS.length) * 100;

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    const commonProps = {
      data: registrationData,
      updateData: updateRegistrationData,
      onStepComplete: markStepAsCompleted,
      onStepError: setStepError,
      isLoading: isSubmitting,
      onFinalSubmit: handleFinalSubmission,
      formErrors: formErrors
    };

    switch (progress.currentStep) {
      case 'personal_info':
        return <PersonalInfoStep {...commonProps} />;
      case 'professional_info':
        return <ProfessionalInfoStep {...commonProps} />;
      case 'specialty_selection':
        return <SpecialtySelectionStep {...commonProps} />;
      case 'identity_verification':
        return <IdentityVerificationStep {...commonProps} />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registro de Médico - Red-Salud
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
                            ? hasError 
                              ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : hasError && isCurrent ? (
                        <AlertCircle className="h-5 w-5" />
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
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0 || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={nextStep}
            disabled={!progress.canProceed || currentStepIndex === REGISTRATION_STEPS.length - 1 || isSubmitting}
            className="ml-auto"
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Mostrar errores del paso actual */}
        {progress.errors[progress.currentStep] && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">
                {progress.errors[progress.currentStep]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}