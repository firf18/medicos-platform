/**
 * Registration Navigation Utilities
 * @fileoverview Utility functions for registration navigation
 * @compliance HIPAA-compliant navigation utilities
 */

import { RegistrationStep } from '@/types/medical/specialties';

// Step order configuration
export const STEP_ORDER: RegistrationStep[] = [
  'personal_info',
  'professional_info',
  'specialty_selection',
  'license_verification',
  'identity_verification',
  'dashboard_configuration',
  'final_review',
  'completed'
];

// Step routes mapping
export const STEP_ROUTES: Record<RegistrationStep, string> = {
  personal_info: '/auth/register/doctor',
  professional_info: '/auth/register/doctor?step=professional',
  specialty_selection: '/auth/register/doctor?step=specialty',
  license_verification: '/auth/register/doctor?step=license',
  identity_verification: '/auth/register/doctor?step=identity',
  dashboard_configuration: '/auth/register/doctor?step=dashboard',
  final_review: '/auth/register/doctor?step=review',
  completed: '/auth/register/doctor/success'
};

// Step display names
export const STEP_DISPLAY_NAMES: Record<RegistrationStep, string> = {
  personal_info: 'Información Personal',
  professional_info: 'Información Profesional',
  specialty_selection: 'Selección de Especialidad',
  license_verification: 'Verificación de Licencia',
  identity_verification: 'Verificación de Identidad',
  dashboard_configuration: 'Configuración del Dashboard',
  final_review: 'Revisión Final',
  completed: 'Completado'
};

/**
 * Get step information
 */
export const getStepInfo = (
  step: RegistrationStep,
  currentStep: RegistrationStep,
  completedSteps: RegistrationStep[]
) => {
  const index = STEP_ORDER.indexOf(step);
  const isCompleted = completedSteps.includes(step);
  const isCurrent = currentStep === step;
  const canAccess = index === 0 || completedSteps.includes(STEP_ORDER[index - 1]);
  
  return {
    index: index + 1,
    total: STEP_ORDER.length,
    isCompleted,
    isCurrent,
    canAccess,
    route: STEP_ROUTES[step]
  };
};

/**
 * Get next step
 */
export const getNextStep = (currentStep: RegistrationStep): RegistrationStep | null => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return STEP_ORDER[currentIndex + 1] || null;
};

/**
 * Get previous step
 */
export const getPreviousStep = (currentStep: RegistrationStep): RegistrationStep | null => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return STEP_ORDER[currentIndex - 1] || null;
};

/**
 * Calculate progress percentage
 */
export const calculateProgressPercentage = (completedSteps: RegistrationStep[]): number => {
  return Math.round((completedSteps.length / STEP_ORDER.length) * 100);
};

/**
 * Check if can proceed to next step
 */
export const canProceedNext = (
  currentStep: RegistrationStep,
  completedSteps: RegistrationStep[]
): boolean => {
  // Allow proceeding if current step is completed OR if it's the first step (personal_info)
  // This allows users to proceed from personal_info even if not explicitly marked as completed
  return completedSteps.includes(currentStep) || currentStep === 'personal_info';
};

/**
 * Check if can go back
 */
export const canGoBack = (currentStep: RegistrationStep): boolean => {
  return currentStep !== 'personal_info';
};
