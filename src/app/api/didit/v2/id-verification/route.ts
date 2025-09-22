/**
 * 🔍 DIDIT API V2 - ID VERIFICATION ENDPOINT
 * 
 * Endpoint independiente para verificación de documentos de identidad
 * Usa la API v2 de Didit para control total del flujo de verificación
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Didit API v2
const DIDIT_V2_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: 'https://verification.didit.me/v2',
  timeout: 30000, // 30 segundos
};

// Tipos para la API v2
interface IdVerificationRequest {
  document_type: 'passport' | 'drivers_license' | 'national_id';
  document_country: string;
  document_number?: string;
  vendor_data?: string;
  callback_url?: string;
  expected_details?: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    document_number?: string;
  };
}

interface IdVerificationResponse {
  verification_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  upload_url?: string;
  verification_url?: string;
  expires_at?: string;
  created_at: string;
}

interface IdVerificationResult {
  verification_id: string;
  status: 'approved' | 'declined' | 'needs_review';
  document_type: string;
  document_number: string;
  extracted_data: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    document_number: string;
    expiration_date?: string;
    issuing_country: string;
  };
  confidence_score: number;
  warnings?: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  images: {
    front_image?: string;
    back_image?: string;
    portrait_image?: string;
  };
}

/**
 * Crea una nueva verificación de identidad usando Didit API v2
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      document_type, 
      document_country, 
      document_number, 
      vendor_data,
      callback_url,
      expected_details 
    } = body as IdVerificationRequest;

    // Validar datos requeridos
    if (!document_type || !document_country) {
      return NextResponse.json(
        { error: 'document_type y document_country son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipos de documento soportados
    const supportedTypes = ['passport', 'drivers_license', 'national_id'];
    if (!supportedTypes.includes(document_type)) {
      return NextResponse.json(
        { error: `document_type debe ser uno de: ${supportedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Preparar payload para Didit API v2
    const diditPayload = {
      document_type,
      document_country,
      ...(document_number && { document_number }),
      ...(vendor_data && { vendor_data }),
      ...(callback_url && { callback_url }),
      ...(expected_details && { expected_details })
    };

    // Llamar a Didit API v2
    // Validar configuración obligatoria
    if (!DIDIT_V2_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
        { status: 500 }
      );
    }

    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/id-verification/`, {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      body: JSON.stringify(diditPayload),
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error en Didit API v2:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        { 
          error: 'Error en verificación de identidad',
          details: errorData.detail || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const verificationData = await response.json() as IdVerificationResponse;

    // Log de auditoría
    logSecurityEvent('id_verification_initiated', {
      verificationId: verificationData.verification_id,
      documentType: document_type,
      documentCountry: document_country,
      vendorData: vendor_data,
      timestamp: new Date().toISOString()
    });

    // Guardar en base de datos si hay vendor_data (ID de usuario)
    if (vendor_data) {
      const admin = createAdminClient();
      await admin
        .from('didit_verifications')
        .insert({
          verification_id: verificationData.verification_id,
          user_id: vendor_data,
          verification_type: 'id_verification',
          status: verificationData.status,
          document_type,
          document_country,
          callback_url,
          created_at: new Date().toISOString()
        })
        .catch(error => {
          console.warn('Error guardando verificación en BD:', error);
        });
    }

    return NextResponse.json({
      success: true,
      verification_id: verificationData.verification_id,
      status: verificationData.status,
      upload_url: verificationData.upload_url,
      verification_url: verificationData.verification_url,
      expires_at: verificationData.expires_at,
      created_at: verificationData.created_at,
      message: 'Verificación de identidad iniciada exitosamente'
    });

  } catch (error) {
    console.error('Error en endpoint de verificación de identidad:', error);
    
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
 * Obtiene el estado de una verificación de identidad
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationId = searchParams.get('verification_id');

    if (!verificationId) {
      return NextResponse.json(
        { error: 'verification_id es requerido' },
        { status: 400 }
      );
    }

    // Llamar a Didit API v2 para obtener estado
    // Validar configuración obligatoria
    if (!DIDIT_V2_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
        { status: 500 }
      );
    }

    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/id-verification/${verificationId}`, {
      method: 'GET',
      headers: {
        'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Error obteniendo estado de verificación',
          details: errorData.detail || response.statusText
        },
        { status: response.status }
      );
    }

    const verificationResult = await response.json() as IdVerificationResult;

    // Log de auditoría
    logSecurityEvent('id_verification_status_checked', {
      verificationId,
      status: verificationResult.status,
      confidenceScore: verificationResult.confidence_score,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      verification_id: verificationResult.verification_id,
      status: verificationResult.status,
      document_type: verificationResult.document_type,
      document_number: verificationResult.document_number,
      extracted_data: verificationResult.extracted_data,
      confidence_score: verificationResult.confidence_score,
      warnings: verificationResult.warnings,
      images: verificationResult.images
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación:', error);
    
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
 * Webhook handler para resultados de verificación de identidad
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { verification_id, status, extracted_data, confidence_score, warnings } = body;

    if (!verification_id || !status) {
      return NextResponse.json(
        { error: 'verification_id y status son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar estado en base de datos
    const admin = createAdminClient();
    const { data: verification, error } = await admin
      .from('didit_verifications')
      .select('user_id, verification_type')
      .eq('verification_id', verification_id)
      .single();

    if (error || !verification) {
      console.warn('Verificación no encontrada en BD:', verification_id);
      return NextResponse.json(
        { error: 'Verificación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado
    await admin
      .from('didit_verifications')
      .update({
        status,
        extracted_data,
        confidence_score,
        warnings,
        updated_at: new Date().toISOString()
      })
      .eq('verification_id', verification_id);

    // Log de auditoría
    logSecurityEvent('id_verification_completed', {
      verificationId: verification_id,
      userId: verification.user_id,
      status,
      confidenceScore: confidence_score,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      verification_id,
      status,
      message: 'Estado de verificación actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado de verificación:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
