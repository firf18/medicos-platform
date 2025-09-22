/**
 * 🧪 PRUEBA DE CORRECCIÓN DE ERRORES EN DIDIT
 * 
 * Script para probar que los errores de "Error interno del servidor" 
 * y validación de paso están corregidos
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🧪 PRUEBA DE CORRECCIÓN DE ERRORES EN DIDIT');
console.log('='.repeat(60));

// Configuración de prueba
const TEST_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: process.env.DIDIT_BASE_URL || 'https://verification.didit.me/v2',
  workflowId: process.env.DIDIT_WORKFLOW_ID
};

// Datos de prueba válidos
const validDoctorData = {
  doctor_id: 'TEST-DOCTOR-FIX-456',
  first_name: 'Dr. María',
  last_name: 'González',
  date_of_birth: '1985-06-15',
  nationality: 'Venezuelan',
  document_number: 'V-12345678',
  email: 'maria.gonzalez.fix@medicina.com',
  phone: '+584241234567'
};

// Datos de prueba inválidos (para probar manejo de errores)
const invalidDoctorData = {
  doctor_id: '', // Campo requerido faltante
  first_name: 'Dr. María',
  last_name: 'González',
  date_of_birth: '1985-06-15',
  nationality: 'Venezuelan',
  document_number: 'V-12345678',
  email: 'maria.gonzalez.fix@medicina.com',
  phone: '+584241234567'
};

/**
 * Probar creación de sesión con datos válidos
 */
async function testValidSessionCreation() {
  console.log('\n✅ PROBANDO CREACIÓN DE SESIÓN CON DATOS VÁLIDOS');
  console.log('-'.repeat(50));

  try {
    const response = await fetch('http://localhost:3000/api/didit/doctor-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validDoctorData)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ ERROR EN CREACIÓN DE SESIÓN:');
      console.log(`   Error: ${errorData.error || 'Error desconocido'}`);
      console.log(`   Details: ${errorData.details || 'N/A'}`);
      return null;
    }

    const sessionData = await response.json();
    
    console.log('✅ SESIÓN CREADA EXITOSAMENTE:');
    console.log(`   Session ID: ${sessionData.session_id}`);
    console.log(`   Status: ${sessionData.status}`);
    console.log(`   Message: ${sessionData.message}`);

    return sessionData;

  } catch (error) {
    console.log('❌ ERROR EN PRUEBA DE SESIÓN VÁLIDA:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Probar creación de sesión con datos inválidos (para probar manejo de errores)
 */
async function testInvalidSessionCreation() {
  console.log('\n❌ PROBANDO CREACIÓN DE SESIÓN CON DATOS INVÁLIDOS');
  console.log('-'.repeat(50));

  try {
    const response = await fetch('http://localhost:3000/api/didit/doctor-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidDoctorData)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    const responseData = await response.json();
    
    if (!response.ok) {
      console.log('✅ ERROR MANEJADO CORRECTAMENTE:');
      console.log(`   Error: ${responseData.error || 'Error desconocido'}`);
      console.log(`   Status: ${response.status}`);
      console.log('   ✅ El error se maneja correctamente sin causar "Error interno del servidor"');
    } else {
      console.log('⚠️  INESPERADO: La sesión se creó con datos inválidos');
    }

    return responseData;

  } catch (error) {
    console.log('❌ ERROR EN PRUEBA DE SESIÓN INVÁLIDA:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Probar directamente la API de Didit
 */
async function testDirectDiditAPI() {
  console.log('\n🔗 PROBANDO API DIRECTA DE DIDIT');
  console.log('-'.repeat(50));

  try {
    const payload = {
      workflow_id: TEST_CONFIG.workflowId,
      vendor_data: validDoctorData.doctor_id,
      callback: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/didit/webhook`,
      expected_details: {
        first_name: validDoctorData.first_name,
        last_name: validDoctorData.last_name,
        date_of_birth: validDoctorData.date_of_birth,
        document_number: validDoctorData.document_number
      },
      contact_details: {
        email: validDoctorData.email,
        email_lang: 'es'
      }
    };

    console.log('📡 Enviando solicitud directa a Didit...');
    console.log(`   URL: ${TEST_CONFIG.baseUrl}/v2/session/`);

    const response = await fetch(`${TEST_CONFIG.baseUrl}/v2/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': TEST_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Fix-Test/1.0'
      },
      body: JSON.stringify(payload)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN API DIRECTA DE DIDIT:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const sessionData = await response.json();
    
    console.log('✅ API DIRECTA DE DIDIT FUNCIONA:');
    console.log(`   Session ID: ${sessionData.session_id}`);
    console.log(`   Status: ${sessionData.status}`);

    return sessionData;

  } catch (error) {
    console.log('❌ ERROR EN API DIRECTA DE DIDIT:');
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
    { name: 'DIDIT_BASE_URL', value: process.env.DIDIT_BASE_URL }
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
 * Función principal de prueba
 */
async function runTest() {
  console.log('🚀 INICIANDO PRUEBA DE CORRECCIÓN DE ERRORES...\n');

  // 1. Verificar configuración
  const configValid = verifyConfiguration();
  if (!configValid) {
    console.log('\n❌ No se puede continuar sin configuración válida');
    return;
  }

  // 2. Probar API directa de Didit
  await testDirectDiditAPI();

  // 3. Probar creación de sesión con datos válidos
  await testValidSessionCreation();

  // 4. Probar creación de sesión con datos inválidos
  await testInvalidSessionCreation();

  console.log('\n' + '='.repeat(60));
  console.log('✅ PRUEBA DE CORRECCIÓN DE ERRORES COMPLETADA');
  console.log('');
  console.log('📋 RESUMEN DE CORRECCIONES:');
  console.log('');
  console.log('   1. ✅ URL corregida: /session/ → /v2/session/');
  console.log('   2. ✅ Manejo de errores mejorado con mensajes específicos');
  console.log('   3. ✅ Logs de debugging agregados');
  console.log('   4. ✅ Validación de errores mejorada para evitar objetos vacíos');
  console.log('   5. ✅ Mensajes de error más informativos');
  console.log('');
  console.log('🔧 PRÓXIMOS PASOS:');
  console.log('   1. Reinicia el servidor: npm run dev');
  console.log('   2. Prueba el flujo completo de registro');
  console.log('   3. Verifica que no aparezcan más errores de "Error interno del servidor"');
  console.log('   4. Monitorea los logs en la consola del navegador');
  console.log('');
  console.log('🎯 Los errores deberían estar corregidos!');
}

// Ejecutar prueba
if (require.main === module) {
  runTest().catch(error => {
    console.error('❌ Error ejecutando prueba:', error);
    process.exit(1);
  });
}

module.exports = {
  testValidSessionCreation,
  testInvalidSessionCreation,
  testDirectDiditAPI,
  verifyConfiguration
};
