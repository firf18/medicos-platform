/**
 * 🧪 PRUEBA RÁPIDA DE DIDIT CON VARIABLES DE ENTORNO
 * 
 * Script para probar que la integración Didit funcione con las variables configuradas
 */

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🧪 PRUEBA RÁPIDA DE DIDIT CON VARIABLES DE ENTORNO');
console.log('=' .repeat(60));

// Verificar que las variables estén cargadas
const apiKey = process.env.DIDIT_API_KEY;
const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET_KEY;
const workflowId = process.env.DIDIT_WORKFLOW_ID;
const baseUrl = process.env.DIDIT_BASE_URL;

console.log('\n🔑 VARIABLES CARGADAS:');
console.log(`   DIDIT_API_KEY: ${apiKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   DIDIT_WEBHOOK_SECRET_KEY: ${webhookSecret ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   DIDIT_WORKFLOW_ID: ${workflowId ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   DIDIT_BASE_URL: ${baseUrl ? '✅ Configurada' : '❌ No configurada'}`);

if (!apiKey || !webhookSecret || !workflowId || !baseUrl) {
  console.log('\n❌ ERROR: Faltan variables de entorno requeridas');
  console.log('🔧 SOLUCIÓN:');
  console.log('1. Verifica que el archivo .env.local existe');
  console.log('2. Reinicia el servidor de desarrollo');
  console.log('3. Ejecuta: npm run dev');
  process.exit(1);
}

// Datos de prueba
const testDoctorData = {
  firstName: 'Dr. María',
  lastName: 'González Pérez',
  email: 'maria.gonzalez.test@medicina.com',
  phone: '+525512345678',
  licenseNumber: 'MED987654321',
  specialty: 'general_medicine',
  documentType: 'medical_license',
  documentNumber: 'MED987654321'
};

console.log('\n👤 DATOS DE PRUEBA:');
console.log(`   Nombre: ${testDoctorData.firstName} ${testDoctorData.lastName}`);
console.log(`   Email: ${testDoctorData.email}`);
console.log(`   Cédula: ${testDoctorData.licenseNumber}`);

// Función para probar la creación de sesión
async function testDiditSession() {
  console.log('\n🔐 PROBANDO CREACIÓN DE SESIÓN DIDIT...');
  
  const sessionConfig = {
    workflow_id: workflowId,
    callback: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/didit/callback`,
    vendor_data: testDoctorData.licenseNumber,
    metadata: {
      platform: 'platform-medicos',
      verification_type: 'doctor_registration',
      specialty: testDoctorData.specialty,
      firstName: testDoctorData.firstName,
      lastName: testDoctorData.lastName,
      documentType: testDoctorData.documentType,
      documentNumber: testDoctorData.documentNumber
    },
    contact_details: {
      email: testDoctorData.email,
      email_lang: 'es',
      phone: testDoctorData.phone
    }
  };

  try {
    console.log('📡 Enviando solicitud a Didit...');
    console.log(`   URL: ${baseUrl}/v2/session/`);
    console.log(`   Workflow ID: ${workflowId}`);
    console.log(`   API Key: ${apiKey.substring(0, 10)}...`);

    const response = await fetch(`${baseUrl}/v2/session/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Platform-Medicos/1.0'
      },
      body: JSON.stringify(sessionConfig)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Didit API Error: ${response.status} - ${response.statusText}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ SESIÓN DIDIT CREADA EXITOSAMENTE!');
    console.log(`   Session ID: ${result.session_id}`);
    console.log(`   Session Token: ${result.session_token}`);
    console.log(`   Verification URL: ${result.url}`);
    console.log(`   Status: ${result.status}`);

    console.log('\n🎉 ¡LA INTEGRACIÓN DIDIT ESTÁ FUNCIONANDO!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. ✅ Reinicia el servidor: npm run dev');
    console.log('2. ✅ Ve a: http://localhost:3000/auth/register/doctor');
    console.log('3. ✅ Completa el formulario hasta verificación');
    console.log('4. ✅ Haz clic en "Iniciar Verificación de Identidad"');
    console.log('5. ✅ La verificación debería funcionar sin errores');

    return result;

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n🔧 PROBLEMA: API Key inválida');
      console.log('💡 SOLUCIÓN: Verifica que la API Key sea correcta en .env.local');
    }
    
    if (error.message.includes('workflow_id')) {
      console.log('\n🔧 PROBLEMA: Workflow ID inválido');
      console.log('💡 SOLUCIÓN: Verifica que el Workflow ID sea correcto en .env.local');
    }
    
    console.log('\n🔍 Revisar logs para más detalles');
    throw error;
  }
}

// Ejecutar la prueba
testDiditSession()
  .then(() => {
    console.log('\n🏥 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
  })
  .catch((error) => {
    console.log('\n❌ PRUEBA FALLIDA');
    process.exit(1);
  });
