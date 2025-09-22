/**
 * 🔍 DIDIT API KEY VALIDATION SCRIPT
 * 
 * Script específico para validar la API key de Didit
 * y determinar qué endpoints están disponibles
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o';
const BASE_URL = 'https://api.didit.me';

/**
 * Prueba diferentes endpoints de Didit para validar la API key
 */
async function validateDiditApiKey() {
  console.log('🔑 Validando API key de Didit...\n');
  
  const endpoints = [
    { path: '/v1/account', method: 'GET', description: 'Account Info (v1)' },
    { path: '/v2/health', method: 'GET', description: 'Health Check (v2)' },
    { path: '/v2/account', method: 'GET', description: 'Account Info (v2)' },
    { path: '/v1/workflows', method: 'GET', description: 'Workflows (v1)' },
    { path: '/v2/workflows', method: 'GET', description: 'Workflows (v2)' },
    { path: '/v1/sessions', method: 'GET', description: 'Sessions (v1)' },
    { path: '/v2/sessions', method: 'GET', description: 'Sessions (v2)' }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Probando ${endpoint.description}...`);
      
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Platform-Medicos-Validation/2.0.0'
        }
      });

      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      if (response.ok) {
        try {
          const data = await response.json();
          result.data = data;
          console.log(`✅ ${endpoint.description}: OK (${response.status})`);
        } catch (parseError) {
          console.log(`✅ ${endpoint.description}: OK (${response.status}) - No JSON response`);
        }
      } else {
        try {
          const errorData = await response.json();
          result.error = errorData;
          console.log(`❌ ${endpoint.description}: ERROR ${response.status} - ${errorData.detail || response.statusText}`);
        } catch (parseError) {
          console.log(`❌ ${endpoint.description}: ERROR ${response.status} - ${response.statusText}`);
        }
      }

      results.push(result);

    } catch (error) {
      console.log(`❌ ${endpoint.description}: EXCEPTION - ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: 0,
        statusText: 'Network Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Prueba crear una sesión de verificación básica
 */
async function testBasicVerificationCreation() {
  console.log('\n🧪 Probando creación de sesión de verificación básica...\n');

  const testPayloads = [
    {
      name: 'ID Verification (v2)',
      url: `${BASE_URL}/v2/id-verification/`,
      payload: {
        document_type: 'national_id',
        document_country: 'VE',
        document_number: 'V-12345678',
        vendor_data: 'test-doctor-123'
      }
    },
    {
      name: 'ID Verification (v1)',
      url: `${BASE_URL}/v1/id-verification/`,
      payload: {
        document_type: 'national_id',
        document_country: 'VE',
        document_number: 'V-12345678',
        vendor_data: 'test-doctor-123'
      }
    },
    {
      name: 'Workflow Creation (v1)',
      url: `${BASE_URL}/v1/workflows/`,
      payload: {
        name: 'Test Workflow',
        features: ['id_verification'],
        callback: 'https://example.com/callback'
      }
    }
  ];

  const results = [];

  for (const test of testPayloads) {
    try {
      console.log(`🔍 Probando ${test.name}...`);
      
      const response = await fetch(test.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Platform-Medicos-Validation/2.0.0'
        },
        body: JSON.stringify(test.payload)
      });

      const result = {
        name: test.name,
        url: test.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };

      if (response.ok) {
        try {
          const data = await response.json();
          result.data = data;
          console.log(`✅ ${test.name}: OK (${response.status})`);
        } catch (parseError) {
          console.log(`✅ ${test.name}: OK (${response.status}) - No JSON response`);
        }
      } else {
        try {
          const errorData = await response.json();
          result.error = errorData;
          console.log(`❌ ${test.name}: ERROR ${response.status} - ${errorData.detail || response.statusText}`);
        } catch (parseError) {
          console.log(`❌ ${test.name}: ERROR ${response.status} - ${response.statusText}`);
        }
      }

      results.push(result);

    } catch (error) {
      console.log(`❌ ${test.name}: EXCEPTION - ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.push({
        name: test.name,
        url: test.url,
        status: 0,
        statusText: 'Network Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Función principal de validación
 */
export async function runApiKeyValidation() {
  console.log('🚀 Iniciando validación completa de API key de Didit...\n');

  const endpointResults = await validateDiditApiKey();
  const verificationResults = await testBasicVerificationCreation();

  // Análisis de resultados
  const successfulEndpoints = endpointResults.filter(r => r.success);
  const successfulVerifications = verificationResults.filter(r => r.success);

  console.log('\n📊 RESUMEN DE VALIDACIÓN:');
  console.log('==========================');
  console.log(`Endpoints exitosos: ${successfulEndpoints.length}/${endpointResults.length}`);
  console.log(`Verificaciones exitosas: ${successfulVerifications.length}/${verificationResults.length}`);

  if (successfulEndpoints.length > 0) {
    console.log('\n✅ Endpoints que funcionan:');
    successfulEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint.description} (${endpoint.endpoint})`);
    });
  }

  if (successfulVerifications.length > 0) {
    console.log('\n✅ Verificaciones que funcionan:');
    successfulVerifications.forEach(verification => {
      console.log(`  - ${verification.name}`);
    });
  }

  // Determinar si la API key es válida
  const isApiKeyValid = successfulEndpoints.length > 0 || successfulVerifications.length > 0;
  
  if (isApiKeyValid) {
    console.log('\n🎉 ¡API key válida! La integración puede proceder.');
  } else {
    console.log('\n❌ API key no válida o sin permisos suficientes.');
    console.log('💡 Posibles causas:');
    console.log('   - API key incorrecta');
    console.log('   - API key sin permisos para los endpoints probados');
    console.log('   - Endpoints no disponibles en esta versión');
    console.log('   - Configuración de cuenta pendiente');
  }

  return {
    apiKeyValid: isApiKeyValid,
    endpointResults,
    verificationResults,
    successfulEndpoints: successfulEndpoints.length,
    successfulVerifications: successfulVerifications.length,
    totalTests: endpointResults.length + verificationResults.length
  };
}

/**
 * Handler para endpoint de validación
 */
export async function GET() {
  try {
    const results = await runApiKeyValidation();
    
    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
      message: 'Validación de API key completada'
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
