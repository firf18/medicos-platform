/**
 * Registration Navigation Hook - Refactored
 * @fileoverview Simplified navigation hook using utility functions
 * @compliance HIPAA-compliant navigation with audit trail
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationStep, DoctorRegistrationData, RegistrationProgress } from '@/types/medical/specialties';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import {
  STEP_ORDER,
  STEP_ROUTES,
  STEP_DISPLAY_NAMES,
  getStepInfo,
  getNextStep,
  getPreviousStep,
  calculateProgressPercentage,
  canProceedNext,
  canGoBack
} from './navigation/registration-navigation.utils';

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

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback(async (step: RegistrationStep) => {
    const stepInfo = getStepInfo(step, currentStep, completedSteps);
    
    if (!stepInfo.canAccess) {
      toast({
        title: 'Acceso denegado',
        description: 'Debe completar los pasos anteriores antes de acceder a este paso.',
        variant: 'destructive'
      });
      return;
    }

    // Validate current step before navigating
    if (currentStep !== step) {
      const validation = await onValidateStep(currentStep, registrationData);
      if (!validation.isValid) {
        toast({
          title: 'Error de validación',
          description: 'Complete la información requerida antes de continuar.',
          variant: 'destructive'
        });
        return;
      }
    }

    // Log navigation event
    logSecurityEvent('data_access', 'registration_step_navigation');

    onStepChange(step);
  }, [currentStep, completedSteps, registrationData, onValidateStep, onStepChange]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(async () => {
    console.log('🚀 goToNextStep llamado:', { currentStep, registrationData });
    
    // Validate current step before proceeding
    const validation = await onValidateStep(currentStep, registrationData);
    console.log('🔍 Validación en goToNextStep:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validación falló en goToNextStep');
      toast({
        title: 'Error de validación',
        description: 'Complete la información requerida antes de continuar.',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ Validación pasada, marcando paso como completado');
    // Mark current step as completed
    onStepComplete(currentStep);

    const nextStep = getNextStep(currentStep);
    console.log('➡️ Siguiente paso:', nextStep);
    
    if (nextStep) {
      console.log('🚀 Navegando al siguiente paso:', nextStep);
      await goToStep(nextStep);
    } else {
      console.log('❌ No hay siguiente paso disponible');
    }
  }, [currentStep, registrationData, onValidateStep, onStepComplete, goToStep]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(async () => {
    const previousStep = getPreviousStep(currentStep);
    if (previousStep) {
      await goToStep(previousStep);
    }
  }, [currentStep, goToStep]);

  /**
   * Handle step completion
   */
  const handleStepComplete = useCallback(async (step: RegistrationStep) => {
    try {
      // Validate step before completing
    const validation = await onValidateStep(step, registrationData);
    if (!validation.isValid) {
      toast({
        title: 'Error de validación',
          description: 'Complete la información requerida antes de continuar.',
        variant: 'destructive'
      });
        return;
    }

      // Log step completion
      logSecurityEvent('data_modification', 'registration_step_completed');

    onStepComplete(step);
    
      // Removed auto-navigation - navigation should only happen when user clicks "Siguiente"

    } catch (error) {
      logger.error('registration', 'Error completing step', { step, error });
    toast({
        title: 'Error',
        description: 'Ocurrió un error al completar el paso.',
        variant: 'destructive'
      });
    }
  }, [registrationData, onValidateStep, onStepComplete, onStepChange]);

  /**
   * Handle step error
   */
  const handleStepError = useCallback((step: RegistrationStep, error: string) => {
    logger.error('registration', 'Step error', { step, error });
    
    logSecurityEvent('system_error', 'registration_step_error');

    toast({
      title: 'Error en el paso',
      description: error,
      variant: 'destructive'
    });
  }, []);

  /**
   * Get step display name
   */
  const getStepDisplayName = useCallback((step: RegistrationStep): string => {
    return STEP_DISPLAY_NAMES[step];
  }, []);

  /**
   * Get all steps info
   */
  const getAllStepsInfo = useCallback(() => {
    return STEP_ORDER.map(step => getStepInfo(step, currentStep, completedSteps));
  }, [currentStep, completedSteps]);

  /**
   * Get progress percentage
   */
  const getProgressPercentage = useCallback((): number => {
    return calculateProgressPercentage(completedSteps);
  }, [completedSteps]);

  /**
   * Check if can proceed to next step with real-time validation
   */
  const canProceedNextWithValidation = useCallback(async (): Promise<boolean> => {
    // For personal_info step, validate all required fields and email verification
    if (currentStep === 'personal_info') {
      const validation = await onValidateStep(currentStep, registrationData);
      
      // Additional check for email verification
      if (validation.isValid) {
        // Check if email is verified (this would be stored in registrationData or a separate state)
        // For now, we'll assume the validation includes email verification
        return true;
      }
      
      return false;
    }
    
    // For other steps, use the standard logic
    return canProceedNext(currentStep, completedSteps);
  }, [currentStep, completedSteps, registrationData, onValidateStep]);

  return {
    // Navigation functions
    goToStep,
    goToNextStep,
    goToPreviousStep,
    handleStepComplete,
    handleStepError,
    
    // Utility functions
    getStepInfo: (step: RegistrationStep) => getStepInfo(step, currentStep, completedSteps),
    getStepDisplayName,
    getAllStepsInfo,
    getProgressPercentage,
    
    // Computed values
    canProceedNext: canProceedNext(currentStep, completedSteps), // Keep for backward compatibility
    canProceedNextWithValidation, // New async version
    canGoBack: canGoBack(currentStep),
    
    // Constants
    stepOrder: STEP_ORDER,
    stepRoutes: STEP_ROUTES,
    currentStepInfo: getStepInfo(currentStep, currentStep, completedSteps),
    progressPercentage: getProgressPercentage()
  };
};