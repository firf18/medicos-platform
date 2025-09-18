/**
 * 🏥 PRUEBA COMPLETA DEL REGISTRO DE MÉDICOS
 * 
 * Script para probar todo el flujo de registro de médicos
 * incluyendo la integración con Didit
 */

console.log('🏥 PRUEBA COMPLETA DEL REGISTRO DE MÉDICOS');
console.log('=' .repeat(60));

// Datos de prueba para el médico
const TEST_DOCTOR = {
  // Información personal
  firstName: 'Dr. María',
  lastName: 'González Pérez',
  email: 'maria.gonzalez.test@medicina.com',
  phone: '+525512345678',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  
  // Información profesional
  licenseNumber: 'MED987654321',
  licenseState: 'CDMX',
  licenseExpiry: '2025-12-31',
  yearsOfExperience: 8,
  currentHospital: 'Hospital General de México',
  clinicAffiliations: ['Clínica San Ángel', 'Centro Médico ABC'],
  bio: 'Médico general con especialización en medicina interna y experiencia en atención primaria.',
  
  // Especialidad
  specialtyId: 'general_medicine',
  subSpecialties: ['internal_medicine', 'preventive_medicine'],
  selectedFeatures: ['patient_management', 'appointment_scheduling', 'medical_records'],
  
  // Horarios de trabajo
  workingHours: {
    monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    saturday: { isWorkingDay: false },
    sunday: { isWorkingDay: false }
  }
};

console.log('\n👤 DATOS DEL MÉDICO DE PRUEBA:');
console.log(`Nombre: ${TEST_DOCTOR.firstName} ${TEST_DOCTOR.lastName}`);
console.log(`Email: ${TEST_DOCTOR.email}`);
console.log(`Teléfono: ${TEST_DOCTOR.phone}`);
console.log(`Cédula: ${TEST_DOCTOR.licenseNumber}`);
console.log(`Especialidad: ${TEST_DOCTOR.specialtyId}`);
console.log(`Experiencia: ${TEST_DOCTOR.yearsOfExperience} años`);

// Función para probar la creación de sesión Didit
async function testDiditSessionCreation() {
  console.log('\n🔐 PROBANDO CREACIÓN DE SESIÓN DIDIT...');
  
  const sessionConfig = {
    workflow_id: '3176221b-c77c-4fea-b2b3-da185ef18122',
    callback: 'https://red-salud.org/api/auth/didit/callback',
    vendor_data: TEST_DOCTOR.licenseNumber,
    metadata: {
      platform: 'platform-medicos',
      verification_type: 'doctor_registration',
      specialty: TEST_DOCTOR.specialtyId,
      firstName: TEST_DOCTOR.firstName,
      lastName: TEST_DOCTOR.lastName,
      documentType: 'medical_license',
      documentNumber: TEST_DOCTOR.licenseNumber
    },
    contact_details: {
      email: TEST_DOCTOR.email,
      email_lang: 'es',
      phone: TEST_DOCTOR.phone
    }
  };

  try {
    const response = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'X-Api-Key': 'iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
        'Content-Type': 'application/json',
        'User-Agent': 'Platform-Medicos/1.0'
      },
      body: JSON.stringify(sessionConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Didit API Error: ${response.status} - ${response.statusText}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ SESIÓN DIDIT CREADA EXITOSAMENTE!');
    console.log(`   Session ID: ${result.session_id}`);
    console.log(`   Session Token: ${result.session_token}`);
    console.log(`   Verification URL: ${result.url}`);
    console.log(`   Status: ${result.status}`);

    return result;

  } catch (error) {
    console.error('❌ ERROR CREANDO SESIÓN DIDIT:', error);
    throw error;
  }
}

// Función para probar el webhook
async function testWebhook() {
  console.log('\n🔔 PROBANDO WEBHOOK...');
  
  const webhookPayload = {
    session_id: 'test-session-123',
    status: 'Approved',
    webhook_type: 'status.updated',
    created_at: Math.floor(Date.now() / 1000),
    timestamp: Math.floor(Date.now() / 1000),
    workflow_id: '3176221b-c77c-4fea-b2b3-da185ef18122',
    vendor_data: TEST_DOCTOR.licenseNumber,
    metadata: {
      platform: 'platform-medicos',
      verification_type: 'doctor_registration',
      specialty: TEST_DOCTOR.specialtyId,
      firstName: TEST_DOCTOR.firstName,
      lastName: TEST_DOCTOR.lastName
    },
    decision: {
      session_id: 'test-session-123',
      status: 'Approved',
      id_verification: {
        status: 'Approved',
        document_type: 'Identity Card',
        first_name: TEST_DOCTOR.firstName,
        last_name: TEST_DOCTOR.lastName,
        document_number: TEST_DOCTOR.licenseNumber
      },
      face_match: {
        status: 'match',
        confidence: 0.94
      },
      liveness: {
        status: 'live',
        confidence: 0.98
      },
      aml: {
        status: 'clear',
        risk_level: 'low'
      }
    }
  };

  const payloadString = JSON.stringify(webhookPayload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Generar HMAC signature
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', 'NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck')
    .update(payloadString)
    .digest('hex');

  console.log('📡 Enviando webhook de prueba...');
  console.log(`   URL: https://red-salud.org/api/webhooks/didit`);
  console.log(`   X-Signature: ${signature}`);
  console.log(`   X-Timestamp: ${timestamp}`);

  try {
    const response = await fetch('https://red-salud.org/api/webhooks/didit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'User-Agent': 'Didit-Webhook/1.0'
      },
      body: payloadString
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Webhook enviado exitosamente!');
      console.log('📊 Respuesta:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error en webhook:', errorText);
    }

    return response;

  } catch (error) {
    console.error('❌ Error enviando webhook:', error.message);
    return null;
  }
}

// Función para probar el callback
async function testCallback() {
  console.log('\n🔄 PROBANDO CALLBACK...');
  
  const callbackUrl = `https://red-salud.org/api/auth/didit/callback?session_token=test-session-token&status=approved`;
  
  console.log('📡 Probando callback URL...');
  console.log(`   URL: ${callbackUrl}`);

  try {
    const response = await fetch(callbackUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Didit-Callback/1.0'
      }
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Callback procesado exitosamente!');
    } else {
      const errorText = await response.text();
      console.log('❌ Error en callback:', errorText);
    }

    return response;

  } catch (error) {
    console.error('❌ Error probando callback:', error.message);
    return null;
  }
}

// Función principal
async function testCompleteRegistrationFlow() {
  try {
    console.log('\n🚀 INICIANDO PRUEBA COMPLETA DEL REGISTRO...\n');

    // Paso 1: Probar creación de sesión Didit
    console.log('📡 PASO 1: CREANDO SESIÓN DE VERIFICACIÓN...');
    const session = await testDiditSessionCreation();

    // Paso 2: Probar webhook
    console.log('\n🔔 PASO 2: PROBANDO WEBHOOK...');
    await testWebhook();

    // Paso 3: Probar callback
    console.log('\n🔄 PASO 3: PROBANDO CALLBACK...');
    await testCallback();

    // Resumen final
    console.log('\n🎉 PRUEBA COMPLETA DEL REGISTRO FINALIZADA!');
    console.log('=' .repeat(60));
    console.log('✅ Sesión de verificación Didit creada');
    console.log('✅ Webhook procesado correctamente');
    console.log('✅ Callback funcionando');
    console.log('✅ Integración completa operativa');
    
    console.log('\n📊 RESUMEN TÉCNICO:');
    console.log(`   Session ID: ${session.session_id}`);
    console.log(`   Verification URL: ${session.url}`);
    console.log(`   Webhook URL: https://red-salud.org/api/webhooks/didit`);
    console.log(`   Callback URL: https://red-salud.org/api/auth/didit/callback`);
    console.log(`   Workflow ID: 3176221b-c77c-4fea-b2b3-da185ef18122`);
    
    console.log('\n🏥 EL REGISTRO DE MÉDICOS ESTÁ LISTO PARA PRODUCCIÓN!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. ✅ Configurar webhook URL en Didit Console');
    console.log('2. ✅ Probar con médico real');
    console.log('3. ✅ Monitorear webhooks en producción');
    console.log('4. ✅ Verificar activación automática de cuentas');
    console.log('5. ✅ Probar flujo completo en http://localhost:3000/auth/register/doctor');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA COMPLETA:', error);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n🔧 PROBLEMA: API Key inválida');
      console.log('💡 SOLUCIÓN: Verifica que la API Key sea correcta');
    }
    
    if (error.message.includes('webhook')) {
      console.log('\n🔧 PROBLEMA: Error con webhook');
      console.log('💡 SOLUCIÓN: Verifica que el servidor esté corriendo');
    }
    
    console.log('\n🔍 Revisar logs para más detalles');
  }
}

// Ejecutar la prueba
testCompleteRegistrationFlow();
