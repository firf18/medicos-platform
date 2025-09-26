import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/laboratories/statistics
 * Obtiene estadísticas del sistema de laboratorios
 */
export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_laboratory_statistics');

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener estadísticas', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      statistics: data[0],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
