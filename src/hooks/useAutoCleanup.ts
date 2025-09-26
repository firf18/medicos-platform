/**
 * Hook para limpieza automática de datos de registro - Red-Salud
 * 
 * Este hook maneja la limpieza automática de datos cuando el usuario
 * navega fuera del proceso de registro o recarga la página.
 * Compatible con Next.js 15
 */

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface UseAutoCleanupProps {
  onCleanup: () => void;
  enabled?: boolean;
}

export function useAutoCleanup({ onCleanup, enabled = true }: UseAutoCleanupProps) {
  const pathname = usePathname();
  
  // Detectar si estamos en el proceso de registro
  const isInRegistrationProcess = pathname.includes('/auth/register/doctor');
  
  // Memoizar la función de limpieza para evitar recreaciones innecesarias
  const handleCleanup = useCallback(() => {
    if (enabled) {
      console.log('[AUTO_CLEANUP] Ejecutando limpieza automática');
      onCleanup();
    }
  }, [onCleanup, enabled]);
  
  // Efecto principal para detectar cambios de ruta
  useEffect(() => {
    if (!enabled) return;
    
    // Limpiar datos si salimos del proceso de registro
    if (!isInRegistrationProcess) {
      console.log('[AUTO_CLEANUP] Usuario salió del proceso de registro, limpiando datos');
      handleCleanup();
    }
  }, [isInRegistrationProcess, handleCleanup, enabled]);
  
  // Efecto para manejar eventos de página
  useEffect(() => {
    if (!enabled) return;
    
    const handleBeforeUnload = () => {
      console.log('[AUTO_CLEANUP] Recarga de página detectada, limpiando datos');
      handleCleanup();
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[AUTO_CLEANUP] Página oculta, limpiando datos');
        handleCleanup();
      }
    };
    
    // Agregar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleCleanup, enabled]);
}
