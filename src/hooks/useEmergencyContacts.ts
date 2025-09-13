'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type EmergencyContact = Database['public']['Tables']['emergency_contacts']['Row']

export const useEmergencyContacts = (userId: string) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchContacts = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (fetchError) throw fetchError

      setContacts(data || [])
    } catch (err) {
      console.error('Error fetching emergency contacts:', err)
      setError('Error al cargar los contactos de emergencia')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const addContact = async (contactData: Partial<EmergencyContact>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('emergency_contacts')
        .insert({
          patient_id: userId,
          ...contactData,
          is_active: true
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Refrescar los contactos
      await fetchContacts()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding emergency contact:', err)
      return { success: false, error: 'Error al agregar el contacto de emergencia' }
    }
  }

  const updateContact = async (contactId: string, updates: Partial<EmergencyContact>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los contactos
      await fetchContacts()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating emergency contact:', err)
      return { success: false, error: 'Error al actualizar el contacto de emergencia' }
    }
  }

  const deleteContact = async (contactId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId)

      if (deleteError) throw deleteError
      
      // Refrescar los contactos
      await fetchContacts()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting emergency contact:', err)
      return { success: false, error: 'Error al eliminar el contacto de emergencia' }
    }
  }

  const toggleContactStatus = async (contactId: string, currentStatus: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('emergency_contacts')
        .update({ is_active: !currentStatus })
        .eq('id', contactId)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refrescar los contactos
      await fetchContacts()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error toggling emergency contact status:', err)
      return { success: false, error: 'Error al cambiar el estado del contacto' }
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    toggleContactStatus
  }
}