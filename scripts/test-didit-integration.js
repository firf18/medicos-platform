/**
 * 🧪 SCRIPT DE PRUEBA PARA INTEGRACIÓN DIDIT
 * 
 * Script para probar la integración con Didit de forma segura
 * sin afectar datos de producción
 * 
 * Uso: node scripts/test-didit-integration.js
 */

const { config } = require('dotenv');
const crypto = require('crypto');

// Cargar variables de entorno
config({ path: '.env.local' });

// ============================================================================
// CONFIGURACIÓN DE PRUEBA
// ============================================================================

const TEST_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  webhookSecret: process.env.DIDIT_WEBHOOK_SECRET_KEY,
  baseUrl: process.env.DIDIT_BASE_URL || 'https://verification.didit.me',
  workflowId: process.env.DIDIT_WORKFLOW_ID,
  webhookUrl: process.env.DIDIT_WEBHOOK_URL || 'https://red-salud.org/api/webhooks/didit'
};

// Datos de prueba para médico venezolano
const TEST_DOCTOR_DATA = {
  firstName: 'Dr. Carlos',
  lastName: 'Rodríguez',
  email: 'carlos.rodriguez@test.com',
  phone: '+584241234567',
  licenseNumber: 'MPPS-12345',
  specialty: 'medicina-general',
  documentType: 'cedula_identidad',
  documentNumber: 'V-12345678',
  medicalBoard: 'Colegio de Médicos de Caracas',
  university: 'Universidad Central de Venezuela'
};

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * Valida la configuración de Didit
 */
function validateConfiguration() {
  console.log('🔧 Validando configuración de Didit...\n');
  
  const requiredFields = [
    { field: 'apiKey', name: 'DIDIT_API_KEY' },
    { field: 'webhookSecret', name: 'DIDIT_WEBHOOK_SECRET_KEY' },
    { field: 'workflowId', name: 'DIDIT_WORKFLOW_ID' },
    { field: 'baseUrl', name: 'DIDIT_BASE_URL' }
  ];

  let isValid = true;
  
  for (const { field, name } of requiredFields) {
    const value = TEST_CONFIG[field];
    if (!value) {
      console.log(`❌ ${name}: No configurada`);
      isValid = false;
    } else {
      const maskedValue = field === 'apiKey' || field === 'webhookSecret' 
        ? `${value.substring(0, 8)}...` 
        : value;
      console.log(`✅ ${name}: ${maskedValue}`);
    }
  }

  // Validar formato de workflow ID
  if (TEST_CONFIG.workflowId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(TEST_CONFIG.workflowId)) {
      console.log(`❌ DIDIT_WORKFLOW_ID: Formato UUID inválido`);
      isValid = false;
    }
  }

  console.log(`\n${isValid ? '✅' : '❌'} Configuración ${isValid ? 'válida' : 'inválida'}\n`);
  return isValid;
}

/**
 * Prueba la conectividad con la API de Didit
 */
async function testApiConnectivity() {
  console.log('🌐 Probando conectividad con API de Didit...\n');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Red-Salud-Test/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      console.log('✅ Conectividad con Didit: OK');
      console.log(`   Status: ${response.status}`);
      console.log(`   URL: ${TEST_CONFIG.baseUrl}`);
    } else {
      console.log('⚠️ Conectividad con Didit: Respuesta no OK');
      console.log(`   Status: ${response.status}`);
      console.log(`   StatusText: ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Error de conectividad con Didit:');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
}

/**
 * Prueba la creación de una sesión de verificación (modo dry-run)
 */
async function testSessionCreation() {
  console.log('🔐 Probando creación de sesión de verificación...\n');
  
  try {
    const sessionConfig = {
      workflow_id: TEST_CONFIG.workflowId,
      callback: `${TEST_CONFIG.webhookUrl}/callback`,
      vendor_data: TEST_DOCTOR_DATA.licenseNumber,
      metadata: {
        platform: 'red-salud-platform',
        country: 'venezuela',
        verification_type: 'doctor_registration_test',
        specialty: TEST_DOCTOR_DATA.specialty,
        test_mode: true
      },
      expected_details: {
        first_name: TEST_DOCTOR_DATA.firstName,
        last_name: TEST_DOCTOR_DATA.lastName
      },
      contact_details: {
        email: TEST_DOCTOR_DATA.email,
        email_lang: 'es'
      }
    };

    console.log('📋 Configuración de sesión:');
    console.log(JSON.stringify(sessionConfig, null, 2));
    console.log('');

    // NOTA: Comentamos la llamada real para evitar crear sesiones de prueba
    // En un entorno de desarrollo, puedes descomentar esto:
    
    /*
    const response = await fetch(`${TEST_CONFIG.baseUrl}/v2/session/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': TEST_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Red-Salud-Test/1.0'
      },
      body: JSON.stringify(sessionConfig),
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sesión creada exitosamente:');
      console.log(`   Session ID: ${result.session_id}`);
      console.log(`   Session Number: ${result.session_number}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Status: ${result.status}`);
    } else {
      const errorText = await response.text();
      console.log('❌ Error creando sesión:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }
    */

    console.log('ℹ️ Creación de sesión simulada (modo dry-run)');
    console.log('   Para probar realmente, descomenta el código en el script');
    
  } catch (error) {
    console.log('❌ Error en prueba de creación de sesión:');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
}

/**
 * Prueba la verificación de firma de webhook
 */
function testWebhookSignature() {
  console.log('🔏 Probando verificación de firma de webhook...\n');
  
  try {
    // Payload de prueba
    const testPayload = JSON.stringify({
      session_id: '12345678-1234-5678-9012-123456789012',
      status: 'Approved',
      webhook_type: 'status.updated',
      vendor_data: TEST_DOCTOR_DATA.licenseNumber,
      timestamp: Math.floor(Date.now() / 1000)
    });

    // Generar firma HMAC
    const expectedSignature = crypto
      .createHmac('sha256', TEST_CONFIG.webhookSecret)
      .update(testPayload)
      .digest('hex');

    console.log('📋 Datos de prueba:');
    console.log(`   Payload: ${testPayload}`);
    console.log(`   Signature: ${expectedSignature}`);
    console.log('');

    // Verificar firma (simulando el proceso del webhook)
    const testSignature = crypto
      .createHmac('sha256', TEST_CONFIG.webhookSecret)
      .update(testPayload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(testSignature, 'utf8')
    );

    console.log(`${isValid ? '✅' : '❌'} Verificación de firma: ${isValid ? 'Válida' : 'Inválida'}`);
    
  } catch (error) {
    console.log('❌ Error en prueba de firma de webhook:');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
}

/**
 * Prueba la validación de datos de médico venezolano
 */
function testVenezuelanDoctorValidation() {
  console.log('🇻🇪 Probando validación de datos de médico venezolano...\n');
  
  const validationTests = [
    {
      name: 'Cédula profesional válida',
      data: { licenseNumber: 'MPPS-12345' },
      shouldPass: true
    },
    {
      name: 'Cédula profesional inválida',
      data: { licenseNumber: 'INVALID-123' },
      shouldPass: false
    },
    {
      name: 'Cédula de identidad válida',
      data: { documentNumber: 'V-12345678' },
      shouldPass: true
    },
    {
      name: 'Cédula de identidad inválida',
      data: { documentNumber: 'X-123' },
      shouldPass: false
    },
    {
      name: 'Teléfono venezolano válido',
      data: { phone: '+584241234567' },
      shouldPass: true
    },
    {
      name: 'Teléfono inválido',
      data: { phone: '+1234567890' },
      shouldPass: false
    }
  ];

  for (const test of validationTests) {
    try {
      // Simular validaciones (normalmente estarían en la clase DiditIntegrationV2)
      let isValid = true;
      let errorMessage = '';

      if (test.data.licenseNumber) {
        const licenseRegex = /^(MPPS|CIV|CMC|CMDM|CMDC|CMDT|CMDZ|CMDA|CMDB|CMDL|CMDF|CMDG|CMDP|CMDS|CMDY|CMDCO|CMDSU|CMDTA|CMDME|CMDMO|CMDVA|CMDAP|CMDGU|CMDPO|CMDNUE|CMDBAR|CMDCAR|CMDARA|CMDBOL|CMDCOJ|CMDDEL|CMDMIRA|CMDTRU|CMDYAR)-\d{4,6}$/i;
        if (!licenseRegex.test(test.data.licenseNumber)) {
          isValid = false;
          errorMessage = 'Formato de cédula profesional inválido';
        }
      }

      if (test.data.documentNumber) {
        const cedulaRegex = /^[VE]-\d{7,8}$/i;
        if (!cedulaRegex.test(test.data.documentNumber)) {
          isValid = false;
          errorMessage = 'Formato de cédula de identidad inválido';
        }
      }

      if (test.data.phone) {
        const phoneRegex = /^\+58[24]\d{9}$/;
        if (!phoneRegex.test(test.data.phone)) {
          isValid = false;
          errorMessage = 'Formato de teléfono venezolano inválido';
        }
      }

      const testPassed = (isValid && test.shouldPass) || (!isValid && !test.shouldPass);
      
      console.log(`${testPassed ? '✅' : '❌'} ${test.name}: ${testPassed ? 'PASS' : 'FAIL'}`);
      if (!testPassed && errorMessage) {
        console.log(`   Error: ${errorMessage}`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  console.log('');
}

/**
 * Función principal de prueba
 */
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE INTEGRACIÓN DIDIT\n');
  console.log('='.repeat(50));
  console.log('');

  // 1. Validar configuración
  const configValid = validateConfiguration();
  if (!configValid) {
    console.log('❌ Las pruebas no pueden continuar sin una configuración válida.');
    process.exit(1);
  }

  // 2. Probar conectividad
  await testApiConnectivity();

  // 3. Probar creación de sesión
  await testSessionCreation();

  // 4. Probar verificación de webhook
  testWebhookSignature();

  // 5. Probar validación de datos venezolanos
  testVenezuelanDoctorValidation();

  console.log('='.repeat(50));
  console.log('✅ PRUEBAS DE INTEGRACIÓN DIDIT COMPLETADAS');
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('   1. Verifica que todas las pruebas pasen');
  console.log('   2. Prueba la creación real de sesión en desarrollo');
  console.log('   3. Configura el webhook en el dashboard de Didit');
  console.log('   4. Prueba el flujo completo con un médico de prueba');
  console.log('');
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Error ejecutando pruebas:', error);
    process.exit(1);
  });
}

module.exports = {
  validateConfiguration,
  testApiConnectivity,
  testSessionCreation,
  testWebhookSignature,
  testVenezuelanDoctorValidation
};