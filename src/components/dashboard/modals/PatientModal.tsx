'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type Patient = Database['public']['Tables']['patients']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface PatientModalProps {
  patient?: Patient | null
  onClose: () => void
  onSave: () => void
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function PatientModal({ patient, onClose, onSave }: PatientModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Datos del perfil
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    // Datos del paciente
    date_of_birth: '',
    blood_type: '',
    allergies: [] as string[],
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })
  const [allergyInput, setAllergyInput] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.profiles?.first_name || '',
        last_name: patient.profiles?.last_name || '',
        email: patient.profiles?.email || '',
        phone: patient.profiles?.phone || '',
        date_of_birth: patient.date_of_birth || '',
        blood_type: patient.blood_type || '',
        allergies: patient.allergies || [],
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
      })
    }
  }, [patient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No hay sesión activa')

      if (patient) {
        // Actualizar paciente existente
        const { error: profileError } = await (supabase as any)
          .from('patients')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
          })
          .eq('id', patient.id)

        if (profileError) throw profileError

        const { error: patientError } = await (supabase as any)
          .from('patients')
          .update({
            date_of_birth: formData.date_of_birth || null,
            blood_type: formData.blood_type || null,
            allergies: formData.allergies.length > 0 ? formData.allergies : null,
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
          })
          .eq('id', patient.id)

        if (patientError) throw patientError
      } else {
        // Crear nuevo paciente usando Edge Function
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) throw new Error('No hay sesión activa')

        const response = await fetch('https://zonmvugejshdstymfdva.supabase.co/functions/v1/create-patient', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            patientData: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email,
              phone: formData.phone,
              date_of_birth: formData.date_of_birth,
              blood_type: formData.blood_type,
              allergies: formData.allergies,
              emergency_contact_name: formData.emergency_contact_name,
              emergency_contact_phone: formData.emergency_contact_phone,
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || 'Error al crear el paciente')
        }
      }

      onSave()
    } catch (error) {
      console.error('Error saving patient:', error)
      alert('Error al guardar el paciente. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const addAllergy = () => {
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergyInput.trim()]
      })
      setAllergyInput('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy)
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Información personal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    disabled={!!patient}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.blood_type}
                      onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    >
                      <option value="">Seleccionar</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alergias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alergias</label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Agregar alergia..."
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      Agregar
                    </button>
                  </div>
                  {formData.allergies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeAllergy(allergy)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contacto de emergencia */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nombre completo"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono de Emergencia</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Número de teléfono"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (patient ? 'Actualizar' : 'Crear Paciente')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}