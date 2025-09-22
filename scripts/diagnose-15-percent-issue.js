/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA 15%
 * 
 * Script para diagnosticar por qué el proceso se queda en 15%
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🔍 DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA 15%');
console.log('='.repeat(60));

/**
 * Probar el endpoint de Didit directamente
 */
async function testDiditEndpointDirect() {
  console.log('\n🔗 PROBANDO ENDPOINT DE DIDIT DIRECTAMENTE');
  console.log('-'.repeat(50));

  try {
    const payload = {
      workflow_id: process.env.DIDIT_WORKFLOW_ID || '3176221b-c77c-4fea-b2b3-da185ef18122',
      vendor_data: 'TEST-DIAGNOSTIC-456',
      callback: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/didit/webhook`,
      expected_details: {
        first_name: 'Test',
        last_name: 'Doctor',
        date_of_birth: '1990-01-01',
        document_number: 'V-15229045'
      }
    };

    console.log('📡 Enviando solicitud directa a Didit...');
    console.log(`   URL: https://verification.didit.me/v2/session/`);
    console.log(`   Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.DIDIT_API_KEY || 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o',
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Diagnostic/1.0'
      },
      body: JSON.stringify(payload)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN DIDIT:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const sessionData = await response.json();
    
    console.log('✅ DIDIT FUNCIONA CORRECTAMENTE:');
    console.log(`   Session ID: ${sessionData.session_id}`);
    console.log(`   Session Token: ${sessionData.session_token}`);
    console.log(`   Status: ${sessionData.status}`);
    console.log(`   URL: ${sessionData.url}`);

    return sessionData;

  } catch (error) {
    console.log('❌ ERROR EN DIDIT:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Probar el endpoint local
 */
async function testLocalEndpoint() {
  console.log('\n🏠 PROBANDO ENDPOINT LOCAL');
  console.log('-'.repeat(50));

  try {
    const payload = {
      doctor_id: 'V-15229045',
      first_name: 'Test',
      last_name: 'Doctor',
      date_of_birth: '1990-01-01',
      nationality: 'Venezuelan',
      document_number: 'V-15229045',
      email: 'test@test.com',
      phone: '+584241234567'
    };

    console.log('📡 Enviando solicitud al endpoint local...');
    console.log(`   URL: http://localhost:3000/api/didit/doctor-verification`);

    const response = await fetch('http://localhost:3000/api/didit/doctor-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN ENDPOINT LOCAL:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const result = await response.json();
    
    console.log('✅ ENDPOINT LOCAL FUNCIONA:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Session ID: ${result.session_id}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);

    return result;

  } catch (error) {
    console.log('❌ ERROR EN ENDPOINT LOCAL:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Probar el endpoint de status
 */
async function testStatusEndpoint(sessionId) {
  console.log('\n📊 PROBANDO ENDPOINT DE STATUS');
  console.log('-'.repeat(50));

  try {
    console.log(`📡 Consultando status de sesión: ${sessionId}`);

    const response = await fetch(`http://localhost:3000/api/didit/status/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN STATUS:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const result = await response.json();
    
    console.log('✅ STATUS FUNCIONA:');
    console.log(`   Session ID: ${result.session_id}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Decision: ${result.decision?.status || 'N/A'}`);

    return result;

  } catch (error) {
    console.log('❌ ERROR EN STATUS:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Verificar configuración
 */
function verifyConfiguration() {
  console.log('\n🔧 VERIFICANDO CONFIGURACIÓN');
  console.log('-'.repeat(50));

  const requiredVars = [
    { name: 'DIDIT_API_KEY', value: process.env.DIDIT_API_KEY },
    { name: 'DIDIT_WORKFLOW_ID', value: process.env.DIDIT_WORKFLOW_ID },
    { name: 'NEXT_PUBLIC_SITE_URL', value: process.env.NEXT_PUBLIC_SITE_URL }
  ];

  let allConfigured = true;

  for (const { name, value } of requiredVars) {
    if (value) {
      const maskedValue = name.includes('KEY') ? `${value.substring(0, 8)}...` : value;
      console.log(`   ✅ ${name}: ${maskedValue}`);
    } else {
      console.log(`   ❌ ${name}: No configurada`);
      allConfigured = false;
    }
  }

  console.log(`\n   ${allConfigured ? '✅' : '❌'} Configuración ${allConfigured ? 'completa' : 'incompleta'}`);
  return allConfigured;
}

/**
 * Función principal de diagnóstico
 */
async function runDiagnostic() {
  console.log('🚀 INICIANDO DIAGNÓSTICO...\n');

  // 1. Verificar configuración
  const configValid = verifyConfiguration();
  if (!configValid) {
    console.log('\n❌ No se puede continuar sin configuración válida');
    return;
  }

  // 2. Probar endpoint de Didit directamente
  const diditResult = await testDiditEndpointDirect();
  if (!diditResult) {
    console.log('\n❌ Didit no funciona, el problema está en la API externa');
    return;
  }

  // 3. Probar endpoint local
  const localResult = await testLocalEndpoint();
  if (!localResult) {
    console.log('\n❌ Endpoint local no funciona, el problema está en el servidor');
    return;
  }

  // 4. Probar endpoint de status
  if (localResult.session_id) {
    await testStatusEndpoint(localResult.session_id);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ DIAGNÓSTICO COMPLETADO');
  console.log('');
  console.log('📋 CONCLUSIONES:');
  console.log('');
  if (diditResult && localResult) {
    console.log('   ✅ Didit API funciona correctamente');
    console.log('   ✅ Endpoint local funciona correctamente');
    console.log('   ✅ El problema está en el frontend');
    console.log('');
    console.log('🔧 POSIBLES CAUSAS DEL PROBLEMA 15%:');
    console.log('');
    console.log('   1. ❌ Error de JavaScript en el frontend');
    console.log('   2. ❌ Problema con el polling de status');
    console.log('   3. ❌ Error en el manejo de la respuesta');
    console.log('   4. ❌ Problema con el estado del componente');
    console.log('');
    console.log('🎯 SOLUCIONES RECOMENDADAS:');
    console.log('');
    console.log('   1. ✅ Revisar la consola del navegador para errores JS');
    console.log('   2. ✅ Verificar el polling de status en el componente');
    console.log('   3. ✅ Revisar el manejo de estados en DiditVerificationStep');
    console.log('   4. ✅ Limpiar caché del navegador');
    console.log('   5. ✅ Reiniciar el servidor de desarrollo');
  } else {
    console.log('   ❌ Hay problemas con la configuración o endpoints');
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  runDiagnostic().catch(error => {
    console.error('❌ Error ejecutando diagnóstico:', error);
    process.exit(1);
  });
}

module.exports = {
  testDiditEndpointDirect,
  testLocalEndpoint,
  testStatusEndpoint,
  verifyConfiguration
};
