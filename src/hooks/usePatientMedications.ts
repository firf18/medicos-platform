'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type Medication = Database['public']['Tables']['patient_medications']['Row'] & {
  doctor_name?: string
  reminders?: any[]
}

export const usePatientMedications = (userId: string) => {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchMedications = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('patient_medications')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('start_date', { ascending: false })

      if (fetchError) throw fetchError

      // En un entorno real, aquí se obtendrían datos adicionales
      const formattedMedications = data?.map(med => ({
        ...med,
        doctor_name: 'Dr. García Martínez',
        reminders: []
      })) || []

      setMedications(formattedMedications)
    } catch (err) {
      console.error('Error fetching medications:', err)
      setError('Error al cargar los medicamentos')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const addMedication = async (medicationData: Partial<Medication>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('patient_medications')
        .insert({
          patient_id: userId,
          ...medicationData,
          is_active: true
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar las medicaciones
      await fetchMedications()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding medication:', err)
      return { success: false, error: 'Error al agregar el medicamento' }
    }
  }

  const updateMedication = async (medicationId: string, updates: Partial<Medication>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('patient_medications')
        .update(updates)
        .eq('id', medicationId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar las medicaciones
      await fetchMedications()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating medication:', err)
      return { success: false, error: 'Error al actualizar el medicamento' }
    }
  }

  const deleteMedication = async (medicationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('patient_medications')
        .delete()
        .eq('id', medicationId)

      if (deleteError) throw deleteError
      
      // Refrescar las medicaciones
      await fetchMedications()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting medication:', err)
      return { success: false, error: 'Error al eliminar el medicamento' }
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [fetchMedications])

  return {
    medications,
    loading,
    error,
    refetch: fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication
  }
}