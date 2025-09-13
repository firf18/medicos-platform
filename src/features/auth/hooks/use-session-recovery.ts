'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { SupabaseClient, AuthError, Session } from '@supabase/supabase-js'

interface RecoveryResult {
  recovered?: boolean
  cleanedUp?: boolean
  error?: unknown
  unhandledError?: unknown
  session?: Session | null
  healthy?: boolean
}

interface SessionHealthResult {
  healthy: boolean
  session: Session | null
}

/**
 * Hook para recuperación automática de errores de sesión
 * Especialmente útil para manejar AuthSessionMissingError
 */
export function useSessionRecovery() {
  const supabase = createClient()
  const { toast } = useToast()

  // Función para limpiar estado corrupto
  const cleanCorruptedAuthState = useCallback(async () => {
    console.log('🧹 Limpiando estado de autenticación corrupto...')
    
    try {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = []
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log(`🗑️ Removido: ${key}`)
        })
      }
      
      // Limpiar cookies relacionadas con Supabase
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.includes('supabase') || name.includes('auth')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
            console.log(`🍪 Cookie removida: ${name}`)
          }
        })
      }
      
      // Forzar sign out local (sin llamada al servidor)
      await supabase.auth.signOut({ scope: 'local' })
      
      console.log('✅ Estado corrupto limpiado exitosamente')
      
    } catch (error) {
      console.error('❌ Error limpiando estado corrupto:', error)
    }
  }, [supabase])

  // Función para detectar y recuperar errores de sesión
  const handleSessionError = useCallback(async (error: unknown): Promise<RecoveryResult> => {
    console.log('🔍 Analizando error de sesión:', error)

    // Detectar AuthSessionMissingError o errores relacionados
    if (
      (error && typeof error === 'object' && 'name' in error && (error as { name: string }).name === 'AuthSessionMissingError') ||
      (error && typeof error === 'object' && 'message' in error && typeof (error as { message: string }).message === 'string' && 
        ((error as { message: string }).message.includes('AuthSessionMissingError') ||
        (error as { message: string }).message.includes('Auth session missing') ||
        (error as { message: string }).message.includes('session missing'))) ||
      (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'session_expired')
    ) {
      console.log('🚨 AuthSessionMissingError detectado, iniciando recuperación...')
      
      try {
        // 1. Intentar refrescar la sesión
        console.log('🔄 Intentando refrescar sesión...')
        const { data, error: refreshError } = await supabase.auth.refreshSession()
        
        if (!refreshError && data.session) {
          console.log('✅ Sesión refrescada exitosamente')
          toast({
            title: 'Sesión restaurada',
            description: 'Tu sesión ha sido restaurada automáticamente.',
          })
          return { recovered: true, session: data.session }
        }
        
        // 2. Si el refresh falla, intentar obtener sesión actual
        console.log('🔍 Refresh falló, intentando obtener sesión actual...')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (!sessionError && sessionData.session) {
          console.log('✅ Sesión actual obtenida')
          toast({
            title: 'Sesión activa',
            description: 'Tu sesión está activa y funcionando correctamente.',
          })
          return { recovered: true, session: sessionData.session }
        }
        
        // 3. Si todo falla, limpiar estado corrupto
        console.log('🧹 Limpiando estado corrupto...')
        await cleanCorruptedAuthState()
        
        return { recovered: false, cleanedUp: true }
        
      } catch (recoveryError) {
        console.error('❌ Error durante recuperación:', recoveryError)
        await cleanCorruptedAuthState()
        return { recovered: false, cleanedUp: true, error: recoveryError }
      }
    }
    
    return { recovered: false, unhandledError: error }
  }, [supabase, toast, cleanCorruptedAuthState]) // Now cleanCorruptedAuthState is defined

  // Función para verificar estado de sesión
  const checkSessionHealth = useCallback(async (): Promise<RecoveryResult> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('⚠️ Error en checkSessionHealth:', error)
        return await handleSessionError(error)
      }
      
      if (session) {
        console.log('✅ Sesión saludable')
        return { healthy: true, session }
      }
      
      console.log('ℹ️ No hay sesión activa')
      return { healthy: true, session: null }
      
    } catch (error) {
      console.error('❌ Error verificando salud de sesión:', error)
      return await handleSessionError(error)
    }
  }, [supabase, handleSessionError])

  // Función para monitorear la expiración de sesión
  const monitorSessionExpiration = useCallback(() => {
    const checkExpiration = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const expiresAt = session.expires_at
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000)
          const timeUntilExpiration = expiresAt - now
          
          // Si la sesión expira en menos de 5 minutos, mostrar advertencia
          if (timeUntilExpiration < 300) {
            toast({
              title: 'Sesión a punto de expirar',
              description: 'Tu sesión expirará pronto. Guarda tu trabajo y considera cerrar e iniciar sesión nuevamente.',
              variant: 'destructive', // Changed from 'warning' to 'destructive'
            })
          }
        }
      }
    }
    
    // Verificar cada minuto
    const interval = setInterval(checkExpiration, 60000)
    
    return () => clearInterval(interval)
  }, [supabase, toast])

  // Auto-verificación periódica (opcional)
  useEffect(() => {
    // Verificar inmediatamente
    checkSessionHealth()
    
    // Configurar verificación periódica cada 5 minutos
    const interval = setInterval(checkSessionHealth, 5 * 60 * 1000)
    
    // Monitorear expiración de sesión
    const cleanupMonitor = monitorSessionExpiration()
    
    return () => {
      clearInterval(interval)
      cleanupMonitor()
    }
  }, [checkSessionHealth, monitorSessionExpiration])

  return {
    handleSessionError,
    cleanCorruptedAuthState,
    checkSessionHealth,
  }
}