/**
 * 🔍 API ENDPOINT PARA VERIFICAR ESTADO DE VERIFICACIÓN DIDIT
 * 
 * Permite a los clientes verificar el estado de una verificación de identidad
 * de forma segura y controlada
 * 
 * @version 1.0.0
 * @author Red-Salud Platform Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDiditConfig, getSessionStatus, processVerificationDecision } from '@/lib/didit-integration';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface VerificationStatusResponse {
  success: boolean;
  sessionId: string;
  status: string;
  userFriendlyStatus: string;
  decision?: any;
  summary?: any; // Simplified type for now
  lastUpdated: string;
  error?: string;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Valida que el usuario tenga acceso a la sesión solicitada
 */
async function validateUserAccess(sessionId: string, request: NextRequest): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('doctor_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('verification_session_id', sessionId)
      .maybeSingle();

    return !error && !!data;
  } catch (error) {
    console.error('Error validando acceso de usuario:', error);
    return false;
  }
}

/**
 * Mapea el estado de Didit a un mensaje amigable
 */
function getUserFriendlyStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Not Started': 'No Iniciado',
    'In Progress': 'En Proceso',
    'Approved': 'Aprobado',
    'Declined': 'Rechazado',
    'In Review': 'En Revisión',
    'Abandoned': 'Abandonado'
  };

  return statusMap[status] || 'Estado Desconocido';
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET - Obtiene el estado de una verificación
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    // Validar parámetros requeridos
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'session_id es requerido' 
        },
        { status: 400 }
      );
    }

    // Requerir autenticación y propiedad de la sesión
    const hasAccess = await validateUserAccess(sessionId, request);
    if (!hasAccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tienes acceso a esta sesión de verificación' 
        },
        { status: 403 }
      );
    }

    // Obtener resultados de Didit
    const config = getDiditConfig();
    const decision = await didit.getVerificationResults(sessionId);
    
    // Extraer resumen de verificación
    const summary = processVerificationDecision(decision);
    
    // Preparar respuesta
    const response: VerificationStatusResponse = {
      success: true,
      sessionId,
      status: decision.status,
      userFriendlyStatus: getUserFriendlyStatus(decision.status),
      decision,
      summary,
      lastUpdated: new Date().toISOString()
    };

    // Registrar estado en BD mediante RPC (idempotente)
    try {
      const admin = createAdminClient();
      await admin.rpc('record_didit_verification', {
        p_session_id: sessionId,
        p_status: decision.status,
        p_decision: decision,
      });
    } catch (e) {
      console.warn('⚠️ No se pudo registrar la verificación desde verification-status GET:', e);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo estado de verificación:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo estado de verificación',
        details: errorMessage,
        lastUpdated: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Fuerza una actualización del estado de verificación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;
    
    // Validar parámetros requeridos
    if (!session_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'session_id es requerido' 
        },
        { status: 400 }
      );
    }

    // Requerir autenticación y propiedad de la sesión
    const hasAccess = await validateUserAccess(session_id, request);
    if (!hasAccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tienes acceso a esta sesión de verificación' 
        },
        { status: 403 }
      );
    }

    // Obtener resultados actualizados de Didit
    const config = getDiditConfig();
    const decision = await didit.getVerificationResults(session_id);
    const summary = processVerificationDecision(decision);
    
    // Actualizar en base de datos si hay cambios
    // Registrar en BD vía RPC (idempotente)
    try {
      const admin = createAdminClient();
      await admin.rpc('record_didit_verification', {
        p_session_id: session_id,
        p_status: decision.status,
        p_decision: decision,
      });
    } catch (e) {
      console.warn('⚠️ No se pudo registrar la verificación desde verification-status POST:', e);
    }

    // Preparar respuesta
    const response: VerificationStatusResponse = {
      success: true,
      sessionId: session_id,
      status: decision.status,
      userFriendlyStatus: getUserFriendlyStatus(decision.status),
      decision,
      summary,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error actualizando estado de verificación:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error actualizando estado de verificación',
        details: errorMessage,
        lastUpdated: new Date().toISOString()
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}