'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PatientDashboardContent } from '@/components/patient-dashboard/PatientDashboardContent';
import { PatientDashboardSkeleton } from '@/components/patient-dashboard/PatientDashboardSkeleton';

export default function PatientDashboardTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test Supabase connection
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw new Error(`Error de autenticación: ${error.message}`);
        }

        if (!data.user) {
          throw new Error('Usuario no autenticado');
        }

        // Test database connection
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (dbError) {
          throw new Error(`Error de base de datos: ${dbError.message}`);
        }

        setHasError(false);
      } catch (error) {
        console.error('Error checking connection:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PatientDashboardSkeleton />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error de Conexión
            </h2>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientDashboardContent />
    </div>
  );
}
