import { NextRequest, NextResponse } from 'next/server';
import { createTemporaryRegistration } from '@/lib/supabase/temporary-registration';
import { completeDoctorRegistrationSchema } from '@/lib/validations';
import { logSecurityEvent } from '@/lib/validations/security.validations';

/**
 * API para crear registro temporal de médico
 * POST /api/auth/register/doctor/temp
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando registro temporal de médico...');
    
    const registrationData = await request.json();
    
    // Validar datos de entrada
    const validationResult = completeDoctorRegistrationSchema.safeParse(registrationData);
    
    if (!validationResult.success) {
      console.log('❌ Validación fallida:', validationResult.error.errors);
      return NextResponse.json({
        error: 'Datos de registro inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    // Log de seguridad
    logSecurityEvent('doctor_temp_registration_started', {
      email: registrationData.email,
      specialtyId: registrationData.specialtyId,
      timestamp: new Date().toISOString()
    });

    // Crear registro temporal
    const result = await createTemporaryRegistration(validationResult.data);

    if (!result.success) {
      console.error('❌ Error creando registro temporal:', result.error);
      
      logSecurityEvent('doctor_temp_registration_failed', {
        email: registrationData.email,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        error: result.error || 'Error creando registro temporal'
      }, { status: 500 });
    }

    console.log('✅ Registro temporal creado exitosamente:', {
      id: result.data?.id,
      email: result.data?.email,
      token: result.verification_token
    });

    logSecurityEvent('doctor_temp_registration_completed', {
      registrationId: result.data?.id,
      email: registrationData.email,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Registro temporal creado exitosamente',
      data: {
        registration_id: result.data?.id,
        verification_token: result.verification_token,
        expires_at: result.data?.expires_at,
        email: result.data?.email
      }
    });

  } catch (error) {
    console.error('❌ Error inesperado en registro temporal:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * API para obtener estado de registro temporal
 * GET /api/auth/register/doctor/temp?token=xxx
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

    const { getTemporaryRegistration } = await import('@/lib/supabase/temporary-registration');
    const result = await getTemporaryRegistration(verificationToken);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Registro no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.data?.id,
        email: result.data?.email,
        status: result.data?.status,
        email_verified_at: result.data?.email_verified_at,
        expires_at: result.data?.expires_at,
        created_at: result.data?.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo registro temporal:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

/**
 * API para cancelar registro temporal
 * DELETE /api/auth/register/doctor/temp?token=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationToken = searchParams.get('token');

    if (!verificationToken) {
      return NextResponse.json({
        error: 'Token de verificación requerido'
      }, { status: 400 });
    }

    const { cancelTemporaryRegistration } = await import('@/lib/supabase/temporary-registration');
    const result = await cancelTemporaryRegistration(verificationToken);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Error cancelando registro'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registro cancelado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error cancelando registro temporal:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
