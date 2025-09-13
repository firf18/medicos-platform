/**
 * Servicio de Registro de Médicos con Supabase - Red-Salud
 * 
 * Este servicio maneja el registro completo de médicos en Supabase,
 * incluyendo autenticación, creación de perfil y configuración inicial.
 */

import { createClient } from './client';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { logSecurityEvent } from '@/lib/validations/doctor-registration';

export interface DoctorRegistrationResponse {
  success: boolean;
  user?: any;
  profile?: any;
  error?: string;
  needsEmailVerification?: boolean;
}

/**
 * Registra un nuevo médico en el sistema
 */
export async function registerDoctor(
  registrationData: DoctorRegistrationData
): Promise<DoctorRegistrationResponse> {
  const supabase = createClient();
  
  try {
    // Log de inicio de registro
    logSecurityEvent('doctor_registration_started', {
      email: registrationData.email,
      specialtyId: registrationData.specialtyId,
      timestamp: new Date().toISOString()
    });

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registrationData.email,
      password: registrationData.password,
      options: {
        data: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          userType: 'doctor',
          registrationStep: 'auth_created'
        }
      }
    });

    if (authError) {
      logSecurityEvent('doctor_registration_auth_failed', {
        error: authError.message,
        email: registrationData.email,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No se pudo crear el usuario'
      };
    }

    // 2. Crear perfil de médico en la tabla profiles
    const profileData = {
      id: authData.user.id,
      email: registrationData.email,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      phone: registrationData.phone,
      user_type: 'doctor' as const,
      status: 'pending_verification' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      logSecurityEvent('doctor_registration_profile_failed', {
        error: profileError.message,
        userId: authData.user.id,
        email: registrationData.email,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: `Error al crear perfil: ${profileError.message}`
      };
    }

    // 3. Crear perfil específico de médico en la tabla doctor_profiles
    const doctorProfileData = {
      user_id: authData.user.id,
      license_number: registrationData.licenseNumber,
      license_state: registrationData.licenseState,
      license_expiry: registrationData.licenseExpiry,
      specialty_id: registrationData.specialtyId,
      sub_specialties: registrationData.subSpecialties || [],
      years_of_experience: registrationData.yearsOfExperience,
      current_hospital: registrationData.currentHospital || null,
      clinic_affiliations: registrationData.clinicAffiliations || [],
      bio: registrationData.bio,
      verification_status: 'pending' as const,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: doctorProfileError } = await supabase
      .from('doctor_profiles')
      .insert(doctorProfileData);

    if (doctorProfileError) {
      logSecurityEvent('doctor_registration_doctor_profile_failed', {
        error: doctorProfileError.message,
        userId: authData.user.id,
        email: registrationData.email,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: `Error al crear perfil médico: ${doctorProfileError.message}`
      };
    }

    // 4. Guardar configuración del dashboard
    if (registrationData.selectedFeatures && registrationData.selectedFeatures.length > 0) {
      const dashboardConfigData = {
        doctor_id: authData.user.id,
        selected_features: registrationData.selectedFeatures,
        working_hours: registrationData.workingHours || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: dashboardError } = await supabase
        .from('doctor_dashboard_configs')
        .insert(dashboardConfigData);

      if (dashboardError) {
        // No es crítico, solo loggeamos el error
        logSecurityEvent('doctor_registration_dashboard_config_failed', {
          error: dashboardError.message,
          userId: authData.user.id,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 5. Log de éxito
    logSecurityEvent('doctor_registration_completed', {
      userId: authData.user.id,
      email: registrationData.email,
      specialtyId: registrationData.specialtyId,
      licenseNumber: registrationData.licenseNumber,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      user: authData.user,
      profile: profileData,
      needsEmailVerification: !authData.user.email_confirmed_at
    };

  } catch (error: any) {
    logSecurityEvent('doctor_registration_unexpected_error', {
      error: error.message,
      email: registrationData.email,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: error.message || 'Error inesperado durante el registro'
    };
  }
}

/**
 * Verifica si un email ya está registrado
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = No rows found, que significa que el email está disponible
      console.error('Error checking email availability:', error);
      return false;
    }
    
    // Si no hay datos, el email está disponible
    return !data;
    
  } catch (error) {
    console.error('Error checking email availability:', error);
    return false;
  }
}

/**
 * Verifica si un número de cédula ya está registrado
 */
export async function checkLicenseAvailability(licenseNumber: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('license_number')
      .eq('license_number', licenseNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking license availability:', error);
      return false;
    }
    
    // Si no hay datos, la cédula está disponible
    return !data;
    
  } catch (error) {
    console.error('Error checking license availability:', error);
    return false;
  }
}

/**
 * Obtiene la información de una especialidad médica
 */
export async function getSpecialtyInfo(specialtyId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('medical_specialties')
      .select('*')
      .eq('id', specialtyId)
      .single();
    
    if (error) {
      console.error('Error fetching specialty info:', error);
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('Error fetching specialty info:', error);
    return null;
  }
}

/**
 * Obtiene todas las especialidades médicas disponibles
 */
export async function getMedicalSpecialties() {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('medical_specialties')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching medical specialties:', error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Error fetching medical specialties:', error);
    return [];
  }
}

/**
 * Reenvía el email de verificación
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return { success: true };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al reenviar email de verificación'
    };
  }
}
