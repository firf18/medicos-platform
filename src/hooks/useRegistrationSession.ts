/**
 * Registration Session Hook
 * @fileoverview React hook for managing registration session state
 * @compliance HIPAA-compliant session management
 */

import { useState, useEffect, useCallback } from 'react';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { registrationSessionManager } from '@/lib/registration/registration-session-manager';

interface UseRegistrationSessionReturn {
  // Session state
  sessionId: string | null;
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  isSessionActive: boolean;

  // Data management
  data: DoctorRegistrationData | null;
  updateData: (data: Partial<DoctorRegistrationData>) => void;

  // Navigation
  navigateToStep: (step: RegistrationStep) => boolean;
  goToNextStep: () => boolean;
  goToPreviousStep: () => boolean;
  completeStep: (step: RegistrationStep) => void;

  // Validation
  isStepValid: (step: RegistrationStep) => boolean;
  isStepCompleted: (step: RegistrationStep) => boolean;
  validateCurrentStep: () => boolean;

  // Verification
  markVerificationComplete: (type: 'email' | 'phone' | 'document', identifier?: string) => void;
  recordVerificationAttempt: (type: 'email' | 'phone' | 'document') => boolean;
  canAttemptVerification: (type: 'email' | 'phone' | 'document') => boolean;
  getVerificationCooldown: (type: 'email' | 'phone' | 'document') => number;

  // Session management
  createSession: () => string;
  clearSession: () => void;
  extendSession: () => void;
}

export const useRegistrationSession = (): UseRegistrationSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal_info');
  const [completedSteps, setCompletedSteps] = useState<RegistrationStep[]>([]);
  const [data, setData] = useState<DoctorRegistrationData | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Initialize session
  useEffect(() => {
    const session = registrationSessionManager.getCurrentSession();
    if (session) {
      setSessionId(session.id);
      setCurrentStep(session.currentStep);
      setCompletedSteps(session.completedSteps);
      setData(session.data);
      setIsSessionActive(true);
    } else {
      // Create new session if none exists
      const newSessionId = registrationSessionManager.createSession();
      setSessionId(newSessionId);
      setCurrentStep('personal_info');
      setCompletedSteps([]);
      setData(registrationSessionManager.getData());
      setIsSessionActive(true);
    }
  }, []);

  // Update data
  const updateData = useCallback((newData: Partial<DoctorRegistrationData>) => {
    registrationSessionManager.updateData(newData);
    const updatedData = registrationSessionManager.getData();
    setData(updatedData);
  }, []);

  // Navigate to step
  const navigateToStep = useCallback((step: RegistrationStep) => {
    const success = registrationSessionManager.navigateToStep(step);
    if (success) {
      setCurrentStep(step);
    }
    return success;
  }, []);

  // Go to next step
  const goToNextStep = useCallback(() => {
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[currentIndex + 1];

    if (nextStep) {
      // Validar paso actual antes de avanzar
      const isValid = registrationSessionManager.validateCurrentStep();
      if (isValid) {
        // Marcar paso actual como completado
        registrationSessionManager.completeStep(currentStep);
        const success = registrationSessionManager.navigateToStep(nextStep);
        if (success) {
          setCurrentStep(nextStep);
          // Actualizar datos desde el session manager
          const updatedData = registrationSessionManager.getData();
          if (updatedData) {
            setData(updatedData);
          }
        }
        return success;
      }
    }

    return false;
  }, [currentStep]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    const previousStep = stepOrder[currentIndex - 1];

    if (previousStep) {
      // Ir al paso anterior sin requerir validación
      const success = registrationSessionManager.navigateToStep(previousStep);
      if (success) {
        setCurrentStep(previousStep);
        // Conservar datos existentes
        const updatedData = registrationSessionManager.getData();
        if (updatedData) {
          setData(updatedData);
        }
      }
      return success;
    }

    return false;
  }, [currentStep]);

  // Complete step
  const completeStep = useCallback((step: RegistrationStep) => {
    registrationSessionManager.completeStep(step);
    setCompletedSteps(prev => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });
  }, []);

  // Validation methods
  const isStepValid = useCallback((step: RegistrationStep) => {
    return registrationSessionManager.isStepValid(step);
  }, []);

  const isStepCompleted = useCallback((step: RegistrationStep) => {
    return registrationSessionManager.isStepCompleted(step);
  }, []);

  const validateCurrentStep = useCallback(() => {
    return registrationSessionManager.validateCurrentStep();
  }, []);

  // Verification methods
  const markVerificationComplete = useCallback((type: 'email' | 'phone' | 'document', identifier?: string) => {
    registrationSessionManager.markVerificationComplete(type, identifier);
  }, []);

  const recordVerificationAttempt = useCallback((type: 'email' | 'phone' | 'document') => {
    return registrationSessionManager.recordVerificationAttempt(type);
  }, []);

  const canAttemptVerification = useCallback((type: 'email' | 'phone' | 'document') => {
    return registrationSessionManager.canAttemptVerification(type);
  }, []);

  const getVerificationCooldown = useCallback((type: 'email' | 'phone' | 'document') => {
    return registrationSessionManager.getVerificationCooldown(type);
  }, []);

  // Session management
  const createSession = useCallback(() => {
    const newSessionId = registrationSessionManager.createSession();
    setSessionId(newSessionId);
    setCurrentStep('personal_info');
    setCompletedSteps([]);
    setData(registrationSessionManager.getData());
    setIsSessionActive(true);
    return newSessionId;
  }, []);

  const clearSession = useCallback(() => {
    registrationSessionManager.clearSession();
    setSessionId(null);
    setCurrentStep('personal_info');
    setCompletedSteps([]);
    setData(null);
    setIsSessionActive(false);
  }, []);

  const extendSession = useCallback(() => {
    registrationSessionManager.extendSession();
  }, []);

  return {
    // Session state
    sessionId,
    currentStep,
    completedSteps,
    isSessionActive,

    // Data management
    data,
    updateData,

    // Navigation
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    completeStep,

    // Validation
    isStepValid,
    isStepCompleted,
    validateCurrentStep,

    // Verification
    markVerificationComplete,
    recordVerificationAttempt,
    canAttemptVerification,
    getVerificationCooldown,

    // Session management
    createSession,
    clearSession,
    extendSession
  };
};
