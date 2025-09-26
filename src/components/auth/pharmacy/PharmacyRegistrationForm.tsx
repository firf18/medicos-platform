'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PharmacyRegistrationData } from '@/types/database/pharmacies.types'
import { usePharmacyRegistration } from '@/hooks/usePharmacyRegistration'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'

// Importar componentes de pasos
import { PharmacyBasicInfoStep } from './steps/PharmacyBasicInfoStep'
import { PharmacyLegalInfoStep } from './steps/PharmacyLegalInfoStep'
import { PharmacyBusinessInfoStep } from './steps/PharmacyBusinessInfoStep'
import { PharmacyAddressStep } from './steps/PharmacyAddressStep'
import { PharmacyServicesStep } from './steps/PharmacyServicesStep'
import { PharmacyDocumentsStep } from './steps/PharmacyDocumentsStep'
import { PharmacyTermsStep } from './steps/PharmacyTermsStep'

interface PharmacyRegistrationFormProps {
  onSuccess: (pharmacyId: string) => void
  onCancel: () => void
}

const REGISTRATION_STEPS = [
  {
    step: 1,
    title: 'Información Básica',
    description: 'Datos generales de la farmacia'
  },
  {
    step: 2,
    title: 'Información Legal',
    description: 'Licencias y documentos legales'
  },
  {
    step: 3,
    title: 'Información Comercial',
    description: 'Tipo de negocio y régimen fiscal'
  },
  {
    step: 4,
    title: 'Ubicación',
    description: 'Dirección y ubicación de la farmacia'
  },
  {
    step: 5,
    title: 'Servicios y Horarios',
    description: 'Servicios ofrecidos y horarios de atención'
  },
  {
    step: 6,
    title: 'Documentos',
    description: 'Subir documentos requeridos'
  },
  {
    step: 7,
    title: 'Términos y Condiciones',
    description: 'Aceptar términos y finalizar'
  }
]

export function PharmacyRegistrationForm({ onSuccess, onCancel }: PharmacyRegistrationFormProps) {
  const router = useRouter()
  const {
    registrationData,
    updateData,
    currentStep,
    progress,
    errors,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submitRegistration,
    validateCurrentStep
  } = usePharmacyRegistration()

  const [showErrors, setShowErrors] = useState(false)

  const handleStepComplete = useCallback(async (stepData: Partial<PharmacyRegistrationData>) => {
    // Actualizar datos
    updateData(stepData)
    
    // Validar paso actual
    const isValid = await validateCurrentStep(stepData)
    
    if (isValid) {
      setShowErrors(false)
      goToNextStep()
    } else {
      setShowErrors(true)
    }
  }, [updateData, validateCurrentStep, goToNextStep])

  const handleStepError = useCallback((stepErrors: Record<string, string>) => {
    setShowErrors(true)
    console.error('Step validation errors:', stepErrors)
  }, [])

  const handleFinalSubmit = useCallback(async () => {
    try {
      const result = await submitRegistration()
      if (result.success && result.pharmacyId) {
        onSuccess(result.pharmacyId)
      }
    } catch (error) {
      console.error('Registration submission error:', error)
      setShowErrors(true)
    }
  }, [submitRegistration, onSuccess])

  const currentStepInfo = REGISTRATION_STEPS.find(step => step.step === currentStep)
  const progressPercentage = ((currentStep - 1) / (REGISTRATION_STEPS.length - 1)) * 100

  const renderCurrentStep = () => {
    const commonProps = {
      data: registrationData,
      updateData,
      onStepComplete: handleStepComplete,
      onStepError: handleStepError,
      isLoading: isSubmitting,
      errors: showErrors ? errors : {},
      onNext: () => handleStepComplete(registrationData),
      onPrevious: goToPreviousStep,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === REGISTRATION_STEPS.length
    }

    switch (currentStep) {
      case 1:
        return <PharmacyBasicInfoStep {...commonProps} />
      case 2:
        return <PharmacyLegalInfoStep {...commonProps} />
      case 3:
        return <PharmacyBusinessInfoStep {...commonProps} />
      case 4:
        return <PharmacyAddressStep {...commonProps} />
      case 5:
        return <PharmacyServicesStep {...commonProps} />
      case 6:
        return <PharmacyDocumentsStep {...commonProps} />
      case 7:
        return <PharmacyTermsStep {...commonProps} onFinalSubmit={handleFinalSubmit} />
      default:
        return <div>Paso no encontrado</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-orange-700">
                Registro de Farmacia
              </CardTitle>
              <CardDescription>
                {currentStepInfo?.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </Button>
          </div>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Paso {currentStep} de {REGISTRATION_STEPS.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressPercentage)}% completado
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="mt-6 hidden md:block">
            <div className="flex items-center justify-between">
              {REGISTRATION_STEPS.map((step, index) => (
                <div
                  key={step.step}
                  className={`flex items-center ${index < REGISTRATION_STEPS.length - 1 ? 'flex-1' : ''}`}
                >
                  <button
                    onClick={() => goToStep(step.step)}
                    disabled={step.step > progress.completedSteps.length + 1}
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                      ${step.step === currentStep
                        ? 'bg-orange-600 text-white'
                        : step.step <= progress.completedSteps.length
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                      }
                      ${step.step <= progress.completedSteps.length + 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}
                    `}
                  >
                    {step.step <= progress.completedSteps.length ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step.step
                    )}
                  </button>
                  
                  {index < REGISTRATION_STEPS.length - 1 && (
                    <div 
                      className={`
                        flex-1 h-1 mx-2
                        ${step.step <= progress.completedSteps.length ? 'bg-green-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              {REGISTRATION_STEPS.map((step) => (
                <div key={step.step} className="flex-1 text-center">
                  <p className={`
                    text-xs font-medium
                    ${step.step === currentStep ? 'text-orange-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Summary */}
      {showErrors && Object.keys(errors).length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 mb-2">
                  Se encontraron errores en el formulario
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {currentStepInfo?.title}
          </CardTitle>
          <CardDescription>
            {currentStepInfo?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Save Progress Notice */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Tu progreso se guarda automáticamente. Puedes continuar más tarde si es necesario.
        </p>
      </div>
    </div>
  )
}
