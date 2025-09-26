'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, MapPin, Phone, Mail, FileText, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 
  'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda', 
  'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 
  'Vargas', 'Yaracuy', 'Zulia', 'Distrito Capital'
]

const CLINIC_TYPES = [
  { value: 'general', label: 'Clínica General' },
  { value: 'specialty', label: 'Clínica Especializada' },
  { value: 'diagnostic', label: 'Centro de Diagnóstico' },
  { value: 'ambulatory', label: 'Centro Ambulatorio' },
  { value: 'emergency', label: 'Centro de Emergencias' },
  { value: 'rehabilitation', label: 'Centro de Rehabilitación' }
]

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
  description: string
  emergency_contact_name: string
  emergency_contact_phone: string
}

export default function ClinicRegistrationPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState<ClinicFormData>({
    clinic_name: '',
    legal_name: '',
    rif: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    clinic_type: '',
    description: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  const [validation, setValidation] = useState<Record<string, string>>({})

  const validateRIF = (rif: string): boolean => {
    const rifPattern = /^[JGVEP]-[0-9]{8}-[0-9]$/
    return rifPattern.test(rif)
  }

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phonePattern = /^(\+58|0)?[2-9][0-9]{9}$/
    return phonePattern.test(phone.replace(/\s|-/g, ''))
  }

  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.clinic_name.trim()) errors.clinic_name = 'El nombre de la clínica es requerido'
      if (!formData.legal_name.trim()) errors.legal_name = 'La razón social es requerida'
      if (!formData.rif.trim()) {
        errors.rif = 'El RIF es requerido'
      } else if (!validateRIF(formData.rif)) {
        errors.rif = 'Formato de RIF inválido. Debe ser: J-12345678-1'
      }
      if (!formData.email.trim()) {
        errors.email = 'El email es requerido'
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Formato de email inválido'
      }
    }

    if (stepNumber === 2) {
      if (!formData.phone.trim()) {
        errors.phone = 'El teléfono es requerido'
      } else if (!validatePhone(formData.phone)) {
        errors.phone = 'Formato de teléfono inválido'
      }
      if (!formData.address.trim()) errors.address = 'La dirección es requerida'
      if (!formData.city.trim()) errors.city = 'La ciudad es requerida'
      if (!formData.state) errors.state = 'El estado es requerido'
      if (!formData.clinic_type) errors.clinic_type = 'El tipo de clínica es requerido'
    }

    if (stepNumber === 3) {
      if (!formData.emergency_contact_name.trim()) errors.emergency_contact_name = 'El contacto de emergencia es requerido'
      if (!formData.emergency_contact_phone.trim()) {
        errors.emergency_contact_phone = 'El teléfono de emergencia es requerido'
      } else if (!validatePhone(formData.emergency_contact_phone)) {
        errors.emergency_contact_phone = 'Formato de teléfono inválido'
      }
    }

    setValidation(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof ClinicFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validation[field]) {
      setValidation(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setLoading(true)
    setError('')

    try {
      // First, check if email or RIF already exists
      const { data: existingClinic } = await supabase
        .from('clinic_registrations')
        .select('email, rif')
        .or(`email.eq.${formData.email},rif.eq.${formData.rif}`)
        .single()

      if (existingClinic) {
        if (existingClinic.email === formData.email) {
          setError('Ya existe una clínica registrada con este email')
          return
        }
        if (existingClinic.rif === formData.rif) {
          setError('Ya existe una clínica registrada con este RIF')
          return
        }
      }

      // Create clinic registration
      const { data: registration, error: regError } = await supabase
        .from('clinic_registrations')
        .insert([{
          ...formData,
          registration_step: 'completed',
          status: 'pending',
          verification_status: 'pending'
        }])
        .select()
        .single()

      if (regError) throw regError

      toast({
        title: "¡Registro exitoso!",
        description: "Tu clínica ha sido registrada. Recibirás un email con los próximos pasos.",
      })

      // Redirect to success page or dashboard
      router.push('/auth/register/clinic/success')

    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Error al registrar la clínica. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Información Básica</h2>
              <p className="text-gray-600">Datos generales de tu clínica</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="clinic_name">Nombre de la Clínica *</Label>
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => handleInputChange('clinic_name', e.target.value)}
                  placeholder="Ej: Clínica Santa María"
                  className={validation.clinic_name ? 'border-red-500' : ''}
                />
                {validation.clinic_name && (
                  <p className="text-sm text-red-500 mt-1">{validation.clinic_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="legal_name">Razón Social *</Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name}
                  onChange={(e) => handleInputChange('legal_name', e.target.value)}
                  placeholder="Nombre legal de la empresa"
                  className={validation.legal_name ? 'border-red-500' : ''}
                />
                {validation.legal_name && (
                  <p className="text-sm text-red-500 mt-1">{validation.legal_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rif">RIF *</Label>
                <Input
                  id="rif"
                  value={formData.rif}
                  onChange={(e) => handleInputChange('rif', e.target.value.toUpperCase())}
                  placeholder="J-12345678-1"
                  className={validation.rif ? 'border-red-500' : ''}
                />
                {validation.rif && (
                  <p className="text-sm text-red-500 mt-1">{validation.rif}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Corporativo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@clinica.com"
                  className={validation.email ? 'border-red-500' : ''}
                />
                {validation.email && (
                  <p className="text-sm text-red-500 mt-1">{validation.email}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Ubicación y Contacto</h2>
              <p className="text-gray-600">Información de contacto y ubicación</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="phone">Teléfono Principal *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0212-1234567 o +58212-1234567"
                  className={validation.phone ? 'border-red-500' : ''}
                />
                {validation.phone && (
                  <p className="text-sm text-red-500 mt-1">{validation.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Dirección Completa *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Dirección completa con referencias"
                  className={validation.address ? 'border-red-500' : ''}
                />
                {validation.address && (
                  <p className="text-sm text-red-500 mt-1">{validation.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Ciudad"
                    className={validation.city ? 'border-red-500' : ''}
                  />
                  {validation.city && (
                    <p className="text-sm text-red-500 mt-1">{validation.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className={validation.state ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENEZUELAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validation.state && (
                    <p className="text-sm text-red-500 mt-1">{validation.state}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="clinic_type">Tipo de Clínica *</Label>
                <Select value={formData.clinic_type} onValueChange={(value) => handleInputChange('clinic_type', value)}>
                  <SelectTrigger className={validation.clinic_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLINIC_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validation.clinic_type && (
                  <p className="text-sm text-red-500 mt-1">{validation.clinic_type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Breve descripción de los servicios que ofrece la clínica"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Contacto de Emergencia</h2>
              <p className="text-gray-600">Información para casos de emergencia</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Nombre del Contacto de Emergencia *</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Nombre completo"
                  className={validation.emergency_contact_name ? 'border-red-500' : ''}
                />
                {validation.emergency_contact_name && (
                  <p className="text-sm text-red-500 mt-1">{validation.emergency_contact_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia *</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  placeholder="0212-1234567 o +58212-1234567"
                  className={validation.emergency_contact_phone ? 'border-red-500' : ''}
                />
                {validation.emergency_contact_phone && (
                  <p className="text-sm text-red-500 mt-1">{validation.emergency_contact_phone}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Resumen del Registro</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Clínica:</strong> {formData.clinic_name}</p>
                <p><strong>RIF:</strong> {formData.rif}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Ubicación:</strong> {formData.city}, {formData.state}</p>
                <p><strong>Tipo:</strong> {CLINIC_TYPES.find(t => t.value === formData.clinic_type)?.label}</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Al completar el registro, recibirás un email con instrucciones para verificar tu clínica 
                y completar el proceso de activación.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro de Clínica
          </h1>
          <p className="text-gray-600">
            Únete a la red de clínicas más grande de Venezuela
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${step >= stepNumber 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'}`}>
                  {step > stepNumber ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Información Básica
            </span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Ubicación
            </span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Contacto
            </span>
          </div>
        </div>

        {/* Main Card */}
        <Card>
          <CardContent className="p-8">
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={handlePrevious} disabled={loading}>
                    Anterior
                  </Button>
                )}
              </div>

              <div>
                {step < 3 ? (
                  <Button onClick={handleNext} disabled={loading}>
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Registrando...' : 'Completar Registro'}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            ¿Necesitas ayuda? Contacta nuestro soporte en{' '}
            <a href="mailto:soporte@platform-medicos.com" className="text-blue-600 hover:underline">
              soporte@platform-medicos.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
