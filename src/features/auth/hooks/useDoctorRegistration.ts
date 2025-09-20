/**
 * Hook Refactorizado para Registro de Médicos - Red-Salud
 * 
 * Hook principal que coordina los servicios modulares para el registro médico.
 * Siguiendo el principio de responsabilidad única, este hook solo maneja:
 * - Gestión de estado React
 * - Coordinación entre servicios
 * - Interfaz para componentes
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Servicios modulares
import { DoctorRegistrationValidationService } from '../services/doctor-registration-validation';
import { DoctorRegistrationApiService } from '../services/doctor-registration-api';
import { DoctorRegistrationLogger } from '../utils/doctor-registration-logger';

// Tipos
import {
  DoctorRegistrationData,
  RegistrationStep,
  RegistrationProgress,
  UseDoctorRegistrationProps,
  UseDoctorRegistrationReturn,
  ValidationResult,
  LogContext
} from '../types/doctor-registration';

// Hooks existentes
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import { useRegistrationPersistence } from '@/hooks/useRegistrationPersistence';

// Configuración inicial
const INITIAL_REGISTRATION_DATA: DoctorRegistrationData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  licenseNumber: '',
  licenseState: '',
  licenseExpiry: '',
  specialtyId: '',
  subSpecialties: [],
  yearsOfExperience: 0,
  currentHospital: '',
  clinicAffiliations: [],
  bio: '',
  selectedFeatures: [],
  workingHours: {},
  identityVerification: {
    verificationId: '',
    status: 'pending',
    documents: []
  },
  licenseDocument: null,
  registrationCompletedAt: '',
  termsAcceptedAt: '',
  privacyAcceptedAt: '',
  complianceAcceptedAt: ''
};

const INITIAL_PROGRESS: RegistrationProgress = {
  canProceed: false,
  errors: {}
};

export function useDoctorRegistration({
  onRegistrationComplete,
  onRegistrationError,
  autoSave = true,
  persistenceOptions = {}
}: UseDoctorRegistrationProps = {}): UseDoctorRegistrationReturn {
  const router = useRouter();
  
  // Estado principal
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData>(INITIAL_REGISTRATION_DATA);
  const [progress, setProgress] = useState<RegistrationProgress>(INITIAL_PROGRESS);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal_info');
  
  // Hooks auxiliares
  const formErrors = useDoctorRegistrationErrors();
  const { saveProgress, loadProgress, clearProgress, autoSaveProgress } = useRegistrationPersistence();
  
  // Referencias
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const logContextRef = useRef<LogContext>({});

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const updateLogContext = useCallback(() => {
    logContextRef.current = DoctorRegistrationLogger.createContext(
      registrationData,
      sessionIdRef.current,
      undefined,
      currentStep
    );
  }, [registrationData, currentStep]);

  // ============================================================================
  // GESTIÓN DE ESTADO
  // ============================================================================

  const updateRegistrationData = useCallback((newData: Partial<DoctorRegistrationData>) => {
    setRegistrationData(prev => {
      const hasChanges = Object.keys(newData).some(key => {
        const newValue = newData[key as keyof DoctorRegistrationData];
        const prevValue = prev[key as keyof DoctorRegistrationData];
        return JSON.stringify(newValue) !== JSON.stringify(prevValue);
      });

      if (!hasChanges) return prev;

      const updatedData = { ...prev, ...newData };

      // Auto-guardar si está habilitado
      if (autoSave) {
        autoSaveProgress(updatedData, progress);
      }

      // Log de actualización
      DoctorRegistrationLogger.logDataUpdate(
        Object.keys(newData),
        logContextRef.current
      );

      return updatedData;
    });
  }, [progress, autoSave, autoSaveProgress]);

  const markStepAsCompleted = useCallback((step: RegistrationStep) => {
    setProgress(prev => {
      const isAlreadyCompleted = prev.canProceed && !prev.errors[step];
      if (isAlreadyCompleted) return prev;

      const updatedProgress = {
        ...prev,
        canProceed: true,
        errors: { ...prev.errors, [step]: '' }
      };

      // Auto-guardar progreso
      if (autoSave) {
        autoSaveProgress(registrationData, updatedProgress);
      }

      // Log de paso completado
      DoctorRegistrationLogger.logStepCompleted(step, logContextRef.current);

      return updatedProgress;
    });
  }, [registrationData, autoSave, autoSaveProgress]);

  const setStepError = useCallback((step: RegistrationStep, error: string) => {
    setProgress(prev => {
      const currentError = prev.errors[step] || '';
      if (currentError === error && !prev.canProceed) return prev;

      const updatedProgress = {
        ...prev,
        canProceed: false,
        errors: { ...prev.errors, [step]: error }
      };

      // Log de error
      DoctorRegistrationLogger.logStepError(step, error, logContextRef.current);

      return updatedProgress;
    });
  }, []);

  const navigateToStep = useCallback((step: RegistrationStep) => {
    const fromStep = currentStep;
    setCurrentStep(step);
    
    // Log de navegación
    DoctorRegistrationLogger.logStepNavigation(fromStep, step, logContextRef.current);
  }, [currentStep]);

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================

  const validateStep = useCallback(async (step: RegistrationStep): Promise<ValidationResult> => {
    setIsLoading(true);
    
    try {
      const result = await DoctorRegistrationValidationService.validateStep(step, registrationData);
      
      if (result.isValid) {
        DoctorRegistrationLogger.logValidationSuccess(step, logContextRef.current);
        formErrors.clearError(step);
      } else {
        DoctorRegistrationLogger.logValidationFailure(step, result.errors, logContextRef.current);
        formErrors.setError(step, result.errors.join(', '));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de validación';
      DoctorRegistrationLogger.logValidationFailure(step, [errorMessage], logContextRef.current);
      formErrors.setError(step, errorMessage);
      
      return {
        isValid: false,
        errors: [errorMessage]
      };
    } finally {
      setIsLoading(false);
    }
  }, [registrationData, formErrors]);

  const validateAllSteps = useCallback(async (): Promise<ValidationResult> => {
    const allErrors: string[] = [];
    
    const steps: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'license_verification',
      'identity_verification',
      'dashboard_configuration'
    ];

    for (const step of steps) {
      const result = await validateStep(step);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }, [validateStep]);

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    const response = await DoctorRegistrationApiService.checkEmailAvailability(email);
    return response.success && response.data?.available === true;
  }, []);

  const verifyMedicalLicense = useCallback(async (licenseData: any) => {
    const response = await DoctorRegistrationApiService.verifyMedicalLicense(licenseData);
    return response.data;
  }, []);

  const initiateIdentityVerification = useCallback(async () => {
    const userData = {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone
    };
    
    const response = await DoctorRegistrationApiService.initiateIdentityVerification(userData);
    return response.data;
  }, [registrationData]);

  // ============================================================================
  // FUNCIONES DE PERSISTENCIA
  // ============================================================================

  const handleSaveProgress = useCallback(() => {
    saveProgress(registrationData, progress);
    DoctorRegistrationLogger.logProgressSaved(logContextRef.current);
  }, [registrationData, progress, saveProgress]);

  const handleLoadProgress = useCallback(() => {
    const savedData = loadProgress();
    if (savedData) {
      setRegistrationData(savedData.data);
      setProgress(savedData.progress);
      DoctorRegistrationLogger.logProgressLoaded(logContextRef.current);
    }
  }, [loadProgress]);

  const handleClearProgress = useCallback(() => {
    clearProgress();
    setRegistrationData(INITIAL_REGISTRATION_DATA);
    setProgress(INITIAL_PROGRESS);
    DoctorRegistrationLogger.logProgressCleared('manual', logContextRef.current);
  }, [clearProgress]);

  // ============================================================================
  // FUNCIÓN DE FINALIZACIÓN
  // ============================================================================

  const submitRegistration = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Validar registro completo
      const validationResult = await DoctorRegistrationValidationService.validateCompleteRegistration(registrationData);
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Finalizar registro
      const response = await DoctorRegistrationApiService.finalizeRegistration(registrationData);
      
      if (!response.success) {
        throw new Error(response.error || 'Error al finalizar el registro');
      }

      // Log de éxito
      DoctorRegistrationLogger.logRegistrationCompleted({
        ...logContextRef.current,
        userId: response.data?.userId
      });

      // Limpiar progreso guardado
      clearProgress();

      // Notificar éxito
      toast({
        title: 'Registro completado',
        description: 'Tu registro ha sido enviado exitosamente.',
      });

      // Callback de éxito
      if (onRegistrationComplete) {
        onRegistrationComplete(registrationData);
      }

      // Redirigir según sea necesario
      if (response.data?.needsEmailVerification) {
        router.push('/auth/verify-email');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Log de error
      DoctorRegistrationLogger.logRegistrationFailed(errorMessage, logContextRef.current);

      // Notificar error
      toast({
        title: 'Error en el registro',
        description: errorMessage,
        variant: 'destructive',
      });

      // Callback de error
      if (onRegistrationError) {
        onRegistrationError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [registrationData, clearProgress, onRegistrationComplete, onRegistrationError, router]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Actualizar contexto de logging cuando cambian los datos
  useEffect(() => {
    updateLogContext();
  }, [updateLogContext]);

  // Cargar progreso guardado al inicializar
  useEffect(() => {
    handleLoadProgress();
    DoctorRegistrationLogger.logRegistrationStarted(logContextRef.current);
  }, [handleLoadProgress]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (autoSave) {
        handleSaveProgress();
      }
    };
  }, [autoSave, handleSaveProgress]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  return {
    // Estado
    registrationData,
    progress,
    isLoading,
    currentStep,
    
    // Acciones
    updateRegistrationData,
    markStepAsCompleted,
    setStepError,
    navigateToStep,
    
    // Validación
    validateStep,
    validateAllSteps,
    
    // API
    checkEmailAvailability,
    verifyMedicalLicense,
    initiateIdentityVerification,
    
    // Persistencia
    saveProgress: handleSaveProgress,
    loadProgress: handleLoadProgress,
    clearProgress: handleClearProgress,
    
    // Finalización
    submitRegistration,
    
    // Estado de errores
    formErrors
  };
}