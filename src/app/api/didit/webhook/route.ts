/**
 * Didit Webhook Handler - Platform Médicos Elite
 * 
 * Maneja webhooks de Didit.me para notificaciones en tiempo real
 * sobre cambios en el estado de verificación de identidad médica
 * 
 * @compliance HIPAA-compliant webhook processing with full audit trail
 * @security HMAC signature verification with timing-safe comparison
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/security.validations';
import { diditWebhookService } from '@/lib/services/didit-webhook.service';

// Configuración de webhook
const WEBHOOK_CONFIG = {
  secretKey: process.env.DIDIT_WEBHOOK_SECRET_KEY || '',
  allowedTimestampSkew: 300, // 5 minutos en segundos
  // Mantener comentarios informativos, pero no bloquear por IPs rígidas que pueden cambiar
  ipWhitelist: [],
};

// Tipos para webhook
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
    expected_details?: {
      first_name: string;
      last_name: string;
    };
    contact_details?: {
      email: string;
      email_lang: string;
      phone?: string;
    };
    callback: string;
    id_verification?: {
      status: string;
      document_type: string;
      document_number: string;
      personal_number?: string;
      portrait_image?: string;
      front_image?: string;
      front_video?: string;
      back_image?: string;
      back_video?: string;
      full_front_image?: string;
      full_back_image?: string;
      date_of_birth: string;
      age: number;
      expiration_date: string;
      date_of_issue: string;
      issuing_state: string;
      issuing_state_name: string;
      first_name: string;
      last_name: string;
      full_name: string;
      gender: string;
      address: string;
      formatted_address: string;
      place_of_birth: string;
      marital_status: string;
      nationality: string;
      parsed_address?: any;
      extra_files?: string[];
      warnings?: Array<{
        risk: string;
        additional_data: any;
        log_type: string;
        short_description: string;
        long_description: string;
      }>;
    };
    reviews?: Array<{
      user: string;
      new_status: string;
      comment: string;
      created_at: string;
    }>;
    created_at: string;
  };
}

interface WebhookHeaders {
  signature: string;
  timestamp: string;
}

/**
 * Verifica la firma HMAC del webhook usando timing-safe comparison
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secretKey: string
): boolean {
  try {
    // Verificar que el timestamp sea reciente (dentro de 5 minutos)
    const currentTime = Math.floor(Date.now() / 1000);
    const incomingTime = parseInt(timestamp, 10);
    
    if (Math.abs(currentTime - incomingTime) > WEBHOOK_CONFIG.allowedTimestampSkew) {
      logger.warn('webhook', 'Request timestamp is stale', {
        currentTime,
        incomingTime,
        skew: Math.abs(currentTime - incomingTime)
      });
      return false;
    }

    // Didit puede enviar firma en distintos headers. Soportar alternativas
    // Formato esperado: HMAC-SHA256 del body (o timestamp + '.' + body) en hex
    // Primero intentar body directo; si falla, intentar timestamp.body
    const hmacBody = createHmac('sha256', secretKey).update(rawBody).digest('hex');
    const hmacWithTs = createHmac('sha256', secretKey).update(`${timestamp}.${rawBody}`).digest('hex');

    // Comparar usando timing-safe comparison para prevenir timing attacks
    const providedSignatureBuffer = Buffer.from(signature, 'utf8');
    const expectedCandidates = [hmacBody, hmacWithTs];
    const isAnyValid = expectedCandidates.some(expected => {
      const expectedSignatureBuffer = Buffer.from(expected, 'utf8');
      if (expectedSignatureBuffer.length !== providedSignatureBuffer.length) return false;
      return timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer);
    });

    if (!isAnyValid) {
      logger.warn('webhook', 'Invalid signature', {
        expected: 'one-of-known-formats',
        provided: signature,
        timestamp,
        bodyLength: rawBody.length
      });
    }

    return isAnyValid;
  } catch (error) {
    logger.error('webhook', 'Error verifying signature', { error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
}

/**
 * Procesa el payload del webhook y actualiza el estado de verificación
 */
async function processWebhookPayload(payload: DiditWebhookPayload): Promise<void> {
  try {
    const { session_id, status, webhook_type, decision, vendor_data, metadata, workflow_id } = payload;

    // Log de auditoría del webhook
    logSecurityEvent('didit_webhook_received', {
      sessionId: session_id,
      status,
      webhookType: webhook_type,
      vendorData: vendor_data,
      hasDecision: !!decision,
      timestamp: new Date().toISOString()
    });

    logger.info('webhook', 'Processing Didit webhook', {
      sessionId: session_id,
      status,
      webhookType: webhook_type,
      vendorData: vendor_data
    });

    // Actualizar sesión de verificación en la base de datos
    await diditWebhookService.upsertVerificationSession({
      session_id,
      user_id: vendor_data || 'unknown',
      status,
      workflow_id,
      vendor_data,
      metadata,
      decision
    });

    // Procesar según el tipo de webhook
    switch (webhook_type) {
      case 'status.updated':
        await handleStatusUpdate(session_id, status, decision, vendor_data, metadata);
        break;
      
      case 'data.updated':
        await handleDataUpdate(session_id, decision, vendor_data, metadata);
        break;
      
      default:
        logger.warn('webhook', 'Unknown webhook type', { webhookType: webhook_type });
    }

  } catch (error) {
    logger.error('webhook', 'Error processing webhook payload', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: payload.session_id
    });
    throw error;
  }
}

/**
 * Maneja actualizaciones de estado de verificación
 */
async function handleStatusUpdate(
  sessionId: string,
  status: string,
  decision: DiditWebhookPayload['decision'],
  vendorData?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Aquí implementarías la lógica para actualizar tu base de datos
    // Por ejemplo, actualizar el estado de verificación del médico
    
    logger.info('webhook', 'Handling status update', {
      sessionId,
      status,
      hasDecision: !!decision,
      vendorData
    });

    // Si hay decisión final, procesar resultados
    if (decision && (status === 'Approved' || status === 'Declined')) {
      await processVerificationDecision(sessionId, decision, status);
    }

    // Log de auditoría
    logSecurityEvent('verification_status_updated', {
      sessionId,
      status,
      vendorData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('webhook', 'Error handling status update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId,
      status
    });
    throw error;
  }
}

/**
 * Maneja actualizaciones de datos de verificación
 */
async function handleDataUpdate(
  sessionId: string,
  decision: DiditWebhookPayload['decision'],
  vendorData?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    logger.info('webhook', 'Handling data update', {
      sessionId,
      hasDecision: !!decision,
      vendorData
    });

    // Procesar actualización de datos
    if (decision) {
      await processVerificationDecision(sessionId, decision, 'data_updated');
    }

    // Log de auditoría
    logSecurityEvent('verification_data_updated', {
      sessionId,
      vendorData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('webhook', 'Error handling data update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
}

/**
 * Procesa la decisión final de verificación
 */
async function processVerificationDecision(
  sessionId: string,
  decision: DiditWebhookPayload['decision'],
  status: string
): Promise<void> {
  try {
    const { id_verification, reviews } = decision;

    logger.info('webhook', 'Processing verification decision', {
      sessionId,
      status,
      hasIdVerification: !!id_verification,
      hasReviews: !!reviews?.length
    });

    // Procesar resultados de verificación de identidad
    if (id_verification) {
      await processIdVerificationResults(sessionId, id_verification, status);
    }

    // Procesar reviews si existen
    if (reviews && reviews.length > 0) {
      await processVerificationReviews(sessionId, reviews);
    }

    // Log de auditoría
    logSecurityEvent('verification_decision_processed', {
      sessionId,
      status,
      idVerificationStatus: id_verification?.status,
      reviewCount: reviews?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('webhook', 'Error processing verification decision', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId,
      status
    });
    throw error;
  }
}

/**
 * Procesa resultados de verificación de identidad
 */
async function processIdVerificationResults(
  sessionId: string,
  idVerification: DiditWebhookPayload['decision']['id_verification'],
  status: string
): Promise<void> {
  try {
    const {
      status: verificationStatus,
      document_type,
      document_number,
      first_name,
      last_name,
      date_of_birth,
      nationality,
      warnings
    } = idVerification!;

    logger.info('webhook', 'Processing ID verification results', {
      sessionId,
      verificationStatus,
      documentType: document_type,
      documentNumber: document_number?.substring(0, 4) + '****', // Masked for security
      firstName: first_name,
      lastName: last_name,
      hasWarnings: !!warnings?.length
    });

    // Procesar resultados usando el servicio de webhook
    await diditWebhookService.processIdVerificationResults(
      sessionId,
      idVerification,
      status
    );

    // Log de auditoría
    logSecurityEvent('id_verification_processed', {
      sessionId,
      verificationStatus,
      documentType: document_type,
      documentNumber: document_number?.substring(0, 4) + '****',
      hasWarnings: !!warnings?.length,
      warningCount: warnings?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('webhook', 'Error processing ID verification results', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
}

/**
 * Procesa reviews de verificación
 */
async function processVerificationReviews(
  sessionId: string,
  reviews: DiditWebhookPayload['decision']['reviews']
): Promise<void> {
  try {
    logger.info('webhook', 'Processing verification reviews', {
      sessionId,
      reviewCount: reviews!.length
    });

    // Procesar reviews usando el servicio de webhook
    await diditWebhookService.processVerificationReviews(sessionId, reviews!);

  } catch (error) {
    logger.error('webhook', 'Error processing verification reviews', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
}

/**
 * Handler principal del webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo raw para verificación de firma
    const rawBody = await request.text();
    
    if (!rawBody) {
      logger.warn('webhook', 'Empty webhook body received');
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Obtener headers necesarios
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');
    const userAgent = request.headers.get('user-agent');
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Validar configuración
    if (!WEBHOOK_CONFIG.secretKey) {
      logger.error('webhook', 'Webhook secret key not configured');
      return NextResponse.json(
        { error: 'Webhook configuration incomplete' },
        { status: 500 }
      );
    }

    // Validar headers requeridos
    if (!signature || !timestamp) {
      logger.warn('webhook', 'Missing required headers', {
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
        clientIP,
        userAgent
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
      logger.warn('webhook', 'Invalid webhook signature', {
        clientIP,
        userAgent,
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
      logger.error('webhook', 'Failed to parse webhook JSON', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        rawBody: rawBody.substring(0, 200) + '...' // Log solo los primeros 200 caracteres
      });
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validar payload requerido
    if (!payload.session_id || !payload.status || !payload.webhook_type) {
      logger.warn('webhook', 'Invalid webhook payload structure', {
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
    logger.info('webhook', 'Webhook processed successfully', {
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
    logger.error('webhook', 'Error processing webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

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
    ipWhitelist: WEBHOOK_CONFIG.ipWhitelist,
    platform: 'platform-medicos',
    version: '1.0.0'
  });
}
