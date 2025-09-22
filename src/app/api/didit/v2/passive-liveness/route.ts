/**
 * 🎭 DIDIT API V2 - PASSIVE LIVENESS ENDPOINT
 * 
 * Endpoint independiente para detección de deepfake y liveness pasivo
 * Usa la API v2 de Didit para verificación de vida en tiempo real
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

// Tipos para Passive Liveness API v2
interface PassiveLivenessRequest {
  selfie_image?: string; // Base64 de selfie
  video_url?: string; // URL de video para análisis
  vendor_data?: string;
  callback_url?: string;
  detection_mode?: 'standard' | 'enhanced' | 'maximum';
  expected_details?: {
    first_name?: string;
    last_name?: string;
  };
}

interface PassiveLivenessResponse {
  liveness_check_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  upload_url?: string;
  verification_url?: string;
  expires_at?: string;
  created_at: string;
}

interface PassiveLivenessResult {
  liveness_check_id: string;
  status: 'approved' | 'declined' | 'needs_review';
  liveness_score: number; // 0-100
  confidence_level: 'low' | 'medium' | 'high';
  is_live: boolean;
  detection_methods: Array<{
    method: string;
    score: number;
    confidence: number;
    passed: boolean;
  }>;
  spoofing_attempts: Array<{
    type: 'photo' | 'video' | 'mask' | 'deepfake' | 'other';
    confidence: number;
    detected: boolean;
    details: string;
  }>;
  quality_metrics: {
    brightness_score: number;
    sharpness_score: number;
    contrast_score: number;
    overall_quality: number;
  };
  warnings?: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  images: {
    selfie_image?: string;
    face_crop?: string;
    liveness_overlay?: string;
  };
}

/**
 * Crea una nueva verificación de liveness pasivo usando Didit API v2
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      selfie_image,
      video_url,
      vendor_data,
      callback_url,
      detection_mode,
      expected_details 
    } = body as PassiveLivenessRequest;

    // Validar que al menos una imagen o video esté presente
    if (!selfie_image && !video_url) {
      return NextResponse.json(
        { error: 'Se requiere selfie_image o video_url' },
        { status: 400 }
      );
    }

    // Validar modo de detección
    const validModes = ['standard', 'enhanced', 'maximum'];
    if (detection_mode && !validModes.includes(detection_mode)) {
      return NextResponse.json(
        { error: `detection_mode debe ser uno de: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }

    // Preparar payload para Didit API v2
    const diditPayload = {
      ...(selfie_image && { selfie_image }),
      ...(video_url && { video_url }),
      ...(vendor_data && { vendor_data }),
      ...(callback_url && { callback_url }),
      ...(detection_mode && { detection_mode }),
      ...(expected_details && { expected_details })
    };

    // Llamar a Didit API v2
    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/passive-liveness/`, {
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
      console.error('Error en Didit Passive Liveness API v2:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        { 
          error: 'Error en verificación de liveness',
          details: errorData.detail || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const livenessData = await response.json() as PassiveLivenessResponse;

    // Log de auditoría
    logSecurityEvent('passive_liveness_initiated', {
      livenessCheckId: livenessData.liveness_check_id,
      hasSelfieImage: !!selfie_image,
      hasVideoUrl: !!video_url,
      detectionMode: detection_mode,
      vendorData: vendor_data,
      timestamp: new Date().toISOString()
    });

    // Guardar en base de datos si hay vendor_data (ID de usuario)
    if (vendor_data) {
      const admin = createAdminClient();
      await admin
        .from('didit_verifications')
        .insert({
          verification_id: livenessData.liveness_check_id,
          user_id: vendor_data,
          verification_type: 'passive_liveness',
          status: livenessData.status,
          detection_mode,
          callback_url,
          created_at: new Date().toISOString()
        })
        .catch(error => {
          console.warn('Error guardando passive liveness en BD:', error);
        });
    }

    return NextResponse.json({
      success: true,
      liveness_check_id: livenessData.liveness_check_id,
      status: livenessData.status,
      upload_url: livenessData.upload_url,
      verification_url: livenessData.verification_url,
      expires_at: livenessData.expires_at,
      created_at: livenessData.created_at,
      message: 'Verificación de liveness iniciada exitosamente'
    });

  } catch (error) {
    console.error('Error en endpoint de verificación de liveness:', error);
    
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
 * Obtiene el estado de una verificación de liveness
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const livenessCheckId = searchParams.get('liveness_check_id');

    if (!livenessCheckId) {
      return NextResponse.json(
        { error: 'liveness_check_id es requerido' },
        { status: 400 }
      );
    }

    // Llamar a Didit API v2 para obtener estado
    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/passive-liveness/${livenessCheckId}`, {
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
          error: 'Error obteniendo estado de verificación de liveness',
          details: errorData.detail || response.statusText
        },
        { status: response.status }
      );
    }

    const livenessResult = await response.json() as PassiveLivenessResult;

    // Log de auditoría
    logSecurityEvent('passive_liveness_status_checked', {
      livenessCheckId,
      status: livenessResult.status,
      livenessScore: livenessResult.liveness_score,
      confidenceLevel: livenessResult.confidence_level,
      isLive: livenessResult.is_live,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      liveness_check_id: livenessResult.liveness_check_id,
      status: livenessResult.status,
      liveness_score: livenessResult.liveness_score,
      confidence_level: livenessResult.confidence_level,
      is_live: livenessResult.is_live,
      detection_methods: livenessResult.detection_methods,
      spoofing_attempts: livenessResult.spoofing_attempts,
      quality_metrics: livenessResult.quality_metrics,
      warnings: livenessResult.warnings,
      images: livenessResult.images
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación de liveness:', error);
    
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
 * Webhook handler para resultados de verificación de liveness
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      liveness_check_id, 
      status, 
      liveness_score, 
      confidence_level,
      is_live,
      detection_methods,
      spoofing_attempts,
      quality_metrics,
      warnings
    } = body;

    if (!liveness_check_id || !status) {
      return NextResponse.json(
        { error: 'liveness_check_id y status son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar estado en base de datos
    const admin = createAdminClient();
    const { data: verification, error } = await admin
      .from('didit_verifications')
      .select('user_id, verification_type')
      .eq('verification_id', liveness_check_id)
      .single();

    if (error || !verification) {
      console.warn('Passive liveness no encontrado en BD:', liveness_check_id);
      return NextResponse.json(
        { error: 'Verificación de liveness no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado
    await admin
      .from('didit_verifications')
      .update({
        status,
        liveness_score,
        confidence_level,
        is_live,
        detection_methods,
        spoofing_attempts,
        quality_metrics,
        warnings,
        updated_at: new Date().toISOString()
      })
      .eq('verification_id', liveness_check_id);

    // Log de auditoría
    logSecurityEvent('passive_liveness_completed', {
      livenessCheckId: liveness_check_id,
      userId: verification.user_id,
      status,
      livenessScore: liveness_score,
      confidenceLevel: confidence_level,
      isLive: is_live,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      liveness_check_id,
      status,
      liveness_score,
      confidence_level,
      is_live,
      message: 'Estado de verificación de liveness actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado de verificación de liveness:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
