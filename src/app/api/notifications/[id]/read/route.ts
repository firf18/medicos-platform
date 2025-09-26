import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PUT /api/notifications/{id}/read
 * Mark notification as read
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: id,
      p_user_id: user_id,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al marcar notificación como leída', details: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Notificación no encontrada o no pertenece al usuario' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación marcada como leída',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
