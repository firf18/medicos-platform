import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const CompleteRegistrationSchema = z.object({
  user_id: z.string().uuid().optional(),
});

const ApproveLaboratorySchema = z.object({
  approved_by: z.string().uuid().optional(),
});

const RejectLaboratorySchema = z.object({
  reason: z.string().min(10, 'Motivo del rechazo requerido'),
  rejected_by: z.string().uuid().optional(),
});

/**
 * POST /api/laboratories/register/{id}/complete
 * Completa el registro de un laboratorio
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = CompleteRegistrationSchema.parse(body);

    const { data, error } = await supabase.rpc('complete_laboratory_registration', {
      p_registration_id: id,
      p_user_id: validatedData.user_id || null,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al completar el registro', details: error.message },
        { status: 400 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { error: data.message, errors: data.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      laboratory_id: data.laboratory_id,
      message: data.message,
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
