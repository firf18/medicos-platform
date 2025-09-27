/**
 * Phone Availability Check API
 * @fileoverview Endpoint para verificar disponibilidad de teléfono en tiempo real
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPhoneAvailability } from '@/infrastructure/database/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validar entrada
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Teléfono es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de teléfono venezolano
    const phoneRegex = /^(\+58)?\d{10}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido. Debe ser un número venezolano válido (+58XXXXXXXXX)' },
        { status: 400 }
      );
    }

    // Verificar disponibilidad
    const result = await checkPhoneAvailability(cleanPhone);

    return NextResponse.json({
      available: result.available,
      normalized: result.normalized,
      phone: cleanPhone
    });

  } catch (error) {
    console.error('Error checking phone availability:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}