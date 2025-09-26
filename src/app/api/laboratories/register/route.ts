import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const LaboratoryRegistrationSchema = z.object({
  email: z.string().email('Email inválido'),
  laboratory_name: z.string().min(2, 'Nombre del laboratorio requerido'),
  legal_name: z.string().min(2, 'Nombre legal requerido'),
  rif: z.string().regex(/^[JGVEP]-[0-9]{8}-[0-9]$/, 'Formato RIF inválido'),
  phone: z.string().optional(),
  address: z.string().min(10, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado requerido'),
  laboratory_type: z.enum(['clinical', 'pathology', 'research', 'reference', 'specialized', 'mobile']).optional(),
});

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

const SearchLaboratoriesSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  laboratory_type: z.enum(['clinical', 'pathology', 'research', 'reference', 'specialized', 'mobile']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// API Routes

/**
 * POST /api/laboratories/register
 * Inicia el registro de un nuevo laboratorio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LaboratoryRegistrationSchema.parse(body);

    const { data, error } = await supabase.rpc('start_laboratory_registration', {
      p_email: validatedData.email,
      p_laboratory_name: validatedData.laboratory_name,
      p_legal_name: validatedData.legal_name,
      p_rif: validatedData.rif,
      p_phone: validatedData.phone,
      p_address: validatedData.address,
      p_city: validatedData.city,
      p_state: validatedData.state,
      p_laboratory_type: validatedData.laboratory_type || 'clinical',
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al iniciar el registro', details: error.message },
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
      registration_id: data.registration_id,
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

/**
 * GET /api/laboratories/register/{id}
 * Obtiene el estado de un registro
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('laboratory_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, registration: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/laboratories/register/{id}/step
 * Actualiza el paso del registro
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { step, data: stepData } = body;

    const { data, error } = await supabase.rpc('update_laboratory_registration_step', {
      p_registration_id: id,
      p_step: step,
      p_data: stepData || {},
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar el paso', details: error.message },
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
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
