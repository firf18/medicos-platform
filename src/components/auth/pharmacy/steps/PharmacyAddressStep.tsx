'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, ArrowRight, ArrowLeft, MapPin } from 'lucide-react'
import { PharmacyRegistrationData, MexicanState } from '@/types/database/pharmacies.types'

interface PharmacyAddressStepProps {
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

export function PharmacyAddressStep({
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
}: PharmacyAddressStepProps) {
  const [formData, setFormData] = useState({
    address: data.address || '',
    city: data.city || '',
    state: data.state || '' as MexicanState,
    postalCode: data.postalCode || ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const mexicanStates: MexicanState[] = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Coahuila',
    'Colima',
    'Ciudad de México',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas'
  ]

  useEffect(() => {
    setFormData({
      address: data.address || '',
      city: data.city || '',
      state: data.state || '' as MexicanState,
      postalCode: data.postalCode || ''
    })
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.address.trim()) {
      errors.address = 'La dirección es requerida'
    } else if (formData.address.trim().length < 10) {
      errors.address = 'La dirección debe ser más específica (mínimo 10 caracteres)'
    }

    if (!formData.city.trim()) {
      errors.city = 'La ciudad es requerida'
    } else if (formData.city.trim().length < 2) {
      errors.city = 'Ingresa una ciudad válida'
    }

    if (!formData.state) {
      errors.state = 'El estado es requerido'
    }

    if (!formData.postalCode.trim()) {
      errors.postalCode = 'El código postal es requerido'
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = 'El código postal debe tener 5 dígitos'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
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
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Ubicación de la Farmacia
          </h3>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Dirección Completa *
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Ej: Av. Insurgentes Sur 123, Col. Roma Norte, Entre Calle A y Calle B"
            rows={3}
            className={getFieldError('address') ? 'border-red-500' : ''}
          />
          {getFieldError('address') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('address')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Incluye calle, número, colonia y referencias que faciliten la ubicación
          </p>
        </div>

        {/* City and State Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Ciudad *
            </Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Ej: Ciudad de México"
              className={getFieldError('city') ? 'border-red-500' : ''}
            />
            {getFieldError('city') && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError('city')}</span>
              </div>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              Estado *
            </Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
              <SelectTrigger className={getFieldError('state') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                {mexicanStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('state') && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError('state')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-sm font-medium">
            Código Postal *
          </Label>
          <Input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="Ej: 06700"
            maxLength={5}
            className={`max-w-xs ${getFieldError('postalCode') ? 'border-red-500' : ''}`}
          />
          {getFieldError('postalCode') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('postalCode')}</span>
            </div>
          )}
        </div>

        {/* Address Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">Consejos para una Dirección Precisa</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Incluye el número exterior e interior (si aplica)</div>
            <div>• Menciona la colonia, fraccionamiento o barrio</div>
            <div>• Agrega referencias como "entre calles" o "frente a"</div>
            <div>• Verifica que el código postal sea correcto</div>
            <div>• La dirección debe ser donde físicamente opera la farmacia</div>
          </div>
        </div>

        {/* Verification Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Verificación de Dirección</h4>
              <p className="text-sm text-yellow-800">
                Esta dirección será verificada durante el proceso de aprobación. 
                Asegúrate de que sea correcta y que la farmacia esté operando en esta ubicación.
              </p>
            </div>
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
