/**
 * Email Confirmation Handler - PKCE Flow
 * @fileoverview Maneja la confirmación de email usando el flujo PKCE de Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/auth/email-verified';

    if (token_hash && type) {
      const supabase = await createServerSupabaseClient();

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        // Redirigir a la página de éxito
        return NextResponse.redirect(new URL(next, request.url));
      }
    }

    // Redirigir a página de error si hay problemas
    return NextResponse.redirect(new URL('/auth/email-error', request.url));

  } catch (error) {
    console.error('Error en email confirmation:', error);
    return NextResponse.redirect(new URL('/auth/email-error', request.url));
  }
}
