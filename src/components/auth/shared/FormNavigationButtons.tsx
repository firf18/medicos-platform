/**
 * Form Navigation Buttons Component - Red-Salud Platform
 * 
 * Componente reutilizable para navegación entre pasos de formularios.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

interface FormNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  showStepIndicator?: boolean;
}

export function FormNavigationButtons({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isLoading = false,
  nextButtonText = 'Siguiente',
  previousButtonText = 'Anterior',
  canGoNext = true,
  canGoPrevious = true,
  showStepIndicator = true
}: FormNavigationButtonsProps) {
  
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="space-y-4">
      {/* Indicador de pasos */}
      {showStepIndicator && totalSteps > 1 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div
                  key={stepNumber}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
              );
            })}
          </div>
          <div className="ml-4 text-sm text-gray-600">
            Paso {currentStep} de {totalSteps}
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className={`flex ${isFirstStep ? 'justify-end' : 'justify-between'}`}>
        {/* Botón anterior */}
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading || !canGoPrevious}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              previousButtonText
            )}
          </button>
        )}

        {/* Botón siguiente/enviar */}
        <button
          type="submit"
          disabled={isLoading || !canGoNext}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLastStep
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLastStep ? 'Creando cuenta...' : 'Procesando...'}
            </>
          ) : (
            <>
              {nextButtonText}
              {!isLastStep && (
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
