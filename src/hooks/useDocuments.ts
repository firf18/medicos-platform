'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type MedicalDocument = Database['public']['Tables']['medical_documents']['Row']

export const useDocuments = (userId: string) => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchDocuments = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setDocuments(data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Error al cargar los documentos')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const addDocument = async (documentData: Partial<MedicalDocument>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('medical_documents')
        .insert({
          patient_id: userId,
          ...documentData
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar los documentos
      await fetchDocuments()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding document:', err)
      return { success: false, error: 'Error al agregar el documento' }
    }
  }

  const updateDocument = async (documentId: string, updates: Partial<MedicalDocument>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('medical_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los documentos
      await fetchDocuments()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating document:', err)
      return { success: false, error: 'Error al actualizar el documento' }
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', documentId)

      if (deleteError) throw deleteError
      
      // Refrescar los documentos
      await fetchDocuments()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting document:', err)
      return { success: false, error: 'Error al eliminar el documento' }
    }
  }

  const toggleSharing = async (documentId: string, sharedWithCaregivers: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('medical_documents')
        .update({ shared_with_caregivers: sharedWithCaregivers })
        .eq('id', documentId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los documentos
      await fetchDocuments()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error toggling document sharing:', err)
      return { success: false, error: 'Error al cambiar la configuración de compartir' }
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleSharing
  }
}