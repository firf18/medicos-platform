/**
 * Step Navigation Component
 * @fileoverview Unified navigation component for registration steps
 * @compliance HIPAA-compliant navigation with validation
 */

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { RegistrationStep } from '@/types/medical/specialties';
import { useRegistrationSession } from '@/hooks/useRegistrationSession';

interface StepNavigationProps {
  currentStep: RegistrationStep;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  customValidation?: () => boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  showNext?: boolean;
  showPrevious?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onNext,
  onPrevious,
  isLoading = false,
  customValidation,
  nextButtonText,
  previousButtonText,
  showNext = true,
  showPrevious = true
}) => {
  const {
    goToNextStep,
    goToPreviousStep,
    validateCurrentStep,
    isStepCompleted,
    completedSteps
  } = useRegistrationSession();

  // Determine if we can proceed to next step
  const canProceedNext = () => {
    if (customValidation) {
      return customValidation();
    }
    return validateCurrentStep();
  };

  // Determine if we can go to previous step
  const canGoPrevious = () => {
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex > 0;
  };

  // Handle next step
  const handleNext = async () => {
    if (onNext) {
      onNext();
    } else {
      goToNextStep();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      goToPreviousStep();
    }
  };

  // Get button text
  const getNextButtonText = () => {
    if (nextButtonText) return nextButtonText;
    
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const isLastStep = currentIndex === stepOrder.length - 1;
    
    return isLastStep ? 'Finalizar Registro' : 'Siguiente';
  };

  const getPreviousButtonText = () => {
    return previousButtonText || 'Anterior';
  };

  return (
    <div className="flex justify-between items-center w-full">
      {/* Previous Button */}
      {showPrevious && canGoPrevious() ? (
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isLoading}
          className="px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {getPreviousButtonText()}
        </Button>
      ) : (
        <div></div>
      )}

      {/* Next Button */}
      {showNext && (
        <Button
          onClick={handleNext}
          disabled={isLoading || !canProceedNext()}
          className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{getNextButtonText()}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      )}
    </div>
  );
};
