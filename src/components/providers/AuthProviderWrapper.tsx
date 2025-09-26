'use client';

import { useEffect, useState, Suspense } from 'react';
import { Toaster } from '../ui/toast-provider';
import dynamic from 'next/dynamic';

// Importación dinámica del AuthProvider para evitar errores de chunk
const AuthProvider = dynamic(
  () => import('@/providers/auth').then(mod => {
    // Verificar que el módulo tenga el componente esperado
    if (mod && mod.AuthProvider) {
      return mod.AuthProvider;
    }
    // Componente de fallback en caso de error
    return function FallbackAuthProvider({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    };
  }).catch(error => {
    // Manejar errores de importación
    console.error('Error al cargar AuthProvider:', error);
    return function ErrorAuthProvider({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    };
  }),
  { 
    loading: () => <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  }
);

// Componente de fallback para evitar errores de carga
const AuthLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Componente de fallback para errores de carga
const AuthErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold text-red-600 mb-2">Error de carga</h2>
      <p className="text-gray-700 mb-4">
        No se pudo cargar el componente de autenticación. Por favor, recarga la página.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        Recargar página
      </button>
    </div>
  </div>
);

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Manejo de errores no capturados
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('chunk') || event.error?.message?.includes('load')) {
        setHasError(true);
        console.error('ChunkLoadError detectado:', event.error);
      }
    };

    window.addEventListener('error', handleError);
    
    // Simular un pequeño retraso para asegurar que la hidratación se complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Mostrar estado de error si se detecta un problema de carga
  if (hasError) {
    return <AuthErrorFallback />;
  }

  // Mostrar un estado de carga simple mientras se monta el componente
  if (!mounted || isLoading) {
    return <AuthLoadingFallback />;
  }

  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </Suspense>
  );
}
