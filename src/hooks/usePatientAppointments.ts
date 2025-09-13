'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  doctor_name?: string
  doctor_specialty?: string
}

export const usePatientAppointments = (userId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchAppointments = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .order('scheduled_at', { ascending: true })

      if (fetchError) throw fetchError

      // En un entorno real, aquí se obtendrían los datos del doctor
      const formattedAppointments = data?.map(apt => ({
        ...apt,
        doctor_name: 'Dr. García Martínez',
        doctor_specialty: 'Cardiología'
      })) || []

      setAppointments(formattedAppointments)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('Error al cargar las citas')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (updateError) throw updateError
      
      // Refrescar las citas
      await fetchAppointments()
      
      return { success: true }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      return { success: false, error: 'Error al cancelar la cita' }
    }
  }

  const rescheduleAppointment = async (appointmentId: string, newDate: string) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          scheduled_at: newDate,
          status: 'scheduled'
        })
        .eq('id', appointmentId)

      if (updateError) throw updateError
      
      // Refrescar las citas
      await fetchAppointments()
      
      return { success: true }
    } catch (err) {
      console.error('Error rescheduling appointment:', err)
      return { success: false, error: 'Error al reprogramar la cita' }
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    cancelAppointment,
    rescheduleAppointment
  }
}