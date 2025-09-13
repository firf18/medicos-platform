'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthChangeEvent } from '@supabase/supabase-js';

export function useSessionExpiration() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSessionExpiration = useCallback(() => {
    toast({
      title: 'Sesión expirada',
      description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      variant: 'destructive',
    });
    
    // Limpiar cualquier estado de autenticación local
    if (typeof window !== 'undefined') {
      // Limpiar localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Redirigir al login
    router.push('/login');
  }, [router, toast]);

  // Monitorear expiración de sesión
  const monitorSessionExpiration = useCallback(() => {
    const checkExpiration = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          return;
        }
        
        if (session) {
          const expiresAt = session.expires_at;
          if (expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiration = expiresAt - now;
            
            // Si la sesión ya expiró
            if (timeUntilExpiration <= 0) {
              handleSessionExpiration();
              return;
            }
            
            // Si la sesión expira en menos de 5 minutos, mostrar advertencia
            if (timeUntilExpiration < 300) {
              toast({
                title: 'Sesión a punto de expirar',
                description: 'Tu sesión expirará en breve. Guarda tu trabajo y considera cerrar e iniciar sesión nuevamente.',
                variant: 'destructive', // Changed from 'warning' to 'destructive'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error verificando expiración de sesión:', error);
      }
    };
    
    // Verificar cada minuto
    const interval = setInterval(checkExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [supabase, toast, handleSessionExpiration]);

  useEffect(() => {
    // Escuchar eventos de expiración de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      if (event === 'SIGNED_OUT') {
        handleSessionExpiration();
      }
    });

    // Iniciar monitoreo de expiración
    const cleanupMonitor = monitorSessionExpiration();

    return () => {
      subscription.unsubscribe();
      cleanupMonitor();
    };
  }, [supabase.auth, handleSessionExpiration, monitorSessionExpiration]);

  return {
    handleSessionExpiration,
  };
}