'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Specialized Registration Page
 * 
 * Handles registration for specialized medical professionals
 * including laboratory technicians, clinic administrators, etc.
 * 
 * @compliance HIPAA-compliant user registration page
 */

function SpecializedRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserType = searchParams.get('type') as 'laboratory' | 'clinic' | null;

  useEffect(() => {
    // Redirect to general registration if no valid user type
    if (!initialUserType) {
      router.push('/auth/register');
    }
  }, [initialUserType, router]);

  // Don't render anything until we have a valid user type
  if (!initialUserType) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Registro Especializado</CardTitle>
            <CardDescription>
              Registro para profesionales médicos especializados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Tipo de usuario: <span className="font-medium">{initialUserType}</span>
              </p>
              <p className="text-sm text-gray-600">
                Esta funcionalidad está en desarrollo. Por favor, utiliza el registro general.
              </p>
              <Button 
                onClick={() => router.push('/auth/register')}
                className="w-full"
              >
                Ir al Registro General
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SpecializedRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>}>
      <SpecializedRegistrationContent />
    </Suspense>
  );
}