'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import EmailVerificationForm from '../../../components/auth/EmailVerificationForm';
import { Card, CardContent } from '../../../components/ui/card';

export default function VerifyEmailPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [linkVerificationAttempted, setLinkVerificationAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type') as 'patient' | 'doctor';
    const tokenParam = searchParams.get('token');
    const tokenHashParam = searchParams.get('token_hash');
    
    if (emailParam) setEmail(emailParam);
    if (typeParam) setUserType(typeParam);
    
    // Si hay un token en la URL, intentar verificación por enlace
    if (tokenParam || tokenHashParam) {
      handleLinkVerification(tokenParam, tokenHashParam);
    }
    
    if (!emailParam && !tokenParam && !tokenHashParam) {
      router.push('/auth/register');
    }
  }, [searchParams, router]);

  const handleLinkVerification = async (token?: string | null, tokenHash?: string | null) => {
    if (linkVerificationAttempted) return;
    
    setLinkVerificationAttempted(true);
    setLoading(true);
    setError('');

    try {
      let result: any;
      
      if (tokenHash) {
        // Verificación con token_hash (nuevo formato de Supabase)
        result = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email'
        });
      } else if (token) {
        // Verificación con token directo
        result = await supabase.auth.verifyOtp({
          token: token,
          type: 'signup',
          email: email
        });
      }

      if (result?.error) throw result.error;

      if (result?.data?.user) {
        handleSuccessfulVerification();
      }
    } catch (error: any) {
      console.error('Error en verificación por enlace:', error);
      setError('El enlace de verificación no es válido o ha expirado. Por favor, solicita un nuevo código.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulVerification = () => {
    setSuccess(true);
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      if (userType === 'patient') {
        router.push('/patient-dashboard');
      } else {
        router.push('/dashboard');
      }
    }, 2000);
  };

  const handleVerificationError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Email Verificado!
            </h2>
            <p className="text-gray-600 mb-4">
              Tu cuenta ha sido verificada exitosamente. 
              Serás redirigido a tu dashboard en unos segundos...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {email ? (
        <EmailVerificationForm
          email={email}
          userType={userType}
          onSuccess={handleSuccessfulVerification}
          onError={handleVerificationError}
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error de Verificación
            </h2>
            <p className="text-gray-600 mb-4">
              No se encontró información de verificación. Por favor, regístrate nuevamente.
            </p>
            <button
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ir al registro
            </button>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-medium mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}