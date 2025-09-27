/**
 * Email Verification Code Validation API
 * @fileoverview Endpoint para validar código de verificación de email usando tablas temporales
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validar entrada
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código de verificación es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
        { error: 'Código de verificación debe tener 6 dígitos' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar código de verificación válido
    const { data: verificationCode, error: codeError } = await supabaseAdmin
      .from('email_verification_codes_temp')
      .select(`
        id,
        registration_id,
        email,
        code,
        used,
        created_at,
        expires_at,
        doctor_registration_temp!inner(
          id,
          status,
          created_at
        )
      `)
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString()) // No expirado
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (codeError || !verificationCode) {
      console.log('❌ Código de verificación no encontrado o inválido:', {
        email: normalizedEmail,
        code,
        error: codeError?.message
      });
      return NextResponse.json(
        { error: 'Código de verificación inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar que el registro temporal esté en estado válido
    if (!['pending_verification', 'email_verified'].includes(verificationCode.doctor_registration_temp.status)) {
      return NextResponse.json(
        { error: 'Estado de registro inválido' },
        { status: 400 }
      );
    }

    // Marcar código como usado
    const { error: updateCodeError } = await supabaseAdmin
      .from('email_verification_codes_temp')
      .update({ 
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', verificationCode.id);

    if (updateCodeError) {
      console.error('Error marking code as used:', updateCodeError);
      return NextResponse.json(
        { error: 'Error actualizando código de verificación' },
        { status: 500 }
      );
    }

    // Actualizar estado del registro temporal
    const { error: updateRegistrationError } = await supabaseAdmin
      .from('doctor_registration_temp')
      .update({ 
        status: 'email_verified',
        email_verified_at: new Date().toISOString()
      })
      .eq('id', verificationCode.registration_id);

    if (updateRegistrationError) {
      console.error('Error updating registration status:', updateRegistrationError);
      return NextResponse.json(
        { error: 'Error actualizando estado de registro' },
        { status: 500 }
      );
    }

    console.log('✅ Email verificado exitosamente:', {
      email: normalizedEmail,
      registrationId: verificationCode.registration_id,
      codeId: verificationCode.id
    });

    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
      email: normalizedEmail,
      registrationId: verificationCode.registration_id
    });

  } catch (error) {
    console.error('Error verifying email code:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}