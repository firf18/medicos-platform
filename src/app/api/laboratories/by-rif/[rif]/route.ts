import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/laboratories/by-rif/{rif}
 * Busca un laboratorio por RIF
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ rif: string }> }) {
  try {
    const { rif } = await params;
    const { data, error } = await supabase.rpc('get_laboratory_by_rif', {
      p_rif: rif,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al buscar el laboratorio', details: error.message },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Laboratorio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      laboratory: data[0],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
