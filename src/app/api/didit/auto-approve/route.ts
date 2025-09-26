/**
 * 🎯 ENDPOINT DE APROBACIÓN AUTOMÁTICA DE VERIFICACIONES DIDIT
 * 
 * Acepta automáticamente las verificaciones que están "In Review"
 * para agilizar el proceso de registro de doctores
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { diditApiClient } from '@/lib/didit/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId es requerido' }, { status: 400 });
    }

    // Log de auditoría
    logSecurityEvent(
      'admin_action',
      `Solicitud de aprobación automática para sesión ${sessionId}`,
      {
        sessionId,
        timestamp: new Date().toISOString()
      },
      'info'
    );

    // 1) Obtener estado actual de la sesión
    let sessionStatus;
    try {
      sessionStatus = await diditApiClient.getSessionStatus(sessionId);
    } catch (error) {
      console.error('Error obteniendo estado de sesión:', error);
      return NextResponse.json(
        { error: 'No se pudo obtener el estado de la sesión' },
        { status: 400 }
      );
    }

    // 2) Verificar que esté en estado "In Review"
    if (sessionStatus.status !== 'In Review') {
      return NextResponse.json(
        { 
          error: 'La sesión no está en estado "In Review"',
          currentStatus: sessionStatus.status
        },
        { status: 409 }
      );
    }

    // 3) Aprobar automáticamente la sesión usando endpoint directo
    try {
      // Usar endpoint directo de Didit para aprobar
      const approvalResult = await fetch(`https://verification.didit.me/v2/session/${sessionId}/update-status/`, {
        method: 'PATCH',
        headers: {
          'x-api-key': process.env.DIDIT_API_KEY as string,
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'User-Agent': 'Platform-Medicos-Doctor/2.0.0'
        },
        body: JSON.stringify({
          new_status: 'Approved',
          comment: 'Aprobación automática para registro de médico - Verificación de identidad completada exitosamente'
        })
      });

      if (!approvalResult.ok) {
        const errorData = await approvalResult.json().catch(() => ({}));
        throw new Error(`Error aprobando sesión: ${approvalResult.status} - ${errorData.detail || 'Error desconocido'}`);
      }

      const approvalData = await approvalResult.json();
      console.log('✅ Sesión aprobada automáticamente:', approvalData);

      // Log de auditoría exitoso
      logSecurityEvent(
        'admin_action',
        `Sesión ${sessionId} aprobada automáticamente`,
        {
          sessionId,
          previousStatus: 'In Review',
          newStatus: 'Approved',
          timestamp: new Date().toISOString()
        },
        'info'
      );

      return NextResponse.json({
        success: true,
        message: 'Verificación aprobada automáticamente',
        sessionId,
        previousStatus: 'In Review',
        newStatus: 'Approved'
      });

    } catch (error) {
      console.error('Error aprobando sesión:', error);
      
      logSecurityEvent(
        'system_error',
        `Error aprobando sesión ${sessionId}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          sessionId,
          error: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString()
        },
        'error'
      );

      return NextResponse.json(
        { error: 'No se pudo aprobar la sesión automáticamente' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en aprobación automática:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
