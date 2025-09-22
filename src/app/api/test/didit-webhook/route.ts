/**
 * 🧪 DIDIT WEBHOOK TEST ENDPOINT
 * 
 * Endpoint para probar el webhook de Didit con datos simulados
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Simula un webhook de Didit para pruebas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, status, doctor_id } = body;

    if (!session_id || !status) {
      return NextResponse.json(
        { error: 'session_id y status son requeridos' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Determinar estado general
    let overallStatus = 'processing';
    if (status === 'Approved') {
      overallStatus = 'approved';
    } else if (status === 'Declined') {
      overallStatus = 'declined';
    } else if (status === 'In Review') {
      overallStatus = 'review';
    } else if (status === 'Not Started') {
      overallStatus = 'pending';
    }

    // Crear o actualizar verificación
    const { data: verification, error: upsertError } = await supabase
      .from('didit_verifications')
      .upsert({
        session_id,
        doctor_id: doctor_id || null,
        workflow_id: '3176221b-c77c-4fea-b2b3-da185ef18122',
        vendor_data: doctor_id || 'test-doctor',
        status,
        overall_status: overallStatus,
        features: ['ID_VERIFICATION', 'FACE_MATCH', 'LIVENESS', 'AML'],
        session_url: `https://verify.didit.me/session/${session_id}`,
        id_verification: status === 'Approved' ? {
          status: 'Approved',
          document_type: 'national_id',
          document_number: 'V-12345678',
          first_name: 'Juan',
          last_name: 'Pérez',
          date_of_birth: '1990-01-15',
          nationality: 'VE'
        } : null,
        face_match: status === 'Approved' ? {
          status: 'Approved',
          match_score: 0.95,
          confidence_level: 'high'
        } : null,
        liveness: status === 'Approved' ? {
          status: 'Approved',
          liveness_score: 0.98,
          is_live: true
        } : null,
        aml: status === 'Approved' ? {
          status: 'Approved',
          overall_risk_score: 0.1,
          risk_level: 'low'
        } : null
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting verification:', upsertError);
      return NextResponse.json(
        { error: 'Error actualizando verificación', details: upsertError.message },
        { status: 500 }
      );
    }

    // Si hay doctor_id, actualizar su estado de verificación
    if (doctor_id && (status === 'Approved' || status === 'Declined')) {
      const { error: updateError } = await supabase
        .from('doctors')
        .update({
          is_verified: status === 'Approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', doctor_id);

      if (updateError) {
        console.error('Error updating doctor verification:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      verification,
      message: 'Webhook simulado procesado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en webhook test:', error);
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
 * Obtiene estadísticas de verificaciones
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Obtener estadísticas usando la función que creamos
    const { data: stats, error: statsError } = await supabase.rpc('get_didit_verification_stats');

    if (statsError) {
      console.error('Error getting stats:', statsError);
      return NextResponse.json(
        { error: 'Error obteniendo estadísticas' },
        { status: 500 }
      );
    }

    // Obtener verificaciones recientes
    const { data: recentVerifications, error: recentError } = await supabase
      .from('didit_verifications')
      .select(`
        id,
        session_id,
        doctor_id,
        status,
        overall_status,
        created_at,
        completed_at,
        features
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error getting recent verifications:', recentError);
    }

    return NextResponse.json({
      success: true,
      stats: stats[0] || {
        total_verifications: 0,
        approved_count: 0,
        declined_count: 0,
        pending_count: 0,
        in_progress_count: 0,
        success_rate: 0
      },
      recent_verifications: recentVerifications || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting webhook test data:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
