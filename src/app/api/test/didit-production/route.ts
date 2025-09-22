/**
 * 🎯 DIDIT PRODUCTION TEST SCRIPT
 * 
 * Script final para probar la integración completa de Didit en producción
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o';
const WORKFLOW_ID = '3176221b-c77c-4fea-b2b3-da185ef18122';
const BASE_URL = 'https://verification.didit.me/v2';

/**
 * Prueba completa de la integración de Didit
 */
export async function runProductionTest() {
  console.log('🚀 Iniciando prueba de producción de Didit...\n');

  const testDoctor = {
    doctor_id: 'test-doctor-' + Date.now(),
    first_name: 'Juan',
    last_name: 'Pérez',
    date_of_birth: '1990-01-15',
    nationality: 'VE',
    document_number: 'V-12345678',
    email: 'juan.perez@example.com',
    phone: '+584121234567'
  };

  console.log('👨‍⚕️ Datos del doctor de prueba:', testDoctor);

  // 1. Crear sesión de verificación
  console.log('\n📝 Paso 1: Creando sesión de verificación...');
  
  const sessionPayload = {
    workflow_id: WORKFLOW_ID,
    vendor_data: testDoctor.doctor_id,
    callback: 'https://platform-medicos.com/api/didit/webhook',
    expected_details: {
      first_name: testDoctor.first_name,
      last_name: testDoctor.last_name,
      date_of_birth: testDoctor.date_of_birth,
      document_number: testDoctor.document_number
    },
    contact_details: {
      email: testDoctor.email,
      phone: testDoctor.phone
    }
  };

  try {
    const sessionResponse = await fetch(`${BASE_URL}/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Production-Test/2.0.0'
      },
      body: JSON.stringify(sessionPayload)
    });

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json().catch(() => ({}));
      console.log('❌ Error creando sesión:', errorData);
      return { success: false, error: 'Failed to create session', details: errorData };
    }

    const sessionData = await sessionResponse.json();
    console.log('✅ Sesión creada exitosamente:');
    console.log('   Session ID:', sessionData.session_id);
    console.log('   Session URL:', sessionData.session_url);
    console.log('   Features:', sessionData.features);
    console.log('   Status:', sessionData.status);

    // 2. Verificar estado inicial
    console.log('\n🔍 Paso 2: Verificando estado inicial...');
    
    const statusResponse = await fetch(`${BASE_URL}/session/${sessionData.session_id}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Production-Test/2.0.0'
      }
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json().catch(() => ({}));
      console.log('❌ Error obteniendo estado:', errorData);
      return { success: false, error: 'Failed to get status', details: errorData };
    }

    const statusData = await statusResponse.json();
    console.log('✅ Estado obtenido exitosamente:');
    console.log('   Status:', statusData.status);
    console.log('   Features:', statusData.features);
    console.log('   Expected Details:', statusData.expected_details);

    // 3. Probar endpoint local
    console.log('\n🏠 Paso 3: Probando endpoint local...');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const localResponse = await fetch(`${baseUrl}/api/didit/doctor-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDoctor)
    });

    if (!localResponse.ok) {
      const errorData = await localResponse.json().catch(() => ({}));
      console.log('❌ Error en endpoint local:', errorData);
      return { success: false, error: 'Local endpoint failed', details: errorData };
    }

    const localData = await localResponse.json();
    console.log('✅ Endpoint local funcionando:');
    console.log('   Session ID:', localData.session_id);
    console.log('   Session URL:', localData.session_url);
    console.log('   Features:', localData.features);

    // 4. Probar obtención de estado local
    console.log('\n📊 Paso 4: Probando obtención de estado local...');
    
    const localStatusResponse = await fetch(`${baseUrl}/api/didit/doctor-verification?session_id=${localData.session_id}`);
    
    if (!localStatusResponse.ok) {
      const errorData = await localStatusResponse.json().catch(() => ({}));
      console.log('❌ Error obteniendo estado local:', errorData);
      return { success: false, error: 'Local status endpoint failed', details: errorData };
    }

    const localStatusData = await localStatusResponse.json();
    console.log('✅ Estado local obtenido:');
    console.log('   Overall Status:', localStatusData.overall_status);
    console.log('   Progress:', localStatusData.progress.percentage + '%');
    console.log('   Completed Features:', localStatusData.progress.completed_features);

    // Resumen final
    console.log('\n🎉 RESUMEN DE PRUEBA DE PRODUCCIÓN:');
    console.log('=====================================');
    console.log('✅ Creación de sesión directa: OK');
    console.log('✅ Obtención de estado directa: OK');
    console.log('✅ Endpoint local de creación: OK');
    console.log('✅ Endpoint local de estado: OK');
    console.log('✅ Workflow ID válido: OK');
    console.log('✅ API Key válida: OK');
    console.log('✅ Características disponibles:', statusData.features.join(', '));

    return {
      success: true,
      sessionId: sessionData.session_id,
      sessionUrl: sessionData.session_url,
      features: statusData.features,
      localSessionId: localData.session_id,
      message: 'Integración de Didit lista para producción'
    };

  } catch (error) {
    console.log('❌ Error en prueba de producción:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handler para endpoint de prueba de producción
 */
export async function GET() {
  try {
    const results = await runProductionTest();
    
    return NextResponse.json({
      success: results.success,
      ...results,
      timestamp: new Date().toISOString(),
      message: results.success ? 'Prueba de producción exitosa' : 'Prueba de producción falló'
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
