'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type Caregiver = Database['public']['Tables']['patient_caregivers']['Row']

export const useCaregivers = (userId: string) => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchCaregivers = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('patient_caregivers')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCaregivers(data || [])
    } catch (err) {
      console.error('Error fetching caregivers:', err)
      setError('Error al cargar los confidentes')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const addCaregiver = async (caregiverData: Partial<Caregiver>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('patient_caregivers')
        .insert({
          patient_id: userId,
          ...caregiverData,
          is_active: true
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar los confidentes
      await fetchCaregivers()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding caregiver:', err)
      return { success: false, error: 'Error al agregar el confidente' }
    }
  }

  const updateCaregiver = async (caregiverId: string, updates: Partial<Caregiver>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('patient_caregivers')
        .update(updates)
        .eq('id', caregiverId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los confidentes
      await fetchCaregivers()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating caregiver:', err)
      return { success: false, error: 'Error al actualizar el confidente' }
    }
  }

  const deleteCaregiver = async (caregiverId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('patient_caregivers')
        .delete()
        .eq('id', caregiverId)

      if (deleteError) throw deleteError
      
      // Refrescar los confidentes
      await fetchCaregivers()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting caregiver:', err)
      return { success: false, error: 'Error al eliminar el confidente' }
    }
  }

  const toggleCaregiverStatus = async (caregiverId: string, currentStatus: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('patient_caregivers')
        .update({ is_active: !currentStatus })
        .eq('id', caregiverId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los confidentes
      await fetchCaregivers()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error toggling caregiver status:', err)
      return { success: false, error: 'Error al cambiar el estado del confidente' }
    }
  }

  useEffect(() => {
    fetchCaregivers()
  }, [fetchCaregivers])

  return {
    caregivers,
    loading,
    error,
    refetch: fetchCaregivers,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    toggleCaregiverStatus
  }
}