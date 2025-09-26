'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, ArrowLeft, CheckCircle2, Shield, FileText, Users } from 'lucide-react'
import { PharmacyRegistrationData } from '@/types/database/pharmacies.types'
import Link from 'next/link'

interface PharmacyTermsStepProps {
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
  onFinalSubmit: () => void
}

export function PharmacyTermsStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  errors,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  onFinalSubmit
}: PharmacyTermsStepProps) {
  const [formData, setFormData] = useState({
    acceptTerms: data.acceptTerms || false,
    acceptPrivacyPolicy: data.acceptPrivacyPolicy || false,
    acceptDataProcessing: data.acceptDataProcessing || false
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    setFormData({
      acceptTerms: data.acceptTerms || false,
      acceptPrivacyPolicy: data.acceptPrivacyPolicy || false,
      acceptDataProcessing: data.acceptDataProcessing || false
    })
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los Términos y Condiciones'
    }

    if (!formData.acceptPrivacyPolicy) {
      errors.acceptPrivacyPolicy = 'Debes aceptar la Política de Privacidad'
    }

    if (!formData.acceptDataProcessing) {
      errors.acceptDataProcessing = 'Debes aceptar el procesamiento de datos'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = () => {
    if (validateForm()) {
      updateData(formData)
      onFinalSubmit()
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

  // Summary of registration data
  const getSummaryData = () => {
    return {
      basicInfo: {
        pharmacyName: data.pharmacyName,
        email: data.email,
        phone: data.phone
      },
      location: {
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode
      },
      legal: {
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType,
        businessType: data.businessType
      },
      services: {
        count: data.services?.length || 0,
        specialties: data.specialties?.length || 0
      },
      documents: {
        count: data.documents?.length || 0
      }
    }
  }

  const summary = getSummaryData()

  return (
    <div className="space-y-6">
      {/* Registration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-orange-700 flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Resumen de Registro</span>
          </CardTitle>
          <CardDescription>
            Revisa la información antes de finalizar tu registro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSummary(!showSummary)}
            className="mb-4"
          >
            {showSummary ? 'Ocultar' : 'Ver'} Resumen Completo
          </Button>
          
          {showSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Información Básica</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Farmacia:</strong> {summary.basicInfo.pharmacyName}</p>
                    <p><strong>Email:</strong> {summary.basicInfo.email}</p>
                    <p><strong>Teléfono:</strong> {summary.basicInfo.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Ubicación</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Dirección:</strong> {summary.location.address}</p>
                    <p><strong>Ciudad:</strong> {summary.location.city}, {summary.location.state}</p>
                    <p><strong>CP:</strong> {summary.location.postalCode}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Información Legal</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Licencia:</strong> {summary.legal.licenseNumber}</p>
                    <p><strong>Tipo:</strong> {summary.legal.licenseType}</p>
                    <p><strong>Negocio:</strong> {summary.legal.businessType}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Servicios y Documentos</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Servicios:</strong> {summary.services.count} seleccionados</p>
                    <p><strong>Especialidades:</strong> {summary.services.specialties} seleccionadas</p>
                    <p><strong>Documentos:</strong> {summary.documents.count} subidos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-orange-600" />
          <span>Términos y Condiciones</span>
        </h3>

        {/* Terms of Service */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Términos y Condiciones de Servicio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 w-full border rounded p-3 text-sm">
                <div className="space-y-2 text-gray-700">
                  <p><strong>1. Aceptación de Términos</strong></p>
                  <p>Al registrarte en Red-Salud, aceptas cumplir con estos términos y condiciones.</p>
                  
                  <p><strong>2. Uso de la Plataforma</strong></p>
                  <p>Te comprometes a usar la plataforma de manera ética y legal, cumpliendo con todas las regulaciones aplicables.</p>
                  
                  <p><strong>3. Responsabilidades</strong></p>
                  <p>Eres responsable de mantener actualizada tu información y cumplir con las normas farmacéuticas vigentes.</p>
                  
                  <p><strong>4. Privacidad y Datos</strong></p>
                  <p>Protegemos tu información según nuestra Política de Privacidad y las leyes aplicables.</p>
                  
                  <p><strong>5. Modificaciones</strong></p>
                  <p>Nos reservamos el derecho de modificar estos términos con previo aviso.</p>
                </div>
              </ScrollArea>
              
              <div className="flex items-start space-x-3 mt-4">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleCheckboxChange('acceptTerms', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                    Acepto los{' '}
                    <Link href="/terminos" className="text-orange-600 hover:underline" target="_blank">
                      Términos y Condiciones de Servicio
                    </Link>{' '}
                    de Red-Salud
                  </Label>
                  {getFieldError('acceptTerms') && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{getFieldError('acceptTerms')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span>Política de Privacidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 w-full border rounded p-3 text-sm">
                <div className="space-y-2 text-gray-700">
                  <p><strong>1. Recopilación de Información</strong></p>
                  <p>Recopilamos información necesaria para proporcionar nuestros servicios de manera segura y eficiente.</p>
                  
                  <p><strong>2. Uso de la Información</strong></p>
                  <p>Utilizamos tu información para verificar credenciales, facilitar conexiones profesionales y mejorar nuestros servicios.</p>
                  
                  <p><strong>3. Protección de Datos</strong></p>
                  <p>Implementamos medidas de seguridad robustas para proteger tu información personal y profesional.</p>
                  
                  <p><strong>4. Compartir Información</strong></p>
                  <p>No compartimos tu información personal con terceros sin tu consentimiento explícito.</p>
                  
                  <p><strong>5. Derechos del Usuario</strong></p>
                  <p>Tienes derecho a acceder, modificar o eliminar tu información personal en cualquier momento.</p>
                </div>
              </ScrollArea>
              
              <div className="flex items-start space-x-3 mt-4">
                <Checkbox
                  id="acceptPrivacyPolicy"
                  checked={formData.acceptPrivacyPolicy}
                  onCheckedChange={(checked) => handleCheckboxChange('acceptPrivacyPolicy', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="acceptPrivacyPolicy" className="text-sm cursor-pointer">
                    Acepto la{' '}
                    <Link href="/privacidad" className="text-orange-600 hover:underline" target="_blank">
                      Política de Privacidad
                    </Link>{' '}
                    de Red-Salud
                  </Label>
                  {getFieldError('acceptPrivacyPolicy') && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{getFieldError('acceptPrivacyPolicy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Processing */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Autorización de Procesamiento de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 mb-4 space-y-2">
                <p>
                  Autorizo a Red-Salud a procesar mis datos personales y profesionales para:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Verificar mi identidad y credenciales profesionales</li>
                  <li>Facilitar conexiones con pacientes y otros profesionales</li>
                  <li>Enviar comunicaciones relacionadas con el servicio</li>
                  <li>Mejorar la seguridad y calidad de la plataforma</li>
                  <li>Cumplir con requisitos legales y regulatorios</li>
                </ul>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptDataProcessing"
                  checked={formData.acceptDataProcessing}
                  onCheckedChange={(checked) => handleCheckboxChange('acceptDataProcessing', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="acceptDataProcessing" className="text-sm cursor-pointer">
                    Autorizo el procesamiento de mis datos personales según se describe arriba
                  </Label>
                  {getFieldError('acceptDataProcessing') && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{getFieldError('acceptDataProcessing')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Proceso de Verificación</h4>
          <p className="text-sm text-orange-800">
            Una vez completado el registro, nuestro equipo verificará tu información y documentos. 
            Este proceso puede tomar de 1 a 3 días hábiles. Te notificaremos por correo electrónico 
            sobre el estado de tu solicitud.
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
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Finalizar Registro</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
