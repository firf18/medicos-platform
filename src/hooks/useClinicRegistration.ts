import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { clinicService } from '@/lib/supabase/clinic-service'
import { toast } from '@/hooks/use-toast'

interface ClinicFormData {
  clinic_name: string
  legal_name: string
  rif: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  clinic_type: string
  description?: string
  emergency_contact_name: string
  emergency_contact_phone: string
}

interface UseClinicRegistrationOptions {
  onSuccess?: (registrationId: string) => void
  onError?: (error: string) => void
  redirectOnSuccess?: boolean
}

export function useClinicRegistration(options: UseClinicRegistrationOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    onSuccess,
    onError,
    redirectOnSuccess = true
  } = options

  const validateRIF = useCallback((rif: string): boolean => {
    const rifPattern = /^[JGVEP]-[0-9]{8}-[0-9]$/
    return rifPattern.test(rif)
  }, [])

  const validateEmail = useCallback((email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }, [])

  const validatePhone = useCallback((phone: string): boolean => {
    const phonePattern = /^(\+58|0)?[2-9][0-9]{9}$/
    return phonePattern.test(phone.replace(/\s|-/g, ''))
  }, [])

  const validateFormData = useCallback((data: ClinicFormData): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}

    // Validaciones básicas
    if (!data.clinic_name.trim()) {
      errors.clinic_name = 'El nombre de la clínica es requerido'
    }

    if (!data.legal_name.trim()) {
      errors.legal_name = 'La razón social es requerida'
    }

    if (!data.rif.trim()) {
      errors.rif = 'El RIF es requerido'
    } else if (!validateRIF(data.rif)) {
      errors.rif = 'Formato de RIF inválido. Debe ser: J-12345678-1'
    }

    if (!data.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!validateEmail(data.email)) {
      errors.email = 'Formato de email inválido'
    }

    if (!data.phone.trim()) {
      errors.phone = 'El teléfono es requerido'
    } else if (!validatePhone(data.phone)) {
      errors.phone = 'Formato de teléfono inválido'
    }

    if (!data.address.trim()) {
      errors.address = 'La dirección es requerida'
    } else if (data.address.trim().length < 10) {
      errors.address = 'La dirección debe ser más específica'
    }

    if (!data.city.trim()) {
      errors.city = 'La ciudad es requerida'
    }

    if (!data.state.trim()) {
      errors.state = 'El estado es requerido'
    }

    if (!data.clinic_type.trim()) {
      errors.clinic_type = 'El tipo de clínica es requerido'
    }

    if (!data.emergency_contact_name.trim()) {
      errors.emergency_contact_name = 'El contacto de emergencia es requerido'
    }

    if (!data.emergency_contact_phone.trim()) {
      errors.emergency_contact_phone = 'El teléfono de emergencia es requerido'
    } else if (!validatePhone(data.emergency_contact_phone)) {
      errors.emergency_contact_phone = 'Formato de teléfono de emergencia inválido'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [validateRIF, validateEmail, validatePhone])

  const registerClinic = useCallback(async (data: ClinicFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Validar datos
      const validation = validateFormData(data)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        setError(firstError)
        return { success: false, error: firstError }
      }

      // Intentar registrar la clínica
      const result = await clinicService.registerClinic(data)

      if (!result.success) {
        setError(result.error)
        onError?.(result.error)
        return result
      }

      // Éxito
      toast({
        title: "¡Registro exitoso!",
        description: "Tu clínica ha sido registrada. Recibirás un email con los próximos pasos.",
      })

      onSuccess?.(result.data.id)

      if (redirectOnSuccess) {
        router.push('/auth/register/clinic/success')
      }

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      onError?.(errorMessage)
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }, [validateFormData, onSuccess, onError, redirectOnSuccess, router])

  const getRegistrationStatus = useCallback(async (registrationId: string) => {
    try {
      const result = await clinicService.getRegistrationStatus(registrationId)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    registerClinic,
    getRegistrationStatus,
    validateRIF,
    validateEmail,
    validatePhone,
    validateFormData,
    clearError
  }
}
