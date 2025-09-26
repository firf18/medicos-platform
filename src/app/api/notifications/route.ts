import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const SendNotificationSchema = z.object({
  user_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  type: z.enum([
    'registration_started',
    'registration_completed',
    'registration_approved',
    'registration_rejected',
    'document_uploaded',
    'document_verified',
    'document_rejected',
    'status_change',
    'system_announcement',
    'reminder'
  ]),
  channel: z.enum(['email', 'sms', 'push', 'in_app', 'webhook']),
  title: z.string().min(1),
  message: z.string().min(1),
  action_url: z.string().url().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.any()).optional(),
});

const NotificationPreferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  registration_notifications: z.boolean().optional(),
  document_notifications: z.boolean().optional(),
  status_notifications: z.boolean().optional(),
  system_notifications: z.boolean().optional(),
  reminder_notifications: z.boolean().optional(),
  digest_frequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional(),
});

/**
 * POST /api/notifications/send
 * Send a notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SendNotificationSchema.parse(body);

    const { data, error } = await supabase.rpc('send_notification', {
      p_user_id: validatedData.user_id || null,
      p_email: validatedData.email || null,
      p_phone: validatedData.phone || null,
      p_type: validatedData.type,
      p_channel: validatedData.channel,
      p_title: validatedData.title,
      p_message: validatedData.message,
      p_action_url: validatedData.action_url || null,
      p_priority: validatedData.priority,
      p_metadata: validatedData.metadata || {},
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al enviar la notificación', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      notification_id: data,
      message: 'Notificación enviada exitosamente',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('get_user_notifications', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
      p_unread_only: unreadOnly,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener notificaciones', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
