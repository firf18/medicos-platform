/**
 * Registration Navigation Hook
 * @fileoverview Navigation flow management for doctor registration process
 * @compliance HIPAA-compliant navigation with audit trail
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationStep, DoctorRegistrationData, RegistrationProgress } from '@/types/medical/specialties';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/doctor-registration';

interface UseRegistrationNavigationProps {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  registrationData: DoctorRegistrationData;
  onStepChange: (step: RegistrationStep) => void;
  onStepComplete: (step: RegistrationStep) => void;
  onValidateStep: (step: RegistrationStep, data: Partial<DoctorRegistrationData>) => Promise<{ isValid: boolean; errors?: string[] }>;
}

export const useRegistrationNavigation = ({
  currentStep,
  completedSteps,
  registrationData,
  onStepChange,
  onStepComplete,
  onValidateStep
}: UseRegistrationNavigationProps) => {
  const router = useRouter();

  // Step order configuration
  const stepOrder: RegistrationStep[] = [
    'personal_info',
    'professional_info',
    'specialty_selection',
    'license_verification',
    'identity_verification',
    'dashboard_configuration'
  ];

  // Step routes mapping
  const stepRoutes: Record<RegistrationStep, string> = {
    personal_info: '/auth/register/doctor',
    professional_info: '/auth/register/doctor?step=professional',
    specialty_selection: '/auth/register/doctor?step=specialty',
    license_verification: '/auth/register/doctor?step=license',
    identity_verification: '/auth/register/doctor?step=identity',
    dashboard_configuration: '/auth/register/doctor?step=dashboard'
  };

  /**
   * Get step information
   */
  const getStepInfo = useCallback((step: RegistrationStep) => {
    const index = stepOrder.indexOf(step);
    const isCompleted = completedSteps.includes(step);
    const isCurrent = currentStep === step;
    const canAccess = index === 0 || completedSteps.includes(stepOrder[index - 1]);
    
    return {
      index: index + 1,
      total: stepOrder.length,
      isCompleted,
      isCurrent,
      canAccess,
      route: stepRoutes[step]
    };
  }, [currentStep, completedSteps, stepOrder, stepRoutes]);

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback(async (targetStep: RegistrationStep, skipValidation = false) => {
    const stepInfo = getStepInfo(targetStep);
    
    // Check if step is accessible
    if (!stepInfo.canAccess) {
      toast({
        title: 'Paso no disponible',
        description: 'Complete los pasos anteriores para continuar',
        variant: 'destructive'
      });
      return false;
    }

    // Validate current step before navigation (unless skipping)
    if (!skipValidation && currentStep !== targetStep) {
      const validation = await onValidateStep(currentStep, registrationData);
      
      if (!validation.isValid) {
        toast({
          title: 'Validación requerida',
          description: 'Complete correctamente el paso actual antes de continuar',
          variant: 'destructive'
        });
        return false;
      }
      
      // Mark current step as completed
      onStepComplete(currentStep);
    }

    // Navigate to target step
    onStepChange(targetStep);
    
    // Update URL
    router.push(stepInfo.route);
    
    // Log navigation
    logSecurityEvent('registration_navigation', {
      fromStep: currentStep,
      toStep: targetStep,
      skipValidation
    });

    logger.info('registration', 'Navigated to step', {
      fromStep: currentStep,
      toStep: targetStep,
      stepIndex: stepInfo.index
    });

    return true;
  }, [currentStep, registrationData, onValidateStep, onStepComplete, onStepChange, router, getStepInfo]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(async () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[currentIndex + 1];
    
    if (!nextStep) {
      // Registration complete, redirect to success page
      router.push('/auth/register/doctor/success');
      return true;
    }

    return goToStep(nextStep);
  }, [currentStep, stepOrder, router, goToStep]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(async () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    const previousStep = stepOrder[currentIndex - 1];
    
    if (!previousStep) {
      return false; // Already at first step
    }

    return goToStep(previousStep, true); // Skip validation when going back
  }, [currentStep, stepOrder, goToStep]);

  /**
   * Handle step completion
   */
  const handleStepComplete = useCallback(async (step: RegistrationStep) => {
    // Validate step data
    const validation = await onValidateStep(step, registrationData);
    
    if (!validation.isValid) {
      toast({
        title: 'Error de validación',
        description: validation.errors?.[0] || 'Por favor corrija los errores antes de continuar',
        variant: 'destructive'
      });
      return false;
    }

    // Mark step as completed
    onStepComplete(step);
    
    // Show success message
    toast({
      title: 'Paso completado',
      description: `${getStepDisplayName(step)} completado exitosamente`,
      variant: 'default'
    });

    // Log completion
    logSecurityEvent('registration_step_completed', {
      step,
      completedSteps: [...completedSteps, step].length,
      totalSteps: stepOrder.length
    });

    return true;
  }, [onValidateStep, registrationData, onStepComplete, completedSteps, stepOrder]);

  /**
   * Handle step error
   */
  const handleStepError = useCallback((step: RegistrationStep, error: string) => {
    toast({
      title: 'Error en el paso',
      description: error,
      variant: 'destructive'
    });

    logger.error('registration', 'Step validation error', {
      step,
      error,
      timestamp: new Date().toISOString()
    });

    logSecurityEvent('registration_step_error', {
      step,
      error,
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * Get step display name
   */
  const getStepDisplayName = useCallback((step: RegistrationStep): string => {
    const displayNames: Record<RegistrationStep, string> = {
      personal_info: 'Información Personal',
      professional_info: 'Información Profesional',
      specialty_selection: 'Selección de Especialidad',
      license_verification: 'Verificación de Licencia',
      identity_verification: 'Verificación de Identidad',
      dashboard_configuration: 'Configuración del Dashboard'
    };
    
    return displayNames[step] || step;
  }, []);

  /**
   * Get progress percentage
   */
  const getProgressPercentage = useCallback((): number => {
    return Math.round((completedSteps.length / stepOrder.length) * 100);
  }, [completedSteps, stepOrder]);

  /**
   * Check if can proceed to next step
   */
  const canProceedNext = useCallback((): boolean => {
    return completedSteps.includes(currentStep);
  }, [currentStep, completedSteps]);

  /**
   * Check if can go back
   */
  const canGoBack = useCallback((): boolean => {
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex > 0;
  }, [currentStep, stepOrder]);

  /**
   * Get all step information
   */
  const getAllStepsInfo = useCallback(() => {
    return stepOrder.map(step => ({
      step,
      ...getStepInfo(step),
      displayName: getStepDisplayName(step)
    }));
  }, [stepOrder, getStepInfo, getStepDisplayName]);

  return {
    // Navigation actions
    goToStep,
    goToNextStep,
    goToPreviousStep,
    handleStepComplete,
    handleStepError,
    
    // Step information
    getStepInfo,
    getStepDisplayName,
    getAllStepsInfo,
    
    // Progress information
    getProgressPercentage,
    canProceedNext,
    canGoBack,
    
    // Step configuration
    stepOrder,
    stepRoutes,
    
    // Current state
    currentStepInfo: getStepInfo(currentStep),
    progressPercentage: getProgressPercentage()
  };
};
