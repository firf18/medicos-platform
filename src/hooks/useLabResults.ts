'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type LabResult = Database['public']['Tables']['medical_documents']['Row'] & {
  doctor_name?: string
  test_type?: string
}

export const useLabResults = (userId: string) => {
  const [results, setResults] = useState<LabResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchLabResults = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('patient_id', userId)
        .eq('document_type', 'lab_result')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // En un entorno real, aquí se obtendrían datos adicionales
      const formattedResults = data?.map(result => ({
        ...result,
        doctor_name: 'Dr. García Martínez',
        test_type: 'Análisis general'
      })) || []

      setResults(formattedResults)
    } catch (err) {
      console.error('Error fetching lab results:', err)
      setError('Error al cargar los resultados de laboratorio')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const markAsCritical = async (resultId: string, isCritical: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('medical_documents')
        .update({ is_critical: isCritical })
        .eq('id', resultId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los resultados
      await fetchLabResults()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating lab result:', err)
      return { success: false, error: 'Error al actualizar el resultado' }
    }
  }

  useEffect(() => {
    fetchLabResults()
  }, [fetchLabResults])

  return {
    results,
    loading,
    error,
    refetch: fetchLabResults,
    markAsCritical
  }
}