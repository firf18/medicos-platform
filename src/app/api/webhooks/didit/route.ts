/**
 * 🔐 DIDIT WEBHOOK HANDLER - VERIFICACIÓN DE IDENTIDAD MÉDICA
 * 
 * Maneja las notificaciones webhook de Didit para actualizar el estado
 * de verificación de identidad de los médicos registrados.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDiditInstance, logDiditEvent } from '@/lib/didit-integration';
import { createClient } from '@/lib/supabase/client';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Obtener headers para verificar la firma
    const headersList = headers();
    const signature = headersList.get('x-didit-signature');
    const body = await request.json();

    if (!signature) {
      logDiditEvent('webhook_signature_missing', { body });
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Procesar webhook con Didit
    const didit = getDiditInstance();
    const webhookResult = await didit.processWebhook(body, signature);

    logDiditEvent('webhook_processed', {
      sessionId: webhookResult.sessionId,
      status: webhookResult.status
    });

    // Actualizar estado en la base de datos
    const supabase = createClient();
    
    // Buscar el registro de médico por sessionId
    const { data: doctorRegistration, error: findError } = await supabase
      .from('doctor_registrations')
      .select('*')
      .eq('identity_verification->>verificationId', webhookResult.sessionId)
      .single();

    if (findError || !doctorRegistration) {
      logDiditEvent('webhook_doctor_not_found', {
        sessionId: webhookResult.sessionId,
        error: findError?.message
      });
      return NextResponse.json(
        { error: 'Doctor registration not found' },
        { status: 404 }
      );
    }

    // Actualizar el estado de verificación
    const { error: updateError } = await supabase
      .from('doctor_registrations')
      .update({
        identity_verification: {
          ...doctorRegistration.identity_verification,
          status: webhookResult.status,
          results: webhookResult.results,
          updatedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', doctorRegistration.id);

    if (updateError) {
      logDiditEvent('webhook_update_failed', {
        sessionId: webhookResult.sessionId,
        error: updateError.message
      });
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      );
    }

    // Si la verificación fue exitosa, activar la cuenta del médico
    if (webhookResult.status === 'completed') {
      const validation = didit.validateDoctorVerification({
        sessionId: webhookResult.sessionId,
        status: webhookResult.status,
        results: webhookResult.results,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      if (validation.isValid) {
        // Activar la cuenta del médico
        const { error: activateError } = await supabase
          .from('doctor_registrations')
          .update({
            verification_status: 'verified',
            is_active: true,
            activated_at: new Date().toISOString()
          })
          .eq('id', doctorRegistration.id);

        if (activateError) {
          logDiditEvent('webhook_activation_failed', {
            sessionId: webhookResult.sessionId,
            error: activateError.message
          });
        } else {
          logDiditEvent('webhook_doctor_activated', {
            sessionId: webhookResult.sessionId,
            doctorId: doctorRegistration.id
          });
        }
      } else {
        logDiditEvent('webhook_verification_invalid', {
          sessionId: webhookResult.sessionId,
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      sessionId: webhookResult.sessionId,
      status: webhookResult.status
    });

  } catch (error) {
    console.error('Error processing Didit webhook:', error);
    
    logDiditEvent('webhook_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      body: await request.json().catch(() => null)
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}