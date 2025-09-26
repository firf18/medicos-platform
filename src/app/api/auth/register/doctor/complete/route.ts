import { NextRequest, NextResponse } from 'next/server';
import { completeDoctorRegistration, checkRegistrationReady } from '@/lib/supabase/final-registration';
import { logSecurityEvent } from '@/lib/validations/security.validations';

/**
 * API para completar registro final de médico
 * POST /api/auth/register/doctor/complete
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando completación de registro de médico...');
    
    const { verification_token } = await request.json();

    // Validar token de verificación
    if (!verification_token) {
      return NextResponse.json({
        error: 'Token de verificación requerido'
      }, { status: 400 });
    }

    // Verificar que el registro esté listo para completar
    const readyCheck = await checkRegistrationReady(verification_token);

    if (!readyCheck.success) {
      return NextResponse.json({
        error: readyCheck.error || 'Error verificando registro'
      }, { status: 400 });
    }

    if (!readyCheck.ready) {
      return NextResponse.json({
        error: readyCheck.error || 'Registro no está listo para completar'
      }, { status: 400 });
    }

    console.log('✅ Registro verificado y listo para completar');

    // Log de inicio de completación
    logSecurityEvent('doctor_completion_started', {
      verification_token: verification_token,
      timestamp: new Date().toISOString()
    });

    // Completar registro
    const result = await completeDoctorRegistration(verification_token);

    if (!result.success) {
      console.error('❌ Error completando registro:', result.error);
      
      logSecurityEvent('doctor_completion_failed', {
        verification_token: verification_token,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        error: result.error || 'Error completando registro'
      }, { status: 500 });
    }

    console.log('✅ Registro completado exitosamente:', {
      userId: result.user?.id,
      email: result.user?.email
    });

    logSecurityEvent('doctor_completion_success', {
      userId: result.user?.id,
      email: result.user?.email,
      verification_token: verification_token,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Registro completado exitosamente',
      data: {
        user: {
          id: result.user?.id,
          email: result.user?.email,
          email_confirmed_at: result.user?.email_confirmed_at
        },
        profile: {
          id: result.profile?.id,
          first_name: result.profile?.first_name,
          last_name: result.profile?.last_name,
          role: result.profile?.role
        },
        doctor: {
          id: result.doctor?.id,
          specialty_id: result.doctor?.specialty_id,
          license_number: result.doctor?.license_number,
          is_verified: result.doctor?.is_verified
        },
        needsEmailVerification: result.needsEmailVerification
      }
    });

  } catch (error) {
    console.error('❌ Error inesperado en completación:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * API para verificar estado de registro
 * GET /api/auth/register/doctor/complete?token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationToken = searchParams.get('token');

    if (!verificationToken) {
      return NextResponse.json({
        error: 'Token de verificación requerido'
      }, { status: 400 });
    }

    const result = await checkRegistrationReady(verificationToken);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Error verificando registro'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ready: result.ready,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Error verificando estado de registro:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
