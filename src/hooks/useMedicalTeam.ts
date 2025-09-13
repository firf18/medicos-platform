'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type Doctor = {
  id: string
  full_name: string
  email: string
  specialty: string
  phone?: string
  bio?: string
  rating?: number
  total_appointments: number
  last_appointment?: string
  next_appointment?: string
}

export const useMedicalTeam = (userId: string) => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchMedicalTeam = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      // Obtener médicos de las citas
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('doctor_id, scheduled_at, status')
        .eq('patient_id', userId)
        .not('doctor_id', 'is', null)

      if (appointmentsError) throw appointmentsError

      // Agrupar citas por médico
      const doctorMap = new Map()
      
      appointments?.forEach(appointment => {
        const doctorId = appointment.doctor_id
        
        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            id: doctorId,
            full_name: 'Dr. García Martínez',
            email: 'doctor@example.com',
            specialty: 'Cardiología',
            phone: '+1234567890',
            bio: 'Especialista en cardiología con 15 años de experiencia',
            rating: 4.5,
            appointments: [],
            total_appointments: 0
          })
        }

        const doctorData = doctorMap.get(doctorId)
        doctorData.appointments.push(appointment)
        doctorData.total_appointments++
      })

      // Procesar citas para obtener fechas de última y próxima cita
      const doctorsArray = Array.from(doctorMap.values()).map(doctor => {
        const now = new Date()
        const pastAppointments = doctor.appointments
          .filter((apt: any) => new Date(apt.scheduled_at) < now && apt.status === 'completed')
          .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
        
        const futureAppointments = doctor.appointments
          .filter((apt: any) => new Date(apt.scheduled_at) > now && apt.status === 'scheduled')
          .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

        return {
          ...doctor,
          last_appointment: pastAppointments[0]?.scheduled_at,
          next_appointment: futureAppointments[0]?.scheduled_at
        }
      })

      setDoctors(doctorsArray)
    } catch (err) {
      console.error('Error fetching medical team:', err)
      setError('Error al cargar el equipo médico')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchMedicalTeam()
  }, [fetchMedicalTeam])

  return {
    doctors,
    loading,
    error,
    refetch: fetchMedicalTeam
  }
}