/**
 * Didit Callback API - Platform Médicos Elite
 * 
 * Callback de Didit.me para NextAuth.js
 * Maneja los resultados de verificación de identidad
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// Configuración de Didit
const DIDIT_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY || 'iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
  webhookSecret: process.env.DIDIT_WEBHOOK_SECRET || 'NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck',
  baseUrl: process.env.DIDIT_BASE_URL || 'https://api.didit.me'
};

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const body = await request.json();
    const { 
      session_id, 
      status, 
      decision, 
      summary, 
      verification_url,
      expires_at,
      created_at,
      updated_at
    } = body;

    // Validar datos requeridos
    if (!session_id || !status) {
      return NextResponse.json(
        { error: 'Datos de callback incompletos' },
        { status: 400 }
      );
    }

    // Verificar que el callback viene de Didit
    const diditSignature = request.headers.get('x-didit-signature');
    if (!diditSignature) {
      console.warn('Callback sin firma de Didit');
      return NextResponse.json({ error: 'Firma de webhook requerida' }, { status: 401 });
    }

    // Verificar firma del webhook (opcional pero recomendado)
    try {
      const bodyText = await request.text();
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', DIDIT_CONFIG.webhookSecret)
        .update(bodyText)
        .digest('hex')}`;
      
      if (diditSignature !== expectedSignature) {
        console.warn('Firma de webhook inválida');
        return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 401 });
      }
    } catch (error) {
      console.warn('Error verificando firma de webhook:', error);
    }

    // Log de auditoría
    console.log('Callback de Didit recibido:', {
      sessionId: session_id,
      status,
      userId: session.user?.email,
      timestamp: new Date().toISOString(),
      platform: 'platform-medicos'
    });

    // Procesar resultado según el estado
    switch (status) {
      case 'completed':
        await handleCompletedVerification(session_id, decision, summary, session);
        break;
      
      case 'failed':
        await handleFailedVerification(session_id, decision, session);
        break;
      
      case 'expired':
        await handleExpiredVerification(session_id, session);
        break;
      
      case 'cancelled':
        await handleCancelledVerification(session_id, session);
        break;
      
      default:
        console.log(`Estado de verificación no manejado: ${status}`);
    }

    // Retornar confirmación
    return NextResponse.json({
      success: true,
      sessionId: session_id,
      status,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en callback de Didit:', error);
    
    return NextResponse.json(
      { 
        error: 'Error procesando callback',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Manejar verificación completada
async function handleCompletedVerification(
  sessionId: string, 
  decision: any, 
  summary: any, 
  session: any
) {
  try {
    // Aquí puedes guardar los resultados en la base de datos
    // Por ejemplo, actualizar el perfil del usuario con la verificación
    
    console.log('Verificación completada:', {
      sessionId,
      decision,
      summary,
      userId: session.user?.email,
      isFullyVerified: summary?.isFullyVerified || false,
      verificationScore: summary?.verificationScore || 0
    });

    // TODO: Implementar guardado en base de datos
    // await updateUserVerificationStatus(session.user.id, {
    //   sessionId,
    //   status: 'verified',
    //   decision,
    //   summary,
    //   verifiedAt: new Date()
    // });

  } catch (error) {
    console.error('Error manejando verificación completada:', error);
  }
}

// Manejar verificación fallida
async function handleFailedVerification(
  sessionId: string, 
  decision: any, 
  session: any
) {
  try {
    console.log('Verificación fallida:', {
      sessionId,
      decision,
      userId: session.user?.email
    });

    // TODO: Implementar guardado en base de datos
    // await updateUserVerificationStatus(session.user.id, {
    //   sessionId,
    //   status: 'failed',
    //   decision,
    //   failedAt: new Date()
    // });

  } catch (error) {
    console.error('Error manejando verificación fallida:', error);
  }
}

// Manejar verificación expirada
async function handleExpiredVerification(sessionId: string, session: any) {
  try {
    console.log('Verificación expirada:', {
      sessionId,
      userId: session.user?.email
    });

    // TODO: Implementar guardado en base de datos
    // await updateUserVerificationStatus(session.user.id, {
    //   sessionId,
    //   status: 'expired',
    //   expiredAt: new Date()
    // });

  } catch (error) {
    console.error('Error manejando verificación expirada:', error);
  }
}

// Manejar verificación cancelada
async function handleCancelledVerification(sessionId: string, session: any) {
  try {
    console.log('Verificación cancelada:', {
      sessionId,
      userId: session.user?.email
    });

    // TODO: Implementar guardado en base de datos
    // await updateUserVerificationStatus(session.user.id, {
    //   sessionId,
    //   status: 'cancelled',
    //   cancelledAt: new Date()
    // });

  } catch (error) {
    console.error('Error manejando verificación cancelada:', error);
  }
}

// Método GET para verificar configuración
export async function GET() {
  return NextResponse.json({
    configured: !!DIDIT_CONFIG.apiKey,
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback`,
    platform: 'platform-medicos',
    status: 'ready'
  });
}