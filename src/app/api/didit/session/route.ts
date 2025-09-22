/**
 * 🎯 DIDIT SESSION MANAGEMENT ENDPOINT
 * 
 * Endpoint para crear y gestionar sesiones de verificación de Didit
 * Usa el sistema correcto de sesiones de Didit
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Didit
const DIDIT_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: 'https://verification.didit.me/v2',
  timeout: 30000, // 30 segundos
};

// Tipos para sesiones de Didit
interface CreateSessionRequest {
  workflow_id: string;
  vendor_data: string;
  callback?: string;
  expected_details?: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    document_number?: string;
  };
}

interface CreateSessionResponse {
  session_id: string;
  session_url: string;
  expires_at: string;
  created_at: string;
}

interface SessionDecisionResponse {
  session_id: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned';
  decision?: {
    session_id: string;
    status: string;
    workflow_id: string;
    features: string[];
    vendor_data: string;
    metadata: Record<string, any>;
    id_verification?: {
      status: string;
      document_type: string;
      document_number: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      nationality: string;
    };
    face_match?: {
      status: string;
      match_score: number;
      confidence_level: string;
    };
    aml_check?: {
      status: string;
      overall_risk_score: number;
      risk_level: string;
    };
    passive_liveness?: {
      status: string;
      liveness_score: number;
      is_live: boolean;
    };
  };
}

/**
 * Crea una nueva sesión de verificación en Didit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow_id, vendor_data, callback, expected_details } = body as CreateSessionRequest;

    // Validar datos requeridos
    if (!workflow_id || !vendor_data) {
      return NextResponse.json(
        { error: 'workflow_id y vendor_data son requeridos' },
        { status: 400 }
      );
    }

    // Preparar payload para Didit
    const diditPayload = {
      workflow_id,
      vendor_data,
      ...(callback && { callback }),
      ...(expected_details && { expected_details })
    };

    // Validar configuración obligatoria
    if (!DIDIT_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
        { status: 500 }
      );
    }

    // Llamar a Didit API
    const response = await fetch(`${DIDIT_CONFIG.baseUrl}/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_CONFIG.apiKey as string,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      body: JSON.stringify(diditPayload),
      signal: AbortSignal.timeout(DIDIT_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error creando sesión en Didit:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        { 
          error: 'Error creando sesión de verificación',
          details: errorData.detail || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const sessionData = await response.json() as CreateSessionResponse;

    // Log de auditoría
    logSecurityEvent(
      'didit_session_created',
      'Sesión de verificación Didit creada',
      {
        sessionId: sessionData.session_id,
        workflowId: workflow_id,
        vendorData: vendor_data,
        callback: callback
      },
      'info'
    );

    return NextResponse.json({
      success: true,
      session_id: sessionData.session_id,
      session_url: sessionData.session_url,
      expires_at: sessionData.expires_at,
      created_at: sessionData.created_at,
      message: 'Sesión de verificación creada exitosamente'
    });

  } catch (error) {
    console.error('Error en endpoint de creación de sesión:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene el estado y decisión de una sesión
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id es requerido' },
        { status: 400 }
      );
    }

    // Validar configuración obligatoria
    if (!DIDIT_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
        { status: 500 }
      );
    }

    // Llamar a Didit API para obtener decisión
    const response = await fetch(`${DIDIT_CONFIG.baseUrl}/session/${sessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': DIDIT_CONFIG.apiKey as string,
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      signal: AbortSignal.timeout(DIDIT_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Error obteniendo estado de sesión',
          details: errorData.detail || response.statusText
        },
        { status: response.status }
      );
    }

    const sessionDecision = await response.json() as SessionDecisionResponse;

    // Log de auditoría
    logSecurityEvent(
      'didit_session_status_checked',
      'Estado de sesión Didit consultado',
      {
        sessionId,
        status: sessionDecision.status,
        hasDecision: !!sessionDecision.decision
      },
      'info'
    );

    return NextResponse.json({
      success: true,
      session_id: sessionDecision.session_id,
      status: sessionDecision.status,
      decision: sessionDecision.decision,
      message: 'Estado de sesión obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estado de sesión:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * Webhook handler para actualizaciones de sesión
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, status, decision } = body;

    if (!session_id || !status) {
      return NextResponse.json(
        { error: 'session_id y status son requeridos' },
        { status: 400 }
      );
    }

    // Log de auditoría
    logSecurityEvent(
      'didit_session_updated',
      'Sesión de verificación Didit actualizada',
      {
        sessionId: session_id,
        status,
        hasDecision: !!decision
      },
      'info'
    );

    // Aquí podrías actualizar tu base de datos con el nuevo estado
    // Por ahora solo logueamos el evento

    return NextResponse.json({
      success: true,
      session_id,
      status,
      message: 'Estado de sesión actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado de sesión:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}