/**
 * 🎯 DIDIT WEBHOOK HANDLER - SIMPLIFIED FOR PRODUCTION
 * 
 * Webhook handler simplificado que usa directamente Supabase
 * para procesar notificaciones de Didit
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/validations/security.validations';

const WEBHOOK_CONFIG = {
  secretKey: process.env.DIDIT_WEBHOOK_SECRET_KEY || '',
  allowedTimestampSkew: 300, // 5 minutos en segundos
};

// Tipos para webhook de Didit
interface DiditWebhookPayload {
  session_id: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned';
  webhook_type: 'status.updated' | 'data.updated';
  created_at: number;
  timestamp: number;
  workflow_id?: string;
  vendor_data?: string;
  metadata?: Record<string, any>;
  decision?: {
    session_id: string;
    session_number: number;
    session_url: string;
    status: string;
    workflow_id: string;
    features: string[];
    vendor_data: string;
    metadata: Record<string, any>;
    id_verification?: any;
    face_match?: any;
    liveness?: any;
    aml?: any;
    nfc?: any;
    ip_analysis?: any;
    reviews?: any[];
    created_at: string;
  };
}

/**
 * Verifica la firma HMAC del webhook
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secretKey: string
): boolean {
  try {
    // Verificar timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    const incomingTime = parseInt(timestamp, 10);
    
    if (Math.abs(currentTime - incomingTime) > WEBHOOK_CONFIG.allowedTimestampSkew) {
      console.warn('Webhook timestamp is stale:', {
        currentTime,
        incomingTime,
        skew: Math.abs(currentTime - incomingTime)
      });
      return false;
    }

    // Generar HMAC esperado
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secretKey);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    // Comparar firmas
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Procesa el payload del webhook
 */
async function processWebhookPayload(payload: DiditWebhookPayload): Promise<void> {
  const supabase = createAdminClient();
  const { session_id, status, decision, vendor_data, workflow_id } = payload;

  try {
    // Log de auditoría
    logSecurityEvent('didit_webhook_received', {
      sessionId: session_id,
      status,
      vendorData: vendor_data,
      hasDecision: !!decision,
      timestamp: new Date().toISOString()
    });

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

    // Actualizar o crear verificación en la base de datos
    const { error: upsertError } = await supabase.rpc('update_didit_verification_status', {
      p_session_id: session_id,
      p_status: status,
      p_overall_status: overallStatus,
      p_id_verification: decision?.id_verification || null,
      p_face_match: decision?.face_match || null,
      p_liveness: decision?.liveness || null,
      p_aml: decision?.aml || null,
      p_nfc: decision?.nfc || null,
      p_ip_analysis: decision?.ip_analysis || null,
      p_reviews: decision?.reviews || null
    });

    if (upsertError) {
      console.error('Error updating verification status:', upsertError);
      
      // Si no existe la verificación, crear una nueva
      if (upsertError.message.includes('not found') || upsertError.message.includes('does not exist')) {
        const { error: insertError } = await supabase
          .from('didit_verifications')
          .insert({
            session_id,
            workflow_id: workflow_id || '3176221b-c77c-4fea-b2b3-da185ef18122',
            vendor_data: vendor_data,
            status,
            overall_status: overallStatus,
            session_url: decision?.session_url,
            features: decision?.features || [],
            id_verification: decision?.id_verification,
            face_match: decision?.face_match,
            liveness: decision?.liveness,
            aml: decision?.aml,
            nfc: decision?.nfc,
            ip_analysis: decision?.ip_analysis,
            reviews: decision?.reviews
          });

        if (insertError) {
          console.error('Error creating new verification:', insertError);
          throw insertError;
        }
      } else {
        throw upsertError;
      }
    }

    // Si la verificación está completa, actualizar el estado del doctor
    if (status === 'Approved' || status === 'Declined') {
      await updateDoctorVerificationStatus(vendor_data, status === 'Approved');
    }

    console.log('Webhook processed successfully:', {
      sessionId: session_id,
      status,
      overallStatus,
      vendorData: vendor_data
    });

  } catch (error) {
    console.error('Error processing webhook payload:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de verificación del doctor
 */
async function updateDoctorVerificationStatus(vendorData: string | undefined, isApproved: boolean): Promise<void> {
  if (!vendorData) return;

  const supabase = createAdminClient();

  try {
    // Buscar el doctor por vendor_data (que debería ser el doctor_id)
    const { data: doctor, error: findError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', vendorData)
      .single();

    if (findError || !doctor) {
      console.warn('Doctor not found for vendor_data:', vendorData);
      return;
    }

    // Actualizar el estado de verificación del doctor
    const { error: updateError } = await supabase
      .from('doctors')
      .update({
        is_verified: isApproved,
        updated_at: new Date().toISOString()
      })
      .eq('id', doctor.id);

    if (updateError) {
      console.error('Error updating doctor verification status:', updateError);
    } else {
      console.log('Doctor verification status updated:', {
        doctorId: doctor.id,
        isVerified: isApproved
      });

      // Log de auditoría
      logSecurityEvent('doctor_verification_status_updated', {
        doctorId: doctor.id,
        isVerified: isApproved,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error updating doctor verification status:', error);
  }
}

/**
 * Handler principal del webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo raw
    const rawBody = await request.text();
    
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Obtener headers
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Validar configuración
    if (!WEBHOOK_CONFIG.secretKey) {
      console.error('Webhook secret key not configured');
      return NextResponse.json(
        { error: 'Webhook configuration incomplete' },
        { status: 500 }
      );
    }

    // Validar headers requeridos
    if (!signature || !timestamp) {
      console.warn('Missing required headers:', {
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
        clientIP
      });
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 401 }
      );
    }

    // Verificar firma del webhook
    const isValidSignature = verifyWebhookSignature(
      rawBody,
      signature,
      timestamp,
      WEBHOOK_CONFIG.secretKey
    );

    if (!isValidSignature) {
      console.warn('Invalid webhook signature:', {
        clientIP,
        timestamp,
        bodyLength: rawBody.length
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parsear JSON del payload
    let payload: DiditWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse webhook JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validar payload requerido
    if (!payload.session_id || !payload.status || !payload.webhook_type) {
      console.warn('Invalid webhook payload structure:', {
        hasSessionId: !!payload.session_id,
        hasStatus: !!payload.status,
        hasWebhookType: !!payload.webhook_type
      });
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // Procesar el webhook
    await processWebhookPayload(payload);

    // Log de éxito
    console.log('Webhook processed successfully:', {
      sessionId: payload.session_id,
      status: payload.status,
      webhookType: payload.webhook_type,
      clientIP,
      timestamp: new Date().toISOString()
    });

    // Log de auditoría
    logSecurityEvent('webhook_processed_successfully', {
      sessionId: payload.session_id,
      status: payload.status,
      webhookType: payload.webhook_type,
      clientIP,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Webhook processed successfully',
      sessionId: payload.session_id,
      status: payload.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing webhook:', error);

    // Log de auditoría para errores
    logSecurityEvent('webhook_processing_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Webhook processing failed'
      },
      { status: 500 }
    );
  }
}

/**
 * Handler GET para verificar configuración del webhook
 */
export async function GET() {
  return NextResponse.json({
    configured: !!WEBHOOK_CONFIG.secretKey,
    timestampSkew: WEBHOOK_CONFIG.allowedTimestampSkew,
    platform: 'platform-medicos',
    version: '2.0.0',
    workflowId: '3176221b-c77c-4fea-b2b3-da185ef18122',
    message: 'Didit webhook handler is ready'
  });
}
