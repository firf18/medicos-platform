/**
 * Hook personalizado para navegación flexible en el registro de médicos - Red-Salud
 * 
 * Este hook maneja la navegación entre pasos del registro permitiendo a los usuarios
 * hacer clic en pasos completados para editarlos.
 */

import { useCallback } from 'react';
import type { RegistrationStep } from '../types/medical/specialties';

interface UseFlexibleNavigationProps {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  onStepChange: (step: RegistrationStep) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface UseFlexibleNavigationReturn {
  canGoToStep: (stepId: RegistrationStep) => boolean;
  goToStep: (stepId: RegistrationStep) => void;
  getStepStatus: (stepId: RegistrationStep) => 'completed' | 'active' | 'pending';
  getStepIndex: (stepId: RegistrationStep) => number;
}

const STEPS: RegistrationStep[] = [
  'personal_info',
  'professional_info',
  'specialty_selection',
  'identity_verification',
  'dashboard_configuration',
  'final_review'
];

export function useFlexibleNavigation({
  currentStep,
  completedSteps,
  onStepChange,
  onNext,
  onPrevious
}: UseFlexibleNavigationProps): UseFlexibleNavigationReturn {
  
  /**
   * Obtiene el índice de un paso
   */
  const getStepIndex = useCallback((stepId: RegistrationStep): number => {
    return STEPS.indexOf(stepId);
  }, []);

  /**
   * Verifica si un paso está completado
   */
  const isStepCompleted = useCallback((stepId: RegistrationStep): boolean => {
    return completedSteps.includes(stepId);
  }, [completedSteps]);

  /**
   * Verifica si un paso está activo
   */
  const isStepActive = useCallback((stepId: RegistrationStep): boolean => {
    return currentStep === stepId;
  }, [currentStep]);

  /**
   * Verifica si se puede navegar a un paso específico
   */
  const canGoToStep = useCallback((stepId: RegistrationStep): boolean => {
    const stepIndex = getStepIndex(stepId);
    const currentStepIndex = getStepIndex(currentStep);
    
    // Se puede ir a:
    // 1. Pasos completados
    // 2. El paso actual
    // 3. El siguiente paso si el actual está completado
    return stepIndex <= currentStepIndex || isStepCompleted(stepId);
  }, [getStepIndex, currentStep, isStepCompleted]);

  /**
   * Navega a un paso específico
   */
  const goToStep = useCallback((stepId: RegistrationStep): void => {
    if (!canGoToStep(stepId)) {
      console.warn(`No se puede navegar al paso: ${stepId}`);
      return;
    }
    
    onStepChange(stepId);
  }, [canGoToStep, onStepChange]);

  /**
   * Obtiene el estado de un paso
   */
  const getStepStatus = useCallback((stepId: RegistrationStep): 'completed' | 'active' | 'pending' => {
    if (isStepActive(stepId)) {
      return 'active';
    }
    
    if (isStepCompleted(stepId)) {
      return 'completed';
    }
    
    return 'pending';
  }, [isStepActive, isStepCompleted]);

  return {
    canGoToStep,
    goToStep,
    getStepStatus,
    getStepIndex
  };
}