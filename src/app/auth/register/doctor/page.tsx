'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';

// Importar componentes de los pasos de registro (modulares)
import PersonalInfoStep from '@/components/auth/doctor-registration/PersonalInfoStep';
import { ProfessionalInfoStep } from '@/domains/auth/components/professional-info';
import SpecialtySelectionStep from '@/components/auth/doctor-registration/SpecialtySelectionStep';
import DiditVerificationMain from '@/components/auth/doctor-registration/DiditVerificationMain';

import { RegistrationStep } from '@/types/medical/specialties';
import { getSpecialtyById } from '@/lib/medical-specialties/specialty-utils';
import { useRegistrationSession } from '@/hooks/useRegistrationSession';
import { registrationSessionManager } from '@/lib/registration/registration-session-manager';
import { ErrorMessage } from '@/components/registration/ErrorMessage';
import { EmailVerificationProvider } from '@/contexts/EmailVerificationContext';
import { DoctorRegistrationProvider } from '@/contexts/DoctorRegistrationContext';

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
  }
];

import { useDoctorRegistration } from '@/contexts/DoctorRegistrationContext';

// Componente interno que usa el contexto
function DoctorRegistrationPageContent() {
  // Usar el nuevo contexto para los datos del formulario
  const { registrationData, updateRegistrationData } = useDoctorRegistration();

  // Usar el hook de sesión de registro mejorado para la lógica de pasos
  const {
    sessionId,
    currentStep,
    completedSteps,
    isSessionActive,
    // data: registrationData, // No se usa de aquí
    // updateData, // No se usa de aquí
    goToNextStep,
    goToPreviousStep,
    completeStep,
    validateCurrentStep,
    markVerificationComplete,
    recordVerificationAttempt,
    canAttemptVerification,
    getVerificationCooldown,
    clearSession,
    extendSession
  } = useRegistrationSession();

  // Limpiar cualquier persistencia automática del sistema antiguo
  useEffect(() => {
    // Limpiar datos del sistema de persistencia automática
    if (typeof window !== 'undefined') {
      localStorage.removeItem('doctor_registration_progress');
      localStorage.removeItem('doctor_registration_step_progress');
      localStorage.removeItem('doctor_registration_session_timestamp');
      localStorage.removeItem('registration_data');
      localStorage.removeItem('registration_progress');
    }
  }, []);

  // Estado para manejo de errores
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepValid, setCurrentStepValid] = useState(false);

  // Manejo de timeout de sesión
  useEffect(() => {
    const handleSessionTimeout = () => {
      alert('Su sesión de registro ha expirado por inactividad. Será redirigido al inicio.');
      window.location.href = '/auth/register/doctor';
    };
    
    // Escuchar evento de timeout
    window.addEventListener('registration-session-timeout', handleSessionTimeout);
    
    return () => {
      window.removeEventListener('registration-session-timeout', handleSessionTimeout);
    };
  }, []);

  // Resetear timeout cuando hay actividad del usuario
  useEffect(() => {
    const resetTimeout = () => {
      extendSession();
    };
    
    // Escuchar eventos de actividad del usuario
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);
    window.addEventListener('click', resetTimeout);
    
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
      window.removeEventListener('click', resetTimeout);
    };
  }, [extendSession]);

  // Validación del paso actual
  useEffect(() => {
    if (registrationData) {
      const isValid = validateCurrentStep();
      setCurrentStepValid(isValid);
    }
  }, [registrationData, currentStep, validateCurrentStep]);
  
  // Log solo cuando el botón está deshabilitado sin razón aparente
  if (isSubmitting && !currentStepValid) {
    console.log('🔘 Botón deshabilitado:', {
      isSubmitting,
      currentStepValid,
      currentStep: currentStep
    });
  }
  
  

  // Función para manejar el submit final
  const handleFinalSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Obtener datos completos del session manager
      const finalData = registrationSessionManager.getData();
      
      if (!finalData) {
        throw new Error('No hay datos para registrar');
      }
      
      // Validar datos finales
      const isFinalValid = registrationSessionManager.validateStep('identity_verification', finalData);
      if (!isFinalValid) {
        throw new Error('Datos inválidos para registro final');
      }
      
      // Solo ahora guardar en Supabase
      const response = await fetch('/api/auth/register/doctor/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al procesar el registro');
      }

      const result = await response.json();
      
      if (result.success) {
        // Limpiar datos de sesión
        clearSession();
        // Redirigir a éxito
        window.location.href = '/auth/login/medicos?message=registration-completed';
      } else {
        throw new Error(result.error || 'Error en registro final');
      }
    } catch (error) {
      console.error('Error finalizando registro:', error);
      alert('Error al finalizar el registro. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [clearSession]);

  // Función para manejar actualización de datos sin guardar en Supabase
  const handleDataUpdate = useCallback((newData: Partial<typeof registrationData>) => {
    // Solo actualizar en memoria
    updateRegistrationData(newData);
  }, [updateRegistrationData]);

  // Función para manejar navegación mejorada
  const handleGoToNextStep = useCallback(() => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      alert('Por favor complete todos los campos requeridos correctamente');
      return;
    }
    
    // Solo avanzar si todo es válido
    const success = goToNextStep();
    if (success) {
      // Marcar paso como completado
      completeStep(currentStep);
    }
  }, [validateCurrentStep, goToNextStep, completeStep, currentStep]);

  const handleGoToPreviousStep = useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  // Calcular progreso actual
  const currentStepIndex = REGISTRATION_STEPS.findIndex(s => s.step === currentStep);
  const isLastStep = currentStepIndex === REGISTRATION_STEPS.length - 1;

  // Crear objeto formErrors compatible
  const formErrorsObject = {
    hasErrors: Object.keys(fieldErrors).length > 0,
    getFieldError: (field: string) => fieldErrors[field] || undefined,
    setFieldError: (field: string, error: string) => {
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    },
    clearFieldError: (field: string) => {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    hasFieldError: (field: string) => !!fieldErrors[field],
    getFieldErrorElement: (field: string) => {
      const error = fieldErrors[field];
      return error ? <div className="text-red-500 text-sm mt-1">{error}</div> : null;
    }
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    const commonProps = {
      data: registrationData,
      updateData: handleDataUpdate,
      onStepComplete: completeStep,
      onStepError: (error: string) => {
        console.error('Error en paso:', error);
        setFieldErrors({ general: error });
      },
      isLoading: isSubmitting,
      onFinalSubmit: handleFinalSubmit,
      formErrors: formErrorsObject,
      onNext: handleGoToNextStep,
      onPrevious: handleGoToPreviousStep
    };

    switch (currentStep) {
      case 'personal_info':
        return <PersonalInfoStep 
          {...commonProps} 
          formData={registrationData}
          onStepError={(error: string) => {
            console.error('Error en paso personal:', error);
            setFieldErrors({ general: error });
          }}
        />;
      case 'professional_info':
        return <ProfessionalInfoStep {...commonProps} />;
      case 'specialty_selection':
        return <SpecialtySelectionStep {...commonProps} />;
      case 'identity_verification':
        return <DiditVerificationMain {...commonProps} />;
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  // Obtener información de la especialidad seleccionada
  const selectedSpecialty = registrationData?.specialtyId 
    ? getSpecialtyById(registrationData.specialtyId)
    : null;

  // Detectar si estamos en la fase 3 (selección de especialidad) para usar layout especial
  const isSpecialtySelection = currentStepIndex === 2; // Índice 2 = Fase 3

  // Mostrar loading si los datos aún no están disponibles
  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario de registro...</p>
        </div>
      </div>
    );
  }

  if (isSpecialtySelection) {
    // Layout de pantalla completa para selección de especialidad
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header compacto mejorado */}
        <div className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4 flex-shrink-0 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Registro Médico</h1>
              <p className="text-sm text-gray-600">Fase 3: Especialidad Médica</p>
              </div>
            </div>
            

            {/* Volver */}
            <Link href="/auth/register">
              <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>

        {/* Contenido de pantalla completa */}
        <div className="relative z-10 flex-1 overflow-y-auto pb-20">
          {renderCurrentStep()}
        </div>

        {/* Navegación en el bottom mejorada */}
        <div className="relative z-10 bg-white/90 backdrop-blur-sm border-t border-white/20 px-6 py-4 flex-shrink-0 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between">
            {currentStepIndex > 0 ? (
              <Button
                variant="outline"
                onClick={handleGoToPreviousStep}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            ) : (
              <div></div>
            )}

            <Button
              id="next-button-personal-info"
              data-testid="next-button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!currentStepValid) {
                  alert('❌ Por favor complete todos los campos requeridos correctamente');
                  return;
                }
                
                console.log('✅ TODAS LAS VALIDACIONES PASARON - PERMITIENDO AVANZAR');
                
                try {
                  if (isLastStep) {
                    await handleFinalSubmit();
                  } else {
                    handleGoToNextStep();
                  }
                } catch (error) {
                  console.error('Error en onClick del botón:', error);
                }
              }}
              disabled={isSubmitting || !currentStepValid}
              className="registration-button px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{isLastStep ? 'Finalizar Registro' : 'Siguiente'}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Layout normal para otras fases
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
        {/* Header con progreso */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
            <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Registro Médico Profesional
              </h1>
                    <p className="text-gray-600 text-lg">
                      Únete a nuestra plataforma médica de confianza
              </p>
                  </div>
                </div>
            </div>
            <Link href="/auth/register">
                <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>


          {/* Especialidad seleccionada */}
          {selectedSpecialty && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Especialidad seleccionada</p>
                      <p className="text-lg font-semibold text-green-900">{selectedSpecialty.name}</p>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </div>


          {/* Contenido del paso actual mejorado */}
          <div className="mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-b border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{currentStepIndex + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {REGISTRATION_STEPS[currentStepIndex]?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {REGISTRATION_STEPS[currentStepIndex]?.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
            {Object.keys(fieldErrors).length > 0 && (
              <ErrorMessage
                title="Corrija los siguientes errores"
                message="Algunos campos requieren atención antes de continuar"
                type="error"
                className="mb-6"
              />
            )}
            {renderCurrentStep()}
              </div>
            </div>
          </div>

          {/* Navegación mejorada */}
          <div className="flex justify-between items-center">
          {/* Solo mostrar botón Anterior si no estamos en el primer paso */}
          {currentStepIndex > 0 ? (
            <Button
              variant="outline"
              onClick={handleGoToPreviousStep}
              disabled={isSubmitting}
                className="px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          ) : (
            <div></div>
          )}

            <Button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!currentStepValid) {
                  alert('❌ Por favor complete todos los campos requeridos correctamente');
                  return;
                }
                
                console.log('✅ TODAS LAS VALIDACIONES PASARON - PERMITIENDO AVANZAR');
                
                try {
                  if (isLastStep) {
                    await handleFinalSubmit();
                  } else {
                    handleGoToNextStep();
                  }
                } catch (error) {
                  console.error('Error en onClick del botón:', error);
                }
              }}
              disabled={isSubmitting || !currentStepValid}
              className="registration-button px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{isLastStep ? 'Finalizar Registro' : 'Siguiente'}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
          </Button>
        </div>

        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function DoctorRegistrationPage() {
  return (
    <EmailVerificationProvider>
      <DoctorRegistrationPageContent />
    </EmailVerificationProvider>
  );
}