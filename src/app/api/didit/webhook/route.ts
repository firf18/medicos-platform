/**
 * 🔧 DIDIT WEBHOOK ENDPOINT - Platform Médicos Elite
 * 
 * Endpoint seguro para recibir webhooks de Didit.me
 * Con verificación HMAC y manejo robusto de errores
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleDiditWebhook, logWebhookRequest } from '@/lib/didit/webhook';

/**
 * POST endpoint para recibir webhooks de Didit
 */
export async function POST(request: NextRequest) {
  // Log del request recibido
  logWebhookRequest(request);
  
  // Delegar al handler principal
  return handleDiditWebhook(request);
}

/**
 * GET endpoint para verificar que el webhook está funcionando
 */
export async function GET() {
  return NextResponse.json({
    message: 'Didit webhook endpoint is active',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
}

/**
 * OPTIONS endpoint para CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-signature, x-timestamp',
    },
  });
}