import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface SpecialtyDataConfig {
  specialtyId: string
  useMockData?: boolean
}

export interface BaseSpecialtyStats {
  totalPatients: number
  todayAppointments: number
  pendingResults: number
  criticalAlerts: number
  monthlyRevenue: number
  patientSatisfaction: number
}

export interface PatientSummary {
  id: string
  name: string
  age: number
  lastVisit: string
  nextAppointment?: string
  status: 'stable' | 'monitoring' | 'critical'
}

export interface AppointmentSummary {
  id: string
  patientName: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export const useSpecialtyData = ({ specialtyId, useMockData = true }: SpecialtyDataConfig) => {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<BaseSpecialtyStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingResults: 0,
    criticalAlerts: 0,
    monthlyRevenue: 0,
    patientSatisfaction: 0
  })
  const [recentPatients, setRecentPatients] = useState<PatientSummary[]>([])
  const [todayAppointments, setTodayAppointments] = useState<AppointmentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadSpecialtyData()
  }, [specialtyId, useMockData])

  const loadSpecialtyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      if (useMockData) {
        // Usar datos simulados para demostración
        await loadMockData()
      } else {
        // Usar datos reales de Supabase
        await loadRealData(user.id)
      }

    } catch (error) {
      console.error('Error loading specialty data:', error)
      setError('Error al cargar datos de la especialidad')
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = async () => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Datos base simulados por especialidad
    const specialtyMockData: Record<string, Partial<BaseSpecialtyStats>> = {
      cardiology: {
        totalPatients: 156,
        todayAppointments: 8,
        pendingResults: 3,
        criticalAlerts: 2,
        monthlyRevenue: 125000,
        patientSatisfaction: 4.7
      },
      neurology: {
        totalPatients: 89,
        todayAppointments: 5,
        pendingResults: 2,
        criticalAlerts: 1,
        monthlyRevenue: 98000,
        patientSatisfaction: 4.8
      },
      pediatrics: {
        totalPatients: 234,
        todayAppointments: 12,
        pendingResults: 5,
        criticalAlerts: 0,
        monthlyRevenue: 145000,
        patientSatisfaction: 4.9
      },
      general_surgery: {
        totalPatients: 67,
        todayAppointments: 3,
        pendingResults: 1,
        criticalAlerts: 1,
        monthlyRevenue: 180000,
        patientSatisfaction: 4.6
      },
      dermatology: {
        totalPatients: 198,
        todayAppointments: 9,
        pendingResults: 4,
        criticalAlerts: 0,
        monthlyRevenue: 112000,
        patientSatisfaction: 4.8
      },
      emergency_medicine: {
        totalPatients: 45,
        todayAppointments: 15,
        pendingResults: 8,
        criticalAlerts: 4,
        monthlyRevenue: 95000,
        patientSatisfaction: 4.5
      },
      endocrinology: {
        totalPatients: 134,
        todayAppointments: 7,
        pendingResults: 3,
        criticalAlerts: 2,
        monthlyRevenue: 108000,
        patientSatisfaction: 4.7
      }
    }

    const mockStats = {
      totalPatients: 0,
      todayAppointments: 0,
      pendingResults: 0,
      criticalAlerts: 0,
      monthlyRevenue: 0,
      patientSatisfaction: 4.6,
      ...specialtyMockData[specialtyId]
    }

    setStats(mockStats)

    // Pacientes simulados
    const mockPatients: PatientSummary[] = [
      {
        id: '1',
        name: 'María González',
        age: 45,
        lastVisit: '2024-01-10',
        status: 'stable'
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        age: 62,
        lastVisit: '2024-01-08',
        nextAppointment: '2024-01-20',
        status: 'monitoring'
      },
      {
        id: '3',
        name: 'Ana Martínez',
        age: 38,
        lastVisit: '2024-01-12',
        status: 'stable'
      }
    ]

    // Citas simuladas
    const mockAppointments: AppointmentSummary[] = [
      {
        id: '1',
        patientName: 'Luis Fernández',
        time: '09:00',
        type: 'Consulta',
        status: 'scheduled'
      },
      {
        id: '2',
        patientName: 'Patricia Silva',
        time: '10:30',
        type: 'Seguimiento',
        status: 'completed'
      },
      {
        id: '3',
        patientName: 'Roberto López',
        time: '14:00',
        type: 'Consulta',
        status: 'scheduled'
      }
    ]

    setRecentPatients(mockPatients)
    setTodayAppointments(mockAppointments)
  }

  const loadRealData = async (userId: string) => {
    try {
      // Cargar estadísticas reales
      const [
        { data: patients },
        { data: appointments },
        { data: criticalResults }
      ] = await Promise.all([
        supabase
          .from('patients')
          .select('id')
          .eq('doctor_id', userId), // Asumiendo que hay relación doctor-paciente

        supabase
          .from('appointments')
          .select('id, status, appointment_date')
          .eq('doctor_id', userId)
          .gte('appointment_date', new Date().toISOString().split('T')[0]),

        supabase
          .from('lab_results')
          .select('id')
          .eq('is_critical', true)
          .eq('doctor_id', userId)
      ])

      setStats({
        totalPatients: patients?.length || 0,
        todayAppointments: appointments?.length || 0,
        pendingResults: 0, // Implementar lógica específica
        criticalAlerts: criticalResults?.length || 0,
        monthlyRevenue: 0, // Implementar cálculo de ingresos
        patientSatisfaction: 4.6 // Implementar encuestas de satisfacción
      })

      // Cargar pacientes recientes
      const { data: recentPatientsData } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
          created_at,
          appointments!inner(
            id,
            appointment_date,
            status,
            doctor_id
          )
        `)
        .eq('appointments.doctor_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentPatientsData) {
        const patients: PatientSummary[] = recentPatientsData.map(patient => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          age: new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear(),
          lastVisit: patient.appointments[0]?.appointment_date || '',
          status: 'stable' as const
        }))
        setRecentPatients(patients)
      }

      // Cargar citas de hoy
      const today = new Date().toISOString().split('T')[0]
      const { data: todayAppointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          notes,
          patients!inner(
            first_name,
            last_name
          )
        `)
        .eq('doctor_id', userId)
        .gte('appointment_date', `${today}T00:00:00`)
        .lt('appointment_date', `${today}T23:59:59`)
        .order('appointment_date', { ascending: true })

      if (todayAppointmentsData) {
        const appointments: AppointmentSummary[] = todayAppointmentsData.map(apt => ({
          id: apt.id,
          patientName: `${apt.patients.first_name} ${apt.patients.last_name}`,
          time: new Date(apt.appointment_date).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'Consulta',
          status: apt.status as any,
          notes: apt.notes
        }))
        setTodayAppointments(appointments)
      }

    } catch (error) {
      console.error('Error loading real data:', error)
      // Fallback a datos simulados si hay error
      await loadMockData()
    }
  }

  const refreshData = () => {
    loadSpecialtyData()
  }

  return {
    user,
    stats,
    recentPatients,
    todayAppointments,
    loading,
    error,
    refreshData
  }
}
