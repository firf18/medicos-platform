'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

export function useEmailVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash: token,
      });

      if (error) throw error;
      
      toast({
        title: '¡Correo verificado!',
        description: 'Tu correo electrónico ha sido verificado correctamente.',
      });
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Error verifying email:', error);
      const errorMessage = (error as PostgrestError).message || 'No se pudo verificar tu correo electrónico';
      toast({
        title: 'Error de verificación',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Correo de verificación enviado',
        description: 'Hemos enviado un nuevo enlace de verificación a tu correo electrónico.',
      });
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Error resending verification email:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al enviar el correo de verificación';
      toast({
        title: 'Error al enviar el correo',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    verifyEmail,
    resendVerificationEmail,
  };
}