'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, ArrowRight, ArrowLeft, Calendar } from 'lucide-react'
import { PharmacyRegistrationData, PharmacyLicenseType } from '@/types/database/pharmacies.types'

interface PharmacyLegalInfoStepProps {
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

export function PharmacyLegalInfoStep({
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
}: PharmacyLegalInfoStepProps) {
  const [formData, setFormData] = useState({
    rfc: data.rfc || '',
    curp: data.curp || '',
    licenseNumber: data.licenseNumber || '',
    licenseType: data.licenseType || '' as PharmacyLicenseType,
    licenseIssuer: data.licenseIssuer || '',
    licenseExpiryDate: data.licenseExpiryDate || '',
    cofeprisRegistration: data.cofeprisRegistration || '',
    sanitaryPermit: data.sanitaryPermit || ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const licenseTypes = [
    { value: 'farmacia', label: 'Farmacia' },
    { value: 'farmacia_hospitalaria', label: 'Farmacia Hospitalaria' },
    { value: 'farmacia_veterinaria', label: 'Farmacia Veterinaria' },
    { value: 'botica', label: 'Botica' }
  ]

  useEffect(() => {
    setFormData({
      rfc: data.rfc || '',
      curp: data.curp || '',
      licenseNumber: data.licenseNumber || '',
      licenseType: data.licenseType || '' as PharmacyLicenseType,
      licenseIssuer: data.licenseIssuer || '',
      licenseExpiryDate: data.licenseExpiryDate || '',
      cofeprisRegistration: data.cofeprisRegistration || '',
      sanitaryPermit: data.sanitaryPermit || ''
    })
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'El número de licencia es requerido'
    }

    if (!formData.licenseType) {
      errors.licenseType = 'El tipo de licencia es requerido'
    }

    if (!formData.licenseIssuer.trim()) {
      errors.licenseIssuer = 'El emisor de la licencia es requerido'
    }

    if (!formData.licenseExpiryDate) {
      errors.licenseExpiryDate = 'La fecha de vencimiento de la licencia es requerida'
    } else {
      const expiryDate = new Date(formData.licenseExpiryDate)
      const today = new Date()
      if (expiryDate <= today) {
        errors.licenseExpiryDate = 'La licencia debe estar vigente'
      }
    }

    if (formData.rfc && !/^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/.test(formData.rfc.toUpperCase())) {
      errors.rfc = 'Formato de RFC inválido'
    }

    if (formData.curp && !/^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(formData.curp.toUpperCase())) {
      errors.curp = 'Formato de CURP inválido'
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
        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="text-sm font-medium">
            Número de Licencia Sanitaria *
          </Label>
          <Input
            id="licenseNumber"
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Ej: LS-123456"
            className={getFieldError('licenseNumber') ? 'border-red-500' : ''}
          />
          {getFieldError('licenseNumber') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('licenseNumber')}</span>
            </div>
          )}
        </div>

        {/* License Type */}
        <div className="space-y-2">
          <Label htmlFor="licenseType" className="text-sm font-medium">
            Tipo de Licencia *
          </Label>
          <Select value={formData.licenseType} onValueChange={(value) => handleInputChange('licenseType', value)}>
            <SelectTrigger className={getFieldError('licenseType') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona el tipo de licencia" />
            </SelectTrigger>
            <SelectContent>
              {licenseTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('licenseType') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('licenseType')}</span>
            </div>
          )}
        </div>

        {/* License Issuer */}
        <div className="space-y-2">
          <Label htmlFor="licenseIssuer" className="text-sm font-medium">
            Emisor de la Licencia *
          </Label>
          <Input
            id="licenseIssuer"
            type="text"
            value={formData.licenseIssuer}
            onChange={(e) => handleInputChange('licenseIssuer', e.target.value)}
            placeholder="Ej: COFEPRIS, Secretaría de Salud del Estado"
            className={getFieldError('licenseIssuer') ? 'border-red-500' : ''}
          />
          {getFieldError('licenseIssuer') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('licenseIssuer')}</span>
            </div>
          )}
        </div>

        {/* License Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="licenseExpiryDate" className="text-sm font-medium">
            Fecha de Vencimiento de la Licencia *
          </Label>
          <div className="relative">
            <Input
              id="licenseExpiryDate"
              type="date"
              value={formData.licenseExpiryDate}
              onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
              className={getFieldError('licenseExpiryDate') ? 'border-red-500' : ''}
            />
            <Calendar className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
          </div>
          {getFieldError('licenseExpiryDate') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('licenseExpiryDate')}</span>
            </div>
          )}
        </div>

        {/* RFC */}
        <div className="space-y-2">
          <Label htmlFor="rfc" className="text-sm font-medium">
            RFC
          </Label>
          <Input
            id="rfc"
            type="text"
            value={formData.rfc}
            onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
            placeholder="Ej: ABC123456XYZ"
            className={getFieldError('rfc') ? 'border-red-500' : ''}
            maxLength={13}
          />
          {getFieldError('rfc') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('rfc')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Requerido para personas morales o físicas con actividad empresarial
          </p>
        </div>

        {/* CURP */}
        <div className="space-y-2">
          <Label htmlFor="curp" className="text-sm font-medium">
            CURP
          </Label>
          <Input
            id="curp"
            type="text"
            value={formData.curp}
            onChange={(e) => handleInputChange('curp', e.target.value.toUpperCase())}
            placeholder="Ej: ABCD123456HDFABC01"
            className={getFieldError('curp') ? 'border-red-500' : ''}
            maxLength={18}
          />
          {getFieldError('curp') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('curp')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Requerido para personas físicas
          </p>
        </div>

        {/* COFEPRIS Registration */}
        <div className="space-y-2">
          <Label htmlFor="cofeprisRegistration" className="text-sm font-medium">
            Registro COFEPRIS
          </Label>
          <Input
            id="cofeprisRegistration"
            type="text"
            value={formData.cofeprisRegistration}
            onChange={(e) => handleInputChange('cofeprisRegistration', e.target.value)}
            placeholder="Ej: COF-123456"
            className={getFieldError('cofeprisRegistration') ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">
            Número de registro en COFEPRIS (opcional)
          </p>
        </div>

        {/* Sanitary Permit */}
        <div className="space-y-2">
          <Label htmlFor="sanitaryPermit" className="text-sm font-medium">
            Permiso Sanitario
          </Label>
          <Input
            id="sanitaryPermit"
            type="text"
            value={formData.sanitaryPermit}
            onChange={(e) => handleInputChange('sanitaryPermit', e.target.value)}
            placeholder="Ej: PS-123456"
            className={getFieldError('sanitaryPermit') ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">
            Permiso sanitario local (opcional)
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
