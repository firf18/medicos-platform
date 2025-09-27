/**
 * Email Availability Check API
 * @fileoverview Endpoint para verificar disponibilidad de email en tiempo real
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkEmailAvailability } from '@/infrastructure/database/supabase-admin';

export async function POST(request: NextRequest) {
  try {
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

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar disponibilidad
    const result = await checkEmailAvailability(normalizedEmail);

    return NextResponse.json({
      available: result.available,
      email: normalizedEmail
    });

  } catch (error) {
    console.error('Error checking email availability:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}