/**
 * Didit Status API - Platform Médicos Elite
 * 
 * API para consultar el estado de sesiones de verificación con Didit.me
 * siguiendo las mejores prácticas de NextAuth.js
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuración de Didit v2
const DIDIT_V2_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: 'https://verification.didit.me/v2',
  timeout: 30000,
};

export async function GET(
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
    if (!DIDIT_V2_CONFIG.apiKey) {
      console.error('DIDIT_API_KEY no configurada');
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta' },
        { status: 500 }
      );
    }

    // Consultar estado de la sesión en Didit API v2
    const diditResponse = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/session/${sessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
        'accept': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!diditResponse.ok) {
      let errorData = {};
      try {
        errorData = await diditResponse.json();
      } catch (parseError) {
        console.warn('No se pudo parsear respuesta de error de Didit:', parseError);
        errorData = { error: 'Error de comunicación con Didit' };
      }
      
      console.error('Error consultando estado de Didit:', {
        sessionId,
        status: diditResponse.status,
        statusText: diditResponse.statusText,
        errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Error consultando estado de verificación',
          details: errorData.error || diditResponse.statusText
        },
        { status: diditResponse.status }
      );
    }

    const statusData = await diditResponse.json();

    // Log de auditoría
    console.log('Estado de verificación consultado:', {
      sessionId,
      status: statusData.status,
      timestamp: new Date().toISOString(),
      platform: 'platform-medicos'
    });

    // Retornar datos del estado en formato v2
    return NextResponse.json({
      sessionId: statusData.session_id,
      status: statusData.status,
      decision: statusData.decision,
      progress: statusData.progress || 0,
      expiresAt: statusData.expires_at,
      lastUpdated: statusData.last_updated || new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en API de estado Didit:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}