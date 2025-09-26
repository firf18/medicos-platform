'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DoctorRegistrationData } from '@/types/medical/specialties';

export interface RegistrationStep {
  step: 'form' | 'verification' | 'completing' | 'completed';
  data?: any;
  error?: string;
}

export interface UseDoctorRegistrationWithVerificationReturn {
  // Estado
  currentStep: RegistrationStep['step'];
  isLoading: boolean;
  error: string | null;
  verificationToken: string | null;
  registrationData: DoctorRegistrationData | null;
  
  // Acciones
  submitRegistration: (data: DoctorRegistrationData) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  completeRegistration: () => Promise<void>;
  resetRegistration: () => void;
  
  // Utilidades
  canProceedToVerification: boolean;
  canCompleteRegistration: boolean;
}

export function useDoctorRegistrationWithVerification(): UseDoctorRegistrationWithVerificationReturn {
  const [currentStep, setCurrentStep] = useState<RegistrationStep['step']>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Resetear todo el flujo
  const resetRegistration = useCallback(() => {
    setCurrentStep('form');
    setIsLoading(false);
    setError(null);
    setVerificationToken(null);
    setRegistrationData(null);
    setRegistrationId(null);
  }, []);

  // Paso 1: Enviar datos de registro
  const submitRegistration = useCallback(async (data: DoctorRegistrationData) => {
    setIsLoading(true);
    clearError();

    try {
      console.log('📝 Enviando datos de registro...');

      const response = await fetch('/api/auth/register/doctor/temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error enviando datos de registro');
      }

      if (!result.success) {
        throw new Error(result.error || 'Error en el servidor');
      }

      console.log('✅ Registro temporal creado:', result.data);

      // Guardar datos para el siguiente paso
      setRegistrationData(data);
      setVerificationToken(result.data.verification_token);
      setRegistrationId(result.data.registration_id);
      setCurrentStep('verification');

      toast({
        title: 'Registro enviado exitosamente',
        description: 'Se ha enviado un código de verificación a tu correo electrónico.',
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('❌ Error en registro:', errorMessage);
      
      setError(errorMessage);
      toast({
        title: 'Error en el registro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [clearError, toast]);

  // Paso 2: Verificar código de email
  const verifyEmail = useCallback(async (email: string, code: string) => {
    if (!registrationId) {
      setError('ID de registro no encontrado');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      console.log('🔍 Verificando código de email...');

      const response = await fetch('/api/auth/verify-email-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
          registration_id: registrationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error verificando código');
      }

      if (!result.success) {
        throw new Error(result.error || 'Error en la verificación');
      }

      console.log('✅ Email verificado exitosamente');

      setCurrentStep('completing');

      toast({
        title: 'Email verificado exitosamente',
        description: 'Procediendo a completar tu registro...',
      });

      // Automáticamente proceder a completar el registro
      await completeRegistration();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('❌ Error en verificación:', errorMessage);
      
      setError(errorMessage);
      toast({
        title: 'Error en la verificación',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [registrationId, clearError, toast]);

  // Reenviar código de verificación
  const resendVerificationCode = useCallback(async (email: string) => {
    if (!registrationId) {
      setError('ID de registro no encontrado');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      console.log('📧 Reenviando código de verificación...');

      const response = await fetch('/api/auth/verify-email-temp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          registration_id: registrationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error reenviando código');
      }

      if (!result.success) {
        throw new Error(result.error || 'Error en el servidor');
      }

      console.log('✅ Código reenviado exitosamente');

      toast({
        title: 'Código reenviado',
        description: 'Se ha enviado un nuevo código de verificación a tu correo.',
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('❌ Error reenviando código:', errorMessage);
      
      setError(errorMessage);
      toast({
        title: 'Error reenviando código',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [registrationId, clearError, toast]);

  // Paso 3: Completar registro final
  const completeRegistration = useCallback(async () => {
    if (!verificationToken) {
      setError('Token de verificación no encontrado');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      console.log('🚀 Completando registro final...');

      const response = await fetch('/api/auth/register/doctor/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_token: verificationToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error completando registro');
      }

      if (!result.success) {
        throw new Error(result.error || 'Error en el servidor');
      }

      console.log('✅ Registro completado exitosamente:', result.data);

      setCurrentStep('completed');

      toast({
        title: '¡Registro completado exitosamente!',
        description: 'Tu cuenta de médico ha sido creada. Redirigiendo al dashboard...',
      });

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/doctor/dashboard');
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('❌ Error completando registro:', errorMessage);
      
      setError(errorMessage);
      toast({
        title: 'Error completando registro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [verificationToken, clearError, toast, router]);

  // Utilidades
  const canProceedToVerification = currentStep === 'form' && !isLoading && !error;
  const canCompleteRegistration = currentStep === 'verification' && !isLoading && !error;

  return {
    // Estado
    currentStep,
    isLoading,
    error,
    verificationToken,
    registrationData,
    
    // Acciones
    submitRegistration,
    verifyEmail,
    resendVerificationCode,
    completeRegistration,
    resetRegistration,
    
    // Utilidades
    canProceedToVerification,
    canCompleteRegistration,
  };
}
