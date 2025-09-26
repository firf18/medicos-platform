/**
 * Email Verification Success Page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    // Cerrar la ventana después de 3 segundos
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      } else {
        router.push('/auth/register/doctor');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-green-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¡Email Verificado!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu email ha sido verificado exitosamente. Ya puedes continuar con el registro.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Esta ventana se cerrará automáticamente en unos segundos...
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                router.push('/auth/register/doctor');
              }
            }}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continuar con el Registro
          </button>
        </div>
      </div>
    </div>
  );
}