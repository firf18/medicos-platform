import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailCode, generateVerificationCode } from '@/lib/supabase/temporary-registration';
import { logSecurityEvent } from '@/lib/validations/security.validations';

/**
 * API para verificar código de email en registro temporal
 * POST /api/auth/verify-email-temp
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando verificación de email temporal...');
    
    const { email, code, registration_id } = await request.json();

    // Validar datos de entrada
    if (!email || !code) {
      return NextResponse.json({
        error: 'Email y código son requeridos'
      }, { status: 400 });
    }

    if (!registration_id) {
      return NextResponse.json({
        error: 'ID de registro es requerido'
      }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    // Validar formato de código
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({
        error: 'Código debe tener 6 dígitos'
      }, { status: 400 });
    }

    console.log(`🔍 Verificando código para: ${email}`);

    // Log de intento de verificación
    logSecurityEvent('email_verification_attempt', {
      email: email,
      registration_id: registration_id,
      timestamp: new Date().toISOString()
    });

    // Verificar código
    const result = await verifyEmailCode(email.toLowerCase(), code);

    if (!result.success) {
      console.error('❌ Error en verificación:', result.error);
      
      logSecurityEvent('email_verification_failed', {
        email: email,
        registration_id: registration_id,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        error: result.error || 'Error verificando código'
      }, { status: 400 });
    }

    console.log(`✅ Email verificado exitosamente: ${email}`);

    logSecurityEvent('email_verification_success', {
      email: email,
      registration_id: registration_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
      data: {
        email: email,
        verified_at: new Date().toISOString(),
        registration_data: result.registrationData
      }
    });

  } catch (error) {
    console.error('❌ Error inesperado en verificación:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * API para reenviar código de verificación
 * POST /api/auth/verify-email-temp/resend
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('📧 Reenviando código de verificación...');
    
    const { email, registration_id } = await request.json();

    // Validar datos de entrada
    if (!email || !registration_id) {
      return NextResponse.json({
        error: 'Email e ID de registro son requeridos'
      }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    console.log(`📧 Generando nuevo código para: ${email}`);

    // Log de solicitud de reenvío
    logSecurityEvent('verification_code_resend_request', {
      email: email,
      registration_id: registration_id,
      timestamp: new Date().toISOString()
    });

    // Generar nuevo código
    const result = await generateVerificationCode(email.toLowerCase(), registration_id);

    if (!result.success) {
      console.error('❌ Error generando código:', result.error);
      
      logSecurityEvent('verification_code_resend_failed', {
        email: email,
        registration_id: registration_id,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        error: result.error || 'Error generando código de verificación'
      }, { status: 500 });
    }

    console.log(`✅ Código generado exitosamente para: ${email}`);

    logSecurityEvent('verification_code_resend_success', {
      email: email,
      registration_id: registration_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Código de verificación enviado exitosamente',
      data: {
        email: email,
        code: result.code, // En producción, esto no se devolvería
        expires_in: 15 * 60 // 15 minutos en segundos
      }
    });

  } catch (error) {
    console.error('❌ Error inesperado reenviando código:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
