'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type ProfileInsert = Tables['profiles']['Insert'];
type PatientInsert = Tables['patients']['Insert'];
type DoctorInsert = Tables['doctors']['Insert'];

type ProfileRole = 'admin' | 'doctor' | 'patient';

// Extender el tipo de retorno de la función insert para evitar errores de tipo
declare module '@supabase/supabase-js' {
  interface PostgrestFilterBuilder<T> {
    insert(values: any, options?: { returning?: 'minimal' | 'representation' }): this;
  }
}

// Type para los datos de registro
type SignUpData = {
  firstName: string;
  lastName: string;
  phone?: string;
  role?: ProfileRole;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  specialtyId?: number;
  licenseNumber?: string;
  bio?: string;
  experienceYears?: number;
  consultationFee?: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Verificar el estado de autenticación al cargar
  useEffect(() => {
    const getProfile = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single<Pick<Profile, 'role'>>();
      
      if (error) {
        console.error('Error al obtener el perfil:', error);
        return null;
      }
      
      return profile;
    };

    const handleAuthChange = async (event: string, currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        const profile = await getProfile(currentSession.user.id);
        
        if (profile) {
          if (profile.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (profile.role === 'doctor') {
            router.push('/doctor/dashboard');
          } else {
            router.push('/patient/dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'INITIAL_SESSION' && currentSession?.user) {
        // Verificar la ruta actual después de cargar la sesión inicial
        const path = window.location.pathname;
        if (path === '/login' || path === '/register') {
          const profile = await getProfile(currentSession.user.id);
          if (profile) {
            if (profile.role === 'admin') {
              router.push('/admin/dashboard');
            } else if (profile.role === 'doctor') {
              router.push('/doctor/dashboard');
            } else {
              router.push('/patient/dashboard');
            }
          }
        }
      }
    };

    // Obtener la sesión actual
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          await handleAuthChange('INITIAL_SESSION', currentSession);
        } else if (window.location.pathname !== '/login' && 
                  window.location.pathname !== '/register' && 
                  window.location.pathname !== '/') {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al obtener la sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Limpiar la suscripción al desmontar
    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // SignUpData type is already defined at the top of the file

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      // 1. Registrar al usuario con email y contraseña
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (signUpError) {
        console.error('Error en signUp:', signUpError);
        return { error: signUpError };
      }

      if (!data.user) {
        return { error: { message: 'No se pudo crear el usuario' } };
      }

      const userId = data.user.id;
      const role = userData.role || 'patient';
      const now = new Date().toISOString();

      // 2. Crear el perfil del usuario
      const profileData = {
        id: userId,
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        role,
        created_at: now,
        updated_at: now,
      } as const;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData as any);

      if (profileError) {
        console.error('Error al crear el perfil:', profileError);
        return { error: profileError };
      }

      // 3. Crear registro específico según el rol
      if (role === 'patient') {
        const patientData = {
          id: userId,
          date_of_birth: userData.dateOfBirth || null,
          blood_type: userData.bloodType || null,
          allergies: userData.allergies || [],
          created_at: now,
          updated_at: now,
          emergency_contact_name: null,
          emergency_contact_phone: null
        } as const;

        const { error: patientError } = await supabase
          .from('patients')
          .insert(patientData as any);

        if (patientError) {
          console.error('Error al crear el paciente:', patientError);
          return { error: patientError };
        }
      } else if (role === 'doctor') {
        // Asegurarse de que specialtyId sea un número válido
        if (!userData.specialtyId) {
          return { error: { message: 'Se requiere un ID de especialidad para el doctor' } };
        }

        const doctorData: Omit<DoctorInsert, 'rating' | 'is_available'> = {
          id: userId,
          specialty_id: userData.specialtyId,
          license_number: userData.licenseNumber || '',
          bio: userData.bio || null,
          experience_years: userData.experienceYears || 0,
          consultation_fee: userData.consultationFee || 0,
          created_at: now,
          updated_at: now,
        };

        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            ...doctorData,
            is_available: true,
            rating: null
          } as any);

        if (doctorError) {
          console.error('Error al crear el doctor:', doctorError);
          return { error: doctorError };
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error en el registro:', error);
      return { 
        error: { 
          message: 'Error inesperado durante el registro',
          details: error 
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin: user?.user_metadata?.role === 'admin',
    isDoctor: user?.user_metadata?.role === 'doctor',
    isPatient: user?.user_metadata?.role === 'patient' || !user?.user_metadata?.role,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
