/**
 * 📊 DIDIT SESSION STATS ENDPOINT - Platform Médicos Elite
 * 
 * Endpoint para obtener estadísticas de sesiones de Didit
 * Útil para debugging y monitoreo
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDiditSessionStats } from '@/lib/didit/session-cleanup';
import { logger } from '@/lib/logging/logger';

/**
 * GET - Obtiene estadísticas de sesiones de Didit
 */
export async function GET(request: NextRequest) {
  try {
    const stats = getDiditSessionStats();

    logger.info('didit-stats', 'Estadísticas de sesiones consultadas', {
      stats,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      message: 'Estadísticas de sesiones obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de sesiones:', error);

    logger.error('didit-stats', 'Error obteniendo estadísticas', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
