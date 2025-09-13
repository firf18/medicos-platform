'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type SecondOpinionRequest = Database['public']['Tables']['second_opinion_requests']['Row']

export const useSecondOpinion = (userId: string) => {
  const [requests, setRequests] = useState<SecondOpinionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchRequests = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('second_opinion_requests')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setRequests(data || [])
    } catch (err) {
      console.error('Error fetching second opinion requests:', err)
      setError('Error al cargar las solicitudes de segunda opinión')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const createRequest = async (requestData: Partial<SecondOpinionRequest>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('second_opinion_requests')
        .insert({
          patient_id: userId,
          ...requestData,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar las solicitudes
      await fetchRequests()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error creating second opinion request:', err)
      return { success: false, error: 'Error al crear la solicitud de segunda opinión' }
    }
  }

  const updateRequest = async (requestId: string, updates: Partial<SecondOpinionRequest>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('second_opinion_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar las solicitudes
      await fetchRequests()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating second opinion request:', err)
      return { success: false, error: 'Error al actualizar la solicitud' }
    }
  }

  const cancelRequest = async (requestId: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('second_opinion_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar las solicitudes
      await fetchRequests()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error cancelling second opinion request:', err)
      return { success: false, error: 'Error al cancelar la solicitud' }
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequest,
    cancelRequest
  }
}