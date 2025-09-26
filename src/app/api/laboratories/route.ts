import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/laboratories
 * Lista laboratorios con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const city = searchParams.get('city') || undefined;
    const state = searchParams.get('state') || undefined;
    const laboratory_type = searchParams.get('laboratory_type') as any || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase.rpc('search_laboratories', {
      p_query: query,
      p_city: city,
      p_state: state,
      p_laboratory_type: laboratory_type,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al buscar laboratorios', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      laboratories: data,
      total_count: data.length > 0 ? data[0].total_count : 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

