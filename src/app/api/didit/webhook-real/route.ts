/**
 * 🔔 WEBHOOK REAL DE DIDIT - SEGÚN DOCUMENTACIÓN OFICIAL
 * 
 * Este endpoint maneja los webhooks reales de Didit.me según su documentación oficial
 * y actualiza el estado de verificación en tiempo real
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

// Configuración de Didit según documentación oficial
const DIDIT_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY || 'iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
  webhookSecret: process.env.DIDIT_WEBHOOK_SECRET || 'NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck',
  baseUrl: 'https://verification.didit.me'
};

// Tipos según documentación oficial de Didit
interface DiditWebhookPayload {
  session_id: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned' | 'Expired';
  decision?: {
    id_verification?: {
      status: string;
      confidence?: number;
      document_type?: string;
      document_number?: string;
      full_name?: string;
      warnings?: string[];
    };
    face_match?: {
      status: string;
      confidence?: number;
      similarity?: number;
    };
    liveness?: {
      status: string;
      confidence?: number;
    };
    aml?: {
      status: string;
      risk_level?: string;
    };
    nfc?: {
      status: string;
      confidence?: number;
    };
    ip_analysis?: {
      status: string;
      risk_level?: string;
    };
    reviews?: any[];
  };
  vendor_data?: string;
  workflow_id?: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

/**
 * Verifica la firma del webhook según documentación oficial de Didit
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secretKey: string
): boolean {
  try {
    // Crear payload para verificación
    const payload = `${timestamp}.${rawBody}`;
    
    // Crear HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Comparar firmas usando timingSafeEqual para prevenir timing attacks
    const providedSignature = Buffer.from(signature, 'hex');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');
    
    return crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Procesa el payload del webhook y actualiza la base de datos
 */
async function processWebhookPayload(payload: DiditWebhookPayload): Promise<void> {
  const { session_id, status, decision, vendor_data, workflow_id } = payload;
  
  console.log('🔔 Procesando webhook de Didit:', {
    session_id,
    status,
    hasDecision: !!decision,
    vendor_data,
    workflow_id,
    timestamp: new Date().toISOString()
  });

  try {
    const admin = createAdminClient();
    
    // Determinar estado general según documentación oficial
    let overallStatus = 'processing';
    let progress = 25;
    
    switch (status) {
      case 'Not Started':
        overallStatus = 'pending';
        progress = 25;
        break;
      case 'In Progress':
        overallStatus = 'processing';
        progress = 50;
        break;
      case 'In Review':
        overallStatus = 'review';
        progress = 75;
        break;
      case 'Approved':
        overallStatus = 'approved';
        progress = 100;
        break;
      case 'Declined':
        overallStatus = 'declined';
        progress = 100;
        break;
      case 'Abandoned':
      case 'Expired':
        overallStatus = 'expired';
        progress = 100;
        break;
    }

    // Actualizar o crear verificación en la base de datos
    const { error: upsertError } = await admin
      .from('didit_verification_sessions')
      .upsert({
        session_id,
        status: overallStatus,
        didit_status: status,
        progress,
        decision: decision || null,
        vendor_data: vendor_data || null,
        workflow_id: workflow_id || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      });

    if (upsertError) {
      console.error('❌ Error actualizando verificación en BD:', upsertError);
      throw upsertError;
    }

    console.log('✅ Verificación actualizada en BD:', {
      session_id,
      status: overallStatus,
      progress: `${progress}%`
    });

    // Si hay decisión final, notificar al usuario
    if (decision && (status === 'Approved' || status === 'Declined' || status === 'In Review')) {
      console.log('📢 Notificando resultado de verificación:', {
        session_id,
        status,
        hasDecision: !!decision
      });
      
      // TODO: Implementar notificación al usuario (email, push, etc.)
      // await notifyUserOfVerificationResult(session_id, status, decision);
    }

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    throw error;
  }
}

/**
 * POST - Maneja webhooks de Didit según documentación oficial
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook recibido de Didit');
    
    // Obtener headers requeridos
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');
    
    if (!signature || !timestamp) {
      console.error('❌ Headers de webhook faltantes:', { signature: !!signature, timestamp: !!timestamp });
      return NextResponse.json(
        { error: 'Headers de webhook requeridos' },
        { status: 400 }
      );
    }

    // Obtener cuerpo raw del request
    const rawBody = await request.text();
    
    // Verificar firma del webhook
    if (!verifyWebhookSignature(rawBody, signature, timestamp, DIDIT_CONFIG.webhookSecret)) {
      console.error('❌ Firma de webhook inválida');
      return NextResponse.json(
        { error: 'Firma de webhook inválida' },
        { status: 401 }
      );
    }

    // Parsear payload
    const payload: DiditWebhookPayload = JSON.parse(rawBody);
    
    // Procesar webhook
    await processWebhookPayload(payload);

    console.log('✅ Webhook procesado exitosamente:', payload.session_id);

    return NextResponse.json({
      success: true,
      session_id: payload.session_id,
      status: payload.status,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    
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
 * GET - Endpoint de verificación para desarrollo
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/didit/webhook-real`,
    configured: !!DIDIT_CONFIG.webhookSecret,
    timestamp: new Date().toISOString()
  });
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
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-signature, x-timestamp',
      },
    }
  );
}
