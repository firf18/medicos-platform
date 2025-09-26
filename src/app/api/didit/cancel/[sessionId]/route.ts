/**
 * 🚫 ENDPOINT DE CANCELACIÓN DE SESIONES DIDIT
 * 
 * Maneja la cancelación de sesiones de verificación de Didit
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId es requerido' },
        { status: 400 }
      );
    }

    console.log('🚫 Cancelando sesión:', sessionId);

    // Por ahora, solo logueamos la cancelación
    // En el futuro se puede implementar cancelación real en Didit
    console.log('✅ Sesión cancelada:', sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      cancelled: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error cancelando sesión:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando estado de cancelación:', sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      cancelled: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verificando cancelación:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}