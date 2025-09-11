'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Session, User, AuthError } from '@supabase/supabase-js'
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
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mantener referencia única del cliente Supabase
let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient();
  }
  return supabaseClientInstance;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = getSupabaseClient(); // Usar instancia única

  // Get the user's role from their metadata
  const getRole = useCallback((user: User | null) => {
    if (!user) return null
    return user.user_metadata?.role || 'patient'
  }, [])

  // Función para limpiar estado corrupto
  const clearCorruptedState = useCallback(async () => {
    console.log('🧹 Limpiando estado de autenticación corrupto...');
    try {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Forzar sign out sin redirigir
      await supabase.auth.signOut({ scope: 'local' });
      
      setSession(null);
      setUser(null);
      
      console.log('✅ Estado de autenticación limpiado');
    } catch (error) {
      console.error('❌ Error limpiando estado:', error);
    }
  }, [supabase])

  // Función para refrescar la sesión
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refrescando sesión...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Error refrescando sesión:', error);
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('refresh_token_not_found')) {
          await clearCorruptedState();
        }
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      console.log('✅ Sesión refrescada exitosamente');
    } catch (error) {
      console.error('❌ Error crítico refrescando sesión:', error);
      await clearCorruptedState();
    }
  }, [supabase, clearCorruptedState])

  // Manejo robusto de cambios de estado de autenticación
  const handleAuthStateChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('🔐 Auth state change:', event, currentSession ? 'Session exists' : 'No session');
    
    try {
      switch (event) {
        case 'SIGNED_IN':
          console.log('✅ Usuario autenticado:', currentSession?.user?.email);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          break;
          
        case 'SIGNED_OUT':
          console.log('👋 Usuario desautenticado');
          setSession(null);
          setUser(null);
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refrescado');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          break;
          
        case 'USER_UPDATED':
          console.log('👤 Usuario actualizado');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          break;
          
        case 'PASSWORD_RECOVERY':
          console.log('🔑 Recuperación de contraseña iniciada');
          break;
          
        default:
          console.log('🔄 Estado de auth cambiado:', event);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
      }
    } catch (error) {
      console.error('❌ Error manejando cambio de estado:', error);
    } finally {
      setIsLoading(false);
    }
  }, [])

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;
    
    console.log('🚀 Inicializando AuthProvider...');
    
    // Configurar listener de cambios de estado
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(handleAuthStateChange);
      authSubscription = data.subscription; // Acceder correctamente a la suscripción
      return data.subscription;
    };
    
    // Obtener sesión inicial
    const getInitialSession = async () => {
      if (!mounted) return;
      
      try {
        console.log('🔍 Obteniendo sesión inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error obteniendo sesión inicial:', error);
          
          // Manejar errores comunes
          if (error.message?.includes('Failed to parse') || 
              error.message?.includes('Invalid') ||
              error.message?.includes('AuthSessionMissingError')) {
            console.log('⚠️ Detectado estado corrupto, limpiando...');
            await clearCorruptedState();
            return;
          }
          
          // Para otros errores, simplemente continuar sin sesión
          setSession(null);
          setUser(null);
        } else {
          console.log('✅ Sesión inicial obtenida:', session ? 'Activa' : 'Inactiva');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error: any) {
        if (!mounted) return;
        
        console.error('❌ Error crítico obteniendo sesión:', error);
        
        // Si hay un error crítico, limpiar estado
        if (error.name === 'AuthSessionMissingError' || 
            error.message?.includes('AuthSessionMissingError') ||
            error.message?.includes('session missing')) {
          console.log('🧹 AuthSessionMissingError detectado, limpiando estado...');
          await clearCorruptedState();
        } else {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };
    
    // Configurar listener y obtener sesión inicial
    setupAuthListener();
    getInitialSession();
    
    // Cleanup
    return () => {
      mounted = false;
      if (authSubscription) {
        try {
          authSubscription.unsubscribe();
          console.log('🧹 Suscripción de auth limpiada');
        } catch (error) {
          console.warn('⚠️ Error limpiando suscripción:', error);
        }
      }
    };
  }, [supabase, handleAuthStateChange, clearCorruptedState])

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
      console.log('🔑 Iniciando sesión...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error en signIn:', error);
        return { error };
      }

      console.log('✅ Inicio de sesión exitoso');
      // El estado se actualizará automáticamente via onAuthStateChange
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error crítico en signIn:', error);
      
      // Manejar AuthSessionMissingError
      if (error.name === 'AuthSessionMissingError' || 
          error.message?.includes('AuthSessionMissingError')) {
        console.log('🧹 AuthSessionMissingError en signIn, refrescando...');
        await refreshSession();
        
        // Reintentar una vez
        try {
          const { data, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (retryError) {
            return { error: retryError };
          }
          
          return { error: null };
        } catch (retryError) {
          return { error: retryError as Error };
        }
      }
      
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Cerrando sesión...');
      
      await supabase.auth.signOut();
      
      // Limpiar estado local inmediatamente
      setUser(null);
      setSession(null);
      
      console.log('✅ Sesión cerrada exitosamente');
      
      // Redirigir después de un breve delay
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    } catch (error: any) {
      console.error('❌ Error cerrando sesión:', error);
      
      // Incluso si hay error, limpiar estado local
      setUser(null);
      setSession(null);
      
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔑 Solicitando reset de contraseña...');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        console.error('❌ Error en resetPassword:', error);
        return { error };
      }

      console.log('✅ Email de reset enviado');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error crítico en resetPassword:', error);
      return { error: error as Error };
    }
  };

  const role = getRole(user) as 'admin' | 'doctor' | 'patient' | null;
  const isAdmin = role === 'admin';
  const isDoctor = role === 'doctor';
  const isPatient = role === 'patient';

  const value = {
    user,
    session,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user && !!session,
    role,
    isAdmin,
    isDoctor,
    isPatient,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  }

  // No renderizar children hasta que esté inicializado
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
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
