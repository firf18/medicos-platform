'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // En un caso real, verificaríamos el estado real del email
  const isEmailVerified = user?.email ? true : false;

  if (isEmailVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    // Aquí normalmente llamarías a una función para reenviar el email
    toast({
      title: 'Correo de verificación enviado',
      description: 'Hemos enviado un nuevo enlace de verificación a tu correo electrónico.',
    });
    
    router.push('/auth/resend-verification');
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Verificación de correo pendiente:</span> Por favor verifica tu dirección de correo electrónico para acceder a todas las funcionalidades.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-700 border-yellow-400 hover:bg-yellow-100"
              onClick={handleResendEmail}
            >
              Reenviar correo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}