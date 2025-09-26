/**
 * Custom Hook for Pharmacy Registration
 * 
 * Manages the multi-step pharmacy registration process with validation,
 * persistence, and submission handling.
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PharmacyRegistrationData, MexicanState, PharmacyLicenseType, PharmacyBusinessType } from '@/types/database/pharmacies.types'
import { pharmacyStepSchemas } from '@/lib/validations/pharmacy'
import { useAuth } from '@/hooks/useAuth'

interface RegistrationProgress {
  currentStep: number
  completedSteps: number[]
  lastSavedAt: string | null
}

interface UsePharmacyRegistrationReturn {
  registrationData: Partial<PharmacyRegistrationData>
  updateData: (data: Partial<PharmacyRegistrationData>) => void
  currentStep: number
  progress: RegistrationProgress
  errors: Record<string, string>
  isSubmitting: boolean
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (step: number) => void
  submitRegistration: () => Promise<{ success: boolean; pharmacyId?: string }>
  validateCurrentStep: (data?: Partial<PharmacyRegistrationData>) => Promise<boolean>
  saveProgress: () => void
  clearProgress: () => void
}

const STORAGE_KEY = 'pharmacy_registration_data'
const PROGRESS_KEY = 'pharmacy_registration_progress'

const defaultBusinessHours = {
  monday: { open: '08:00', close: '20:00', isOpen: true },
  tuesday: { open: '08:00', close: '20:00', isOpen: true },
  wednesday: { open: '08:00', close: '20:00', isOpen: true },
  thursday: { open: '08:00', close: '20:00', isOpen: true },
  friday: { open: '08:00', close: '20:00', isOpen: true },
  saturday: { open: '08:00', close: '18:00', isOpen: true },
  sunday: { open: '09:00', close: '15:00', isOpen: false }
}

const defaultServices = [
  'Dispensación de Recetas',
  'Consulta Farmacéutica',
  'Medición de Presión Arterial'
]

export function usePharmacyRegistration(): UsePharmacyRegistrationReturn {
  const { user } = useAuth()
  const router = useRouter()

  // Estado principal
  const [registrationData, setRegistrationData] = useState<Partial<PharmacyRegistrationData>>({
    businessHours: defaultBusinessHours,
    services: defaultServices,
    specialties: [],
    documents: []
  })

  const [progress, setProgress] = useState<RegistrationProgress>({
    currentStep: 1,
    completedSteps: [],
    lastSavedAt: null
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos guardados al inicializar
  useEffect(() => {
    loadSavedData()
  }, [])

  // Guardar datos automáticamente cuando cambien
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgress()
    }, 1000) // Guardar después de 1 segundo de inactividad

    return () => clearTimeout(timer)
  }, [registrationData, progress])

  const loadSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      const savedProgress = localStorage.getItem(PROGRESS_KEY)

      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setRegistrationData({
          ...parsedData,
          businessHours: parsedData.businessHours || defaultBusinessHours,
          services: parsedData.services || defaultServices,
          specialties: parsedData.specialties || [],
          documents: parsedData.documents || []
        })
      }

      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
      }
    } catch (error) {
      console.error('Error loading saved registration data:', error)
    }
  }, [])

  const saveProgress = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationData))
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({
        ...progress,
        lastSavedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error saving registration progress:', error)
    }
  }, [registrationData, progress])

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PROGRESS_KEY)
      setRegistrationData({
        businessHours: defaultBusinessHours,
        services: defaultServices,
        specialties: [],
        documents: []
      })
      setProgress({
        currentStep: 1,
        completedSteps: [],
        lastSavedAt: null
      })
      setErrors({})
    } catch (error) {
      console.error('Error clearing registration progress:', error)
    }
  }, [])

  const updateData = useCallback((newData: Partial<PharmacyRegistrationData>) => {
    setRegistrationData(prev => ({
      ...prev,
      ...newData
    }))
    
    // Limpiar errores relacionados con los campos actualizados
    const updatedFields = Object.keys(newData)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => {
        delete newErrors[field]
      })
      return newErrors
    })
  }, [])

  const validateCurrentStep = useCallback(async (data?: Partial<PharmacyRegistrationData>): Promise<boolean> => {
    const dataToValidate = data || registrationData
    const stepSchema = pharmacyStepSchemas[progress.currentStep as keyof typeof pharmacyStepSchemas]
    
    if (!stepSchema) {
      return true
    }

    try {
      await stepSchema.parseAsync(dataToValidate)
      setErrors({})
      return true
    } catch (error: any) {
      if (error.issues) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue: any) => {
          const field = issue.path.join('.')
          newErrors[field] = issue.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [registrationData, progress.currentStep])

  const goToNextStep = useCallback(() => {
    setProgress(prev => {
      const newCompletedSteps = prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStep]

      return {
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, 7),
        completedSteps: newCompletedSteps
      }
    })
    setErrors({})
  }, [])

  const goToPreviousStep = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }))
    setErrors({})
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 7 && step <= progress.completedSteps.length + 1) {
      setProgress(prev => ({
        ...prev,
        currentStep: step
      }))
      setErrors({})
    }
  }, [progress.completedSteps])

  const submitRegistration = useCallback(async (): Promise<{ success: boolean; pharmacyId?: string }> => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Validar todos los datos antes de enviar
      const isValid = await validateCurrentStep(registrationData)
      if (!isValid) {
        throw new Error('Datos de registro inválidos')
      }

      // Preparar FormData para envío
      const formData = new FormData()

      // Agregar campos básicos
      Object.entries(registrationData).forEach(([key, value]) => {
        if (key === 'documents') {
          // Manejar documentos por separado
          (value as any[])?.forEach((doc, index) => {
            if (doc.file instanceof File) {
              formData.append('documents', doc.file)
              formData.append(`document_${index}_name`, doc.name)
              formData.append(`document_${index}_type`, doc.type)
            }
          })
        } else if (key === 'businessHours' || key === 'services' || key === 'specialties') {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Enviar solicitud de registro
      const response = await fetch('/api/pharmacy/register', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en el registro')
      }

      if (result.success) {
        // Limpiar datos guardados después del registro exitoso
        clearProgress()
        
        return {
          success: true,
          pharmacyId: result.data?.pharmacy_id
        }
      } else {
        throw new Error(result.error || 'Error desconocido')
      }

    } catch (error: any) {
      console.error('Registration submission error:', error)
      
      // Manejar errores específicos
      if (error.details) {
        const newErrors: Record<string, string> = {}
        error.details.forEach((detail: any) => {
          newErrors[detail.field] = detail.message
        })
        setErrors(newErrors)
      } else {
        setErrors({
          general: error.message || 'Error durante el registro. Inténtalo de nuevo.'
        })
      }

      return { success: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [user, registrationData, validateCurrentStep, clearProgress])

  return {
    registrationData,
    updateData,
    currentStep: progress.currentStep,
    progress,
    errors,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submitRegistration,
    validateCurrentStep,
    saveProgress,
    clearProgress
  }
}
