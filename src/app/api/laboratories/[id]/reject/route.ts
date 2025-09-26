import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const RejectLaboratorySchema = z.object({
  reason: z.string().min(10),
  rejected_by: z.string().uuid().optional(),
});

/**
 * PUT /api/laboratories/{id}/reject
 * Rechaza un laboratorio
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = RejectLaboratorySchema.parse(body);

    const { data, error } = await supabase.rpc('reject_laboratory', {
      p_laboratory_id: id,
      p_reason: validatedData.reason,
      p_rejected_by: validatedData.rejected_by || null,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al rechazar el laboratorio', details: error.message },
        { status: 400 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { error: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
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
