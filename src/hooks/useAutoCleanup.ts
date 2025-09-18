/**
 * Hook para limpieza automática de datos de registro - Red-Salud
 * 
 * Este hook maneja la limpieza automática de datos cuando el usuario
 * navega fuera del proceso de registro o recarga la página.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface UseAutoCleanupProps {
  onCleanup: () => void;
  enabled?: boolean;
}

export function useAutoCleanup({ onCleanup, enabled = true }: UseAutoCleanupProps) {
  const pathname = usePathname();
  
  // Detectar si estamos en el proceso de registro
  const isInRegistrationProcess = pathname.includes('/auth/register/doctor');
  
  useEffect(() => {
    if (!enabled) return;
    
    // Limpiar datos si salimos del proceso de registro
    if (!isInRegistrationProcess) {
      console.log('[AUTO_CLEANUP] Usuario salió del proceso de registro, limpiando datos');
      onCleanup();
    }
  }, [isInRegistrationProcess, onCleanup, enabled]);
  
  // Detectar recarga de página
  useEffect(() => {
    if (!enabled) return;
    
    const handleBeforeUnload = () => {
      console.log('[AUTO_CLEANUP] Recarga de página detectada, limpiando datos');
      onCleanup();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onCleanup, enabled]);
  
  // Detectar cambio de pestaña
  useEffect(() => {
    if (!enabled) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[AUTO_CLEANUP] Página oculta, limpiando datos');
        onCleanup();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onCleanup, enabled]);
}
