'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { AlertCircle, ArrowRight, ArrowLeft, Clock, Stethoscope } from 'lucide-react'
import { PharmacyRegistrationData, WorkingHours } from '@/types/database/pharmacies.types'

interface PharmacyServicesStepProps {
  data: Partial<PharmacyRegistrationData>
  updateData: (data: Partial<PharmacyRegistrationData>) => void
  onStepComplete: (data: Partial<PharmacyRegistrationData>) => void
  onStepError: (errors: Record<string, string>) => void
  isLoading: boolean
  errors: Record<string, string>
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const defaultWorkingHours: WorkingHours = {
  monday: { open: '08:00', close: '20:00', isOpen: true },
  tuesday: { open: '08:00', close: '20:00', isOpen: true },
  wednesday: { open: '08:00', close: '20:00', isOpen: true },
  thursday: { open: '08:00', close: '20:00', isOpen: true },
  friday: { open: '08:00', close: '20:00', isOpen: true },
  saturday: { open: '09:00', close: '18:00', isOpen: true },
  sunday: { open: '10:00', close: '16:00', isOpen: false }
}

const availableServices = [
  { id: 'dispensing', label: 'Dispensación de Medicamentos', description: 'Venta de medicamentos con y sin receta' },
  { id: 'consultation', label: 'Consulta Farmacéutica', description: 'Asesoría sobre medicamentos y tratamientos' },
  { id: 'vaccination', label: 'Servicios de Vacunación', description: 'Aplicación de vacunas preventivas' },
  { id: 'health_screening', label: 'Monitoreo de Salud', description: 'Medición de presión, glucosa, etc.' },
  { id: 'delivery', label: 'Entrega a Domicilio', description: 'Servicio de entrega de medicamentos' },
  { id: 'compounding', label: 'Preparación Magistral', description: 'Elaboración de fórmulas personalizadas' },
  { id: 'medical_devices', label: 'Venta de Dispositivos Médicos', description: 'Equipos médicos y dispositivos' },
  { id: 'nutrition', label: 'Asesoría Nutricional', description: 'Consultas sobre suplementos y nutrición' }
]

const availableSpecialties = [
  { id: 'pediatric', label: 'Farmacia Pediátrica', description: 'Especialización en medicamentos para niños' },
  { id: 'oncology', label: 'Farmacia Oncológica', description: 'Medicamentos especializados para cáncer' },
  { id: 'geriatric', label: 'Farmacia Geriátrica', description: 'Atención especializada para adultos mayores' },
  { id: 'psychiatric', label: 'Farmacia Psiquiátrica', description: 'Medicamentos para salud mental' },
  { id: 'dermatology', label: 'Farmacia Dermatológica', description: 'Productos especializados para la piel' },
  { id: 'veterinary', label: 'Farmacia Veterinaria', description: 'Medicamentos para animales' },
  { id: 'homeopathic', label: 'Farmacia Homeopática', description: 'Medicamentos homeopáticos' },
  { id: 'natural', label: 'Productos Naturales', description: 'Medicina herbal y productos naturales' }
]

const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
] as const

export function PharmacyServicesStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  errors,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep
}: PharmacyServicesStepProps) {
  const [formData, setFormData] = useState({
    services: data.services || [],
    specialties: data.specialties || [],
    businessHours: data.businessHours || defaultWorkingHours
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      services: data.services || [],
      specialties: data.specialties || [],
      businessHours: data.businessHours || defaultWorkingHours
    })
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (formData.services.length === 0) {
      errors.services = 'Debes seleccionar al menos un servicio'
    }

    // Validate business hours
    const openDays = daysOfWeek.filter(day => formData.businessHours[day.key].isOpen)
    if (openDays.length === 0) {
      errors.businessHours = 'Debes tener al menos un día de operación'
    }

    // Validate time format for open days
    openDays.forEach(day => {
      const hours = formData.businessHours[day.key]
      if (hours.isOpen) {
        if (!hours.open || !hours.close) {
          errors[`${day.key}_hours`] = `Horario incompleto para ${day.label}`
        } else if (hours.open >= hours.close) {
          errors[`${day.key}_hours`] = `Horario inválido para ${day.label}: la hora de apertura debe ser menor a la de cierre`
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    const newServices = checked
      ? [...formData.services, serviceId]
      : formData.services.filter(s => s !== serviceId)
    
    setFormData(prev => ({ ...prev, services: newServices }))
    
    if (validationErrors.services && newServices.length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.services
        return newErrors
      })
    }
  }

  const handleSpecialtyChange = (specialtyId: string, checked: boolean) => {
    const newSpecialties = checked
      ? [...formData.specialties, specialtyId]
      : formData.specialties.filter(s => s !== specialtyId)
    
    setFormData(prev => ({ ...prev, specialties: newSpecialties }))
  }

  const handleHoursChange = (day: keyof WorkingHours, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }))

    // Clear validation errors for this day
    const errorKey = `${day}_hours`
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      updateData(formData)
      onStepComplete(formData)
    } else {
      onStepError(validationErrors)
    }
  }

  const handlePrevious = () => {
    updateData(formData)
    onPrevious()
  }

  const getFieldError = (field: string) => {
    return errors[field] || validationErrors[field] || ''
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Services Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Servicios Ofrecidos
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableServices.map((service) => (
              <div key={service.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={service.id}
                  checked={formData.services.includes(service.id)}
                  onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={service.id} className="text-sm font-medium cursor-pointer">
                    {service.label}
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {getFieldError('services') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('services')}</span>
            </div>
          )}
        </div>

        {/* Specialties Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Especialidades (Opcional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSpecialties.map((specialty) => (
              <div key={specialty.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={specialty.id}
                  checked={formData.specialties.includes(specialty.id)}
                  onCheckedChange={(checked) => handleSpecialtyChange(specialty.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={specialty.id} className="text-sm font-medium cursor-pointer">
                    {specialty.label}
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">{specialty.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Horarios de Atención
            </h3>
          </div>
          
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                <Checkbox
                  id={`${day.key}_open`}
                  checked={formData.businessHours[day.key].isOpen}
                  onCheckedChange={(checked) => handleHoursChange(day.key, 'isOpen', checked as boolean)}
                />
                <Label htmlFor={`${day.key}_open`} className="w-20 text-sm font-medium">
                  {day.label}
                </Label>
                
                {formData.businessHours[day.key].isOpen && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={formData.businessHours[day.key].open}
                      onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                      className="w-24"
                    />
                    <span className="text-gray-500">a</span>
                    <Input
                      type="time"
                      value={formData.businessHours[day.key].close}
                      onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
                
                {!formData.businessHours[day.key].isOpen && (
                  <span className="text-gray-500 text-sm">Cerrado</span>
                )}
                
                {getFieldError(`${day.key}_hours`) && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs ml-auto">
                    <AlertCircle className="h-3 w-3" />
                    <span>{getFieldError(`${day.key}_hours`)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {getFieldError('businessHours') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('businessHours')}</span>
            </div>
          )}
        </div>

        {/* Services Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Los servicios seleccionados aparecerán en tu perfil público</div>
            <div>• Puedes modificar estos servicios después del registro</div>
            <div>• Las especialidades ayudan a los pacientes a encontrar tu farmacia</div>
            <div>• Los horarios pueden ser actualizados en cualquier momento</div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
        >
          <span>Siguiente</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
