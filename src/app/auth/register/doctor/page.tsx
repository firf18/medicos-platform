'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Stethoscope, Upload, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DoctorFormData {
  // Datos personales
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  dateOfBirth: string
  
  // Datos profesionales
  medicalLicense: string
  specialization: string
  yearsOfExperience: string
  institution: string
  
  // Verificación
  licenseDocument: File | null
  profilePhoto: File | null
}

export default function DoctorRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<DoctorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    medicalLicense: '',
    specialization: '',
    yearsOfExperience: '',
    institution: '',
    licenseDocument: null,
    profilePhoto: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileChange = (field: 'licenseDocument' | 'profilePhoto', file: File | null) => {
    setFormData({ ...formData, [field]: file })
  }

  const validateStep = (step: number): boolean => {
    setError('')
    
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          setError('Por favor completa todos los campos obligatorios')
          return false
        }
        if (!formData.email.includes('@')) {
          setError('Por favor ingresa un email válido')
          return false
        }
        return true
        
      case 2:
        if (!formData.password || !formData.confirmPassword) {
          setError('Por favor completa todos los campos de contraseña')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden')
          return false
        }
        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres')
          return false
        }
        return true
        
      case 3:
        if (!formData.medicalLicense || !formData.specialization || !formData.yearsOfExperience) {
          setError('Por favor completa todos los campos profesionales')
          return false
        }
        return true
        
      case 4:
        if (!formData.licenseDocument) {
          setError('Por favor sube una copia de tu cédula profesional')
          return false
        }
        return true
        
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    
    setLoading(true)
    setError('')

    try {
      // Registrar usuario en auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            role: 'doctor',
            user_type: 'doctor',
            medical_license: formData.medicalLicense,
            specialization: formData.specialization,
            years_of_experience: formData.yearsOfExperience,
            institution: formData.institution,
            verification_status: 'pending'
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // TODO: Aquí subiríamos los documentos a Supabase Storage
        // Por ahora solo redirigimos a verificación
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}&type=doctor`)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Configurar Contraseña</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">Mínimo 6 caracteres</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña *</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Profesional</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Cédula Profesional *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.medicalLicense}
                onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Especialización *</label>
              <select
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
              >
                <option value="">Selecciona una especialización</option>
                <option value="medicina_general">Medicina General</option>
                <option value="cardiologia">Cardiología</option>
                <option value="dermatologia">Dermatología</option>
                <option value="neurologia">Neurología</option>
                <option value="pediatria">Pediatría</option>
                <option value="ginecologia">Ginecología</option>
                <option value="traumatologia">Traumatología</option>
                <option value="psiquiatria">Psiquiatría</option>
                <option value="oftalmologia">Oftalmología</option>
                <option value="otorrinolaringologia">Otorrinolaringología</option>
                <option value="otra">Otra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Años de Experiencia *</label>
              <select
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
              >
                <option value="">Selecciona años de experiencia</option>
                <option value="0-2">0-2 años</option>
                <option value="3-5">3-5 años</option>
                <option value="6-10">6-10 años</option>
                <option value="11-15">11-15 años</option>
                <option value="16-20">16-20 años</option>
                <option value="20+">Más de 20 años</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institución/Hospital</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
              />
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Verificación de Documentos</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cédula Profesional *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Subir archivo</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('licenseDocument', e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG hasta 10MB</p>
                  {formData.licenseDocument && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {formData.licenseDocument.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Foto de Perfil (Opcional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Subir foto</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('profilePhoto', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG hasta 5MB</p>
                  {formData.profilePhoto && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {formData.profilePhoto.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <Stethoscope className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Médico
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Paso {currentStep} de 4
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <div>
              {currentStep === 1 ? (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Completar Registro'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/auth/login" 
            className="text-indigo-600 hover:text-indigo-500"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}