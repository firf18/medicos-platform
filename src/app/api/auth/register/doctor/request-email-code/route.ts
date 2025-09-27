/**
 * Email Verification Code Request API
 * @fileoverview Endpoint para solicitar código de verificación de email usando tablas temporales
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';

// Rate limiting simple por IP
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 1; // 1 solicitud por minuto

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, lastRequest: now });
    return { allowed: true };
  }

  // Resetear contador si ha pasado el tiempo de ventana
  if (now - userLimit.lastRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastRequest: now });
    return { allowed: true };
  }

  // Verificar si ha excedido el límite
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - (now - userLimit.lastRequest)) / 1000);
    return { allowed: false, retryAfter };
  }

  // Incrementar contador
  userLimit.count++;
  userLimit.lastRequest = now;
  return { allowed: true };
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del cliente para rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Verificar rate limit
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Demasiados intentos. Espera ${rateLimitCheck.retryAfter} segundos antes de intentar nuevamente.`,
          rateLimited: true,
          waitTime: rateLimitCheck.retryAfter,
          retryAfter: Date.now() + (rateLimitCheck.retryAfter! * 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validar entrada
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
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

    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si ya existe un registro temporal para este email
    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from('doctor_registration_temp')
      .select('id, status, created_at')
      .eq('email', normalizedEmail)
      .in('status', ['pending_verification', 'email_verified'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
      .limit(1)
      .single();

    let registrationId: string;

    if (existingRecord) {
      // Usar registro existente
      registrationId = existingRecord.id;
      console.log('📧 Usando registro temporal existente:', registrationId);
    } else {
      // Crear nuevo registro temporal
      const { data: newRecord, error: createError } = await supabaseAdmin
        .from('doctor_registration_temp')
        .insert({
          email: normalizedEmail,
          status: 'pending_verification',
          registration_data: {},
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating temp registration:', createError);
        return NextResponse.json(
          { error: 'Error creando registro temporal' },
          { status: 500 }
        );
      }

      registrationId = newRecord.id;
      console.log('📧 Nuevo registro temporal creado:', registrationId);
    }

    // Generar código de verificación
    const verificationCode = generateVerificationCode();

    // Guardar código en tabla de códigos temporales
    const { error: codeError } = await supabaseAdmin
      .from('email_verification_codes_temp')
      .insert({
        registration_id: registrationId,
        email: normalizedEmail,
        code: verificationCode,
        used: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
      });

    if (codeError) {
      console.error('Error saving verification code:', codeError);
      return NextResponse.json(
        { error: 'Error guardando código de verificación' },
        { status: 500 }
      );
    }

    // TODO: Enviar email real con el código
    // Por ahora, solo loggear para desarrollo
    console.log('📧 Código de verificación generado:', {
      email: normalizedEmail,
      code: verificationCode,
      registrationId
    });

    return NextResponse.json({
      success: true,
      message: 'Código de verificación enviado',
      email: normalizedEmail,
      // En desarrollo, incluir el código para testing
      ...(process.env.NODE_ENV === 'development' && { 
        verificationCode,
        registrationId 
      })
    });

  } catch (error) {
    console.error('Error requesting email verification code:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}