/**
 * 🔧 DIDIT WEBHOOK HANDLER - Platform Médicos Elite
 * 
 * Manejo seguro de webhooks de Didit.me con verificación HMAC
 * Basado en documentación oficial con validación de firma y timestamp
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { DIDIT_DOCTOR_CONFIG, DiditWebhookPayload } from './config';
import { DiditApiClient } from './client';

/**
 * Verificar firma del webhook según documentación oficial
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secretKey: string
): boolean {
  try {
    // Validar timestamp (máximo 5 minutos de diferencia)
    const currentTime = Math.floor(Date.now() / 1000);
    const incomingTime = parseInt(timestamp, 10);
    
    if (Math.abs(currentTime - incomingTime) > 300) {
      console.warn('Webhook timestamp is stale:', { currentTime, incomingTime });
      return false;
    }

    // Generar HMAC SHA256
    const hmac = crypto.createHmac('sha256', secretKey);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    // Comparación segura contra timing attacks
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedSignatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedSignatureBuffer.length !== providedSignatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Procesar payload del webhook
 */
async function processWebhookPayload(payload: DiditWebhookPayload): Promise<void> {
  const { session_id, status, webhook_type, vendor_data, decision } = payload;

  console.log(`Processing webhook: ${webhook_type} for session ${session_id} with status ${status}`);

  try {
    // Aquí puedes agregar lógica específica para tu aplicación
    // Por ejemplo, actualizar base de datos, enviar notificaciones, etc.
    
    if (status === 'Approved') {
      console.log(`Doctor ${vendor_data} approved for session ${session_id}`);
      // TODO: Actualizar estado del doctor en tu base de datos
      // TODO: Enviar notificación de aprobación
    } else if (status === 'Declined') {
      console.log(`Doctor ${vendor_data} declined for session ${session_id}`);
      // TODO: Actualizar estado del doctor en tu base de datos
      // TODO: Enviar notificación de rechazo
    } else if (status === 'In Review') {
      console.log(`Doctor ${vendor_data} under review for session ${session_id}`);
      // TODO: Notificar que está en revisión manual
    }

    // Log detallado para debugging
    if (decision) {
      console.log('Decision details:', {
        session_id: decision.session_id,
        id_verification: decision.id_verification?.status,
        liveness: decision.liveness?.status,
        face_match: decision.face_match?.status,
        aml: decision.aml?.status,
        ip_analysis: decision.ip_analysis?.status
      });
    }

  } catch (error) {
    console.error('Error processing webhook payload:', error);
    throw error;
  }
}

/**
 * Handler principal del webhook
 */
export async function handleDiditWebhook(request: NextRequest): Promise<NextResponse> {
  try {
    // Obtener el cuerpo raw del request
    const rawBody = await request.text();
    
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Obtener headers requeridos
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');
    const secretKey = DIDIT_DOCTOR_CONFIG.webhookSecret;

    // Validar headers requeridos
    if (!signature || !timestamp || !secretKey) {
      console.warn('Missing required webhook headers:', { 
        hasSignature: !!signature, 
        hasTimestamp: !!timestamp, 
        hasSecret: !!secretKey 
      });
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 401 }
      );
    }

    // Verificar firma del webhook
    if (!verifyWebhookSignature(rawBody, signature, timestamp, secretKey)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parsear JSON del payload
    let payload: DiditWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Invalid JSON in webhook payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validar estructura del payload
    if (!payload.session_id || !payload.status || !payload.webhook_type) {
      console.warn('Invalid webhook payload structure:', payload);
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // Procesar el webhook
    await processWebhookPayload(payload);

    // Responder con éxito
    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      session_id: payload.session_id,
      status: payload.status
    });

  } catch (error) {
    console.error('Error handling webhook:', error);
    
    // En caso de error, devolver 500 para que Didit reintente
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Middleware para logging de webhooks
 */
export function logWebhookRequest(request: NextRequest, payload?: any): void {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'Unknown';
  
  console.log('Webhook received:', {
    timestamp: new Date().toISOString(),
    userAgent,
    ip,
    payload: payload ? {
      session_id: payload.session_id,
      status: payload.status,
      webhook_type: payload.webhook_type
    } : 'Not parsed yet'
  });
}
