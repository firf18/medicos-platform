'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'] & {
  doctor_name?: string
  doctor_specialty?: string
}

export const useMedicalHistory = (userId: string) => {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchMedicalHistory = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      // Obtener historial médico de citas completadas
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transformar citas en registros médicos
      const medicalRecords: MedicalRecord[] = data?.map(apt => ({
        id: apt.id,
        appointment_id: apt.id,
        doctor_id: apt.doctor_id,
        visit_date: apt.scheduled_at,
        diagnosis: apt.notes || 'Consulta general',
        treatment: apt.description || 'Tratamiento no especificado',
        notes: apt.notes,
        follow_up_required: false,
        follow_up_date: null,
        doctor_name: 'Dr. García Martínez',
        doctor_specialty: 'Cardiología',
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        patient_id: userId
      })) || []

      setRecords(medicalRecords)
    } catch (err) {
      console.error('Error fetching medical history:', err)
      setError('Error al cargar el historial médico')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchMedicalHistory()
  }, [fetchMedicalHistory])

  return {
    records,
    loading,
    error,
    refetch: fetchMedicalHistory
  }
}