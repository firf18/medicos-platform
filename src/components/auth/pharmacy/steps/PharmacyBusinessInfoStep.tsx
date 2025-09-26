'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, ArrowRight, ArrowLeft, Building } from 'lucide-react'
import { PharmacyRegistrationData, PharmacyBusinessType } from '@/types/database/pharmacies.types'

interface PharmacyBusinessInfoStepProps {
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

export function PharmacyBusinessInfoStep({
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
}: PharmacyBusinessInfoStepProps) {
  const [formData, setFormData] = useState({
    businessType: data.businessType || '' as PharmacyBusinessType,
    taxRegime: data.taxRegime || ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const businessTypes = [
    { value: 'individual', label: 'Persona Física' },
    { value: 'corporation', label: 'Persona Moral (S.A. de C.V.)' },
    { value: 'partnership', label: 'Sociedad (S. de R.L.)' },
    { value: 'cooperative', label: 'Cooperativa' }
  ]

  const taxRegimes = [
    { value: 'RIF', label: 'Régimen de Incorporación Fiscal' },
    { value: 'RESICO', label: 'Régimen Simplificado de Confianza' },
    { value: 'General', label: 'Régimen General de Ley' },
    { value: 'SAT_002', label: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { value: 'SAT_601', label: 'General de Ley Personas Morales' },
    { value: 'SAT_603', label: 'Personas Morales con Fines no Lucrativos' },
    { value: 'SAT_605', label: 'Sueldos y Salarios' },
    { value: 'SAT_606', label: 'Arrendamiento' },
    { value: 'SAT_607', label: 'Régimen de Enajenación o Adquisición de Bienes' },
    { value: 'SAT_608', label: 'Demás ingresos' },
    { value: 'SAT_610', label: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
    { value: 'SAT_611', label: 'Ingresos por Dividendos (socios y accionistas)' },
    { value: 'SAT_612', label: 'Personas Físicas con Actividades Empresariales y Profesionales' },
    { value: 'SAT_614', label: 'Ingresos por intereses' },
    { value: 'SAT_615', label: 'Régimen de los ingresos por obtención de premios' },
    { value: 'SAT_616', label: 'Sin obligaciones fiscales' },
    { value: 'SAT_620', label: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
    { value: 'SAT_621', label: 'Incorporación Fiscal' },
    { value: 'SAT_622', label: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
    { value: 'SAT_623', label: 'Opcional para Grupos de Sociedades' },
    { value: 'SAT_624', label: 'Coordinados' },
    { value: 'SAT_625', label: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
    { value: 'SAT_626', label: 'Régimen Simplificado de Confianza' }
  ]

  useEffect(() => {
    setFormData({
      businessType: data.businessType || '' as PharmacyBusinessType,
      taxRegime: data.taxRegime || ''
    })
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.businessType) {
      errors.businessType = 'El tipo de negocio es requerido'
    }

    if (!formData.taxRegime) {
      errors.taxRegime = 'El régimen fiscal es requerido'
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
          <Building className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Información Comercial y Fiscal
          </h3>
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-sm font-medium">
            Tipo de Negocio *
          </Label>
          <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
            <SelectTrigger className={getFieldError('businessType') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona el tipo de negocio" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('businessType') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('businessType')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Selecciona la estructura legal de tu farmacia
          </p>
        </div>

        {/* Tax Regime */}
        <div className="space-y-2">
          <Label htmlFor="taxRegime" className="text-sm font-medium">
            Régimen Fiscal *
          </Label>
          <Select value={formData.taxRegime} onValueChange={(value) => handleInputChange('taxRegime', value)}>
            <SelectTrigger className={getFieldError('taxRegime') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona tu régimen fiscal" />
            </SelectTrigger>
            <SelectContent>
              {taxRegimes.map((regime) => (
                <SelectItem key={regime.value} value={regime.value}>
                  {regime.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('taxRegime') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('taxRegime')}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Selecciona el régimen fiscal bajo el cual opera tu farmacia
          </p>
        </div>

        {/* Business Type Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">Información sobre Tipos de Negocio</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <div>
              <strong>Persona Física:</strong> Negocio individual, el propietario es responsable de todas las obligaciones.
            </div>
            <div>
              <strong>Persona Moral (S.A. de C.V.):</strong> Sociedad anónima, responsabilidad limitada al capital aportado.
            </div>
            <div>
              <strong>Sociedad (S. de R.L.):</strong> Sociedad de responsabilidad limitada, responsabilidad limitada a las aportaciones.
            </div>
            <div>
              <strong>Cooperativa:</strong> Sociedad cooperativa, participación democrática de los socios.
            </div>
          </div>
        </div>

        {/* Tax Regime Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Información sobre Regímenes Fiscales</h4>
          <div className="text-sm text-green-800 space-y-2">
            <div>
              <strong>RESICO:</strong> Régimen Simplificado de Confianza, para personas físicas y morales con ingresos hasta cierto límite.
            </div>
            <div>
              <strong>Régimen General:</strong> Para personas físicas con actividades empresariales y profesionales.
            </div>
            <div>
              <strong>Personas Morales:</strong> Régimen general para sociedades.
            </div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            <strong>Importante:</strong> Consulta con tu contador para asegurar que seleccionas el régimen correcto.
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
