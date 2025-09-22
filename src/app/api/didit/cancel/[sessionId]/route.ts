/**
 * Didit Cancel API - Platform Médicos Elite
 * 
 * API para cancelar sesiones de verificación con Didit.me
 * siguiendo las mejores prácticas de NextAuth.js
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuración de Didit
const DIDIT_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY || 'iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
  baseUrl: process.env.DIDIT_BASE_URL || 'https://api.didit.me',
};

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      );
    }

    // Validar configuración de API
    if (!DIDIT_CONFIG.apiKey) {
      console.error('DIDIT_API_KEY no configurada');
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta' },
        { status: 500 }
      );
    }

    // Cancelar sesión en Didit API
    const diditResponse = await fetch(`${DIDIT_CONFIG.baseUrl}/v1/sessions/${sessionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIDIT_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'X-Platform': 'platform-medicos',
        'X-User-Type': 'doctor'
      }
    });

    if (!diditResponse.ok) {
      let errorData = {};
      try {
        errorData = await diditResponse.json();
      } catch (parseError) {
        console.warn('No se pudo parsear respuesta de error de Didit:', parseError);
        errorData = { error: 'Error de comunicación con Didit' };
      }
      
      console.error('Error cancelando sesión de Didit:', {
        sessionId,
        status: diditResponse.status,
        statusText: diditResponse.statusText,
        errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Error cancelando verificación',
          details: errorData.error || diditResponse.statusText
        },
        { status: diditResponse.status }
      );
    }

    const cancelData = await diditResponse.json();

    // Log de auditoría
    console.log('Sesión de verificación cancelada:', {
      sessionId,
      timestamp: new Date().toISOString(),
      platform: 'platform-medicos'
    });

    // Retornar confirmación de cancelación
    return NextResponse.json({
      sessionId: cancelData.session_id,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      message: 'Verificación cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error en API de cancelación Didit:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}