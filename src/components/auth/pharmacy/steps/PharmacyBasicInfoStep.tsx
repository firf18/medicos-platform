'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { PharmacyRegistrationData } from '@/types/database/pharmacies.types'

interface PharmacyBasicInfoStepProps {
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

export function PharmacyBasicInfoStep({
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
}: PharmacyBasicInfoStepProps) {
  const [formData, setFormData] = useState({
    pharmacyName: data.pharmacyName || '',
    commercialName: data.commercialName || '',
    email: data.email || '',
    phone: data.phone || '',
    secondaryPhone: data.secondaryPhone || '',
    website: data.website || ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      pharmacyName: data.pharmacyName || '',
      commercialName: data.commercialName || '',
      email: data.email || '',
      phone: data.phone || '',
      secondaryPhone: data.secondaryPhone || '',
      website: data.website || ''
    })
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.pharmacyName.trim()) {
      errors.pharmacyName = 'El nombre de la farmacia es requerido'
    } else if (formData.pharmacyName.trim().length < 3) {
      errors.pharmacyName = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido'
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Ingresa un número de teléfono válido'
    }

    if (formData.secondaryPhone && !/^[\d\s\-\+\(\)]{10,15}$/.test(formData.secondaryPhone.replace(/\s/g, ''))) {
      errors.secondaryPhone = 'Ingresa un número de teléfono válido'
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Ingresa una URL válida (debe comenzar con http:// o https://)'
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
        {/* Pharmacy Name */}
        <div className="space-y-2">
          <Label htmlFor="pharmacyName" className="text-sm font-medium">
            Nombre de la Farmacia *
          </Label>
          <Input
            id="pharmacyName"
            type="text"
            value={formData.pharmacyName}
            onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
            placeholder="Ej: Farmacia San Miguel"
            className={getFieldError('pharmacyName') ? 'border-red-500' : ''}
          />
          {getFieldError('pharmacyName') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('pharmacyName')}</span>
            </div>
          )}
        </div>

        {/* Commercial Name */}
        <div className="space-y-2">
          <Label htmlFor="commercialName" className="text-sm font-medium">
            Nombre Comercial
          </Label>
          <Input
            id="commercialName"
            type="text"
            value={formData.commercialName}
            onChange={(e) => handleInputChange('commercialName', e.target.value)}
            placeholder="Ej: Farmacia San Miguel 24/7"
            className={getFieldError('commercialName') ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">
            Nombre comercial o marca registrada (opcional)
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Correo Electrónico *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="farmacia@ejemplo.com"
            className={getFieldError('email') ? 'border-red-500' : ''}
          />
          {getFieldError('email') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('email')}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Teléfono Principal *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Ej: (55) 1234-5678"
            className={getFieldError('phone') ? 'border-red-500' : ''}
          />
          {getFieldError('phone') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('phone')}</span>
            </div>
          )}
        </div>

        {/* Secondary Phone */}
        <div className="space-y-2">
          <Label htmlFor="secondaryPhone" className="text-sm font-medium">
            Teléfono Secundario
          </Label>
          <Input
            id="secondaryPhone"
            type="tel"
            value={formData.secondaryPhone}
            onChange={(e) => handleInputChange('secondaryPhone', e.target.value)}
            placeholder="Ej: (55) 9876-5432"
            className={getFieldError('secondaryPhone') ? 'border-red-500' : ''}
          />
          {getFieldError('secondaryPhone') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('secondaryPhone')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Teléfono adicional para emergencias o contacto alternativo
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            Sitio Web
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.farmaciaejemplo.com"
            className={getFieldError('website') ? 'border-red-500' : ''}
          />
          {getFieldError('website') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('website')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Sitio web de la farmacia (opcional)
          </p>
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
