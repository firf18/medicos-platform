/**
 * Send Email Verification Code API - OTP Implementation
 * @fileoverview API para enviar códigos OTP de verificación usando Supabase Auth nativo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log(`📧 Enviando código OTP a: ${email}`);

    try {
      // Usar signInWithOtp para enviar código OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true, // Permitir crear usuario si no existe
          emailRedirectTo: `${siteUrl}/api/auth/verify-email`
        }
      });

      if (error) {
        console.error('Error en signInWithOtp:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          code: error.code
        });
        
        // Manejar errores específicos de rate limiting
        if (error.message.includes('rate limit') || error.message.includes('429') || error.code === 'over_email_send_rate_limit') {
          // Extraer el tiempo de espera del mensaje de error
          const timeMatch = error.message.match(/(\d+)\s*seconds?/);
          const waitTime = timeMatch ? parseInt(timeMatch[1]) : 30;
          
          return NextResponse.json(
            { 
              error: `Demasiados intentos. Debes esperar ${waitTime} segundos antes de solicitar otro código.`,
              rateLimited: true,
              waitTime: waitTime,
              retryAfter: Date.now() + (waitTime * 1000)
            },
            { status: 429 }
          );
        }

        if (error.message.includes('smtp') || error.message.includes('mail')) {
          return NextResponse.json(
            { 
              error: 'Error de SMTP. Verifica tu configuración de correo. Si usas Gmail, considera cambiar a un proveedor transaccional.',
              smtpError: true,
              details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
          );
        }

        if (error.message.includes('not allowed for otp') || error.message.includes('otp_disabled')) {
          return NextResponse.json(
            { 
              error: 'OTP no está habilitado. Contacta al administrador.',
              otpDisabled: true
            },
            { status: 400 }
          );
        }

        if (error.message.includes('Email address not authorized')) {
          return NextResponse.json(
            { 
              error: 'Email no autorizado. Contacta al administrador.',
              emailNotAuthorized: true
            },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { 
            error: 'Error enviando código de verificación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }

      console.log(`✅ Código OTP enviado exitosamente a: ${email}`);
      console.log(`📊 Respuesta:`, {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error
      });

      return NextResponse.json({
        success: true,
        message: 'Código de verificación enviado',
        email: email,
        timestamp: new Date().toISOString()
      });

    } catch (otpError) {
      console.error('Error en signInWithOtp:', otpError);
      
      // Manejar rate limit en catch también
      if (otpError instanceof Error && 
          (otpError.message.includes('rate limit') || otpError.message.includes('429'))) {
        const timeMatch = otpError.message.match(/(\d+)\s*seconds?/);
        const waitTime = timeMatch ? parseInt(timeMatch[1]) : 30;
        
        return NextResponse.json(
          { 
            error: `Demasiados intentos. Debes esperar ${waitTime} segundos antes de solicitar otro código.`,
            rateLimited: true,
            waitTime: waitTime,
            retryAfter: Date.now() + (waitTime * 1000)
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Error enviando código de verificación',
          details: process.env.NODE_ENV === 'development' ? (otpError as Error).message : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en send-verification-code:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}