/**
 * Hook personalizado para el registro de médicos - Red-Salud
 * 
 * Este hook maneja todo el estado y lógica del registro de médicos,
 * incluyendo validaciones, seguridad y compliance médico.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { 
  DoctorRegistrationData, 
  RegistrationStep, 
  RegistrationProgress 
} from '@/types/medical/specialties';
import {
  personalInfoSchema,
  professionalInfoSchema,
  specialtySelectionSchema,
  identityVerificationSchema,
  dashboardConfigurationSchema,
  completeDoctorRegistrationSchema,
  logSecurityEvent,
  validateDataSensitivity,
  sanitizeInput,
  validatePasswordStrength
} from '@/lib/validations/doctor-registration';
import { 
  registerDoctor, 
  checkEmailAvailability,
  checkLicenseAvailability 
} from '@/lib/supabase/doctor-registration';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { ZodError } from 'zod';

interface UseDoctorRegistrationProps {
  onRegistrationComplete?: (data: DoctorRegistrationData) => void;
  onRegistrationError?: (error: string) => void;
}

export function useDoctorRegistration({ 
  onRegistrationComplete, 
  onRegistrationError 
}: UseDoctorRegistrationProps = {}) {
  const router = useRouter();
  
  // Hook de manejo de errores mejorado
  const formErrors = useDoctorRegistrationErrors();
  
  // Estado del formulario de registro
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialtyId: '',
    subSpecialties: [],
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    yearsOfExperience: 0,
    currentHospital: '',
    clinicAffiliations: [],
    bio: '',
    selectedFeatures: [],
    workingHours: {
      monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isWorkingDay: false },
      sunday: { isWorkingDay: false }
    }
  });

  // Estado del progreso de registro
  const [progress, setProgress] = useState<RegistrationProgress>({
    currentStep: 'personal_info',
    completedSteps: [],
    totalSteps: 6,
    canProceed: false,
    errors: {}
  });

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN POR PASO
  // ============================================================================

  const validatePersonalInfo = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      const personalData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        password: data.password || '',
        confirmPassword: data.confirmPassword || ''
      };

      // Sanitizar inputs
      Object.keys(personalData).forEach(key => {
        if (typeof personalData[key as keyof typeof personalData] === 'string') {
          personalData[key as keyof typeof personalData] = sanitizeInput(
            personalData[key as keyof typeof personalData] as string
          );
        }
      });

      // Validar con Zod
      await personalInfoSchema.parseAsync(personalData);

      // Validar sensibilidad de datos
      if (!validateDataSensitivity(personalData)) {
        formErrors.setFieldError('general', 'Los datos contienen información sensible no permitida');
        return { isValid: false, errors: ['Los datos contienen información sensible no permitida'] };
      }

      // Validar fortaleza de contraseña
      const passwordValidation = validatePasswordStrength(personalData.password);
      if (!passwordValidation.isValid) {
        formErrors.setFieldError('contraseña', passwordValidation.errors.join(', '));
        return { isValid: false, errors: passwordValidation.errors };
      }

      // Limpiar errores si la validación es exitosa
      formErrors.clearAllErrors();

      // Log de seguridad
      logSecurityEvent('personal_info_validated', {
        email: personalData.email,
        timestamp: new Date().toISOString()
      });

      return { isValid: true, errors: [] };
    } catch (error: any) {
      logSecurityEvent('personal_info_validation_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Manejar errores de Zod de forma user-friendly
      if (error instanceof ZodError) {
        formErrors.setZodError(error);
        return { 
          isValid: false, 
          errors: formErrors.errors.map(e => e.message)
        };
      }
      
      // Manejar otros errores
      formErrors.setFieldError('general', error.message);
      return { 
        isValid: false, 
        errors: [error.message] 
      };
    }
  }, [formErrors]);

  const validateProfessionalInfo = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      const professionalData = {
        licenseNumber: data.licenseNumber || '',
        licenseState: data.licenseState || '',
        licenseExpiry: data.licenseExpiry || '',
        yearsOfExperience: data.yearsOfExperience || 0,
        currentHospital: data.currentHospital || '',
        clinicAffiliations: data.clinicAffiliations || [],
        bio: data.bio || ''
      };

      // Sanitizar inputs
      Object.keys(professionalData).forEach(key => {
        if (typeof professionalData[key as keyof typeof professionalData] === 'string') {
          professionalData[key as keyof typeof professionalData] = sanitizeInput(
            professionalData[key as keyof typeof professionalData] as string
          );
        }
      });

      // Validar con Zod
      await professionalInfoSchema.parseAsync(professionalData);

      // Limpiar errores si la validación es exitosa
      formErrors.clearAllErrors();

      // Log de seguridad
      logSecurityEvent('professional_info_validated', {
        licenseNumber: professionalData.licenseNumber,
        licenseState: professionalData.licenseState,
        timestamp: new Date().toISOString()
      });

      return { isValid: true, errors: [] };
    } catch (error: any) {
      logSecurityEvent('professional_info_validation_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Manejar errores de Zod de forma user-friendly
      if (error instanceof ZodError) {
        formErrors.setZodError(error);
        return { 
          isValid: false, 
          errors: formErrors.errors.map(e => e.message)
        };
      }
      
      // Manejar otros errores
      formErrors.setFieldError('general', error.message);
      return { 
        isValid: false, 
        errors: [error.message] 
      };
    }
  }, [formErrors]);

  const validateSpecialtySelection = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      const specialtyData = {
        specialtyId: data.specialtyId || '',
        subSpecialties: data.subSpecialties || [],
        selectedFeatures: data.selectedFeatures || []
      };

      // Validar con Zod
      await specialtySelectionSchema.parseAsync(specialtyData);

      // Log de seguridad
      logSecurityEvent('specialty_selection_validated', {
        specialtyId: specialtyData.specialtyId,
        subSpecialties: specialtyData.subSpecialties,
        timestamp: new Date().toISOString()
      });

      return { isValid: true, errors: [] };
    } catch (error: any) {
      logSecurityEvent('specialty_selection_validation_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { 
        isValid: false, 
        errors: [error.message] 
      };
    }
  }, []);

  const validateIdentityVerification = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      if (!data.identityVerification) {
        throw new Error('La verificación de identidad es requerida');
      }

      // Validar con Zod
      await identityVerificationSchema.parseAsync({ identityVerification: data.identityVerification });

      // Log de seguridad
      logSecurityEvent('identity_verification_validated', {
        verificationId: data.identityVerification.verificationId,
        status: data.identityVerification.status,
        timestamp: new Date().toISOString()
      });

      return { isValid: true, errors: [] };
    } catch (error: any) {
      logSecurityEvent('identity_verification_validation_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { 
        isValid: false, 
        errors: [error.message] 
      };
    }
  }, []);

  const validateDashboardConfiguration = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      const dashboardData = {
        selectedFeatures: data.selectedFeatures || [],
        workingHours: data.workingHours || registrationData.workingHours
      };

      // Validar con Zod
      await dashboardConfigurationSchema.parseAsync(dashboardData);

      // Log de seguridad
      logSecurityEvent('dashboard_configuration_validated', {
        selectedFeatures: dashboardData.selectedFeatures,
        timestamp: new Date().toISOString()
      });

      return { isValid: true, errors: [] };
    } catch (error: any) {
      logSecurityEvent('dashboard_configuration_validation_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      return { 
        isValid: false, 
        errors: [error.message] 
      };
    }
  }, [registrationData.workingHours]);

  // ============================================================================
  // FUNCIONES DE NAVEGACIÓN
  // ============================================================================

  const updateRegistrationData = useCallback((newData: Partial<DoctorRegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...newData }));
  }, []);

  const markStepAsCompleted = useCallback((step: RegistrationStep) => {
    setProgress(prev => ({
      ...prev,
      canProceed: true,
      errors: { ...prev.errors, [step]: '' }
    }));
  }, []);

  const setStepError = useCallback((step: RegistrationStep, error: string) => {
    setProgress(prev => ({
      ...prev,
      canProceed: false,
      errors: { ...prev.errors, [step]: error }
    }));
  }, []);

  const nextStep = useCallback(async () => {
    const currentStep = progress.currentStep;
    let validationResult = { isValid: true, errors: [] };

    // Validar el paso actual antes de avanzar
    switch (currentStep) {
      case 'personal_info':
        validationResult = await validatePersonalInfo(registrationData);
        break;
      case 'professional_info':
        validationResult = await validateProfessionalInfo(registrationData);
        break;
      case 'specialty_selection':
        validationResult = await validateSpecialtySelection(registrationData);
        break;
      case 'identity_verification':
        validationResult = await validateIdentityVerification(registrationData);
        break;
      case 'dashboard_configuration':
        validationResult = await validateDashboardConfiguration(registrationData);
        break;
    }

    if (!validationResult.isValid) {
      setStepError(currentStep, validationResult.errors.join(', '));
      return;
    }

    // Marcar paso como completado y avanzar
    markStepAsCompleted(currentStep);
    
    const steps: RegistrationStep[] = [
      'personal_info',
      'professional_info', 
      'specialty_selection',
      'identity_verification',
      'dashboard_configuration',
      'final_review'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      setProgress(prev => ({
        ...prev,
        currentStep: nextStepValue,
        completedSteps: [...prev.completedSteps, currentStep]
      }));
    }
  }, [progress.currentStep, registrationData, validatePersonalInfo, validateProfessionalInfo, validateSpecialtySelection, validateIdentityVerification, validateDashboardConfiguration, markStepAsCompleted, setStepError]);

  const prevStep = useCallback(() => {
    const steps: RegistrationStep[] = [
      'personal_info',
      'professional_info', 
      'specialty_selection',
      'identity_verification',
      'dashboard_configuration',
      'final_review'
    ];
    
    const currentIndex = steps.indexOf(progress.currentStep);
    if (currentIndex > 0) {
      const prevStepValue = steps[currentIndex - 1];
      setProgress(prev => ({
        ...prev,
        currentStep: prevStepValue,
        completedSteps: prev.completedSteps.filter(step => step !== prevStepValue)
      }));
    }
  }, [progress.currentStep]);

  // ============================================================================
  // FUNCIÓN DE ENVÍO FINAL
  // ============================================================================

  const handleFinalSubmission = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Validación completa final
      await completeDoctorRegistrationSchema.parseAsync(registrationData);
      
      // Log de seguridad para envío
      logSecurityEvent('doctor_registration_submission_started', {
        email: registrationData.email,
        specialtyId: registrationData.specialtyId,
        timestamp: new Date().toISOString()
      });

      // Registrar médico en Supabase
      const registrationResult = await registerDoctor(registrationData);

      if (!registrationResult.success) {
        throw new Error(registrationResult.error || 'Error durante el registro');
      }

      // Marcar como completado
      setProgress(prev => ({
        ...prev,
        currentStep: 'completed',
        completedSteps: [...prev.completedSteps, 'final_review']
      }));

      // Notificar éxito
      if (registrationResult.needsEmailVerification) {
        toast({
          title: '¡Registro exitoso!',
          description: 'Tu cuenta de médico ha sido creada exitosamente. Verifica tu email para activar tu cuenta.',
        });
        
        // Redirigir a verificación de email
        router.push('/auth/verify-email');
      } else {
        toast({
          title: '¡Registro exitoso!',
          description: 'Tu cuenta de médico ha sido creada y activada exitosamente.',
        });
        
        // Redirigir al dashboard del médico
        router.push('/doctor/dashboard');
      }

      // Callback de éxito
      onRegistrationComplete?.(registrationData);
      
    } catch (error: any) {
      console.error('Error en el registro:', error);
      
      // Log de error
      logSecurityEvent('doctor_registration_failed', {
        error: error.message,
        email: registrationData.email,
        timestamp: new Date().toISOString()
      });

      // Mapear errores comunes
      let errorMessage = error.message;
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.';
      } else if (error.message?.includes('license_number')) {
        errorMessage = 'Este número de cédula profesional ya está registrado.';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Error con el correo electrónico. Verifica que sea válido.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Error con la contraseña. Verifica que cumpla con los requisitos.';
      } else if (!errorMessage) {
        errorMessage = 'Ocurrió un error al procesar tu registro. Inténtalo de nuevo.';
      }

      // Notificar error
      toast({
        title: 'Error en el registro',
        description: errorMessage,
        variant: 'destructive',
      });

      // Callback de error
      onRegistrationError?.(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  }, [registrationData, onRegistrationComplete, onRegistrationError, router, toast]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Auto-validación en tiempo real (solo después de interacción del usuario)
  useEffect(() => {
    const validateCurrentStep = async () => {
      if (isLoading) return;
      
      // Solo validar si el usuario ha empezado a llenar el formulario
      const hasUserInteracted = Object.values(registrationData).some(value => {
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return value > 0;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
        return false;
      });
      
      if (!hasUserInteracted) return;
      
      let validationResult = { isValid: true, errors: [] };
      
      switch (progress.currentStep) {
        case 'personal_info':
          validationResult = await validatePersonalInfo(registrationData);
          break;
        case 'professional_info':
          validationResult = await validateProfessionalInfo(registrationData);
          break;
        case 'specialty_selection':
          validationResult = await validateSpecialtySelection(registrationData);
          break;
        case 'identity_verification':
          validationResult = await validateIdentityVerification(registrationData);
          break;
        case 'dashboard_configuration':
          validationResult = await validateDashboardConfiguration(registrationData);
          break;
      }
      
      if (validationResult.isValid) {
        markStepAsCompleted(progress.currentStep);
      } else {
        setStepError(progress.currentStep, validationResult.errors.join(', '));
      }
    };

    // Debounce para evitar validaciones excesivas
    const timeoutId = setTimeout(validateCurrentStep, 500);
    return () => clearTimeout(timeoutId);
  }, [registrationData, progress.currentStep, isLoading, validatePersonalInfo, validateProfessionalInfo, validateSpecialtySelection, validateIdentityVerification, validateDashboardConfiguration, markStepAsCompleted, setStepError]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  return {
    // Estado
    registrationData,
    progress,
    isLoading,
    isSubmitting,
    
    // Funciones de navegación
    updateRegistrationData,
    nextStep,
    prevStep,
    markStepAsCompleted,
    setStepError,
    
    // Función de envío
    handleFinalSubmission,
    
    // Funciones de validación
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateIdentityVerification,
    validateDashboardConfiguration,
    
    // Manejo de errores mejorado
    formErrors: {
      errors: formErrors.errors,
      warnings: formErrors.warnings,
      hasErrors: formErrors.hasErrors,
      hasWarnings: formErrors.hasWarnings,
      hasCriticalErrors: formErrors.hasCriticalErrors,
      errorSummary: formErrors.errorSummary,
      errorsByField: formErrors.errorsByField,
      getFieldError: formErrors.getFieldError,
      hasFieldError: formErrors.hasFieldError,
      getFieldClassName: formErrors.getFieldClassName,
      getFieldErrorElement: formErrors.getFieldErrorElement,
      clearAllErrors: formErrors.clearAllErrors,
      clearFieldError: formErrors.clearFieldError,
      setFieldError: formErrors.setFieldError,
      validateEmail: formErrors.validateEmail,
      validatePhone: formErrors.validatePhone,
      validatePassword: formErrors.validatePassword,
      validatePasswordMatch: formErrors.validatePasswordMatch,
      validateName: formErrors.validateName
    }
  };
}
