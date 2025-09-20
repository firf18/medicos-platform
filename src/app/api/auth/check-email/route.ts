import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/auth/check-email
// Checks if an email is available (not present in profiles)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Parámetro email inválido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Formato de correo inválido' },
        { status: 400 }
      );
    }

    // Fail-safe: if service key is missing in non-production, return available=true
    let admin: any;
    try {
      admin = createAdminClient();
    } catch (e) {
      // In development without service role, don't block registration
      return NextResponse.json({ available: true });
    }

    // Query minimal data to avoid exposing sensitive information
    const { data, error } = await (admin as any)
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    // PGRST116 = no rows found
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Error verificando disponibilidad del correo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ available: !data });
  } catch (_) {
    // Network or parsing error – do not block user flow
    return NextResponse.json({ available: true });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}


