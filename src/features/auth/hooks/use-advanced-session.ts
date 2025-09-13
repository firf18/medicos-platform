'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// Tipos para el estado de la sesión
interface AdvancedSessionState {
  session: Session | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  lastRefresh: number | null;
  tabId: string;
}

// Eventos personalizados para comunicación entre pestañas
const SESSION_CHANGE_EVENT = 'auth-session-change';
const LOGOUT_EVENT = 'auth-logout-all';

export function useAdvancedSession() {
  const [sessionState, setSessionState] = useState<AdvancedSessionState>({
    session: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastRefresh: null,
    tabId: Math.random().toString(36).substring(2, 15),
  });
  
  const supabase = createClient() as SupabaseClient;
  const { toast } = useToast();
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para actualizar el estado de la sesión
  const updateSessionState = useCallback((updates: Partial<AdvancedSessionState>) => {
    setSessionState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Función para obtener la sesión actual
  const getSession = useCallback(async () => {
    try {
      updateSessionState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      updateSessionState({
        session: data.session,
        isLoading: false,
        error: null
      });
      
      // Emitir evento de cambio de sesión a otras pestañas
      if (data.session) {
        const event = new CustomEvent(SESSION_CHANGE_EVENT, {
          detail: { session: data.session, sourceTabId: sessionState.tabId }
        });
        window.dispatchEvent(event);
      }
      
      return data.session;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      updateSessionState({
        session: null,
        isLoading: false,
        error: error as Error
      });
      
      return null;
    }
  }, [supabase, updateSessionState, sessionState.tabId]);

  // Función para refrescar la sesión
  const refreshSession = useCallback(async () => {
    try {
      updateSessionState({ isRefreshing: true, error: null });
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      updateSessionState({
        session: data.session,
        isRefreshing: false,
        error: null,
        lastRefresh: Date.now()
      });
      
      // Emitir evento de cambio de sesión a otras pestañas
      if (data.session) {
        const event = new CustomEvent(SESSION_CHANGE_EVENT, {
          detail: { session: data.session, sourceTabId: sessionState.tabId }
        });
        window.dispatchEvent(event);
      }
      
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Error refrescando sesión:', error);
      updateSessionState({
        isRefreshing: false,
        error: error as Error
      });
      
      // Si el error es de sesión inválida, cerrar sesión
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('Invalid refresh token') || 
            errorMessage.includes('refresh token expired')) {
          await signOutAllTabs();
        }
      }
      
      return { success: false, error };
    }
  }, [supabase, updateSessionState, sessionState.tabId]);

  // Función para cerrar sesión en todas las pestañas
  const signOutAllTabs = useCallback(async () => {
    try {
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Limpiar estado local
      updateSessionState({
        session: null,
        isLoading: false,
        error: null
      });
      
      // Emitir evento de cierre de sesión a otras pestañas
      const event = new CustomEvent(LOGOUT_EVENT, {
        detail: { sourceTabId: sessionState.tabId }
      });
      window.dispatchEvent(event);
      
      // Redirigir al login
      router.push('/login');
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente.',
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cerrar la sesión.',
        variant: 'destructive',
      });
      
      return { success: false, error };
    }
  }, [supabase, updateSessionState, sessionState.tabId, router, toast]);

  // Función para verificar si la sesión está a punto de expirar
  const checkSessionExpiry = useCallback(() => {
    if (!sessionState.session?.expires_at) return;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = sessionState.session.expires_at;
    const timeUntilExpiry = expiresAt - now;
    
    // Si la sesión expira en menos de 5 minutos, mostrar advertencia
    if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
      toast({
        title: 'Sesión a punto de expirar',
        description: 'Tu sesión expirará pronto. Guarda tu trabajo y considera cerrar e iniciar sesión nuevamente.',
        variant: 'destructive',
      });
    }
    
    // Si la sesión ya expiró, intentar refrescar
    if (timeUntilExpiry <= 0) {
      refreshSession();
    }
  }, [sessionState.session?.expires_at, toast, refreshSession]);

  // Manejar eventos de otras pestañas
  useEffect(() => {
    const handleSessionChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Solo actualizar si el evento no viene de la misma pestaña
      if (customEvent.detail?.sourceTabId !== sessionState.tabId) {
        updateSessionState({
          session: customEvent.detail?.session || null
        });
      }
    };
    
    const handleLogout = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Solo cerrar sesión si el evento no viene de la misma pestaña
      if (customEvent.detail?.sourceTabId !== sessionState.tabId) {
        updateSessionState({
          session: null,
          isLoading: false,
          error: null
        });
        
        router.push('/login');
      }
    };
    
    window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
    window.addEventListener(LOGOUT_EVENT, handleLogout);
    
    return () => {
      window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
      window.removeEventListener(LOGOUT_EVENT, handleLogout);
    };
  }, [sessionState.tabId, updateSessionState, router]);

  // Escuchar cambios de autenticación de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Evento de autenticación:', event);
        
        updateSessionState({
          session,
          isLoading: false
        });
        
        // Refrescar la página cuando cambia la sesión
        router.refresh();
      }
    );
    
    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Error limpiando suscripción de autenticación:', error);
      }
    };
  }, [supabase, updateSessionState, router]);

  // Verificar sesión al montar el componente
  useEffect(() => {
    getSession();
  }, [getSession]);

  // Configurar intervalo para verificar expiración de sesión
  useEffect(() => {
    sessionCheckIntervalRef.current = setInterval(checkSessionExpiry, 60000); // Cada minuto
    
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [checkSessionExpiry]);

  // Configurar refresco automático de sesión antes de que expire
  useEffect(() => {
    if (sessionState.session?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = sessionState.session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      // Refrescar la sesión 2 minutos antes de que expire
      const refreshTime = Math.max(0, timeUntilExpiry - 120) * 1000;
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshSession();
      }, refreshTime);
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [sessionState.session?.expires_at, refreshSession]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, []);

  return {
    ...sessionState,
    getSession,
    refreshSession,
    signOutAllTabs,
    checkSessionExpiry,
  };
}