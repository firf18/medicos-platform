'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'doctor' | 'patient';
  redirectTo?: string;
};

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAdmin, isDoctor, isPatient, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // No hacer nada mientras se está cargando
    if (isLoading) return;

    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Verificar si el usuario tiene el rol requerido
    if (requiredRole) {
      const hasRequiredRole = 
        (requiredRole === 'admin' && isAdmin) ||
        (requiredRole === 'doctor' && isDoctor) ||
        (requiredRole === 'patient' && isPatient);

      if (!hasRequiredRole) {
        // Redirigir al dashboard correspondiente según el rol del usuario
        if (isAdmin) {
          router.push('/admin/dashboard');
        } else if (isDoctor) {
          router.push('/doctor/dashboard');
        } else if (isPatient) {
          router.push('/patient/dashboard');
        } else {
          // Si el usuario no tiene un rol válido, redirigir a la página de inicio
          router.push('/');
        }
        return;
      }
    }
    
    // Si llegamos aquí, el usuario está autorizado
    setIsAuthorized(true);
  }, [user, isAdmin, isDoctor, isPatient, isLoading, requiredRole, router, redirectTo]);

  // Mostrar estado de carga mientras se verifica la autenticación
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está autorizado, mostrar el contenido protegido
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Si no está autorizado, mostrar un mensaje de error
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Acceso denegado</h3>
        <p className="mt-1 text-sm text-gray-500">
          No tienes permiso para acceder a esta página.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
