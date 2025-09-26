/**
 * Sistema de Registro Final de Médicos - Red-Salud
 * 
 * Este servicio maneja el registro final en Supabase después de la verificación de email.
 */

import { createClient } from './client';
import { createAdminClient } from './admin';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { logSecurityEvent } from '@/lib/validations/security.validations';

export interface FinalRegistrationResponse {
  success: boolean;
  user?: any;
  profile?: any;
  doctor?: any;
  error?: string;
  needsEmailVerification?: boolean;
}

/**
 * Completa el registro de médico en Supabase después de verificación de email
 */
export async function completeDoctorRegistration(
  verificationToken: string
): Promise<FinalRegistrationResponse> {
  const admin = createAdminClient();
  
  try {
    console.log('🚀 Iniciando registro final de médico...');
    
    // 1. Obtener datos del registro temporal
    const { data: tempRegistration, error: tempError } = await admin
      .from('doctor_registration_temp')
      .select('*')
      .eq('verification_token', verificationToken)
      .eq('status', 'email_verified')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (tempError) {
      console.error('Error obteniendo registro temporal:', tempError);
      return {
        success: false,
        error: 'Error obteniendo datos de registro'
      };
    }

    if (!tempRegistration) {
      return {
        success: false,
        error: 'Registro no encontrado o no verificado'
      };
    }

    const registrationData: DoctorRegistrationData = tempRegistration.registration_data;

    // Log de inicio de registro final
    logSecurityEvent('doctor_final_registration_started', {
      email: registrationData.email,
      specialtyId: registrationData.specialtyId,
      registrationId: tempRegistration.id,
      timestamp: new Date().toISOString()
    });

    // 2. Verificar si el usuario ya existe en Supabase Auth
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers();
    
    let existingUser = null;
    if (!listError && authUsers?.users) {
      existingUser = authUsers.users.find(user => user.email === registrationData.email);
    }

    let authData = null;
    let authError = null;

    if (existingUser) {
      // Usar usuario existente
      console.log('✅ Usando usuario existente de Auth');
      authData = { user: existingUser };
    } else {
      // Crear nuevo usuario en Supabase Auth
      console.log('🔍 Creando nuevo usuario en Supabase Auth...');
      
      const { data: signUpData, error: signUpError } = await admin.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
            userType: 'doctor',
            registrationStep: 'final_registration',
            phone: registrationData.phone,
            specialtyId: registrationData.specialtyId,
            licenseNumber: registrationData.licenseNumber || 'PENDING_SACS',
            documentNumber: registrationData.documentNumber,
            documentType: registrationData.documentType || 'cedula'
          }
        }
      });

      if (signUpError) {
        console.error('Error creando usuario en Auth:', signUpError);
        return {
          success: false,
          error: `Error creando usuario: ${signUpError.message}`
        };
      }

      authData = signUpData;
    }

    if (!authData?.user) {
      return {
        success: false,
        error: 'No se pudo crear usuario en el sistema de autenticación'
      };
    }

    console.log('✅ Usuario disponible en Auth:', authData.user.id);

    // 3. Crear perfil en la tabla profiles
    const profileData = {
      id: authData.user.id,
      email: registrationData.email,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      phone: registrationData.phone,
      role: 'doctor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await admin
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      
      logSecurityEvent('doctor_final_registration_profile_failed', {
        userId: authData.user.id,
        email: registrationData.email,
        error: profileError.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: `Error al crear perfil: ${profileError.message}`
      };
    }

    console.log('✅ Perfil creado para user_id:', authData.user.id);

    // 4. Crear perfil de doctor en la tabla doctors
    const licenseNumber = registrationData.licenseNumber || `PENDING_SACS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const doctorData = {
      id: authData.user.id,
      specialty_id: registrationData.specialtyId,
      license_number: licenseNumber,
      email: registrationData.email,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      full_name: `${registrationData.firstName} ${registrationData.lastName}`,
      bio: registrationData.bio || null,
      experience_years: registrationData.yearsOfExperience || 0,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: doctorError } = await admin
      .from('doctors')
      .insert(doctorData);

    if (doctorError) {
      console.error('Error creando perfil de doctor:', doctorError);
      
      logSecurityEvent('doctor_final_registration_doctor_failed', {
        userId: authData.user.id,
        email: registrationData.email,
        error: doctorError.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: `Error al crear perfil de doctor: ${doctorError.message}`
      };
    }

    console.log('✅ Perfil de doctor creado para user_id:', authData.user.id);

    // 5. Crear configuración del dashboard del doctor
    if (registrationData.selectedFeatures && registrationData.selectedFeatures.length > 0) {
      const dashboardConfigData = {
        doctor_id: authData.user.id,
        selected_features: registrationData.selectedFeatures,
        working_hours: registrationData.workingHours || {},
        theme_preferences: {},
        notification_settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: dashboardError } = await admin
        .from('doctor_dashboard_configs')
        .insert(dashboardConfigData);

      if (dashboardError) {
        console.log('⚠️ Error creando configuración del dashboard:', dashboardError.message);
        // No es crítico, continuamos
      } else {
        console.log('✅ Configuración del dashboard creada para user_id:', authData.user.id);
      }
    }

    // 6. Actualizar estado del registro temporal
    const { error: updateError } = await admin
      .from('doctor_registration_temp')
      .update({
        status: 'registration_completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tempRegistration.id);

    if (updateError) {
      console.log('⚠️ Error actualizando estado del registro temporal:', updateError.message);
      // No es crítico, continuamos
    }

    // 7. Log de éxito
    logSecurityEvent('doctor_final_registration_completed', {
      userId: authData.user.id,
      email: registrationData.email,
      specialtyId: registrationData.specialtyId,
      licenseNumber: licenseNumber,
      registrationId: tempRegistration.id,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Registro final completado exitosamente');

    return {
      success: true,
      user: authData.user,
      profile: profileData,
      doctor: doctorData,
      needsEmailVerification: !authData.user.email_confirmed_at
    };

  } catch (error: any) {
    console.error('❌ Error inesperado en registro final:', error);
    
    logSecurityEvent('doctor_final_registration_unexpected_error', {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: error.message || 'Error inesperado durante el registro final'
    };
  }
}

/**
 * Verifica si un registro temporal está listo para completar
 */
export async function checkRegistrationReady(
  verificationToken: string
): Promise<{ success: boolean; ready?: boolean; error?: string; data?: any }> {
  const admin = createAdminClient();
  
  try {
    const { data: registration, error } = await admin
      .from('doctor_registration_temp')
      .select('*')
      .eq('verification_token', verificationToken)
      .maybeSingle();

    if (error) {
      console.error('Error checking registration:', error);
      return {
        success: false,
        error: 'Error verificando registro'
      };
    }

    if (!registration) {
      return {
        success: false,
        error: 'Registro no encontrado'
      };
    }

    // Verificar si está expirado
    if (new Date(registration.expires_at) <= new Date()) {
      return {
        success: true,
        ready: false,
        error: 'Registro expirado'
      };
    }

    // Verificar si el email está verificado
    if (registration.status !== 'email_verified') {
      return {
        success: true,
        ready: false,
        error: 'Email no verificado'
      };
    }

    return {
      success: true,
      ready: true,
      data: {
        id: registration.id,
        email: registration.email,
        status: registration.status,
        email_verified_at: registration.email_verified_at,
        expires_at: registration.expires_at
      }
    };

  } catch (error: any) {
    console.error('Unexpected error in checkRegistrationReady:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Obtiene estadísticas de registros temporales
 */
export async function getRegistrationStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  const admin = createAdminClient();
  
  try {
    const { data: stats, error } = await admin
      .from('doctor_registration_temp')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        
        const statusCounts = result.data.reduce((acc: any, item: any) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});

        return {
          data: {
            total: result.data.length,
            by_status: statusCounts,
            pending_verification: statusCounts.pending_verification || 0,
            email_verified: statusCounts.email_verified || 0,
            registration_completed: statusCounts.registration_completed || 0,
            expired: statusCounts.expired || 0,
            cancelled: statusCounts.cancelled || 0
          }
        };
      });

    if (error) {
      console.error('Error getting registration stats:', error);
      return {
        success: false,
        error: 'Error obteniendo estadísticas'
      };
    }

    return {
      success: true,
      stats: stats
    };

  } catch (error: any) {
    console.error('Unexpected error in getRegistrationStats:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}
