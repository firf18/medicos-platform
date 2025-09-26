'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import CardiologyDashboard from './cardiology/CardiologyDashboard'
import NeurologyDashboard from './neurology/NeurologyDashboard'
import PediatricsDashboard from './pediatrics/PediatricsDashboard'
import GeneralSurgeryDashboard from './general-surgery/GeneralSurgeryDashboard'

// Lazy loading para otros dashboards que crearemos
import dynamic from 'next/dynamic'

const DermatologyDashboard = dynamic(() => import('./dermatology/DermatologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const PsychiatryDashboard = dynamic(() => import('./psychiatry/PsychiatryDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const InternalMedicineDashboard = dynamic(() => import('./internal-medicine/InternalMedicineDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const OrthopedicsDashboard = dynamic(() => import('./orthopedics/OrthopedicsDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const OphthalmologyDashboard = dynamic(() => import('./ophthalmology/OphthalmologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const GynecologyDashboard = dynamic(() => import('./gynecology/GynecologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const EndocrinologyDashboard = dynamic(() => import('./endocrinology/EndocrinologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const OncologyDashboard = dynamic(() => import('./oncology/OncologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const EmergencyMedicineDashboard = dynamic(() => import('./emergency-medicine/EmergencyMedicineDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const RadiologyDashboard = dynamic(() => import('./radiology/RadiologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

const AnesthesiologyDashboard = dynamic(() => import('./anesthesiology/AnesthesiologyDashboard'), {
  loading: () => <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
})

interface SpecialtyDashboardRouterProps {
  specialtyId?: string
}

export default function SpecialtyDashboardRouter({ specialtyId }: SpecialtyDashboardRouterProps) {
  const [user, setUser] = useState<User | null>(null)
  const [doctorSpecialty, setDoctorSpecialty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadUserAndSpecialty()
  }, [])

  const loadUserAndSpecialty = async () => {
    try {
      setLoading(true)
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      // Obtener especialidad del doctor
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('specialty_id')
        .eq('id', user.id)
        .single()

      if (doctorError) {
        console.error('Error loading doctor specialty:', doctorError)
        setError('Error al cargar la especialidad del doctor')
        return
      }

      setDoctorSpecialty(doctorData?.specialty_id || null)

    } catch (error) {
      console.error('Error loading user and specialty:', error)
      setError('Error al cargar datos del usuario')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard especializado...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={loadUserAndSpecialty}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Determinar qué especialidad usar (parámetro o especialidad del doctor)
  const targetSpecialty = specialtyId || doctorSpecialty

  if (!targetSpecialty) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Especialidad no encontrada</h2>
          <p className="text-gray-600 mb-4">
            No se pudo determinar su especialidad médica. Por favor, complete su perfil.
          </p>
          <a 
            href="/doctor/profile" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Completar Perfil
          </a>
        </div>
      </div>
    )
  }

  // Renderizar el dashboard apropiado según la especialidad
  const renderSpecialtyDashboard = () => {
    switch (targetSpecialty) {
      case 'cardiology':
        return <CardiologyDashboard />
      
      case 'neurology':
        return <NeurologyDashboard />
      
      case 'pediatrics':
        return <PediatricsDashboard />
      
      case 'general_surgery':
      case 'surgery':
        return <GeneralSurgeryDashboard />
      
      case 'dermatology':
        return <DermatologyDashboard />
      
      case 'psychiatry':
        return <PsychiatryDashboard />
      
      case 'internal_medicine':
        return <InternalMedicineDashboard />
      
      case 'orthopedics':
        return <OrthopedicsDashboard />
      
      case 'ophthalmology':
        return <OphthalmologyDashboard />
      
      case 'gynecology':
        return <GynecologyDashboard />
      
      case 'endocrinology':
        return <EndocrinologyDashboard />
      
      case 'oncology':
        return <OncologyDashboard />
      
      case 'emergency_medicine':
        return <EmergencyMedicineDashboard />
      
      case 'radiology':
        return <RadiologyDashboard />
      
      case 'anesthesiology':
        return <AnesthesiologyDashboard />
      
      default:
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard en Desarrollo</h2>
              <p className="text-gray-600 mb-4">
                El dashboard para la especialidad "{targetSpecialty}" está en desarrollo.
              </p>
              <p className="text-sm text-gray-500">
                Mientras tanto, puede usar el dashboard general.
              </p>
              <a 
                href="/dashboard" 
                className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Ir al Dashboard General
              </a>
            </div>
          </div>
        )
    }
  }

  return renderSpecialtyDashboard()
}

// Componente para seleccionar especialidad (para administradores o demos)
export function SpecialtySelector({ onSelect }: { onSelect: (specialtyId: string) => void }) {
  const specialties = [
    { id: 'cardiology', name: 'Cardiología', color: 'red' },
    { id: 'neurology', name: 'Neurología', color: 'purple' },
    { id: 'pediatrics', name: 'Pediatría', color: 'pink' },
    { id: 'general_surgery', name: 'Cirugía General', color: 'orange' },
    { id: 'dermatology', name: 'Dermatología', color: 'yellow' },
    { id: 'psychiatry', name: 'Psiquiatría', color: 'indigo' },
    { id: 'internal_medicine', name: 'Medicina Interna', color: 'blue' },
    { id: 'orthopedics', name: 'Ortopedia', color: 'green' },
    { id: 'ophthalmology', name: 'Oftalmología', color: 'teal' },
    { id: 'gynecology', name: 'Ginecología', color: 'rose' },
    { id: 'endocrinology', name: 'Endocrinología', color: 'amber' },
    { id: 'oncology', name: 'Oncología', color: 'gray' },
    { id: 'emergency_medicine', name: 'Medicina de Emergencia', color: 'red' },
    { id: 'radiology', name: 'Radiología', color: 'cyan' },
    { id: 'anesthesiology', name: 'Anestesiología', color: 'violet' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboards por Especialidad</h1>
          <p className="text-gray-600 mt-2">Seleccione una especialidad para ver su dashboard personalizado</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => onSelect(specialty.id)}
              className={`p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-${specialty.color}-500`}
            >
              <h3 className="text-lg font-medium text-gray-900">{specialty.name}</h3>
              <p className="text-sm text-gray-600 mt-2">Dashboard especializado</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
