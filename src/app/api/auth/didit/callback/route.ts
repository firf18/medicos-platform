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
      timestamp: new Date().toISOString(),
      platform: 'platform-medicos'
    });

    // Procesar resultado según el estado
    switch (status) {
      case 'completed':
        await handleCompletedVerification(session_id, decision, summary);
        break;
      
      case 'failed':
        await handleFailedVerification(session_id, decision);
        break;
      
      case 'expired':
        await handleExpiredVerification(session_id);
        break;
      
      case 'cancelled':
        await handleCancelledVerification(session_id);
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
  summary: any
) {
  try {
    // Aquí puedes guardar los resultados en la base de datos
    // Por ejemplo, actualizar el perfil del usuario con la verificación
    
    console.log('Verificación completada:', {
      sessionId,
      decision,
      summary,
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
  decision: any
) {
  try {
    console.log('Verificación fallida:', {
      sessionId,
      decision
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
async function handleExpiredVerification(sessionId: string) {
  try {
    console.log('Verificación expirada:', {
      sessionId
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
async function handleCancelledVerification(sessionId: string) {
  try {
    console.log('Verificación cancelada:', {
      sessionId
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

// Método GET para manejar callbacks de Didit (URL con parámetros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('verificationSessionId');
    const status = searchParams.get('status');
    
    console.log('🔔 Callback GET recibido de Didit:', {
      sessionId,
      status,
      timestamp: new Date().toISOString(),
      url: request.url
    });

    // Validar parámetros requeridos
    if (!sessionId || !status) {
      console.warn('❌ Callback GET sin parámetros requeridos:', { sessionId, status });
      return NextResponse.json(
        { error: 'Parámetros de callback incompletos' },
        { status: 400 }
      );
    }

    // Procesar resultado según el estado
    switch (status) {
      case 'Approved':
        await handleCompletedVerification(sessionId, null, null);
        break;
      
      case 'Declined':
        await handleFailedVerification(sessionId, null);
        break;
      
      case 'In Review':
        await handleInReviewVerification(sessionId);
        break;
      
      case 'Abandoned':
        await handleCancelledVerification(sessionId);
        break;
      
      default:
        console.log(`Estado de verificación no manejado: ${status}`);
    }

    // Retornar página HTML simple para mostrar al usuario
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verificación Completada</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0; padding: 0; height: 100vh;
              display: flex; align-items: center; justify-content: center;
            }
            .container {
              background: white; border-radius: 12px; padding: 2rem;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center; max-width: 400px; width: 90%;
            }
            .success { color: #10b981; }
            .review { color: #f59e0b; }
            .error { color: #ef4444; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
            p { margin: 0; color: #6b7280; }
            .close-btn {
              background: #3b82f6; color: white; border: none;
              padding: 0.75rem 1.5rem; border-radius: 6px;
              margin-top: 1rem; cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${status === 'Approved' ? `
              <div class="icon success">✅</div>
              <h1 class="success">¡Verificación Exitosa!</h1>
              <p>Tu identidad ha sido verificada correctamente. Puedes cerrar esta ventana y continuar con tu registro.</p>
            ` : status === 'In Review' ? `
              <div class="icon review">⏳</div>
              <h1 class="review">Verificación en Revisión</h1>
              <p>Tu verificación está siendo revisada. Tendrás acceso limitado hasta que se complete. Puedes cerrar esta ventana.</p>
            ` : status === 'Declined' ? `
              <div class="icon error">❌</div>
              <h1 class="error">Verificación Rechazada</h1>
              <p>Tu verificación fue rechazada. Contacta a soporte para más información.</p>
            ` : `
              <div class="icon">ℹ️</div>
              <h1>Verificación Procesada</h1>
              <p>Estado: ${status}. Puedes cerrar esta ventana.</p>
            `}
            <button class="close-btn" onclick="window.close()">Cerrar Ventana</button>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('❌ Error en callback GET:', error);
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error de Verificación</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #fef2f2; margin: 0; padding: 2rem;
              display: flex; align-items: center; justify-content: center; min-height: 100vh;
            }
            .container {
              background: white; border-radius: 8px; padding: 2rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              text-align: center; max-width: 400px;
            }
            .error { color: #ef4444; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon error">❌</div>
            <h1 class="error">Error de Verificación</h1>
            <p>Hubo un problema procesando tu verificación. Intenta nuevamente.</p>
            <button onclick="window.close()" style="background: #ef4444; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; margin-top: 1rem; cursor: pointer;">Cerrar Ventana</button>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

// Función para manejar verificación en revisión
async function handleInReviewVerification(sessionId: string) {
  try {
    console.log('Verificación en revisión:', {
      sessionId,
      timestamp: new Date().toISOString()
    });

    // TODO: Implementar guardado en base de datos para estado "in_review"
    // await updateUserVerificationStatus(sessionId, {
    //   status: 'in_review',
    //   reviewedAt: new Date()
    // });

  } catch (error) {
    console.error('Error manejando verificación en revisión:', error);
  }
}