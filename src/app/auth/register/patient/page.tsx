'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Upload, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PatientFormData {
  // Datos personales
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  dateOfBirth: string
  
  // Datos médicos básicos
  bloodType: string
  allergies: string
  chronicConditions: string
  currentMedications: string
  
  // Contacto de emergencia
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  
  // Opcionales
  profilePhoto: File | null
}

export default function PatientRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    profilePhoto: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileChange = (file: File | null) => {
    setFormData({ ...formData, profilePhoto: file })
  }

  const validateStep = (step: number): boolean => {
    setError('')
    
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth) {
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
        if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
          setError('Por favor completa la información del contacto de emergencia')
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
    if (!validateStep(3)) return
    
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
            date_of_birth: formData.dateOfBirth,
            role: 'patient',
            user_type: 'patient',
            blood_type: formData.bloodType,
            allergies: formData.allergies,
            chronic_conditions: formData.chronicConditions,
            current_medications: formData.currentMedications,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone,
            emergency_contact_relation: formData.emergencyContactRelation
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // TODO: Aquí subiríamos la foto de perfil a Supabase Storage
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}&type=patient`)
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento *</label>
              <input
                type="date"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contacto de Emergencia</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Contacto *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono del Contacto *</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relación</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.emergencyContactRelation}
                onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
              >
                <option value="">Selecciona relación</option>
                <option value="madre">Madre</option>
                <option value="padre">Padre</option>
                <option value="esposo/a">Esposo/a</option>
                <option value="hermano/a">Hermano/a</option>
                <option value="hijo/a">Hijo/a</option>
                <option value="amigo/a">Amigo/a</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Médica (Opcional)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.bloodType}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
              >
                <option value="">Selecciona tipo de sangre</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alergias</label>
              <textarea
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Describe cualquier alergia conocida..."
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condiciones Crónicas</label>
              <textarea
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Diabetes, hipertensión, etc..."
                value={formData.chronicConditions}
                onChange={(e) => handleInputChange('chronicConditions', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medicamentos Actuales</label>
              <textarea
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Lista de medicamentos que tomas regularmente..."
                value={formData.currentMedications}
                onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Foto de Perfil (Opcional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                      <span>Subir foto</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
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
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-emerald-100">
            <Heart className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Paciente
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Paso {currentStep} de 4
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
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
            className="text-emerald-600 hover:text-emerald-500"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}