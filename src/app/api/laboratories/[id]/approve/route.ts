import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const ApproveLaboratorySchema = z.object({
  approved_by: z.string().uuid().optional(),
});

/**
 * PUT /api/laboratories/{id}/approve
 * Aprueba un laboratorio
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = ApproveLaboratorySchema.parse(body);

    const { data, error } = await supabase.rpc('approve_laboratory', {
      p_laboratory_id: id,
      p_approved_by: validatedData.approved_by || null,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al aprobar el laboratorio', details: error.message },
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
