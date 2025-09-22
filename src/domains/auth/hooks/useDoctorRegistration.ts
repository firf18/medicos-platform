/**
 * Doctor Registration Hook - Refactored
 * @fileoverview Main hook for doctor registration process using modular sub-hooks
 * @compliance HIPAA-compliant registration management with audit trail
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { useRegistrationState } from './useRegistrationState';
import { useRegistrationValidation } from './useRegistrationValidation';
import { useRegistrationNavigation } from './useRegistrationNavigation';

interface UseDoctorRegistrationProps {
  onRegistrationComplete?: (data: DoctorRegistrationData) => void;
  onRegistrationError?: (error: string) => void;
}

export const useDoctorRegistration = ({
  onRegistrationComplete,
  onRegistrationError
}: UseDoctorRegistrationProps = {}) => {
  const router = useRouter();

  // Core state management
  const {
    registrationData,
    progress,
    isSubmitting,
    updateData,
    updateProgress,
    setIsSubmitting,
    completeStep,
    goToNextStep: stateGoToNextStep,
    goToPreviousStep: stateGoToPreviousStep,
    resetRegistration,
    isComplete,
    currentStep,
    completedSteps,
    percentage,
    canGoNext,
    canGoBack,
    isStepCompleted
  } = useRegistrationState({
    onDataChange: (data) => {
      logger.debug('registration', 'Registration data updated', {
        step: progress.currentStep,
        hasEmail: !!data.email,
        hasLicense: !!data.licenseNumber
      });
    },
    onProgressChange: (progressData) => {
      logger.debug('registration', 'Registration progress updated', {
        step: progressData.currentStep,
        percentage: progressData.percentage,
        completedSteps: progressData.completedSteps.length
      });
    }
  });

  // Validation management
  const {
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateLicenseVerification,
    validateIdentityVerification,
    validateDashboardConfiguration,
    validateCompleteRegistration,
    validateStep,
    formErrors
  } = useRegistrationValidation();

  // Navigation management
  const {
    goToStep,
    goToNextStep,
    goToPreviousStep,
    handleStepComplete,
    handleStepError,
    getStepInfo,
    getStepDisplayName,
    getAllStepsInfo,
    getProgressPercentage,
    canProceedNext,
    canGoBack: navCanGoBack,
    stepOrder,
    stepRoutes,
    currentStepInfo,
    progressPercentage
  } = useRegistrationNavigation({
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    registrationData,
    onStepChange: (step) => updateProgress({ currentStep: step }),
    onStepComplete: completeStep,
    onValidateStep: validateStep
  });

  /**
   * Submit complete registration
   */
  const submitRegistration = useCallback(async (): Promise<boolean> => {
    try {
      setIsSubmitting(true);

      // Final validation
      const validation = await validateCompleteRegistration(registrationData);
      if (!validation.isValid) {
        const errorMessage = validation.errors?.[0] || 'Error de validación';
        onRegistrationError?.(errorMessage);
        toast({
          title: 'Error de registro',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }

      // Log registration attempt
      logSecurityEvent('registration_submission_started', {
        email: registrationData.email,
        specialtyId: registrationData.specialtyId,
        timestamp: new Date().toISOString()
      });

      // Submit to API
      const response = await fetch('/api/auth/register/doctor/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        const errorMessage = errorData.error || 'Error al procesar el registro';
        
        logger.error('registration', 'Registration submission failed', {
          status: response.status,
          error: errorMessage,
          email: registrationData.email
        });

        onRegistrationError?.(errorMessage);
        toast({
          title: 'Error de registro',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }

      const result = await response.json();

      // Log successful registration
      logSecurityEvent('registration_completed', {
        email: registrationData.email,
        specialtyId: registrationData.specialtyId,
        userId: result.userId,
        timestamp: new Date().toISOString()
      });

      logger.info('registration', 'Doctor registration completed successfully', {
        email: registrationData.email,
        userId: result.userId,
        specialtyId: registrationData.specialtyId
      });

      // Mark registration as complete
      updateProgress({ isComplete: true, percentage: 100 });

      // Clear saved data
      resetRegistration();

      // Show success message
      toast({
        title: 'Registro exitoso',
        description: 'Su cuenta médica ha sido creada exitosamente',
        variant: 'default'
      });

      // Callback for completion
      onRegistrationComplete?.(registrationData);

      // Redirect to success page
      router.push('/auth/register/doctor/success');

      return true;

    } catch (error) {
      logger.error('registration', 'Registration submission error', { error });
      
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado durante el registro';
      onRegistrationError?.(errorMessage);
      
      toast({
        title: 'Error de registro',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    registrationData,
    validateCompleteRegistration,
    onRegistrationError,
    onRegistrationComplete,
    updateProgress,
    resetRegistration,
    router,
    setIsSubmitting
  ]);

  /**
   * Handle step completion with navigation
   */
  const completeStepAndContinue = useCallback(async (step: RegistrationStep) => {
    const success = await handleStepComplete(step);
    if (success) {
      // If this is the last step, submit registration
      if (step === 'dashboard_configuration') {
        return submitRegistration();
      } else {
        // Otherwise, go to next step
        return goToNextStep();
      }
    }
    return false;
  }, [handleStepComplete, submitRegistration, goToNextStep]);

  /**
   * Update data with automatic validation
   */
  const updateDataWithValidation = useCallback(async (
    updates: Partial<DoctorRegistrationData>,
    validateImmediately = false
  ) => {
    updateData(updates);

    // Optionally validate immediately
    if (validateImmediately) {
      const validation = await validateStep(progress.currentStep, { ...registrationData, ...updates });
      if (!validation.isValid) {
        handleStepError(progress.currentStep, validation.errors?.[0] || 'Error de validación');
      }
    }
  }, [updateData, validateStep, progress.currentStep, registrationData, handleStepError]);

  /**
   * Get current step validation status
   */
  const getCurrentStepValidation = useCallback(async () => {
    return validateStep(progress.currentStep, registrationData);
  }, [validateStep, progress.currentStep, registrationData]);

  return {
    // Registration data
    registrationData,
    progress,
    
    // Loading states
    isSubmitting,
    isLoading: isSubmitting, // Legacy compatibility
    
    // Actions
    updateData: updateDataWithValidation,
    updateProgress,
    resetRegistration,
    submitRegistration,
    
    // Step management
    completeStep: completeStepAndContinue,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    handleStepComplete,
    handleStepError,
    
    // Validation
    validateStep,
    getCurrentStepValidation,
    formErrors,
    
    // Step-specific validations (for legacy compatibility)
    validatePersonalInfo,
    validateProfessionalInfo,
    validateSpecialtySelection,
    validateLicenseVerification,
    validateIdentityVerification,
    validateDashboardConfiguration,
    
    // Navigation info
    getStepInfo,
    getStepDisplayName,
    getAllStepsInfo,
    stepOrder,
    stepRoutes,
    
    // Progress info
    isComplete,
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    percentage: progress.percentage,
    progressPercentage,
    
    // Navigation capabilities
    canGoNext: canProceedNext,
    canGoBack: navCanGoBack,
    canProceedNext,
    isStepCompleted,
    
    // Current step info
    currentStepInfo
  };
};
