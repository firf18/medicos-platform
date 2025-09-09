'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, FileText, Phone, Mail, AlertTriangle, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type Patient = Database['public']['Tables']['patients']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

type Appointment = Database['public']['Tables']['appointments']['Row']
type MedicalRecord = Database['public']['Tables']['medical_records']['Row']

interface PatientDetailModalProps {
  patient: Patient
  onClose: () => void
}

export default function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchPatientData()
  }, [patient.id])

  const fetchPatientData = async () => {
    try {
      // Obtener citas
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: false })

      // Obtener registros médicos
      const { data: recordsData } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })

      setAppointments(appointmentsData || [])
      setMedicalRecords(recordsData || [])
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'No especificado'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} años`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const tabs = [
    { id: 'info', name: 'Información General', icon: FileText },
    { id: 'appointments', name: 'Citas', icon: Calendar },
    { id: 'records', name: 'Historial Médico', icon: Heart },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-indigo-700">
                        {patient.profiles?.first_name?.[0]}{patient.profiles?.last_name?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {patient.profiles?.first_name} {patient.profiles?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Paciente desde {formatDate(patient.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Información personal */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-500">{patient.profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Teléfono</p>
                          <p className="text-sm text-gray-500">{patient.profiles?.phone || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Edad</p>
                          <p className="text-sm text-gray-500">{calculateAge(patient.date_of_birth)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tipo de Sangre</p>
                          <p className="text-sm text-gray-500">{patient.blood_type || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alergias */}
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        Alergias
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contacto de emergencia */}
                  {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Contacto de Emergencia</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.emergency_contact_name || 'No especificado'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient.emergency_contact_phone || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Historial de Citas</h4>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(appointment.appointment_date)}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          {appointment.diagnosis && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Diagnóstico:</strong> {appointment.diagnosis}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-sm text-gray-600">
                              <strong>Notas:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
                  )}
                </div>
              )}

              {activeTab === 'records' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Historial Médico</h4>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {medicalRecords.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(record.created_at)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Diagnóstico:</strong> {record.diagnosis}
                          </p>
                          {record.treatment && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Tratamiento:</strong> {record.treatment}
                            </p>
                          )}
                          {record.notes && (
                            <p className="text-sm text-gray-600">
                              <strong>Notas:</strong> {record.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay registros médicos</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}