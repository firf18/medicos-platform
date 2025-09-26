/**
 * Verify Email OTP Code API
 * @fileoverview API para verificar códigos OTP de email usando Supabase Auth nativo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email y código son requeridos' },
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

    // Validar formato de código (6 dígitos)
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Código debe tener 6 dígitos' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    console.log(`🔍 Verificando código OTP para: ${email}`);

    try {
      // Verificar el código OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: 'email'
      });

      if (error) {
        console.error('Error en verifyOtp:', error);
        
        // Manejar errores específicos
        if (error.message.includes('expired') || error.message.includes('expirado')) {
          return NextResponse.json(
            { 
              error: 'El código ha expirado. Solicita uno nuevo.',
              expired: true
            },
            { status: 400 }
          );
        }

        if (error.message.includes('invalid') || error.message.includes('incorrect')) {
          return NextResponse.json(
            { 
              error: 'Código incorrecto. Verifica los 6 dígitos.',
              invalid: true
            },
            { status: 400 }
          );
        }

        if (error.message.includes('too many') || error.message.includes('demasiados')) {
          return NextResponse.json(
            { 
              error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
              tooManyAttempts: true
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { 
            error: 'Error verificando código',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 400 }
        );
      }

      if (!data.user) {
        console.error('Verificación exitosa pero sin datos de usuario');
        return NextResponse.json(
          { error: 'Error en la verificación. Intenta de nuevo.' },
          { status: 500 }
        );
      }

      console.log(`✅ Código OTP verificado exitosamente para: ${email}`);
      console.log(`👤 Usuario ID: ${data.user.id}`);
      console.log(`📧 Email confirmado: ${data.user.email_confirmed_at ? 'SÍ' : 'NO'}`);

      return NextResponse.json({
        success: true,
        message: 'Código verificado correctamente',
        user: {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at,
          metadata: data.user.user_metadata
        },
        session: data.session ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        } : null,
        timestamp: new Date().toISOString()
      });

    } catch (verifyError) {
      console.error('Error en verifyOtp:', verifyError);
      
      return NextResponse.json(
        { 
          error: 'Error verificando código',
          details: process.env.NODE_ENV === 'development' ? (verifyError as Error).message : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en verify-email-code:', error);
    
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