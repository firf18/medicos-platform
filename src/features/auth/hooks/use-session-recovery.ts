'use client'

import { useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook para recuperación automática de errores de sesión
 * Especialmente útil para manejar AuthSessionMissingError
 */
export function useSessionRecovery() {
  const supabase = createClient();

  // Función para detectar y recuperar errores de sesión
  const handleSessionError = useCallback(async (error: any) => {
    console.log('🔍 Analizando error de sesión:', error);

    // Detectar AuthSessionMissingError o errores relacionados
    if (
      error?.name === 'AuthSessionMissingError' ||
      error?.message?.includes('AuthSessionMissingError') ||
      error?.message?.includes('Auth session missing') ||
      error?.message?.includes('session missing')
    ) {
      console.log('🚨 AuthSessionMissingError detectado, iniciando recuperación...');
      
      try {
        // 1. Intentar refrescar la sesión
        console.log('🔄 Intentando refrescar sesión...');
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && data.session) {
          console.log('✅ Sesión refrescada exitosamente');
          return { recovered: true, session: data.session };
        }
        
        // 2. Si el refresh falla, intentar obtener sesión actual
        console.log('🔍 Refresh falló, intentando obtener sesión actual...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!sessionError && sessionData.session) {
          console.log('✅ Sesión actual obtenida');
          return { recovered: true, session: sessionData.session };
        }
        
        // 3. Si todo falla, limpiar estado corrupto
        console.log('🧹 Limpiando estado corrupto...');
        await cleanCorruptedAuthState();
        
        return { recovered: false, cleanedUp: true };
        
      } catch (recoveryError) {
        console.error('❌ Error durante recuperación:', recoveryError);
        await cleanCorruptedAuthState();
        return { recovered: false, cleanedUp: true, error: recoveryError };
      }
    }
    
    return { recovered: false, unhandledError: error };
  }, [supabase]);

  // Función para limpiar estado corrupto
  const cleanCorruptedAuthState = useCallback(async () => {
    console.log('🧹 Limpiando estado de autenticación corrupto...');
    
    try {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('supabase')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removido: ${key}`);
        });
      }
      
      // Limpiar cookies relacionadas con Supabase
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('supabase')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
            console.log(`🍪 Cookie removida: ${name}`);
          }
        });
      }
      
      // Forzar sign out local (sin llamada al servidor)
      await supabase.auth.signOut({ scope: 'local' });
      
      console.log('✅ Estado corrupto limpiado exitosamente');
      
    } catch (error) {
      console.error('❌ Error limpiando estado corrupto:', error);
    }
  }, [supabase]);

  // Función para verificar estado de sesión
  const checkSessionHealth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('⚠️ Error en checkSessionHealth:', error);
        return await handleSessionError(error);
      }
      
      if (session) {
        console.log('✅ Sesión saludable');
        return { healthy: true, session };
      }
      
      console.log('ℹ️ No hay sesión activa');
      return { healthy: true, session: null };
      
    } catch (error) {
      console.error('❌ Error verificando salud de sesión:', error);
      return await handleSessionError(error);
    }
  }, [supabase, handleSessionError]);

  // Auto-verificación periódica (opcional)
  useEffect(() => {
    // Verificar inmediatamente
    checkSessionHealth();
    
    // Configurar verificación periódica cada 5 minutos
    const interval = setInterval(checkSessionHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkSessionHealth]);

  return {
    handleSessionError,
    cleanCorruptedAuthState,
    checkSessionHealth,
  };
}