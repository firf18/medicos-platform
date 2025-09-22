/**
 * 🧪 DIDIT SESSION TEST SCRIPT
 * 
 * Script para probar la creación y gestión de sesiones de Didit
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o';
const BASE_URL = 'https://verification.didit.me/v2';

/**
 * Prueba crear una sesión de verificación
 */
async function testCreateSession() {
  console.log('🎯 Probando creación de sesión de Didit...\n');

  // Primero necesitamos obtener un workflow_id válido
  // Por ahora usaremos un UUID de ejemplo
  const testWorkflowId = '550e8400-e29b-41d4-a716-446655440000';
  
  const payload = {
    workflow_id: testWorkflowId,
    vendor_data: 'test-doctor-123',
    callback: 'https://platform-medicos.com/api/didit/webhook',
    expected_details: {
      first_name: 'Juan',
      last_name: 'Pérez',
      date_of_birth: '1990-01-15',
      document_number: 'V-12345678'
    }
  };

  try {
    console.log('📤 Enviando solicitud de creación de sesión...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Test/2.0.0'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📥 Respuesta recibida: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sesión creada exitosamente:');
      console.log('Session ID:', data.session_id);
      console.log('Session URL:', data.session_url);
      console.log('Expires At:', data.expires_at);
      
      return {
        success: true,
        sessionId: data.session_id,
        sessionUrl: data.session_url,
        data
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Error creando sesión:');
      console.log('Status:', response.status);
      console.log('Error:', errorData);
      
      return {
        success: false,
        status: response.status,
        error: errorData
      };
    }

  } catch (error) {
    console.log('❌ Excepción creando sesión:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Prueba obtener el estado de una sesión
 */
async function testGetSessionStatus(sessionId: string) {
  console.log(`\n🔍 Probando obtención de estado de sesión: ${sessionId}...\n`);

  try {
    const response = await fetch(`${BASE_URL}/session/${sessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Test/2.0.0'
      }
    });

    console.log(`📥 Respuesta recibida: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Estado de sesión obtenido:');
      console.log('Status:', data.status);
      console.log('Has Decision:', !!data.decision);
      
      if (data.decision) {
        console.log('Decision Details:', JSON.stringify(data.decision, null, 2));
      }
      
      return {
        success: true,
        status: data.status,
        decision: data.decision,
        data
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Error obteniendo estado:');
      console.log('Status:', response.status);
      console.log('Error:', errorData);
      
      return {
        success: false,
        status: response.status,
        error: errorData
      };
    }

  } catch (error) {
    console.log('❌ Excepción obteniendo estado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Prueba nuestro endpoint local
 */
async function testLocalEndpoint() {
  console.log('\n🏠 Probando endpoint local de creación de sesión...\n');

  const payload = {
    workflow_id: '550e8400-e29b-41d4-a716-446655440000',
    vendor_data: 'test-doctor-123',
    callback: 'https://platform-medicos.com/api/didit/webhook',
    expected_details: {
      first_name: 'Juan',
      last_name: 'Pérez',
      date_of_birth: '1990-01-15',
      document_number: 'V-12345678'
    }
  };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/didit/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📥 Respuesta local: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint local funcionando:');
      console.log('Session ID:', data.session_id);
      console.log('Session URL:', data.session_url);
      
      return {
        success: true,
        sessionId: data.session_id,
        data
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Error en endpoint local:');
      console.log('Error:', errorData);
      
      return {
        success: false,
        error: errorData
      };
    }

  } catch (error) {
    console.log('❌ Excepción en endpoint local:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Función principal de prueba
 */
export async function runSessionTests() {
  console.log('🚀 Iniciando pruebas de sesiones de Didit...\n');

  const results = {
    createSession: false,
    getSessionStatus: false,
    localEndpoint: false
  };

  // 1. Probar creación de sesión directa
  const createResult = await testCreateSession();
  results.createSession = createResult.success;

  // 2. Si la creación fue exitosa, probar obtener estado
  if (createResult.success && createResult.sessionId) {
    const statusResult = await testGetSessionStatus(createResult.sessionId);
    results.getSessionStatus = statusResult.success;
  }

  // 3. Probar endpoint local
  const localResult = await testLocalEndpoint();
  results.localEndpoint = localResult.success;

  // Resumen de resultados
  console.log('\n📊 RESUMEN DE PRUEBAS DE SESIONES:');
  console.log('=====================================');
  console.log(`Creación de sesión: ${results.createSession ? '✅' : '❌'}`);
  console.log(`Obtención de estado: ${results.getSessionStatus ? '✅' : '❌'}`);
  console.log(`Endpoint local: ${results.localEndpoint ? '✅' : '❌'}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  console.log(`\n🎯 Tasa de éxito: ${successRate}% (${passedTests}/${totalTests})`);

  if (successRate >= 66) {
    console.log('🎉 ¡Sistema de sesiones de Didit funcionando correctamente!');
  } else if (successRate >= 33) {
    console.log('⚠️ Sistema parcialmente funcional, revisar errores');
  } else {
    console.log('❌ Sistema requiere correcciones antes de producción');
  }

  return {
    results,
    successRate,
    totalTests,
    passedTests
  };
}

/**
 * Handler para endpoint de prueba
 */
export async function GET() {
  try {
    const results = await runSessionTests();
    
    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
      message: 'Pruebas de sesiones de Didit completadas'
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
