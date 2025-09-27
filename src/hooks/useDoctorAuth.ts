/**
 * Hook personalizado para autenticación de médicos
 * Maneja la autenticación específica para médicos con especialidades
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface DoctorProfile {
  id: string;
  user_id: string;
  license_number: string;
  specialty_id: string;
  bio?: string;
  consultation_fee?: number;
  experience_years?: number;
  is_available: boolean;
  rating?: number;
  created_at: string;
  updated_at: string;
}

interface Specialty {
  id: string;
  name: string;
  description?: string;
  dashboard_features?: any[];
  required_validations?: any[];
  is_active: boolean;
}

interface DoctorAuthState {
  user: User | null;
  doctorProfile: DoctorProfile | null;
  specialty: Specialty | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  error: string | null;
}

export function useDoctorAuth(): DoctorAuthState {
  const [state, setState] = useState<DoctorAuthState>({
    user: null,
    doctorProfile: null,
    specialty: null,
    isLoading: true,
    isAuthenticated: false,
    isDoctor: false,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setState(prev => ({ ...prev, error: error.message, isLoading: false }));
          }
          return;
        }

        if (session?.user) {
          await loadDoctorProfile(session.user);
        } else {
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              isLoading: false, 
              isAuthenticated: false,
              isDoctor: false 
            }));
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            error: 'Error al cargar la sesión', 
            isLoading: false 
          }));
        }
      }
    };

    // Cargar perfil del doctor
    const loadDoctorProfile = async (user: User) => {
      try {
        // Obtener perfil del doctor
        const { data: doctorProfile, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (doctorError) {
          console.error('Error loading doctor profile:', doctorError);
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              error: 'No se encontró perfil de médico', 
              isLoading: false,
              isAuthenticated: true,
              isDoctor: false
            }));
          }
          return;
        }

        if (!doctorProfile) {
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              error: 'No se encontró perfil de médico', 
              isLoading: false,
              isAuthenticated: true,
              isDoctor: false
            }));
          }
          return;
        }

        // Obtener especialidad
        let specialty = null;
        if (doctorProfile.specialty_id) {
          const { data: specialtyData, error: specialtyError } = await supabase
            .from('specialties')
            .select('*')
            .eq('id', doctorProfile.specialty_id)
            .single();

          if (!specialtyError && specialtyData) {
            specialty = specialtyData;
          }
        }

        if (mounted) {
          setState(prev => ({
            ...prev,
            user,
            doctorProfile,
            specialty,
            isLoading: false,
            isAuthenticated: true,
            isDoctor: true,
            error: null,
          }));
        }
      } catch (error) {
        console.error('Error loading doctor profile:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            error: 'Error al cargar perfil del médico', 
            isLoading: false 
          }));
        }
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          await loadDoctorProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({
            ...prev,
            user: null,
            doctorProfile: null,
            specialty: null,
            isLoading: false,
            isAuthenticated: false,
            isDoctor: false,
            error: null,
          }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

// Hook para obtener la especialidad del médico actual
export function useDoctorSpecialty() {
  const { specialty, isLoading } = useDoctorAuth();
  
  return {
    specialty,
    isLoading,
    specialtyId: specialty?.id,
    specialtyName: specialty?.name,
    dashboardFeatures: specialty?.dashboard_features || [],
  };
}

// Hook para verificar si el médico tiene acceso a una especialidad específica
export function useSpecialtyAccess(targetSpecialtyId: string) {
  const { specialty, isDoctor, isLoading } = useDoctorAuth();
  
  const hasAccess = !isLoading && isDoctor && (
    specialty?.id === targetSpecialtyId || 
    specialty?.id === 'medicina_general' || // Medicina general tiene acceso a todo
    targetSpecialtyId === 'medicina_general' // Todos tienen acceso a medicina general
  );

  return {
    hasAccess,
    isLoading,
    currentSpecialty: specialty,
  };
}
