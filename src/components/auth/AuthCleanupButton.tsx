'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

// Componente de fallback para evitar errores de carga
const CleanupButtonFallback = () => null;

export function AuthCleanupButton() {
  const [isClearing, setIsClearing] = useState(false);
  const supabase = createClient();

  const clearAuthState = async () => {
    setIsClearing(true);
    
    try {
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar localStorage
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Limpiar sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            sessionStorage.removeItem(key);
          }
        });
      }

      // Limpiar cookies
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('supabase') || name.includes('auth')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
          }
        });
      }

      // Recargar la página
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error clearing auth state:', error);
      // Forzar recarga en caso de error
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  // Solo mostrar si hay errores de cookies
  const shouldShow = typeof window !== 'undefined' && 
    typeof document !== 'undefined' &&
    (localStorage?.getItem('supabase.auth.token')?.includes('base64-') ||
     document.cookie.includes('base64-'));

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="text-sm mb-2">
        🚨 Detectamos problemas de autenticación
      </div>
      <button
        onClick={clearAuthState}
        disabled={isClearing}
        className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {isClearing ? 'Limpiando...' : 'Solucionar'}
      </button>
    </div>
  );
}

// Exportar componente con Suspense para evitar errores de carga
export function AuthCleanupButtonWithSuspense() {
  return (
    <Suspense fallback={<CleanupButtonFallback />}>
      <AuthCleanupButton />
    </Suspense>
  );
}