/**
 * Registration State Hook
 * @fileoverview Core state management for doctor registration process
 * @compliance HIPAA-compliant registration state with audit trail
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DoctorRegistrationData, RegistrationStep, RegistrationProgress } from '@/types/medical/specialties';
import { useRegistrationPersistence } from '@/hooks/useRegistrationPersistence';
import { logger } from '@/lib/logging/logger';

interface UseRegistrationStateProps {
  onDataChange?: (data: DoctorRegistrationData) => void;
  onProgressChange?: (progress: RegistrationProgress) => void;
}

export const useRegistrationState = ({
  onDataChange,
  onProgressChange
}: UseRegistrationStateProps = {}) => {
  // Persistence hook
  const registrationPersistence = useRegistrationPersistence();
  
  // Auto-save refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<DoctorRegistrationData | null>(null);
  const lastSavedProgressRef = useRef<RegistrationProgress | null>(null);

  // Initialize registration data
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData>(() => {
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
      university: '',
      graduationYear: undefined,
      medicalBoard: '',
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

  // Initialize progress
  const [progress, setProgress] = useState<RegistrationProgress>(() => {
    const { progress } = registrationPersistence.loadProgress();
    return progress || {
      currentStep: 'personal_info',
      completedSteps: [],
      totalSteps: 4,
      percentage: 0,
      isComplete: false,
      errors: [],
      lastUpdated: new Date().toISOString()
    };
  });

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Auto-save progress with debouncing
   */
  const autoSaveProgress = useCallback((
    data: DoctorRegistrationData, 
    progressData: RegistrationProgress
  ) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if data has changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);
    const progressChanged = JSON.stringify(progressData) !== JSON.stringify(lastSavedProgressRef.current);

    if (!dataChanged && !progressChanged) {
      return;
    }

    // Debounce save operation
    saveTimeoutRef.current = setTimeout(() => {
      try {
        registrationPersistence.saveProgress(data, progressData);
        lastSavedDataRef.current = data;
        lastSavedProgressRef.current = progressData;
        
        // Solo loggear en desarrollo y para cambios significativos
        if (process.env.NODE_ENV === 'development' && progressData.percentage > 0) {
          logger.debug('registration', 'Auto-saved registration progress', {
            step: progressData.currentStep,
            percentage: progressData.percentage
          });
        }
      } catch (error) {
        logger.error('registration', 'Failed to auto-save progress', { error });
      }
    }, 1000); // 1 second debounce
  }, [registrationPersistence]);

  /**
   * Update registration data
   */
  const updateData = useCallback((updates: Partial<DoctorRegistrationData>) => {
    setRegistrationData(prev => {
      const newData = { ...prev, ...updates };
      
      // Auto-save
      autoSaveProgress(newData, progress);
      
      // Notify parent
      onDataChange?.(newData);
      
      return newData;
    });
  }, [progress, autoSaveProgress, onDataChange]);

  /**
   * Update progress
   */
  const updateProgress = useCallback((updates: Partial<RegistrationProgress> | ((prev: RegistrationProgress) => Partial<RegistrationProgress>)) => {
    setProgress(prev => {
      const patch = typeof updates === 'function' ? updates(prev) : updates;
      const newProgress = {
        ...prev,
        ...patch,
        lastUpdated: new Date().toISOString()
      };

      // Auto-save
      autoSaveProgress(registrationData, newProgress);

      // Notify parent
      onProgressChange?.(newProgress);

      return newProgress;
    });
  }, [registrationData, autoSaveProgress, onProgressChange]);

  /**
   * Complete a registration step
   */
  const completeStep = useCallback((step: RegistrationStep) => {
    updateProgress(prev => {
      const alreadyCompleted = prev.completedSteps.includes(step);
      const completedSteps = alreadyCompleted ? prev.completedSteps : [...prev.completedSteps, step];
      const percentage = Math.round((completedSteps.length / prev.totalSteps) * 100);
      return {
        completedSteps,
        percentage,
        isComplete: percentage === 100
      };
    });
  }, [updateProgress]);

  /**
   * Move to next step
   */
  const goToNextStep = useCallback((currentStep: RegistrationStep) => {
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[currentIndex + 1];
    
    if (nextStep) {
      updateProgress({ currentStep: nextStep });
    }
  }, [updateProgress]);

  /**
   * Go to previous step
   */
  const goToPreviousStep = useCallback((currentStep: RegistrationStep) => {
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const previousStep = stepOrder[currentIndex - 1];
    
    if (previousStep) {
      updateProgress({ currentStep: previousStep });
    }
  }, [updateProgress]);

  /**
   * Reset registration
   */
  const resetRegistration = useCallback(() => {
    registrationPersistence.clearProgress();
    setRegistrationData({
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
      university: '',
      graduationYear: undefined,
      medicalBoard: '',
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
    });
    setProgress({
      currentStep: 'personal_info',
      completedSteps: [],
      totalSteps: 4,
      percentage: 0,
      isComplete: false,
      errors: [],
      lastUpdated: new Date().toISOString()
    });
  }, [registrationPersistence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Log registration start
  useEffect(() => {
    logger.info('registration', 'Doctor registration process started', {
      timestamp: new Date().toISOString()
    });
  }, []);

  return {
    // State
    registrationData,
    progress,
    isSubmitting,
    
    // Actions
    updateData,
    updateProgress,
    setIsSubmitting,
    completeStep,
    goToNextStep,
    goToPreviousStep,
    resetRegistration,
    
    // Computed values
    isComplete: progress.isComplete,
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    percentage: progress.percentage,
    
    // Utils
    canGoNext: (step: RegistrationStep) => progress.completedSteps.includes(step),
    canGoBack: (step: RegistrationStep) => step !== 'personal_info',
    isStepCompleted: (step: RegistrationStep) => progress.completedSteps.includes(step)
  };
};
