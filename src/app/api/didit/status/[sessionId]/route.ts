/**
 * 🎯 DIDIT SESSION STATUS ENDPOINT
 * 
 * Endpoint para obtener el estado de una sesión de verificación de Didit
 * 
 * @version 1.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { diditApiClient, DiditApiError } from '@/lib/didit/client';

// Tipos para el estado de la sesión
interface DiditSessionStatus {
  session_id: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned' | 'Expired';
  decision?: {
    face_match?: { status: string; confidence?: number };
    id_verification?: { status: string; confidence?: number };
    liveness?: { status: string; confidence?: number };
    aml?: { status: string; confidence?: number };
  };
  document_name?: string;
  extracted_name?: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

/**
 * GET - Obtiene el estado de una sesión de verificación
 */
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

    // Log de auditoría
    logSecurityEvent(
      'didit_status_request',
      `Solicitud de estado para sesión ${sessionId}`,
      {
        sessionId,
        timestamp: new Date().toISOString()
      },
      'info'
    );

    // Obtener estado de la sesión usando el cliente robusto
    let sessionStatus;
    try {
      sessionStatus = await diditApiClient.getSessionStatus(sessionId);
    } catch (error) {
      console.error('Error obteniendo estado de sesión desde Didit:', error);
      
      // Si es un error de configuración, devolver error específico
      if (error instanceof Error && error.message.includes('Configuración de Didit inválida')) {
        return NextResponse.json(
          { 
            error: 'Configuración de Didit no válida',
            details: 'Verifique las variables de entorno de Didit',
            sessionId,
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }
      
      // Si es un error 404 de Didit, devolver error específico con información útil
      if (error instanceof DiditApiError && error.statusCode === 404) {
        logSecurityEvent(
          'didit_session_not_found',
          `Sesión ${sessionId} no encontrada en Didit`,
          {
            sessionId,
            error: error.message,
            timestamp: new Date().toISOString()
          },
          'warning'
        );

        return NextResponse.json(
          { 
            error: 'Sesión no encontrada',
            details: 'La sesión puede haber expirado o no existir en Didit',
            sessionId,
            status: 'Expired',
            timestamp: new Date().toISOString(),
            // Información adicional para el frontend
            sessionExpired: true,
            message: 'Sesión de verificación no encontrada. Puede haber expirado o no existir.'
          },
          { status: 404 }
        );
      }
      
      throw error; // Re-lanzar otros errores
    }

    // Construir respuesta compatible con el frontend
    const response: DiditSessionStatus = {
      session_id: sessionId,
      status: sessionStatus.status,
      decision: sessionStatus.decision,
      document_name: sessionStatus.document_name,
      extracted_name: sessionStatus.extracted_name,
      created_at: sessionStatus.created_at,
      updated_at: sessionStatus.updated_at,
      expires_at: sessionStatus.expires_at
    };

    // Log de auditoría exitoso
    logSecurityEvent(
      'didit_status_success',
      `Estado obtenido para sesión ${sessionId}`,
      {
        sessionId,
        status: sessionStatus.status,
        timestamp: new Date().toISOString()
      },
      'info'
    );

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error obteniendo estado de sesión Didit:', error);

    // Manejo específico de errores de Didit
    if (error instanceof DiditApiError) {
      const statusCode = error.statusCode || 500;
      
      logSecurityEvent(
        'didit_status_error',
        `Error de Didit obteniendo estado: ${error.message}`,
        {
          error: error.message,
          statusCode,
          details: error.details,
          timestamp: new Date().toISOString()
        },
        'error'
      );

      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          status: statusCode
        },
        { status: statusCode }
      );
    }

    // Error genérico
    logSecurityEvent(
      'didit_status_error',
      `Error interno obteniendo estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      'error'
    );

    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: 'Error obteniendo estado de la sesión'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}