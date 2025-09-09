'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type SignUpResponse = {
  error: Error | null;
  data: {
    user: User | null;
    session: Session | null;
  } | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: 'admin' | 'doctor' | 'patient' | null;
  isAdmin: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Get the user's role from their metadata
  const getRole = (user: User | null) => {
    if (!user) return null
    return user.user_metadata?.role || 'patient'
  }

  useEffect(() => {
    // Check active session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            phone: userData.phone,
            // Agregar campos adicionales según el rol
            ...(userData.role === 'doctor' && {
              specialty_id: userData.specialtyId,
              license_number: userData.licenseNumber,
              bio: userData.bio,
              experience_years: userData.experienceYears,
              consultation_fee: userData.consultationFee,
            }),
            ...(userData.role === 'patient' && {
              date_of_birth: userData.dateOfBirth,
              blood_type: userData.bloodType,
              allergies: userData.allergies,
            }),
          },
        },
      });

      if (error) {
        return { error, data: null };
      }

      return { error: null, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const role = getRole(user) as 'admin' | 'doctor' | 'patient' | null;
  const isAdmin = role === 'admin';
  const isDoctor = role === 'doctor';
  const isPatient = role === 'patient';

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    role,
    isAdmin,
    isDoctor,
    isPatient,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
