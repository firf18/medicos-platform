'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '../../../components/ui/use-toast';

type UserRole = 'patient' | 'doctor' | 'admin' | null;

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
              role: (userData as any)?.role || 'patient',
              firstName: (userData as any)?.first_name || '',
              lastName: (userData as any)?.last_name || '',
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
            role: (userData as any)?.role || 'patient',
            firstName: (userData as any)?.first_name || '',
            lastName: (userData as any)?.last_name || '',
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
  }, [supabase.auth]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
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
          role: (userData as any)?.role || 'patient',
          firstName: (userData as any)?.first_name || '',
          lastName: (userData as any)?.last_name || '',
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error al iniciar sesión',
        description: error.message || 'Ocurrió un error al iniciar sesión',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) throw error;

      // Create user profile in the database
      if (data.user) {
        const { error: profileError } = await (supabase as any)
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
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Error al registrarse',
        description: error.message || 'Ocurrió un error al crear la cuenta',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Sign out
  const signOut = async () => {
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
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error al cerrar sesión',
        description: error.message || 'Ocurrió un error al cerrar la sesión',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error al restablecer la contraseña',
        description: error.message || 'Ocurrió un error al enviar el correo de restablecimiento',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error al actualizar la contraseña',
        description: error.message || 'Ocurrió un error al actualizar la contraseña',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}

export default useAuth;
