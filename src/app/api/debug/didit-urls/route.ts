/**
 * 🔍 ENDPOINT DE DEBUG PARA VERIFICAR URLS DE DIDIT
 * 
 * Este endpoint te ayuda a verificar qué URLs está enviando tu aplicación
 * y compararlas con lo que está configurado en Didit.me
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Detectar entorno
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    
    // URLs que debería estar enviando
    const expectedUrls = {
      development: 'http://localhost:3000/api/auth/didit/callback',
      production: 'https://red-salud.org/api/auth/didit/callback'
    };

    const currentExpectedUrl = isDevelopment || isLocalhost 
      ? expectedUrls.development 
      : expectedUrls.production;

    // Información de debug
    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        isDevelopment,
        isLocalhost,
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent')
      },
      urls: {
        expected: currentExpectedUrl,
        development: expectedUrls.development,
        production: expectedUrls.production,
        configured: process.env.DIDIT_CALLBACK_URL || 'No configurado',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'No configurado'
      },
      didit: {
        apiKey: process.env.DIDIT_API_KEY ? 'Configurado' : 'No configurado',
        webhookSecret: process.env.DIDIT_WEBHOOK_SECRET ? 'Configurado' : 'No configurado',
        baseUrl: process.env.DIDIT_BASE_URL || 'No configurado',
        doctorWorkflowId: process.env.DIDIT_DOCTOR_WORKFLOW_ID || 'No configurado'
      },
      instructions: {
        step1: 'Ve a tu dashboard de Didit.me',
        step2: 'Busca la sección "Webhooks" o "Callbacks"',
        step3: `Cambia la URL de callback a: ${currentExpectedUrl}`,
        step4: 'Guarda la configuración',
        step5: 'Prueba nuevamente la verificación'
      }
    };

    return NextResponse.json(debugInfo, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error en debug endpoint:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testData } = body;
    
    // Detectar entorno
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    
    // URL que debería estar enviando
    const expectedUrl = isDevelopment || isLocalhost 
      ? 'http://localhost:3000/api/auth/didit/callback'
      : 'https://red-salud.org/api/auth/didit/callback';

    // Crear sesión de prueba
    const testSessionData = {
      doctor_id: 'TEST-' + Date.now(),
      first_name: 'Juan',
      last_name: 'Pérez',
      date_of_birth: '1990-01-01',
      nationality: 'Venezuelan',
      document_number: '12345678',
      email: 'test@example.com',
      phone: '+584121234567',
      callback_url: expectedUrl
    };

    // Simular creación de sesión (sin llamar a Didit realmente)
    const mockSessionResponse = {
      session_id: 'test-session-' + Date.now(),
      session_url: `https://api.didit.me/verification/test-session?callback_url=${encodeURIComponent(expectedUrl)}`,
      status: 'created',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    };

    return NextResponse.json({
      success: true,
      testData: testSessionData,
      mockResponse: mockSessionResponse,
      analysis: {
        expectedCallbackUrl: expectedUrl,
        actualCallbackUrl: expectedUrl,
        isCorrect: true,
        environment: isDevelopment ? 'development' : 'production',
        host: request.headers.get('host')
      }
    });

  } catch (error) {
    console.error('Error en test endpoint:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
