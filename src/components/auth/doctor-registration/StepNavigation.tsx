'use client';

import { Button } from '@/components/ui/button';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  LayoutDashboard, 
  CheckCircle,
  IdCard
} from 'lucide-react';
import { RegistrationStep } from '@/types/medical/specialties';
import { useFlexibleNavigation } from '@/hooks/useFlexibleNavigation';
import StepSummary from '@/components/auth/doctor-registration/StepSummary';
import { DoctorRegistrationData } from '@/types/medical/specialties';

const STEPS = [
  { id: 'personal_info', title: 'Información Personal', icon: User },
  { id: 'professional_info', title: 'Información Profesional', icon: FileText },
  { id: 'license_verification', title: 'Verificación SACs', icon: IdCard },
  { id: 'specialty_selection', title: 'Especialidad Médica', icon: Stethoscope },
  { id: 'dashboard_configuration', title: 'Configuración del Dashboard', icon: LayoutDashboard },
  { id: 'identity_verification', title: 'Verificación Didit', icon: Shield }
];

interface StepNavigationProps {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  onStepChange: (step: RegistrationStep) => void;
  canProceed: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
  registrationData: DoctorRegistrationData;
}

export default function StepNavigation({
  currentStep,
  completedSteps,
  onStepChange,
  canProceed,
  onNext,
  onPrevious,
  isSubmitting = false,
  registrationData
}: StepNavigationProps) {
  // Usar el hook de navegación flexible
  const { canGoToStep, goToStep, getStepStatus, getStepIndex } = useFlexibleNavigation({
    currentStep,
    completedSteps,
    onStepChange,
    onNext,
    onPrevious
  });

  const progressPercentage = ((getStepIndex(currentStep) + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progreso del Registro */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Progreso del Registro</h3>
          <span className="text-sm text-gray-500">
            Paso {getStepIndex(currentStep) + 1} de {STEPS.length}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const status = getStepStatus(step.id as RegistrationStep);
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center ${
                  canGoToStep(step.id as RegistrationStep) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                onClick={() => canGoToStep(step.id as RegistrationStep) && goToStep(step.id as RegistrationStep)}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
                  ${status === 'active' 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2' 
                    : status === 'completed' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                  ${canGoToStep(step.id as RegistrationStep) ? 'hover:ring-2 hover:ring-blue-200' : ''}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs text-center transition-colors ${
                  status === 'active' ? 'font-semibold text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resúmenes de Pasos Completados */}
      {completedSteps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Pasos Completados</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedSteps
              .filter(step => step !== currentStep)
              .map(step => (
                <StepSummary 
                  key={step}
                  step={step}
                  data={registrationData}
                  onEdit={goToStep}
                />
              ))
            }
          </div>
        </div>
      )}

      {/* Botones de Navegación */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          disabled={currentStep === 'personal_info' || isSubmitting}
          variant="outline"
        >
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : currentStep === 'final_review' ? 'Completar Registro' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}