'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type HealthMetric = Database['public']['Tables']['health_metrics']['Row']

export const useHealthMetrics = (userId: string) => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchMetrics = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', userId)
        .order('recorded_at', { ascending: false })

      if (fetchError) throw fetchError

      setMetrics(data || [])
    } catch (err) {
      console.error('Error fetching health metrics:', err)
      setError('Error al cargar las métricas de salud')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const addMetric = async (metricData: Partial<HealthMetric>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('health_metrics')
        .insert({
          patient_id: userId,
          ...metricData,
          recorded_at: new Date().toISOString(),
          source: 'manual'
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar las métricas
      await fetchMetrics()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding metric:', err)
      return { success: false, error: 'Error al agregar la métrica' }
    }
  }

  const deleteMetric = async (metricId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('health_metrics')
        .delete()
        .eq('id', metricId)

      if (deleteError) throw deleteError
      
      // Refrescar las métricas
      await fetchMetrics()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting metric:', err)
      return { success: false, error: 'Error al eliminar la métrica' }
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
    addMetric,
    deleteMetric
  }
}