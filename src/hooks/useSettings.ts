'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type UserSettings = {
  profile: {
    name: string
    email: string
    phone: string
    language: string
    timezone: string
  }
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    appointments: boolean
    medications: boolean
    labResults: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'doctors-only'
    shareDataForResearch: boolean
    allowMarketing: boolean
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
  }
}

export const useSettings = (userId: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      // En una implementación real, se obtendrían los ajustes del usuario
      // Por ahora, usamos datos mock
      const mockSettings: UserSettings = {
        profile: {
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+34 600 123 456',
          language: 'es',
          timezone: 'Europe/Madrid'
        },
        notifications: {
          email: true,
          sms: false,
          push: true,
          appointments: true,
          medications: true,
          labResults: true
        },
        privacy: {
          profileVisibility: 'doctors-only',
          shareDataForResearch: false,
          allowMarketing: false
        },
        security: {
          twoFactorEnabled: true,
          lastPasswordChange: '2024-01-01'
        }
      }

      setSettings(mockSettings)
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateSetting = async (section: keyof UserSettings, key: string, value: any) => {
    try {
      // En una implementación real, se actualizaría en la base de datos
      setSettings(prev => {
        if (!prev) return null
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        }
      })
      
      return { success: true }
    } catch (err) {
      console.error('Error updating setting:', err)
      return { success: false, error: 'Error al actualizar la configuración' }
    }
  }

  const saveSettings = async () => {
    try {
      if (!settings) return { success: false, error: 'No hay configuración para guardar' }
      
      // En una implementación real, se guardarían los ajustes en la base de datos
      console.log('Guardando configuración para el usuario:', userId, settings)
      
      return { success: true }
    } catch (err) {
      console.error('Error saving settings:', err)
      return { success: false, error: 'Error al guardar la configuración' }
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    updateSetting,
    saveSettings,
    refetch: fetchSettings
  }
}