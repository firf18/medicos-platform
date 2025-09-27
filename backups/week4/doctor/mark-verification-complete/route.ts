/**
 * 🎯 ENDPOINT PARA MARCAR VERIFICACIÓN COMO COMPLETADA
 * 
 * Marca la verificación como completada en nuestro sistema
 * para permitir el registro inmediato
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, diditStatus } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId es requerido' }, { status: 400 });
    }

    // Log de auditoría simplificado
    console.log('🔍 Marcando verificación como completada:', {
      sessionId,
      diditStatus,
      timestamp: new Date().toISOString()
    });

    const admin = createAdminClient();

    // Buscar el registro por verification_session_id
    const { data: reg, error: regErr } = await admin
      .from('doctor_registrations')
      .select('id, user_id')
      .eq('verification_session_id', sessionId)
      .maybeSingle();

    if (regErr) {
      console.error('Error buscando registro:', regErr);
      return NextResponse.json(
        { error: 'No se pudo encontrar el registro' },
        { status: 500 }
      );
    }

    if (!reg) {
      console.error('Registro no encontrado para sessionId:', sessionId);
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el estado de verificación en el registro
    const { error: updateError } = await (admin as any)
      .from('doctor_registrations')
      .update({
        verification_status: 'completed',
        didit_session_id: sessionId,
        didit_status: diditStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', (reg as any).id);

    if (updateError) {
      console.error('Error actualizando estado de verificación:', updateError);
      return NextResponse.json(
        { error: 'No se pudo actualizar el estado de verificación' },
        { status: 500 }
      );
    }

    console.log('✅ Verificación marcada como completada:', { sessionId, diditStatus });

    // Log de auditoría exitoso simplificado
    console.log('✅ Verificación completada exitosamente:', {
      sessionId,
      diditStatus,
      userId: (reg as any).user_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Verificación marcada como completada',
      sessionId,
      diditStatus
    });

  } catch (error) {
    console.error('Error marcando verificación como completada:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
