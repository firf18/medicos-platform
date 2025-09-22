/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO: PROBLEMA DEL 20% EN DIDIT
 * 
 * Script para diagnosticar por qué Didit se queda pegado en el 20%
 * y no progresa más allá de ese punto
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🔍 DIAGNÓSTICO: PROBLEMA DEL 20% EN DIDIT');
console.log('='.repeat(60));

// Configuración de prueba
const TEST_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: process.env.DIDIT_BASE_URL || 'https://verification.didit.me/v2',
  workflowId: process.env.DIDIT_WORKFLOW_ID
};

// Datos de prueba específicos
const testDoctorData = {
  doctor_id: 'TEST-DOCTOR-123',
  first_name: 'Dr. María',
  last_name: 'González',
  date_of_birth: '1985-06-15',
  nationality: 'Venezuelan',
  document_number: 'V-12345678',
  email: 'maria.gonzalez.test@medicina.com',
  phone: '+584241234567'
};

/**
 * 1. DIAGNÓSTICO: Crear sesión y verificar respuesta inicial
 */
async function diagnoseSessionCreation() {
  console.log('\n🔍 PASO 1: DIAGNÓSTICO DE CREACIÓN DE SESIÓN');
  console.log('-'.repeat(50));

  try {
    const payload = {
      workflow_id: TEST_CONFIG.workflowId,
      vendor_data: testDoctorData.doctor_id,
      callback: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/didit/webhook`,
      expected_details: {
        first_name: testDoctorData.first_name,
        last_name: testDoctorData.last_name,
        date_of_birth: testDoctorData.date_of_birth,
        document_number: testDoctorData.document_number
      },
      contact_details: {
        email: testDoctorData.email,
        email_lang: 'es'
      }
    };

    console.log('📡 Creando sesión de prueba...');
    console.log(`   URL: ${TEST_CONFIG.baseUrl}/v2/session/`);
    console.log(`   Workflow ID: ${TEST_CONFIG.workflowId}`);

    const response = await fetch(`${TEST_CONFIG.baseUrl}/v2/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': TEST_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Diagnostic/1.0'
      },
      body: JSON.stringify(payload)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN CREACIÓN DE SESIÓN:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const sessionData = await response.json();
    
    console.log('✅ SESIÓN CREADA EXITOSAMENTE:');
    console.log(`   Session ID: ${sessionData.session_id}`);
    console.log(`   Session URL: ${sessionData.session_url}`);
    console.log(`   Status: ${sessionData.status}`);
    console.log(`   Features: ${sessionData.features?.join(', ') || 'N/A'}`);

    return sessionData;

  } catch (error) {
    console.log('❌ ERROR EN DIAGNÓSTICO DE SESIÓN:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * 2. DIAGNÓSTICO: Verificar estado inicial de la sesión
 */
async function diagnoseInitialStatus(sessionId) {
  console.log('\n🔍 PASO 2: DIAGNÓSTICO DE ESTADO INICIAL');
  console.log('-'.repeat(50));

  try {
    console.log(`📡 Consultando estado inicial de sesión: ${sessionId}`);

    const response = await fetch(`${TEST_CONFIG.baseUrl}/v2/session/${sessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': TEST_CONFIG.apiKey,
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Diagnostic/1.0'
      }
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR CONSULTANDO ESTADO:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const statusData = await response.json();
    
    console.log('✅ ESTADO INICIAL OBTENIDO:');
    console.log(`   Session ID: ${statusData.session_id}`);
    console.log(`   Status: ${statusData.status}`);
    console.log(`   Features: ${statusData.features?.join(', ') || 'N/A'}`);
    
    // Analizar cada característica
    if (statusData.id_verification) {
      console.log(`   ID Verification: ${statusData.id_verification.status}`);
    }
    if (statusData.face_match) {
      console.log(`   Face Match: ${statusData.face_match.status}`);
    }
    if (statusData.liveness) {
      console.log(`   Liveness: ${statusData.liveness.status}`);
    }
    if (statusData.aml) {
      console.log(`   AML: ${statusData.aml.status}`);
    }

    return statusData;

  } catch (error) {
    console.log('❌ ERROR EN DIAGNÓSTICO DE ESTADO:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * 3. DIAGNÓSTICO: Simular progreso de verificación
 */
async function diagnoseProgressSimulation(sessionId) {
  console.log('\n🔍 PASO 3: DIAGNÓSTICO DE SIMULACIÓN DE PROGRESO');
  console.log('-'.repeat(50));

  console.log('📊 Simulando diferentes estados de progreso...');

  const progressStates = [
    { name: 'Not Started', expected: '0%' },
    { name: 'In Progress', expected: '20-40%' },
    { name: 'In Review', expected: '60-80%' },
    { name: 'Approved', expected: '100%' },
    { name: 'Declined', expected: '100%' }
  ];

  for (const state of progressStates) {
    console.log(`\n   Estado: ${state.name}`);
    console.log(`   Progreso esperado: ${state.expected}`);
    
    // Simular cómo el componente manejaría este estado
    let progress = 0;
    switch (state.name) {
      case 'Not Started':
        progress = 0;
        break;
      case 'In Progress':
        progress = 20; // ← AQUÍ ESTÁ EL PROBLEMA POTENCIAL
        break;
      case 'In Review':
        progress = 60;
        break;
      case 'Approved':
      case 'Declined':
        progress = 100;
        break;
    }
    
    console.log(`   Progreso calculado: ${progress}%`);
    
    if (state.name === 'In Progress' && progress === 20) {
      console.log('   ⚠️  POSIBLE PROBLEMA: El estado "In Progress" se queda en 20%');
      console.log('   💡 SOLUCIÓN: Necesitamos lógica adicional para incrementar progreso');
    }
  }
}

/**
 * 4. DIAGNÓSTICO: Verificar lógica de polling
 */
function diagnosePollingLogic() {
  console.log('\n🔍 PASO 4: DIAGNÓSTICO DE LÓGICA DE POLLING');
  console.log('-'.repeat(50));

  console.log('🔄 Analizando lógica de polling del componente...');

  // Simular la lógica actual del componente
  const simulatePolling = (status, currentProgress) => {
    let newProgress = currentProgress;
    
    if (status === 'user_verifying') {
      newProgress = Math.min(currentProgress + 10, 80);
    } else if (status === 'processing') {
      newProgress = 90;
    } else if (status === 'completed') {
      newProgress = 100;
    }
    
    return newProgress;
  };

  console.log('\n   Simulando polling con diferentes estados:');
  
  const testCases = [
    { status: 'Not Started', initialProgress: 20 },
    { status: 'In Progress', initialProgress: 20 },
    { status: 'In Review', initialProgress: 20 },
    { status: 'Approved', initialProgress: 20 }
  ];

  for (const testCase of testCases) {
    const newProgress = simulatePolling(testCase.status, testCase.initialProgress);
    console.log(`   Estado: ${testCase.status} | Progreso inicial: ${testCase.initialProgress}% | Progreso final: ${newProgress}%`);
    
    if (testCase.status === 'In Progress' && newProgress === 20) {
      console.log('   ❌ PROBLEMA IDENTIFICADO: El estado "In Progress" no incrementa el progreso');
    }
  }
}

/**
 * 5. DIAGNÓSTICO: Identificar el problema específico
 */
function identifySpecificProblem() {
  console.log('\n🔍 PASO 5: IDENTIFICACIÓN DEL PROBLEMA ESPECÍFICO');
  console.log('-'.repeat(50));

  console.log('🎯 PROBLEMA IDENTIFICADO:');
  console.log('');
  console.log('   El componente DiditVerificationStep.tsx tiene la siguiente lógica:');
  console.log('');
  console.log('   ```typescript');
  console.log('   updateVerificationState({');
  console.log('     status: "session_created",');
  console.log('     sessionId: sessionData.session_id,');
  console.log('     verificationUrl: sessionData.session_url,');
  console.log('     progress: 20  // ← SE QUEDA AQUÍ');
  console.log('   });');
  console.log('   ```');
  console.log('');
  console.log('   Luego, cuando se abre la ventana de verificación:');
  console.log('');
  console.log('   ```typescript');
  console.log('   updateVerificationState({');
  console.log('     status: "user_verifying",');
  console.log('     progress: 30  // ← SOLO LLEGA A 30%');
  console.log('   });');
  console.log('   ```');
  console.log('');
  console.log('   El problema es que el polling no está funcionando correctamente');
  console.log('   o el estado no está cambiando de "In Progress" a otros estados.');
  console.log('');
  console.log('🔧 SOLUCIONES PROPUESTAS:');
  console.log('');
  console.log('   1. Verificar que el polling esté funcionando');
  console.log('   2. Asegurar que el estado cambie correctamente');
  console.log('   3. Implementar lógica de progreso incremental');
  console.log('   4. Agregar logs de debugging para el polling');
}

/**
 * Función principal de diagnóstico
 */
async function runDiagnosis() {
  console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...\n');

  // Verificar configuración
  if (!TEST_CONFIG.apiKey || !TEST_CONFIG.workflowId) {
    console.log('❌ ERROR: Configuración incompleta');
    console.log('   Verifica que las variables de entorno estén configuradas');
    return;
  }

  // 1. Crear sesión de prueba
  const sessionData = await diagnoseSessionCreation();
  if (!sessionData) {
    console.log('\n❌ No se puede continuar sin una sesión válida');
    return;
  }

  // 2. Verificar estado inicial
  await diagnoseInitialStatus(sessionData.session_id);

  // 3. Simular progreso
  diagnoseProgressSimulation(sessionData.session_id);

  // 4. Verificar lógica de polling
  diagnosePollingLogic();

  // 5. Identificar problema específico
  identifySpecificProblem();

  console.log('\n' + '='.repeat(60));
  console.log('✅ DIAGNÓSTICO COMPLETADO');
  console.log('');
  console.log('📋 RESUMEN:');
  console.log('   El problema del 20% se debe a que:');
  console.log('   1. El progreso se establece en 20% al crear la sesión');
  console.log('   2. El polling no está incrementando el progreso correctamente');
  console.log('   3. El estado "In Progress" no tiene lógica de progreso incremental');
  console.log('');
  console.log('🔧 PRÓXIMOS PASOS:');
  console.log('   1. Implementar lógica de progreso incremental en el polling');
  console.log('   2. Agregar logs de debugging para monitorear el progreso');
  console.log('   3. Verificar que el webhook esté funcionando correctamente');
  console.log('   4. Probar con una sesión real de verificación');
}

// Ejecutar diagnóstico
if (require.main === module) {
  runDiagnosis().catch(error => {
    console.error('❌ Error ejecutando diagnóstico:', error);
    process.exit(1);
  });
}

module.exports = {
  diagnoseSessionCreation,
  diagnoseInitialStatus,
  diagnoseProgressSimulation,
  diagnosePollingLogic,
  identifySpecificProblem
};
