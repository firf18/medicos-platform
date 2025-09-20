/**
 * Hook personalizado para el registro de médicos - Red-Salud
 * 
 * Este hook maneja todo el estado y lógica del registro de médicos,
 * incluyendo validaciones, seguridad y compliance médico.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
  licenseVerificationSchema, // Nuevo schema
  identityVerificationSchema,
  dashboardConfigurationSchema,
  completeDoctorRegistrationSchema,
  logSecurityEvent,
  validateDataSensitivity,
  sanitizeInput,
  validatePasswordStrength,
  validateDocumentFormat // Nueva función
} from '@/lib/validations/doctor-registration';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { useRegistrationPersistence } from '@/hooks/useRegistrationPersistence';
import { logger } from '@/lib/logging/logger';
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
  
  // Hook de persistencia de registro
  const registrationPersistence = useRegistrationPersistence();
  
  // Refs para el autoguardado
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<DoctorRegistrationData | null>(null);
  const lastSavedProgressRef = useRef<RegistrationProgress | null>(null);
  
  // Registrar inicio del proceso de registro
  useEffect(() => {
    logger.info('registration', 'Doctor registration process started', {
      timestamp: new Date().toISOString()
    });
  }, []);
  
  // Estado del formulario de registro
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData>(() => {
    // Intentar cargar datos guardados
    const { data } = registrationPersistence.loadProgress();
    return data || {
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
      bio: '',
      // Información académica y profesional
      university: '',
      graduationYear: undefined,
      medicalBoard: '',
      // Verificación de documento
      documentType: undefined,
      documentNumber: '',
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
    };
  });

  // Estado del progreso de registro
  const [progress, setProgress] = useState<RegistrationProgress>(() => {
    // Intentar cargar progreso guardado
    const { progress: savedProgress } = registrationPersistence.loadProgress();
    return savedProgress || {
      currentStep: 'personal_info',
      completedSteps: [],
      totalSteps: 6, // Actualizado a 6 pasos
      canProceed: false,
      errors: {}
    };
  });

  // Estado de carga
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para guardar automáticamente el progreso
  const autoSaveProgress = useCallback((data: DoctorRegistrationData, progress: RegistrationProgress) => {
    // Cancelar el guardado anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Guardar después de 1 segundo de inactividad
    saveTimeoutRef.current = setTimeout(() => {
      // Solo guardar si los datos han cambiado
      const dataChanged = JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);
      const progressChanged = JSON.stringify(progress) !== JSON.stringify(lastSavedProgressRef.current);
      
      if (dataChanged || progressChanged) {
        registrationPersistence.saveProgress(data, progress);
        lastSavedDataRef.current = { ...data };
        lastSavedProgressRef.current = { ...progress };
        
        logger.info('registration', 'Progress auto-saved', {
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);
  }, [registrationPersistence]);

  // Limpiar el timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN POR PASO
  // ============================================================================

  const validatePersonalInfo = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      logger.debug('registration', 'Validating personal info', {
        fields: Object.keys(data).filter(key => data[key as keyof typeof data])
      });
      
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

      logger.info('registration', 'Personal info validation successful', {
        email: personalData.email
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('personal_info_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      logger.warn('registration', 'Personal info validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fields: Object.keys(data)
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formErrors.setFieldError('general', errorMessage);
      return { 
        isValid: false, 
        errors: [errorMessage] 
      };
    }
  }, [formErrors]);

  const validateProfessionalInfo = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      logger.debug('registration', 'Validating professional info', {
        fields: Object.keys(data).filter(key => data[key as keyof typeof data])
      });
      
      const professionalData = {
        licenseNumber: data.licenseNumber || '',
        licenseState: data.licenseState || '',
        licenseExpiry: data.licenseExpiry || '',
        yearsOfExperience: data.yearsOfExperience || 0,
        bio: data.bio || ''
      };

      // Sanitizar inputs
      const sanitizedData: Record<string, string | number | string[]> = {};
      Object.keys(professionalData).forEach(key => {
        const value = professionalData[key as keyof typeof professionalData];
        if (typeof value === 'string') {
          sanitizedData[key] = sanitizeInput(value);
        } else {
          sanitizedData[key] = value;
        }
      });
      // Aplicar datos sanitizados
      Object.assign(professionalData, sanitizedData);

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

      logger.info('registration', 'Professional info validation successful', {
        licenseNumber: professionalData.licenseNumber
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('professional_info_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      logger.warn('registration', 'Professional info validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fields: Object.keys(data)
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formErrors.setFieldError('general', errorMessage);
      return { 
        isValid: false, 
        errors: [errorMessage] 
      };
    }
  }, [formErrors]);

  const validateSpecialtySelection = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      logger.debug('registration', 'Validating specialty selection', {
        fields: Object.keys(data).filter(key => data[key as keyof typeof data])
      });
      
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

      logger.info('registration', 'Specialty selection validation successful', {
        specialtyId: specialtyData.specialtyId
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('specialty_selection_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      logger.warn('registration', 'Specialty selection validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fields: Object.keys(data)
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { 
        isValid: false, 
        errors: [errorMessage] 
      };
    }
  }, []);

  const validateLicenseVerification = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      logger.debug('registration', 'Validating license verification', {
        documentType: data.documentType,
        documentNumber: data.documentNumber
      });
      
      const licenseData = {
        documentType: data.documentType || '',
        documentNumber: data.documentNumber || ''
      };

      // Validar con Zod
      await licenseVerificationSchema.parseAsync(licenseData);

      // Validar formato específico del documento
      if (licenseData.documentType && licenseData.documentNumber) {
        const isFormatValid = validateDocumentFormat(licenseData.documentType, licenseData.documentNumber);
        if (!isFormatValid) {
          const formatError = getDocumentFormatError(licenseData.documentType);
          formErrors.setFieldError('documentNumber', formatError);
          return { isValid: false, errors: [formatError] };
        }
      }

      // Limpiar errores si la validación es exitosa
      formErrors.clearAllErrors();

      // Log de seguridad
      logSecurityEvent('license_verification_validated', {
        documentType: licenseData.documentType,
        documentNumber: licenseData.documentNumber,
        timestamp: new Date().toISOString()
      });

      logger.info('registration', 'License verification validation successful', {
        documentType: licenseData.documentType,
        documentNumber: licenseData.documentNumber
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('license_verification_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      logger.warn('registration', 'License verification validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentType: data.documentType,
        documentNumber: data.documentNumber
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formErrors.setFieldError('general', errorMessage);
      return { 
        isValid: false, 
        errors: [errorMessage] 
      };
    }
  }, [formErrors]);

  const validateIdentityVerification = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      logger.debug('registration', 'Validating identity verification', {
        hasIdentityVerification: !!data.identityVerification
      });
      
      if (!data.identityVerification) {
        throw new Error('La verificación de identidad es requerida');
      }

      // Validar que la verificación esté completada
      if (data.identityVerification.status !== 'verified') {
        throw new Error('La verificación de identidad debe estar completada');
      }

      // Validar que tenga un ID de verificación válido
      if (!data.identityVerification.verificationId) {
        throw new Error('ID de verificación de identidad es requerido');
      }

      // Validar formato UUID del ID de verificación
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.identityVerification.verificationId)) {
        throw new Error('ID de verificación de identidad inválido');
      }

      // Validar que tenga resultados de verificación
      if (!data.identityVerification.verificationResults) {
        throw new Error('Resultados de verificación son requeridos');
      }

      // Validar resultados de verificación
      if (!data.identityVerification.verificationResults.documentValid) {
        throw new Error('El documento debe ser válido');
      }

      if (!data.identityVerification.verificationResults.faceMatch) {
        throw new Error('La verificación facial debe ser exitosa');
      }

      if (!data.identityVerification.verificationResults.livenessCheck) {
        throw new Error('La verificación de vida debe ser exitosa');
      }

      if (!data.identityVerification.verificationResults.amlScreening) {
        throw new Error('El screening AML debe ser exitoso');
      }

      // Validar con Zod
      await identityVerificationSchema.parseAsync({ identityVerification: data.identityVerification });

      // Log de seguridad
      logSecurityEvent('identity_verification_validated', {
        verificationId: data.identityVerification.verificationId,
        status: data.identityVerification.status,
        timestamp: new Date().toISOString()
      });

      logger.info('registration', 'Identity verification validation successful', {
        verificationId: data.identityVerification.verificationId
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('identity_verification_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        verificationId: data.identityVerification?.verificationId,
        timestamp: new Date().toISOString()
      });
      
      logger.warn('registration', 'Identity verification validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        verificationId: data.identityVerification?.verificationId
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { 
        isValid: false, 
        errors: [errorMessage] 
      };
    }
  }, []);

  const validateDashboardConfiguration = useCallback(async (data: Partial<DoctorRegistrationData>) => {
    try {
      logger.debug('registration', 'Validating dashboard configuration', {
        hasSelectedFeatures: !!data.selectedFeatures,
        hasWorkingHours: !!data.workingHours
      });
      
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

      logger.info('registration', 'Dashboard configuration validation successful', {
        selectedFeaturesCount: dashboardData.selectedFeatures.length
      });

      return { isValid: true, errors: [] };
    } catch (error: unknown) {
      logSecurityEvent('dashboard_configuration_validation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      logger.warn('registration', 'Dashboard configuration validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { 
        isValid: false, 
        errors: [errorMessage] 
      };
    }
  }, [registrationData.workingHours]);

  // ============================================================================
  // FUNCIONES DE NAVEGACIÓN
  // ============================================================================

  const updateRegistrationData = useCallback((newData: Partial<DoctorRegistrationData>) => {
    setRegistrationData(prev => {
      const updatedData = { ...prev, ...newData };
      
      // Guardar progreso automáticamente
      autoSaveProgress(updatedData, progress);
      
      // Loggear cambios en el registro
      logger.debug('registration', 'Registration data updated', {
        fields: Object.keys(newData),
        timestamp: new Date().toISOString()
      });
      
      return updatedData;
    });
  }, [progress, autoSaveProgress]);

  const markStepAsCompleted = useCallback((step: RegistrationStep) => {
    setProgress(prev => {
      const updatedProgress = {
        ...prev,
        canProceed: true,
        errors: { ...prev.errors, [step]: '' }
      };
      
      // Guardar progreso automáticamente
      autoSaveProgress(registrationData, updatedProgress);
      
      return updatedProgress;
    });
  }, [registrationData, autoSaveProgress]);

  const setStepError = useCallback((step: RegistrationStep, error: string) => {
    setProgress(prev => {
      const updatedProgress = {
        ...prev,
        canProceed: false,
        errors: { ...prev.errors, [step]: error }
      };
      
      // Guardar progreso automáticamente
      autoSaveProgress(registrationData, updatedProgress);
      
      return updatedProgress;
    });
  }, [registrationData, autoSaveProgress]);

  const nextStep = useCallback(async () => {
    const currentStep = progress.currentStep;
    let validationResult = { isValid: true, errors: [] };

    logger.info('registration', 'Attempting to move to next step', {
      currentStep,
      timestamp: new Date().toISOString()
    });

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
      case 'license_verification': // Nuevo caso
        validationResult = await validateLicenseVerification(registrationData);
        break;
      case 'identity_verification':
        validationResult = await validateIdentityVerification(registrationData);
        break;
      case 'dashboard_configuration':
        validationResult = await validateDashboardConfiguration(registrationData);
        break;
    }

    if (!validationResult.isValid) {
      logger.warn('registration', 'Step validation failed', {
        step: currentStep,
        errors: validationResult.errors
      });
      
      setStepError(currentStep, validationResult.errors.join(', '));
      return;
    }

    // Marcar paso como completado y avanzar
    markStepAsCompleted(currentStep);
    
    const steps: RegistrationStep[] = [
      'personal_info',
      'professional_info', 
      'specialty_selection',
      'license_verification', // Nuevo paso
      'identity_verification',
      'dashboard_configuration',
      'final_review'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      
      logger.info('registration', 'Moving to next step', {
        from: currentStep,
        to: nextStepValue,
        timestamp: new Date().toISOString()
      });
      
      setProgress(prev => {
        const updatedProgress = {
          ...prev,
          currentStep: nextStepValue,
          completedSteps: [...prev.completedSteps, currentStep]
        };
        
        // Guardar progreso automáticamente
        autoSaveProgress(registrationData, updatedProgress);
        
        return updatedProgress;
      });
    }
  }, [progress.currentStep, registrationData, validatePersonalInfo, validateProfessionalInfo, validateSpecialtySelection, validateLicenseVerification, validateIdentityVerification, validateDashboardConfiguration, markStepAsCompleted, setStepError, autoSaveProgress]);

  const prevStep = useCallback(() => {
    const steps: RegistrationStep[] = [
      'personal_info',
      'professional_info', 
      'specialty_selection',
      'license_verification', // Nuevo paso
      'identity_verification',
      'dashboard_configuration',
      'final_review'
    ];
    
    const currentIndex = steps.indexOf(progress.currentStep);
    if (currentIndex > 0) {
      const prevStepValue = steps[currentIndex - 1];
      
      logger.info('registration', 'Moving to previous step', {
        from: progress.currentStep,
        to: prevStepValue,
        timestamp: new Date().toISOString()
      });
      
      setProgress(prev => {
        const updatedProgress = {
          ...prev,
          currentStep: prevStepValue,
          completedSteps: prev.completedSteps.filter(step => step !== prevStepValue)
        };
        
        // Guardar progreso automáticamente
        autoSaveProgress(registrationData, updatedProgress);
        
        return updatedProgress;
      });
    }
  }, [progress.currentStep, registrationData, autoSaveProgress]);

  // ============================================================================
  // FUNCIÓN DE ENVÍO FINAL
  // ============================================================================

  const handleFinalSubmission = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Validación completa final
      await completeDoctorRegistrationSchema.parseAsync(registrationData);

      // Requiere verificación aprobada antes de finalizar
      if (registrationData.identityVerification?.status !== 'verified') {
        throw new Error('La verificación de identidad debe estar aprobada antes de finalizar.');
      }

      // Log de seguridad para envío
      logSecurityEvent('doctor_registration_finalize_started', {
        email: registrationData.email,
        specialtyId: registrationData.specialtyId,
        timestamp: new Date().toISOString()
      });

      // Llamar al endpoint de finalización (server-side, service-role)
      const res = await fetch('/api/auth/register/doctor/finalize', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Debes iniciar sesión para finalizar el registro.');
        }
        if (res.status === 409) {
          throw new Error('La verificación de identidad no está aprobada aún.');
        }
        throw new Error(err.error || 'No se pudo finalizar el registro');
      }

      // Limpiar progreso guardado
      registrationPersistence.clearProgress();

      // Marcar como completado
      setProgress(prev => {
        const updatedProgress = {
          ...prev,
          currentStep: 'completed' as RegistrationStep,
          completedSteps: [...prev.completedSteps, 'final_review' as RegistrationStep]
        };
        autoSaveProgress(registrationData, updatedProgress);
        return updatedProgress;
      });

      toast({
        title: '¡Registro completado!',
        description: 'Tu perfil de médico ha sido activado correctamente.'
      });

      // Redirigir a página de éxito o dashboard
      router.push('/auth/register/doctor/success');

      // Callback de éxito
      onRegistrationComplete?.(registrationData);
    } catch (error: unknown) {
      console.error('Error al finalizar registro:', error);
      logSecurityEvent('doctor_registration_finalize_failed', {
        error: error instanceof Error ? error.message : String(error) || 'Error desconocido',
        email: registrationData.email,
        timestamp: new Date().toISOString()
      });

      toast({
        title: 'Error en la finalización',
        description: error instanceof Error ? error.message : 'Ocurrió un error al finalizar tu registro.',
        variant: 'destructive'
      });

      onRegistrationError?.(error instanceof Error ? error.message : 'Error al finalizar');
    } finally {
      setIsSubmitting(false);
    }
  }, [registrationData, onRegistrationComplete, onRegistrationError, router, registrationPersistence, autoSaveProgress]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Auto-validación en tiempo real (solo para limpiar errores, no para marcarlos)
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
        case 'license_verification': // Nuevo caso
          validationResult = await validateLicenseVerification(registrationData);
          break;
        case 'identity_verification':
          validationResult = await validateIdentityVerification(registrationData);
          break;
        case 'dashboard_configuration':
          validationResult = await validateDashboardConfiguration(registrationData);
          break;
      }
      
      // Solo marcar como completado si es válido, pero NO marcar como error automáticamente
      // Los errores solo se marcan cuando el usuario intenta avanzar al siguiente paso
      if (validationResult.isValid) {
        markStepAsCompleted(progress.currentStep);
      }
      // Removido: setStepError automático para evitar mostrar rojo prematuramente
    };

    // Debounce para evitar validaciones excesivas
    const timeoutId = setTimeout(validateCurrentStep, 500);
    return () => clearTimeout(timeoutId);
  }, [registrationData, progress.currentStep, isLoading, validatePersonalInfo, validateProfessionalInfo, validateSpecialtySelection, validateLicenseVerification, validateIdentityVerification, validateDashboardConfiguration, markStepAsCompleted]);

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  // Obtener mensaje de error de formato según tipo de documento
  const getDocumentFormatError = (type: string): string => {
    switch (type) {
      case 'cedula_identidad':
        return 'Formato inválido. Debe ser V-XXXXXXXX o E-XXXXXXXX';
      case 'pasaporte':
        return 'Formato inválido. Debe ser P-XXXXXXXX';
      case 'matricula':
        return 'Formato inválido. Debe ser MPPS-XXXXX, CMC-XXXXX u otros colegios médicos reconocidos';
      default:
        return 'Formato de documento inválido';
    }
  };

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
    validateLicenseVerification, // Nueva función
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