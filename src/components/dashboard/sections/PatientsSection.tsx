'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
import PatientModal from '../modals/PatientModal'
import PatientDetailModal from '../modals/PatientDetailModal'

type Patient = Database['public']['Tables']['patients']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default function PatientsSection() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          profiles (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowDetailModal(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setShowPatientModal(true)
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paciente?')) return

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)

      if (error) throw error
      
      setPatients(patients.filter(p => p.id !== patientId))
    } catch (error) {
      console.error('Error deleting patient:', error)
    }
  }

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pacientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista completa de todos tus pacientes registrados
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setEditingPatient(null)
              setShowPatientModal(true)
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Tabla de pacientes */}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Sangre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto de Emergencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Actualización
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-700">
                                {patient.profiles?.first_name?.[0]}{patient.profiles?.last_name?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.profiles?.first_name} {patient.profiles?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(patient.date_of_birth)} años
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.blood_type || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{patient.emergency_contact_name || 'No especificado'}</div>
                          <div className="text-gray-500">{patient.emergency_contact_phone || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda' : 'No hay pacientes registrados'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showPatientModal && (
        <PatientModal
          patient={editingPatient}
          onClose={() => {
            setShowPatientModal(false)
            setEditingPatient(null)
          }}
          onSave={() => {
            fetchPatients()
            setShowPatientModal(false)
            setEditingPatient(null)
          }}
        />
      )}

      {showDetailModal && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedPatient(null)
          }}
        />
      )}
    </div>
  )
}