/**
 * 🔔 WEBHOOK HANDLER PROFESIONAL PARA DIDIT
 * 
 * Maneja los webhooks de Didit de forma robusta y segura
 * Específicamente diseñado para médicos venezolanos en Red-Salud
 * 
 * @version 2.0.0
 * @author Red-Salud Platform Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getDiditInstance, DiditWebhook, extractVerificationSummary } from '@/lib/didit-integration';
import { createAdminClient } from '@/lib/supabase/admin';

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

const WEBHOOK_CONFIG = {
  secret: process.env.DIDIT_WEBHOOK_SECRET_KEY!,
  maxBodySize: 1024 * 1024, // 1MB
  timeoutMs: 30000, // 30 segundos
  retryAttempts: 3
};

// Validar configuración al cargar
if (!WEBHOOK_CONFIG.secret) {
  throw new Error('❌ DIDIT_WEBHOOK_SECRET_KEY es requerida');
}

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface WebhookLogEntry {
  timestamp: string;
  event: string;
  session_id?: string;
  status?: string;
  vendor_data?: string;
  success: boolean;
  error?: string;
  processing_time_ms: number;
  ip_address?: string;
  user_agent?: string;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Crea un log estructurado del webhook
 */
function createWebhookLog(
  event: string,
  data: Partial<WebhookLogEntry>,
  request?: NextRequest
): WebhookLogEntry {
  return {
    timestamp: new Date().toISOString(),
    event,
    success: data.success ?? false,
    processing_time_ms: data.processing_time_ms ?? 0,
    ip_address: request?.ip || request?.headers.get('x-forwarded-for') || 'unknown',
    user_agent: request?.headers.get('user-agent') || 'unknown',
    ...data
  };
}

/**
 * Log estructurado para webhooks
 */
function logWebhookEvent(logEntry: WebhookLogEntry): void {
  const logLevel = logEntry.success ? 'INFO' : 'ERROR';
  const emoji = logEntry.success ? '✅' : '❌';
  
  console.log(`${emoji} [WEBHOOK-${logLevel}] ${logEntry.event}:`, JSON.stringify(logEntry, null, 2));
}

/**
 * Valida el tamaño del payload
 */
function validatePayloadSize(body: string): boolean {
  return Buffer.byteLength(body, 'utf8') <= WEBHOOK_CONFIG.maxBodySize;
}

/**
 * Busca el registro del médico por session_id (verification_session_id)
 */
async function findRegistrationBySession(sessionId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('doctor_registrations')
    .select(`id, user_id, first_name, last_name, email, license_number, specialty_id, verification_status, verification_session_id`)
    .eq('verification_session_id', sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error buscando registro por sesión: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Registro médico no encontrado para session_id: ${sessionId}`);
  }

  return data as {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    license_number: string;
    specialty_id: string | null;
    verification_status: string | null;
    verification_session_id: string | null;
  };
}

/**
 * Registra la verificación usando función segura (RPC)
 */
async function applyVerificationUpdate(sessionId: string, webhookData: DiditWebhook) {
  const admin = createAdminClient();
  const { error } = await admin.rpc('record_didit_verification', {
    p_session_id: sessionId,
    p_status: webhookData.status,
    p_decision: webhookData.decision ?? {},
  });
  if (error) {
    throw new Error(`Error registrando verificación: ${error.message}`);
  }
}

/**
 * Envía notificación al médico sobre el resultado
 */
async function notifyDoctorOfResult(
  doctorData: { id: string; user_id: string; first_name: string; last_name: string; verification_session_id: string | null },
  status: string,
  verificationSummary: ReturnType<typeof extractVerificationSummary>
) {
  const admin = createAdminClient();
  
  let notificationTitle = '';
  let notificationMessage = '';
  let notificationType = 'info';

  switch (status) {
    case 'Approved':
      if (verificationSummary.isFullyVerified) {
        notificationTitle = '🎉 Verificación Exitosa';
        notificationMessage = `¡Felicidades Dr. ${doctorData.first_name} ${doctorData.last_name}! Tu identidad ha sido verificada exitosamente. Ya puedes acceder a todas las funciones de la plataforma.`;
        notificationType = 'success';
      } else {
        notificationTitle = '⚠️ Verificación Parcial';
        notificationMessage = `Dr. ${doctorData.first_name} ${doctorData.last_name}, tu verificación ha sido aprobada pero requiere revisión adicional. Te contactaremos pronto.`;
        notificationType = 'warning';
      }
      break;
      
    case 'Declined':
      notificationTitle = '❌ Verificación Rechazada';
      notificationMessage = `Dr. ${doctorData.first_name} ${doctorData.last_name}, tu verificación no pudo ser completada. Por favor, contacta a soporte para más información.`;
      notificationType = 'error';
      break;
      
    case 'In Review':
      notificationTitle = '🔍 Verificación en Revisión';
      notificationMessage = `Dr. ${doctorData.first_name} ${doctorData.last_name}, tu verificación está siendo revisada manualmente. Te notificaremos cuando esté lista.`;
      notificationType = 'info';
      break;
  }

  // Intentar usar la función segura para notificaciones
  const { error: rpcError } = await (admin as any).rpc('create_doctor_notification', {
    p_user_id: doctorData.user_id,
    p_title: notificationTitle,
    p_message: notificationMessage,
    p_type: notificationType,
    p_related_entity_type: 'doctor_registration',
    p_related_entity_id: doctorData.id,
  });

  if (rpcError) {
    console.warn('⚠️ Error creando notificación vía RPC, fallback a insert directo:', rpcError);
    try {
      await (admin as any)
        .from('notifications')
        .insert({
          user_id: doctorData.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          category: 'verification',
          metadata: {
            session_id: doctorData.verification_session_id,
            verification_score: verificationSummary.verificationScore,
            completed_checks: verificationSummary.completedChecks,
            failed_checks: verificationSummary.failedChecks
          },
          created_at: new Date().toISOString()
        });
    } catch (e) {
      console.warn('⚠️ Fallback de notificación falló:', e);
    }
  }
}

// ============================================================================
// HANDLERS PRINCIPALES
// ============================================================================

/**
 * Maneja los webhooks POST de Didit
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let logEntry: Partial<WebhookLogEntry> = {};

  try {
    // Obtener headers
    const headersList = await headers();
    const signature = headersList.get('x-signature');
    const timestamp = headersList.get('x-timestamp');
    const contentType = headersList.get('content-type');

    logEntry = {
      event: 'webhook_received',
      success: false
    };

    // Validar headers requeridos
    if (!signature || !timestamp) {
      const missingHeaders = [];
      if (!signature) missingHeaders.push('X-Signature');
      if (!timestamp) missingHeaders.push('X-Timestamp');
      
      logEntry.error = `Headers faltantes: ${missingHeaders.join(', ')}`;
      logWebhookEvent(createWebhookLog('webhook_validation_failed', logEntry, request));
      
      return NextResponse.json(
        { 
          error: 'Headers de webhook requeridos',
          missing: missingHeaders,
          received_headers: Object.fromEntries(headersList.entries())
        },
        { status: 401 }
      );
    }

    // Validar content-type
    if (contentType !== 'application/json') {
      logEntry.error = `Content-Type inválido: ${contentType}`;
      logWebhookEvent(createWebhookLog('webhook_validation_failed', logEntry, request));
      
      return NextResponse.json(
        { error: 'Content-Type debe ser application/json' },
        { status: 400 }
      );
    }

    // Obtener el cuerpo raw del request
    const rawBody = await request.text();
    
    // Validar tamaño del payload
    if (!validatePayloadSize(rawBody)) {
      logEntry.error = `Payload demasiado grande: ${Buffer.byteLength(rawBody, 'utf8')} bytes`;
      logWebhookEvent(createWebhookLog('webhook_validation_failed', logEntry, request));
      
      return NextResponse.json(
        { error: 'Payload demasiado grande' },
        { status: 413 }
      );
    }

    // Verificar firma del webhook usando la integración de Didit
    const didit = getDiditInstance();
    if (!didit.verifyWebhookSignature(rawBody, signature, timestamp)) {
      logEntry.error = 'Firma de webhook inválida o timestamp expirado';
      logWebhookEvent(createWebhookLog('webhook_signature_failed', logEntry, request));
      
      return NextResponse.json(
        { error: 'Firma de webhook inválida' },
        { status: 401 }
      );
    }

    // Procesar webhook usando la integración de Didit
    const webhookData = await didit.processWebhook(rawBody, signature, timestamp);
    
    logEntry.session_id = webhookData.session_id;
    logEntry.status = webhookData.status;
    logEntry.vendor_data = webhookData.vendor_data;

    // Registrar actualización (idempotente) en la base de datos
    await applyVerificationUpdate(webhookData.session_id, webhookData);

    // Intentar obtener registro enlazado por session_id para notificación
    let doctorRegistration: any = null;
    try {
      doctorRegistration = await findRegistrationBySession(webhookData.session_id);
    } catch (_) {
      // Puede no existir aún (sesión creada fuera del flujo de registro)
    }

    // Notificar al médico si hay decisión y registro enlazado
    if (webhookData.decision && doctorRegistration) {
      const verificationSummary = extractVerificationSummary(webhookData.decision);
      await notifyDoctorOfResult(doctorRegistration, webhookData.status, verificationSummary);
    }

    logEntry.success = true;
    logEntry.processing_time_ms = Date.now() - startTime;
    
    logWebhookEvent(createWebhookLog('webhook_processed_successfully', logEntry, request));

    return NextResponse.json({
      success: true,
      sessionId: webhookData.session_id,
      status: webhookData.status,
      doctorId: doctorRegistration?.id || null,
      message: 'Webhook procesado exitosamente',
      processingTimeMs: logEntry.processing_time_ms
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    logEntry.success = false;
    logEntry.error = errorMessage;
    logEntry.processing_time_ms = Date.now() - startTime;
    
    logWebhookEvent(createWebhookLog('webhook_processing_error', logEntry, request));
    
    return NextResponse.json(
      { 
        error: 'Error procesando webhook',
        details: errorMessage,
        sessionId: logEntry.session_id,
        processingTimeMs: logEntry.processing_time_ms
      },
      { status: 500 }
    );
  }
}

/**
 * Maneja las solicitudes GET (para verificación de webhook)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Health check de la integración Didit
    const didit = getDiditInstance();
    const healthCheck = await didit.healthCheck();
    
    const response = {
      service: 'Red-Salud Didit Webhook Handler',
      version: '2.0.0',
      status: 'active',
      timestamp: new Date().toISOString(),
      didit_integration: healthCheck,
      config: {
        webhook_secret_configured: !!WEBHOOK_CONFIG.secret,
        max_body_size_mb: WEBHOOK_CONFIG.maxBodySize / (1024 * 1024),
        timeout_ms: WEBHOOK_CONFIG.timeoutMs
      },
      processing_time_ms: Date.now() - startTime
    };

    logWebhookEvent(createWebhookLog('webhook_health_check', {
      success: true,
      processing_time_ms: response.processing_time_ms
    }, request));

    return NextResponse.json(response);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    logWebhookEvent(createWebhookLog('webhook_health_check_failed', {
      success: false,
      error: errorMessage,
      processing_time_ms: Date.now() - startTime
    }, request));

    return NextResponse.json(
      {
        service: 'Red-Salud Didit Webhook Handler',
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Maneja otros métodos HTTP no soportados
 */
export async function OPTIONS() {
  return NextResponse.json(
    { message: 'Método no soportado' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET, POST'
      }
    }
  );
}
