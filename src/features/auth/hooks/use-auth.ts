'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '../../../components/ui/use-toast';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

type UserRole = 'patient' | 'doctor' | 'clinic' | 'laboratory' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  } | null;
}

interface AuthResult {
  success: boolean;
  error?: unknown;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get additional user data from the database if needed
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: session.user.id,
              email: session.user.email || '',
              role: (userData as { role?: UserRole })?.role || 'patient',
              firstName: (userData as { first_name?: string })?.first_name || '',
              lastName: (userData as { last_name?: string })?.last_name || '',
            },
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      },
    );

    // Initial check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: user.id,
            email: user.email || '',
            role: (userData as { role?: UserRole })?.role || 'patient',
            firstName: (userData as { first_name?: string })?.first_name || '',
            lastName: (userData as { last_name?: string })?.last_name || '',
          },
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    checkUser();

    return () => {
      try {
        subscription?.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Error cleaning up auth subscription:', error);
      }
    };
  }, [supabase, supabase.auth]); // Added supabase to dependencies

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user role from the database
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          role: (userData as { role?: UserRole })?.role || 'patient',
          firstName: (userData as { first_name?: string })?.first_name || '',
          lastName: (userData as { last_name?: string })?.last_name || '',
        },
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Error signing in:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al iniciar sesión';
      toast({
        title: 'Error al iniciar sesión',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: SignUpData): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) throw error;

      // Create user profile in the database
      if (data.user) {
        const { error: profileError } = await (supabase as SupabaseClient)
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role || 'patient',
            },
          ]);

        if (profileError) throw profileError;
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al crear la cuenta';
      toast({
        title: 'Error al registrarse',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Sign out
  const signOut = async (): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      
      router.push('/login');
      return { success: true };
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al cerrar la sesión';
      toast({
        title: 'Error al cerrar sesión',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al enviar el correo de restablecimiento';
      toast({
        title: 'Error al restablecer la contraseña',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al actualizar la contraseña';
      toast({
        title: 'Error al actualizar la contraseña',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) throw error;
      
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
    }
  };

  // Check if user email is verified
  const isEmailVerified = (): boolean => {
    return authState.user?.email ? true : false; // En un caso real, verificaríamos el estado real del email
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    isEmailVerified,
  };
}

export default useAuth;