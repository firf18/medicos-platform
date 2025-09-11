'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
import { CheckCircle, ArrowRight, Stethoscope, User, FileText } from 'lucide-react'

type Specialty = Database['public']['Tables']['specialties']['Row']

export default function SetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    specialty_id: '',
    license_number: '',
    experience_years: '',
    bio: '',
    consultation_fee: '',
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSpecialties()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      router.push('/auth/login')
      return
    }

    // Verificar si es médico
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', session.session.user.id)
      .single()

    // Verificar si es clínica
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', session.session.user.id)
      .single()

    // Verificar si es laboratorio
    const { data: laboratory, error: laboratoryError } = await supabase
      .from('laboratories')
      .select('id')
      .eq('id', session.session.user.id)
      .single()

    // Redirigir según el rol
    if (doctor && !doctorError) {
      // Es médico, continuar con este asistente
      return
    } else if (clinic && !clinicError) {
      // Es clínica, redirigir al asistente de clínicas
      router.push('/auth/setup-wizard/clinic')
      return
    } else if (laboratory && !laboratoryError) {
      // Es laboratorio, redirigir al asistente de laboratorios
      router.push('/auth/setup-wizard/laboratory')
      return
    } else {
      // No es ninguno de los roles esperados
      router.push('/unauthorized')
    }
  }

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name')

      if (error) throw error
      setSpecialties(data || [])
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No hay sesión activa')

      // Actualizar información del doctor
      const { error } = await (supabase as any)
        .from('doctors')
        .update({
          specialty_id: parseInt(formData.specialty_id),
          license_number: formData.license_number,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          bio: formData.bio || null,
          consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        })
        .eq('id', session.session.user.id)

      if (error) throw error

      router.push('/doctor/dashboard')
    } catch (error) {
      console.error('Error updating doctor info:', error)
      alert('Error al guardar la información. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, name: 'Especialidad', icon: Stethoscope },
    { id: 2, name: 'Información Profesional', icon: User },
    { id: 3, name: 'Perfil Completo', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Configuración Inicial
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Completa tu perfil profesional
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= step.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Selecciona tu Especialidad Médica
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Esto nos ayudará a personalizar tu dashboard con las herramientas específicas para tu práctica.
                </p>
                
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {specialties.map((specialty) => (
                    <label
                      key={specialty.id}
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.specialty_id === specialty.id.toString()
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="specialty"
                        value={specialty.id}
                        checked={formData.specialty_id === specialty.id.toString()}
                        onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {specialty.name}
                        </div>
                        {specialty.description && (
                          <div className="text-sm text-gray-500">
                            {specialty.description}
                          </div>
                        )}
                      </div>
                      {formData.specialty_id === specialty.id.toString() && (
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información Profesional
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Proporciona tu información profesional básica.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número de Cédula Profesional *
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      placeholder="Ej: 12345678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      placeholder="Ej: 5"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Completa tu Perfil
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Información adicional para tu perfil profesional.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Biografía Profesional
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Describe tu experiencia, formación y enfoque profesional..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tarifa de Consulta (MXN)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.consultation_fee}
                      onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                      placeholder="Ej: 800.00"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.specialty_id}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading || !formData.license_number}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Finalizar Configuración'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}