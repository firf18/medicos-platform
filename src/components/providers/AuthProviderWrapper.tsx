'use client';

import { useEffect, useState } from 'react';
import { Toaster } from '../ui/toast-provider';
import { AuthProvider as SupabaseAuthProvider } from '@/features/auth/contexts/AuthContext';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SupabaseAuthProvider>
      {children}
      <Toaster />
    </SupabaseAuthProvider>
  );
}
