import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const LaboratoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  legal_name: z.string().min(2).optional(),
  commercial_name: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  secondary_phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().min(10).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  postal_code: z.string().optional(),
  municipality: z.string().optional(),
  laboratory_type: z.enum(['clinical', 'pathology', 'research', 'reference', 'specialized', 'mobile']).optional(),
  specialties: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  working_hours: z.record(z.any()).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});


/**
 * GET /api/laboratories/{id}
 * Obtiene un laboratorio específico
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('laboratories')
      .select(`
        *,
        laboratory_services(*),
        laboratory_equipment(*),
        laboratory_documents(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Laboratorio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, laboratory: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/laboratories/{id}
 * Actualiza un laboratorio
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = LaboratoryUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from('laboratories')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar el laboratorio', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      laboratory: data,
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

