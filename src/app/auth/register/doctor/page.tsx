'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';

// Importar componentes de los pasos de registro
import PersonalInfoStep from '@/components/auth/doctor-registration/PersonalInfoStep';
import ProfessionalInfoStep from '@/components/auth/doctor-registration/ProfessionalInfoStep';
import LicenseVerificationStep from '@/components/auth/doctor-registration/LicenseVerificationStep';
import SpecialtySelectionStep from '@/components/auth/doctor-registration/SpecialtySelectionStep';
import DiditVerificationMain from '@/components/auth/doctor-registration/DiditVerificationMain';
import DashboardConfigurationStep from '@/components/auth/doctor-registration/DashboardConfigurationStep';
import FinalReviewStep from '@/components/auth/doctor-registration/FinalReviewStep';

import { RegistrationStep } from '@/types/medical/specialties';
import { getSpecialtyById } from '@/lib/medical-specialties/specialty-utils';
import { useDoctorRegistration } from '@/domains/auth/hooks/useDoctorRegistration';
import { useAutoCleanup } from '@/hooks/useAutoCleanup';
import { errorMonitor } from '@/lib/monitoring/frontend-error-monitor';
import { EmailVerificationProvider, useEmailVerification } from '@/contexts/EmailVerificationContext';
import { emailVerificationTracker } from '@/lib/email-verification/verification-tracker';

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

// Componente interno que usa el contexto
function DoctorRegistrationPageContent() {
  // Estado para rastrear la validación del paso actual
  const [currentStepValid, setCurrentStepValid] = useState(false);
  
  // Usar el contexto de verificación de email y teléfono
  const { 
    isEmailVerified, 
    verifiedEmail, 
    isPhoneVerified, 
    verifiedPhone,
    setIsPhoneVerified,
    setVerifiedPhone
  } = useEmailVerification();


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
      // Registro completado
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
    },
    enabled: true
  });

  // Monitorear cambios en registrationData para validación del paso personal_info
  useEffect(() => {
    if (progress.currentStep === 'personal_info') {
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
      const hasAllFields = requiredFields.every(field => {
        const value = registrationData[field as keyof typeof registrationData];
        return value && value.toString().trim() !== '';
      });

      const passwordsMatch = registrationData.password === registrationData.confirmPassword;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email || '');
      const phoneValid = /^\+58\d{10}$/.test(registrationData.phone || '');
      const passwordValid = (registrationData.password || '').length >= 8;
      
      // Verificar que el email esté verificado
      const emailVerified = isEmailVerified && verifiedEmail === registrationData.email;
      
      // Verificar que el teléfono esté verificado
      const phoneVerified = isPhoneVerified && verifiedPhone === registrationData.phone;
      
      const isValid = hasAllFields && passwordsMatch && emailValid && phoneValid && passwordValid && emailVerified && phoneVerified;
      
      setCurrentStepValid(isValid);
    }
  }, [registrationData, progress.currentStep, isEmailVerified, verifiedEmail, isPhoneVerified, verifiedPhone, setCurrentStepValid]);

  // Log de verificación solo cuando cambia el estado de verificación (con debounce)
  const [lastLogTime, setLastLogTime] = useState(0);
  useEffect(() => {
    if (progress.currentStep === 'personal_info') {
      const emailVerified = isEmailVerified && verifiedEmail === registrationData.email;
      const phoneVerified = isPhoneVerified && verifiedPhone === registrationData.phone;
      
      // Solo loggear si han pasado al menos 2 segundos desde el último log
      const now = Date.now();
      if ((!emailVerified || !phoneVerified) && (now - lastLogTime > 2000)) {
        console.log('⚠️ Verificación pendiente:', {
          emailVerified,
          phoneVerified,
          isEmailVerified,
          verifiedEmail,
          isPhoneVerified,
          verifiedPhone,
          currentEmail: registrationData.email,
          currentPhone: registrationData.phone
        });
        setLastLogTime(now);
      }
    }
  }, [isEmailVerified, verifiedEmail, isPhoneVerified, verifiedPhone, registrationData.email, registrationData.phone, progress.currentStep, lastLogTime]);

  // Calcular progreso actual
  const currentStepIndex = REGISTRATION_STEPS.findIndex(s => s.step === progress.currentStep);
  const isLastStep = currentStepIndex === REGISTRATION_STEPS.length - 1;
  
  // Log solo cuando el botón está deshabilitado sin razón aparente
  if (isSubmitting && !currentStepValid) {
    console.log('🔘 Botón deshabilitado:', {
      isSubmitting,
      currentStepValid,
      currentStep: progress.currentStep
    });
  }
  
  

  // Wrapper para onFinalSubmit que ignora el return value
  const handleFinalSubmitWrapper = async (): Promise<void> => {
    try {
      await submitRegistration();
    } catch (error) {
      console.error('Error en submitRegistration:', error);
    }
  };

  // Función para validar si se puede proceder al siguiente paso
  const canProceedToNext = useCallback(async (): Promise<boolean> => {
    if (progress.currentStep === 'personal_info') {
      // Para el paso de información personal, usar el estado de validación del componente
      return currentStepValid;
    }

    // Para otros pasos, usar la lógica estándar
    return canProceedNext;
  }, [progress.currentStep, currentStepValid, canProceedNext]);

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
        return <DiditVerificationMain {...commonProps} />;
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
                onClick={goToPreviousStep}
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
                
                // Validación manual simple
                const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
                const hasAllFields = requiredFields.every(field => {
                  const value = registrationData[field as keyof typeof registrationData];
                  return value && value.toString().trim() !== '';
                });
                
                const passwordsMatch = registrationData.password === registrationData.confirmPassword;
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email || '');
                const phoneValid = /^\+58\d{10}$/.test(registrationData.phone || '');
                const passwordValid = (registrationData.password || '').length >= 8;
                
                // VALIDACIÓN ESTRICTA - TODOS LOS CAMPOS DEBEN ESTAR COMPLETOS Y VÁLIDOS
                const emailVerified = isEmailVerified && verifiedEmail === registrationData.email;
                const phoneVerified = isPhoneVerified && verifiedPhone === registrationData.phone;
                
                // VERIFICACIÓN ROBUSTA CON TRACKER - NO SE PUEDE BYPASSEAR
                const realEmailVerification = emailVerificationTracker.isEmailVerified(registrationData.email);
                
                console.log('🔍 VALIDACIÓN ESTRICTA INICIADA:', {
                  hasAllFields,
                  passwordsMatch,
                  emailValid,
                  phoneValid,
                  passwordValid,
                  emailVerified,
                  phoneVerified,
                  realEmailVerification,
                  isEmailVerified,
                  verifiedEmail,
                  currentEmail: registrationData.email,
                  isPhoneVerified,
                  verifiedPhone,
                  currentPhone: registrationData.phone
                });

                // 1. VALIDAR CAMPOS OBLIGATORIOS
                if (!hasAllFields) {
                  alert('❌ FALTA: Por favor completa todos los campos requeridos');
                  return;
                }
                
                // 2. VALIDAR CONTRASEÑAS
                if (!passwordsMatch) {
                  alert('❌ CONTRASEÑAS NO COINCIDEN: Las contraseñas deben ser iguales');
                  return;
                }
                
                if (!passwordValid) {
                  alert('❌ CONTRASEÑA DÉBIL: La contraseña debe tener al menos 8 caracteres');
                  return;
                }
                
                // 3. VALIDAR FORMATOS
                if (!emailValid) {
                  alert('❌ FORMATO INVÁLIDO: Por favor ingresa un email válido');
                  return;
                }
                
                if (!phoneValid) {
                  alert('❌ FORMATO INVÁLIDO: Por favor ingresa un teléfono válido (+58XXXXXXXXX)');
                  return;
                }
                
                // 4. VALIDAR VERIFICACIÓN DE EMAIL (OBLIGATORIO - NO SE PUEDE BYPASSEAR)
                if (!realEmailVerification) {
                  console.log('❌ EMAIL NO VERIFICADO (TRACKER):', {
                    realEmailVerification,
                    isEmailVerified,
                    verifiedEmail,
                    currentEmail: registrationData.email,
                    matches: verifiedEmail === registrationData.email
                  });
                  alert('❌ EMAIL NO VERIFICADO: Debes verificar tu email con el código de verificación antes de continuar');
                  return;
                }

                // 5. VALIDAR VERIFICACIÓN DE TELÉFONO (OBLIGATORIO - NO SE PUEDE BYPASSEAR)
                if (!phoneVerified) {
                  console.log('❌ TELÉFONO NO VERIFICADO:', {
                    isPhoneVerified,
                    verifiedPhone,
                    currentPhone: registrationData.phone,
                    matches: verifiedPhone === registrationData.phone
                  });
                  alert('❌ TELÉFONO NO VERIFICADO: Debes verificar tu teléfono antes de continuar');
                  return;
                }

                // 6. VALIDACIÓN FINAL - TODOS LOS REQUISITOS CUMPLIDOS
                console.log('✅ TODAS LAS VALIDACIONES PASARON - PERMITIENDO AVANZAR');
                
                try {
                  if (isLastStep) {
                    await handleFinalSubmitWrapper();
                  } else {
                    goToNextStep();
                  }
                } catch (error) {
                  console.error('Error en onClick del botón:', error);
                }
              }}
              disabled={isSubmitting}
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
              onClick={goToPreviousStep}
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
                
                // Validación manual simple
                const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
                const hasAllFields = requiredFields.every(field => {
                  const value = registrationData[field as keyof typeof registrationData];
                  return value && value.toString().trim() !== '';
                });
                
                const passwordsMatch = registrationData.password === registrationData.confirmPassword;
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email || '');
                const phoneValid = /^\+58\d{10}$/.test(registrationData.phone || '');
                const passwordValid = (registrationData.password || '').length >= 8;
                
                // VALIDACIÓN ESTRICTA - TODOS LOS CAMPOS DEBEN ESTAR COMPLETOS Y VÁLIDOS
                const emailVerified = isEmailVerified && verifiedEmail === registrationData.email;
                const phoneVerified = isPhoneVerified && verifiedPhone === registrationData.phone;
                
                // VERIFICACIÓN ROBUSTA CON TRACKER - NO SE PUEDE BYPASSEAR
                const realEmailVerification = emailVerificationTracker.isEmailVerified(registrationData.email);
                
                console.log('🔍 VALIDACIÓN ESTRICTA INICIADA (BOTÓN 2):', {
                  hasAllFields,
                  passwordsMatch,
                  emailValid,
                  phoneValid,
                  passwordValid,
                  emailVerified,
                  phoneVerified,
                  realEmailVerification,
                  isEmailVerified,
                  verifiedEmail,
                  currentEmail: registrationData.email,
                  isPhoneVerified,
                  verifiedPhone,
                  currentPhone: registrationData.phone
                });

                // 1. VALIDAR CAMPOS OBLIGATORIOS
                if (!hasAllFields) {
                  alert('❌ FALTA: Por favor completa todos los campos requeridos');
                  return;
                }
                
                // 2. VALIDAR CONTRASEÑAS
                if (!passwordsMatch) {
                  alert('❌ CONTRASEÑAS NO COINCIDEN: Las contraseñas deben ser iguales');
                  return;
                }
                
                if (!passwordValid) {
                  alert('❌ CONTRASEÑA DÉBIL: La contraseña debe tener al menos 8 caracteres');
                  return;
                }
                
                // 3. VALIDAR FORMATOS
                if (!emailValid) {
                  alert('❌ FORMATO INVÁLIDO: Por favor ingresa un email válido');
                  return;
                }
                
                if (!phoneValid) {
                  alert('❌ FORMATO INVÁLIDO: Por favor ingresa un teléfono válido (+58XXXXXXXXX)');
                  return;
                }
                
                // 4. VALIDAR VERIFICACIÓN DE EMAIL (OBLIGATORIO - NO SE PUEDE BYPASSEAR)
                if (!realEmailVerification) {
                  console.log('❌ EMAIL NO VERIFICADO (BOTÓN 2 - TRACKER):', {
                    realEmailVerification,
                    isEmailVerified,
                    verifiedEmail,
                    currentEmail: registrationData.email,
                    matches: verifiedEmail === registrationData.email
                  });
                  alert('❌ EMAIL NO VERIFICADO: Debes verificar tu email con el código de verificación antes de continuar');
                  return;
                }

                // 5. VALIDAR VERIFICACIÓN DE TELÉFONO (OBLIGATORIO - NO SE PUEDE BYPASSEAR)
                if (!phoneVerified) {
                  console.log('❌ TELÉFONO NO VERIFICADO (BOTÓN 2):', {
                    isPhoneVerified,
                    verifiedPhone,
                    currentPhone: registrationData.phone,
                    matches: verifiedPhone === registrationData.phone
                  });
                  alert('❌ TELÉFONO NO VERIFICADO: Debes verificar tu teléfono antes de continuar');
                  return;
                }

                // 6. VALIDACIÓN FINAL - TODOS LOS REQUISITOS CUMPLIDOS
                console.log('✅ TODAS LAS VALIDACIONES PASARON (BOTÓN 2) - PERMITIENDO AVANZAR');
                
                try {
                  if (isLastStep) {
                    await handleFinalSubmitWrapper();
                  } else {
                    goToNextStep();
                  }
                } catch (error) {
                  console.error('Error en onClick del botón:', error);
                }
              }}
              disabled={isSubmitting}
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

// Componente principal que envuelve con el provider
export default function DoctorRegistrationPage() {
  return (
    <EmailVerificationProvider>
      <DoctorRegistrationPageContent />
    </EmailVerificationProvider>
  );
}