'use client';

import { useEffect, useState, Suspense } from 'react';
import { Toaster } from '../ui/toast-provider';
import { AuthProvider } from '@/providers/auth';

// Componente de fallback para evitar errores de carga
const AuthLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Simular un pequeño retraso para asegurar que la hidratación se complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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