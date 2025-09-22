/**
 * 🎭 DIDIT API V2 - FACE MATCH ENDPOINT
 * 
 * Endpoint independiente para comparación facial (selfie vs identificación)
 * Usa la API v2 de Didit para verificación biométrica facial
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Didit API v2
const DIDIT_V2_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY || 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o',
  baseUrl: 'https://api.didit.me/v2',
  timeout: 30000, // 30 segundos
};

// Tipos para Face Match API v2
interface FaceMatchRequest {
  id_verification_id?: string; // ID de verificación de identidad previa
  document_image?: string; // Base64 de imagen del documento
  selfie_image?: string; // Base64 de selfie
  vendor_data?: string;
  callback_url?: string;
  expected_details?: {
    first_name?: string;
    last_name?: string;
  };
}

interface FaceMatchResponse {
  face_match_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  upload_url?: string;
  verification_url?: string;
  expires_at?: string;
  created_at: string;
}

interface FaceMatchResult {
  face_match_id: string;
  status: 'approved' | 'declined' | 'needs_review';
  match_score: number; // 0-100
  confidence_level: 'low' | 'medium' | 'high';
  liveness_score?: number; // 0-100
  face_detected: boolean;
  quality_score: number; // 0-100
  warnings?: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  images: {
    selfie_image?: string;
    document_portrait?: string;
    face_crop?: string;
  };
}

/**
 * Crea una nueva verificación de coincidencia facial usando Didit API v2
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id_verification_id,
      document_image,
      selfie_image,
      vendor_data,
      callback_url,
      expected_details 
    } = body as FaceMatchRequest;

    // Validar que al menos una imagen esté presente
    if (!id_verification_id && !document_image && !selfie_image) {
      return NextResponse.json(
        { error: 'Se requiere id_verification_id o al menos una imagen (document_image o selfie_image)' },
        { status: 400 }
      );
    }

    // Preparar payload para Didit API v2
    const diditPayload = {
      ...(id_verification_id && { id_verification_id }),
      ...(document_image && { document_image }),
      ...(selfie_image && { selfie_image }),
      ...(vendor_data && { vendor_data }),
      ...(callback_url && { callback_url }),
      ...(expected_details && { expected_details })
    };

    // Llamar a Didit API v2
    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/face-match/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIDIT_V2_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      body: JSON.stringify(diditPayload),
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error en Didit Face Match API v2:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        { 
          error: 'Error en verificación facial',
          details: errorData.detail || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const faceMatchData = await response.json() as FaceMatchResponse;

    // Log de auditoría
    logSecurityEvent('face_match_initiated', {
      faceMatchId: faceMatchData.face_match_id,
      idVerificationId: id_verification_id,
      vendorData: vendor_data,
      timestamp: new Date().toISOString()
    });

    // Guardar en base de datos si hay vendor_data (ID de usuario)
    if (vendor_data) {
      const admin = createAdminClient();
      await admin
        .from('didit_verifications')
        .insert({
          verification_id: faceMatchData.face_match_id,
          user_id: vendor_data,
          verification_type: 'face_match',
          status: faceMatchData.status,
          id_verification_id,
          callback_url,
          created_at: new Date().toISOString()
        })
        .catch(error => {
          console.warn('Error guardando face match en BD:', error);
        });
    }

    return NextResponse.json({
      success: true,
      face_match_id: faceMatchData.face_match_id,
      status: faceMatchData.status,
      upload_url: faceMatchData.upload_url,
      verification_url: faceMatchData.verification_url,
      expires_at: faceMatchData.expires_at,
      created_at: faceMatchData.created_at,
      message: 'Verificación facial iniciada exitosamente'
    });

  } catch (error) {
    console.error('Error en endpoint de verificación facial:', error);
    
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
 * Obtiene el estado de una verificación facial
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const faceMatchId = searchParams.get('face_match_id');

    if (!faceMatchId) {
      return NextResponse.json(
        { error: 'face_match_id es requerido' },
        { status: 400 }
      );
    }

    // Llamar a Didit API v2 para obtener estado
    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/face-match/${faceMatchId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIDIT_V2_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Error obteniendo estado de verificación facial',
          details: errorData.detail || response.statusText
        },
        { status: response.status }
      );
    }

    const faceMatchResult = await response.json() as FaceMatchResult;

    // Log de auditoría
    logSecurityEvent('face_match_status_checked', {
      faceMatchId,
      status: faceMatchResult.status,
      matchScore: faceMatchResult.match_score,
      confidenceLevel: faceMatchResult.confidence_level,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      face_match_id: faceMatchResult.face_match_id,
      status: faceMatchResult.status,
      match_score: faceMatchResult.match_score,
      confidence_level: faceMatchResult.confidence_level,
      liveness_score: faceMatchResult.liveness_score,
      face_detected: faceMatchResult.face_detected,
      quality_score: faceMatchResult.quality_score,
      warnings: faceMatchResult.warnings,
      images: faceMatchResult.images
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación facial:', error);
    
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
 * Webhook handler para resultados de verificación facial
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      face_match_id, 
      status, 
      match_score, 
      confidence_level, 
      liveness_score,
      face_detected,
      quality_score,
      warnings 
    } = body;

    if (!face_match_id || !status) {
      return NextResponse.json(
        { error: 'face_match_id y status son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar estado en base de datos
    const admin = createAdminClient();
    const { data: verification, error } = await admin
      .from('didit_verifications')
      .select('user_id, verification_type')
      .eq('verification_id', face_match_id)
      .single();

    if (error || !verification) {
      console.warn('Face match no encontrado en BD:', face_match_id);
      return NextResponse.json(
        { error: 'Verificación facial no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado
    await admin
      .from('didit_verifications')
      .update({
        status,
        match_score,
        confidence_level,
        liveness_score,
        face_detected,
        quality_score,
        warnings,
        updated_at: new Date().toISOString()
      })
      .eq('verification_id', face_match_id);

    // Log de auditoría
    logSecurityEvent('face_match_completed', {
      faceMatchId: face_match_id,
      userId: verification.user_id,
      status,
      matchScore: match_score,
      confidenceLevel: confidence_level,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      face_match_id,
      status,
      match_score,
      confidence_level,
      message: 'Estado de verificación facial actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado de verificación facial:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
