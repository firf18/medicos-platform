/**
 * 🎯 ENDPOINT UNIFICADO DE REGISTRO DE MÉDICOS
 * 
 * Consolida toda la funcionalidad de los 4 endpoints fragmentados:
 * - /temp (registro temporal)
 * - /complete (completar registro)
 * - /finalize (finalizar registro)
 * - /mark-verification-complete (marcar verificación)
 * 
 * Flujo unificado con manejo de estado interno
 */

import { NextRequest, NextResponse } from 'next/server';
import { createTemporaryRegistration } from '@/lib/supabase/temporary-registration';
import { completeDoctorRegistration, checkRegistrationReady } from '@/lib/supabase/final-registration';
import { createAdminClient } from '@/lib/supabase/admin';
import { completeDoctorRegistrationSchema } from '@/lib/validations';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import bcrypt from 'bcrypt';

// Tipos para el endpoint unificado
interface RegistrationRequest {
  // Datos del médico
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialtyId: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  institution?: string;
  
  // Estado del proceso
  step?: 'temp' | 'complete' | 'finalize' | 'verify';
  verification_token?: string;
  sessionId?: string;
  diditStatus?: string;
}

interface RegistrationResponse {
  success: boolean;
  step: string;
  message: string;
  data?: any;
  error?: string;
  details?: any[];
}

/**
 * Endpoint unificado para registro de médicos
 * POST /api/auth/register/doctor
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando proceso unificado de registro de médico...');
    
    const requestData: RegistrationRequest = await request.json();
    const { step = 'temp', ...registrationData } = requestData;
    
    console.log('📊 Paso del proceso:', step, {
      email: registrationData.email,
      hasPassword: !!registrationData.password,
      hasVerificationToken: !!registrationData.verification_token
    });

    // Log de seguridad inicial
    logSecurityEvent('doctor_unified_registration_started', 'Doctor unified registration started', {
      email: registrationData.email,
      step,
      timestamp: new Date().toISOString()
    });

    // Procesar según el paso
    switch (step) {
      case 'temp':
        return await handleTemporaryRegistration(registrationData);
      
      case 'complete':
        return await handleCompleteRegistration(registrationData);
      
      case 'finalize':
        return await handleFinalizeRegistration(registrationData);
      
      case 'verify':
        return await handleVerificationComplete(registrationData);
      
      default:
        return NextResponse.json({
          success: false,
          step: 'error',
          message: 'Paso de registro inválido',
          error: 'Step debe ser: temp, complete, finalize, o verify'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error en endpoint unificado:', error);
    
    logSecurityEvent('doctor_unified_registration_error', 'Doctor unified registration error', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      step: 'error',
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Manejar registro temporal
 */
async function handleTemporaryRegistration(data: Omit<RegistrationRequest, 'step'>): Promise<NextResponse<RegistrationResponse>> {
  try {
    console.log('📝 Procesando registro temporal...');
    
    // Validar datos de entrada
    const validationResult = completeDoctorRegistrationSchema.safeParse(data);
    
    if (!validationResult.success) {
      console.log('❌ Validación fallida:', validationResult.error.issues);
      return NextResponse.json({
        success: false,
        step: 'temp',
        message: 'Datos de registro inválidos',
        error: 'Validación fallida',
        details: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    // Crear registro temporal
    const result = await createTemporaryRegistration(validationResult.data);

    if (!result.success) {
      console.error('❌ Error creando registro temporal:', result.error);
      
      logSecurityEvent('doctor_temp_registration_failed', 'Doctor temporary registration failed', {
        email: data.email,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        step: 'error',
        message: 'Error creando registro temporal',
        error: result.error || 'Error desconocido'
      }, { status: 500 });
    }

    console.log('✅ Registro temporal creado exitosamente');
    
    logSecurityEvent('doctor_temp_registration_success', 'Doctor temporary registration success', {
      email: data.email,
      registrationId: result.data?.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      step: 'temp',
      message: 'Registro temporal creado exitosamente',
      data: {
        registrationId: result.data?.id,
        verificationToken: result.data?.verification_token,
        nextStep: 'complete'
      }
    });

  } catch (error) {
    console.error('❌ Error en registro temporal:', error);
    return NextResponse.json({
      success: false,
      step: 'error',
      message: 'Error procesando registro temporal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Manejar completación de registro
 */
async function handleCompleteRegistration(data: Omit<RegistrationRequest, 'step'>): Promise<NextResponse<RegistrationResponse>> {
  try {
    console.log('✅ Procesando completación de registro...');
    
    const { verification_token } = data;

    // Validar token de verificación
    if (!verification_token) {
      return NextResponse.json({
        success: false,
        step: 'complete',
        message: 'Token de verificación requerido',
        error: 'verification_token es requerido'
      }, { status: 400 });
    }

    // Verificar que el registro esté listo para completar
    const readyCheck = await checkRegistrationReady(verification_token);

    if (!readyCheck.success) {
      return NextResponse.json({
        success: false,
        step: 'complete',
        message: 'Error verificando registro',
        error: readyCheck.error || 'Registro no está listo para completar'
      }, { status: 400 });
    }

    // Completar registro
    const result = await completeDoctorRegistration(verification_token);

    if (!result.success) {
      console.error('❌ Error completando registro:', result.error);
      
      logSecurityEvent('doctor_complete_registration_failed', 'Doctor complete registration failed', {
        verificationToken: verification_token,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        step: 'complete',
        message: 'Error completando registro',
        error: result.error || 'Error desconocido'
      }, { status: 500 });
    }

    console.log('✅ Registro completado exitosamente');
    
    logSecurityEvent('doctor_complete_registration_success', 'Doctor complete registration success', {
      verificationToken: verification_token,
      doctorId: result.doctor?.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      step: 'complete',
      message: 'Registro completado exitosamente',
      data: {
        doctorId: result.doctor?.id,
        nextStep: 'finalize'
      }
    });

  } catch (error) {
    console.error('❌ Error en completación de registro:', error);
    return NextResponse.json({
      success: false,
      step: 'complete',
      message: 'Error procesando completación de registro',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Manejar finalización de registro
 */
async function handleFinalizeRegistration(data: Omit<RegistrationRequest, 'step'>): Promise<NextResponse<RegistrationResponse>> {
  try {
    console.log('🏁 Procesando finalización de registro...');
    
    // Validación previa de datos críticos
    if (!data.password || data.password.length < 6) {
      return NextResponse.json({
        success: false,
        step: 'finalize',
        message: 'Contraseña inválida',
        error: 'Contraseña debe tener al menos 6 caracteres'
      }, { status: 400 });
    }
    
    if (!data.firstName || !data.lastName) {
      return NextResponse.json({
        success: false,
        step: 'finalize',
        message: 'Datos requeridos faltantes',
        error: 'Nombre y apellido son requeridos'
      }, { status: 400 });
    }

    const admin = createAdminClient();

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        specialtyId: data.specialtyId,
        role: 'doctor'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError);
      
      logSecurityEvent('doctor_finalize_registration_auth_failed', 'Doctor finalize registration auth failed', {
        email: data.email,
        error: authError.message,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        step: 'finalize',
        message: 'Error creando usuario',
        error: authError.message
      }, { status: 500 });
    }

    // Crear perfil básico en tabla profiles
    const { data: profileData, error: profileError } = await (admin as any)
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: 'doctor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      
      // Limpiar usuario creado en Auth si falla el perfil
      await admin.auth.admin.deleteUser(authData.user.id);
      
      logSecurityEvent('doctor_finalize_registration_profile_failed', 'Doctor finalize registration profile failed', {
        email: data.email,
        userId: authData.user.id,
        error: profileError.message,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        step: 'finalize',
        message: 'Error creando perfil',
        error: profileError.message
      }, { status: 500 });
    }

    // Crear registro profesional en tabla doctors
    const { data: doctorData, error: doctorError } = await (admin as any)
      .from('doctors')
      .insert({
        id: authData.user.id,
        license_number: data.licenseNumber,
        specialty_id: parseInt(data.specialtyId),
        experience_years: (data as any).yearsOfExperience || 0,
        bio: (data as any).bio || '',
        is_available: false, // Inicialmente no disponible hasta verificación
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (doctorError) {
      console.error('❌ Error creando registro de doctor:', doctorError);
      
      // Limpiar usuario y perfil creados si falla el registro de doctor
      await admin.auth.admin.deleteUser(authData.user.id);
      await (admin as any).from('profiles').delete().eq('id', authData.user.id);
      
      logSecurityEvent('doctor_finalize_registration_doctor_failed', 'Doctor finalize registration doctor failed', {
        email: data.email,
        userId: authData.user.id,
        error: doctorError.message,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        step: 'finalize',
        message: 'Error creando registro de doctor',
        error: doctorError.message
      }, { status: 500 });
    }

    console.log('✅ Registro finalizado exitosamente');
    
    logSecurityEvent('doctor_finalize_registration_success', 'Doctor finalize registration success', {
      email: data.email,
      userId: authData.user.id,
      doctorId: profileData.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      step: 'finalize',
      message: 'Registro finalizado exitosamente',
      data: {
        userId: authData.user.id,
        doctorId: profileData.id,
        email: data.email,
        nextStep: 'complete'
      }
    });

  } catch (error) {
    console.error('❌ Error en finalización de registro:', error);
    return NextResponse.json({
      success: false,
      step: 'finalize',
      message: 'Error procesando finalización de registro',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Manejar marcado de verificación como completada
 */
async function handleVerificationComplete(data: Omit<RegistrationRequest, 'step'>): Promise<NextResponse<RegistrationResponse>> {
  try {
    console.log('🔍 Procesando marcado de verificación...');
    
    const { sessionId, diditStatus } = data;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        step: 'verify',
        message: 'SessionId requerido',
        error: 'sessionId es requerido'
      }, { status: 400 });
    }

    const admin = createAdminClient();

    // Buscar el registro por verification_session_id
    const { data: reg, error: regErr } = await (admin as any)
      .from('doctor_registrations')
      .select('*')
      .eq('verification_session_id', sessionId)
      .single();

    if (regErr || !reg) {
      console.error('❌ Registro no encontrado:', regErr);
      return NextResponse.json({
        success: false,
        step: 'verify',
        message: 'Registro no encontrado',
        error: 'No se encontró registro con el sessionId proporcionado'
      }, { status: 404 });
    }

    // Actualizar estado de verificación
    const { error: updateErr } = await (admin as any)
      .from('doctor_registrations')
      .update({
        verification_completed: true,
        verification_status: diditStatus || 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', reg.id);

    if (updateErr) {
      console.error('❌ Error actualizando verificación:', updateErr);
      return NextResponse.json({
        success: false,
        step: 'verify',
        message: 'Error actualizando verificación',
        error: updateErr.message
      }, { status: 500 });
    }

    console.log('✅ Verificación marcada como completada');
    
    logSecurityEvent('doctor_verification_marked_complete', 'Doctor verification marked complete', {
      sessionId,
      registrationId: reg.id,
      diditStatus,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      step: 'verify',
      message: 'Verificación marcada como completada',
      data: {
        registrationId: reg.id,
        verificationCompleted: true,
        nextStep: 'complete'
      }
    });

  } catch (error) {
    console.error('❌ Error en marcado de verificación:', error);
    return NextResponse.json({
      success: false,
      step: 'verify',
      message: 'Error procesando marcado de verificación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
