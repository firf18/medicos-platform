/**
 * Sistema de Registro Temporal de Médicos - Red-Salud
 * 
 * Este servicio maneja el almacenamiento temporal de datos de registro
 * antes de la verificación de correo electrónico.
 */

import { createClient } from './client';
import { createAdminClient } from './admin';
import { DoctorRegistrationData } from '@/types/medical/specialties';

export interface TemporaryRegistrationData {
  id: string;
  email: string;
  verification_token: string;
  registration_data: DoctorRegistrationData;
  status: 'pending_verification' | 'email_verified' | 'registration_completed' | 'expired' | 'cancelled';
  email_verified_at?: string;
  verification_attempts: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationCodeData {
  id: string;
  registration_temp_id: string;
  email: string;
  code: string;
  attempts: number;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface TemporaryRegistrationResponse {
  success: boolean;
  data?: TemporaryRegistrationData;
  error?: string;
  verification_token?: string;
}

/**
 * Crea un registro temporal de médico
 */
export async function createTemporaryRegistration(
  registrationData: DoctorRegistrationData
): Promise<TemporaryRegistrationResponse> {
  const admin = createAdminClient();
  
  try {
    // Validar datos de entrada
    if (!registrationData.email || !registrationData.firstName || !registrationData.lastName) {
      return {
        success: false,
        error: 'Datos de registro incompletos'
      };
    }

    // Verificar si ya existe un registro temporal para este email
    const { data: existingRegistration, error: checkError } = await admin
      .from('doctor_registration_temp')
      .select('id, status, expires_at')
      .eq('email', registrationData.email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing registration:', checkError);
      return {
        success: false,
        error: 'Error verificando registro existente'
      };
    }

    // Si existe un registro activo, actualizarlo
    if (existingRegistration && existingRegistration.status !== 'expired' && 
        new Date(existingRegistration.expires_at) > new Date()) {
      
      const { data: updatedRegistration, error: updateError } = await admin
        .from('doctor_registration_temp')
        .update({
          registration_data: registrationData,
          verification_attempts: 0,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 horas
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRegistration.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating existing registration:', updateError);
        return {
          success: false,
          error: 'Error actualizando registro existente'
        };
      }

      return {
        success: true,
        data: updatedRegistration,
        verification_token: updatedRegistration.verification_token
      };
    }

    // Crear nuevo registro temporal
    const verificationToken = `reg_${crypto.randomUUID().replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 horas

    const { data: newRegistration, error: createError } = await admin
      .from('doctor_registration_temp')
      .insert({
        email: registrationData.email.toLowerCase(),
        verification_token: verificationToken,
        registration_data: registrationData,
        status: 'pending_verification',
        expires_at: expiresAt
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating temporary registration:', createError);
      return {
        success: false,
        error: 'Error creando registro temporal'
      };
    }

    // Log de creación
    await admin
      .from('registration_verification_logs')
      .insert({
        registration_temp_id: newRegistration.id,
        action: 'registration_created',
        status: 'success',
        metadata: {
          email: registrationData.email,
          specialty_id: registrationData.specialtyId
        }
      });

    return {
      success: true,
      data: newRegistration,
      verification_token: verificationToken
    };

  } catch (error: any) {
    console.error('Unexpected error in createTemporaryRegistration:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Genera y envía código de verificación por email
 */
export async function generateVerificationCode(
  email: string,
  registrationTempId: string
): Promise<{ success: boolean; error?: string; code?: string }> {
  const admin = createAdminClient();
  
  try {
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    // Eliminar códigos anteriores no usados para este email
    await admin
      .from('email_verification_codes_temp')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('used', false);

    // Crear nuevo código
    const { data: verificationCode, error: createError } = await admin
      .from('email_verification_codes_temp')
      .insert({
        registration_temp_id: registrationTempId,
        email: email.toLowerCase(),
        code: code,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating verification code:', createError);
      return {
        success: false,
        error: 'Error generando código de verificación'
      };
    }

    // Log de generación de código
    await admin
      .from('registration_verification_logs')
      .insert({
        registration_temp_id: registrationTempId,
        action: 'verification_code_generated',
        status: 'success',
        metadata: {
          email: email,
          code_length: code.length
        }
      });

    return {
      success: true,
      code: code // En producción, esto se enviaría por email
    };

  } catch (error: any) {
    console.error('Unexpected error in generateVerificationCode:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Verifica código de verificación
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string; registrationData?: DoctorRegistrationData }> {
  const admin = createAdminClient();
  
  try {
    // Buscar código de verificación
    const { data: verificationCode, error: codeError } = await admin
      .from('email_verification_codes_temp')
      .select('*, doctor_registration_temp(*)')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (codeError) {
      console.error('Error finding verification code:', codeError);
      return {
        success: false,
        error: 'Error verificando código'
      };
    }

    if (!verificationCode) {
      return {
        success: false,
        error: 'Código inválido o expirado'
      };
    }

    // Verificar intentos
    if (verificationCode.attempts >= verificationCode.max_attempts) {
      return {
        success: false,
        error: 'Demasiados intentos fallidos'
      };
    }

    // Marcar código como usado
    const { error: updateError } = await admin
      .from('email_verification_codes_temp')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', verificationCode.id);

    if (updateError) {
      console.error('Error marking code as used:', updateError);
      return {
        success: false,
        error: 'Error procesando verificación'
      };
    }

    // Actualizar estado del registro temporal
    const { error: statusError } = await admin
      .from('doctor_registration_temp')
      .update({
        status: 'email_verified',
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationCode.registration_temp_id);

    if (statusError) {
      console.error('Error updating registration status:', statusError);
      return {
        success: false,
        error: 'Error actualizando estado de registro'
      };
    }

    // Log de verificación exitosa
    await admin
      .from('registration_verification_logs')
      .insert({
        registration_temp_id: verificationCode.registration_temp_id,
        action: 'email_verified',
        status: 'success',
        metadata: {
          email: email,
          verification_method: 'code'
        }
      });

    return {
      success: true,
      registrationData: verificationCode.doctor_registration_temp.registration_data
    };

  } catch (error: any) {
    console.error('Unexpected error in verifyEmailCode:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Obtiene datos de registro temporal por token
 */
export async function getTemporaryRegistration(
  verificationToken: string
): Promise<{ success: boolean; data?: TemporaryRegistrationData; error?: string }> {
  const admin = createAdminClient();
  
  try {
    const { data: registration, error } = await admin
      .from('doctor_registration_temp')
      .select('*')
      .eq('verification_token', verificationToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error fetching temporary registration:', error);
      return {
        success: false,
        error: 'Error obteniendo registro temporal'
      };
    }

    if (!registration) {
      return {
        success: false,
        error: 'Registro no encontrado o expirado'
      };
    }

    return {
      success: true,
      data: registration
    };

  } catch (error: any) {
    console.error('Unexpected error in getTemporaryRegistration:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Limpia registros expirados
 */
export async function cleanupExpiredRegistrations(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  const admin = createAdminClient();
  
  try {
    const { data, error } = await admin.rpc('cleanup_expired_registrations');

    if (error) {
      console.error('Error cleaning up expired registrations:', error);
      return {
        success: false,
        error: 'Error limpiando registros expirados'
      };
    }

    return {
      success: true,
      deletedCount: data
    };

  } catch (error: any) {
    console.error('Unexpected error in cleanupExpiredRegistrations:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Cancela un registro temporal
 */
export async function cancelTemporaryRegistration(
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  
  try {
    const { error } = await admin
      .from('doctor_registration_temp')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('verification_token', verificationToken);

    if (error) {
      console.error('Error cancelling registration:', error);
      return {
        success: false,
        error: 'Error cancelando registro'
      };
    }

    return {
      success: true
    };

  } catch (error: any) {
    console.error('Unexpected error in cancelTemporaryRegistration:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}
