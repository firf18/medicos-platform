/**
 * 🔄 CALLBACK HANDLER PARA DIDIT
 * 
 * Maneja la redirección del usuario después de completar
 * la verificación de identidad en Didit. No confiere autoridad,
 * el estado definitivo lo establece el webhook + RPC seguro.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDiditInstance, extractVerificationSummary } from '@/lib/didit-integration';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    // Parámetros compatibles: session_id | session | session_token
    const { searchParams } = new URL(request.url);
    const sessionId =
      searchParams.get('session_id') ||
      searchParams.get('session') ||
      searchParams.get('session_token');

    if (!sessionId) {
      return NextResponse.redirect(
        new URL('/auth/register/doctor/verify?status=failed&message=missing_session_id', request.url)
      );
    }

    // Obtener resultados actuales desde Didit (para UX inmediata)
    const didit = getDiditInstance();
    const decision = await didit.getVerificationResults(sessionId);
    const summary = extractVerificationSummary(decision);

    // Registrar en BD vía función segura (idempotente). No bloquear el flujo si falla.
    try {
      const admin = createAdminClient();
      await admin.rpc('record_didit_verification', {
        p_session_id: sessionId,
        p_status: decision.status,
        p_decision: decision
      });
    } catch (e) {
      console.warn('⚠️ No se pudo registrar la verificación desde callback, continuará el webhook:', e);
    }

    // Determinar redirección amigable (el estado final lo fija el webhook)
    let redirectPath = '/auth/register/doctor/verify?status=pending';
    if (decision.status === 'Approved' && summary.isFullyVerified) {
      redirectPath = '/auth/register/doctor/success';
    } else if (decision.status === 'Declined') {
      redirectPath = '/auth/register/doctor/verify?status=failed&message=verification_declined';
    } else if (decision.status === 'In Review') {
      redirectPath = '/auth/register/doctor/verify?status=in_review';
    }

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error('❌ Error en callback Didit:', error);
    return NextResponse.redirect(
      new URL('/auth/register/doctor/verify?status=failed&message=internal_error', request.url)
    );
  }
}
