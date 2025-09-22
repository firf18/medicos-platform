/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA DEL 15%
 * 
 * Script para diagnosticar por qué el progreso se queda en 15% y no avanza
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🔍 DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA DEL 15%');
console.log('='.repeat(60));

/**
 * Probar creación de sesión
 */
async function testSessionCreation() {
  console.log('\n📡 PROBANDO CREACIÓN DE SESIÓN');
  console.log('-'.repeat(40));

  try {
    const testData = {
      doctor_id: 'V-TEST123456',
      first_name: 'Test',
      last_name: 'Doctor',
      date_of_birth: '1990-01-01',
      nationality: 'Venezuelan',
      document_number: 'V-TEST123456',
      email: 'test@test.com',
      phone: '+584241234567'
    };

    console.log('📤 Enviando datos:', testData);

    const response = await fetch('http://localhost:3000/api/didit/doctor-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN CREACIÓN DE SESIÓN:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const sessionData = await response.json();
    
    console.log('✅ SESIÓN CREADA EXITOSAMENTE:');
    console.log(`   Session ID: ${sessionData.session_id}`);
    console.log(`   Status: ${sessionData.status}`);
    console.log(`   Success: ${sessionData.success}`);
    console.log(`   Message: ${sessionData.message}`);

    return sessionData;

  } catch (error) {
    console.log('❌ ERROR EN CREACIÓN DE SESIÓN:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Probar polling de estado
 */
async function testStatusPolling(sessionId, maxAttempts = 10) {
  console.log('\n🔄 PROBANDO POLLING DE ESTADO');
  console.log('-'.repeat(40));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📡 Polling attempt #${attempt} para sesión: ${sessionId}`);

      const response = await fetch(`http://localhost:3000/api/didit/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`   Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ ERROR EN POLLING #${attempt}:`);
        console.log(`   Error: ${errorText}`);
        
        if (attempt < maxAttempts) {
          console.log(`   Esperando 3 segundos antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        } else {
          return null;
        }
      }

      const statusData = await response.json();
      
      console.log(`✅ POLLING #${attempt} EXITOSO:`);
      console.log(`   Session ID: ${statusData.session_id || 'N/A'}`);
      console.log(`   Status: ${statusData.status || 'N/A'}`);
      console.log(`   Decision: ${statusData.decision?.status || 'N/A'}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);

      // Simular lógica de progreso del frontend
      let progress = 15; // Progreso inicial
      let internalStatus = 'user_verifying';

      switch (statusData.status) {
        case 'Not Started':
          progress = 20;
          internalStatus = 'user_verifying';
          break;
        case 'In Progress':
          progress = Math.min(20 + (attempt * 10), 80);
          internalStatus = 'user_verifying';
          break;
        case 'In Review':
          progress = 85;
          internalStatus = 'processing';
          break;
        case 'Approved':
          progress = 100;
          internalStatus = 'completed';
          break;
        case 'Declined':
          progress = 100;
          internalStatus = 'failed';
          break;
        default:
          progress = Math.min(progress + 5, 80);
      }

      console.log(`   Progreso calculado: ${progress}%`);
      console.log(`   Estado interno: ${internalStatus}`);

      // Si está completado, terminar
      if (statusData.status === 'Approved' || statusData.status === 'Declined') {
        console.log('🏁 Verificación completada, terminando polling');
        return statusData;
      }

      // Esperar antes del siguiente polling
      if (attempt < maxAttempts) {
        console.log(`   Esperando 3 segundos antes del siguiente polling...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.log(`❌ ERROR EN POLLING #${attempt}:`);
      console.log(`   Error: ${error.message}`);
      
      if (attempt < maxAttempts) {
        console.log(`   Esperando 3 segundos antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.log(`⚠️ Polling terminado después de ${maxAttempts} intentos`);
  return null;
}

/**
 * Verificar configuración del servidor
 */
async function checkServerConfiguration() {
  console.log('\n🔧 VERIFICANDO CONFIGURACIÓN DEL SERVIDOR');
  console.log('-'.repeat(40));

  try {
    // Verificar que el servidor esté funcionando
    const response = await fetch('http://localhost:3000', {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      }
    });

    console.log(`📡 Servidor Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ Servidor funcionando correctamente');
    } else {
      console.log('❌ Servidor no responde correctamente');
      return false;
    }

    // Verificar endpoint de Didit
    const diditResponse = await fetch('http://localhost:3000/api/didit/doctor-verification', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`📡 Didit Endpoint Status: ${diditResponse.status} ${diditResponse.statusText}`);

    if (diditResponse.ok || diditResponse.status === 405) { // 405 = Method Not Allowed es normal para OPTIONS
      console.log('✅ Endpoint de Didit accesible');
    } else {
      console.log('❌ Endpoint de Didit no accesible');
      return false;
    }

    return true;

  } catch (error) {
    console.log('❌ ERROR VERIFICANDO SERVIDOR:');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Función principal de diagnóstico
 */
async function runDiagnosis() {
  console.log('🚀 INICIANDO DIAGNÓSTICO DEL PROBLEMA DEL 15%...\n');

  // 1. Verificar configuración del servidor
  const serverOk = await checkServerConfiguration();
  if (!serverOk) {
    console.log('\n❌ No se puede continuar sin servidor funcionando');
    console.log('   Ejecuta: npm run dev');
    return;
  }

  // 2. Probar creación de sesión
  const sessionData = await testSessionCreation();
  if (!sessionData) {
    console.log('\n❌ No se puede continuar sin sesión válida');
    return;
  }

  // 3. Probar polling de estado
  const finalStatus = await testStatusPolling(sessionData.session_id);

  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DEL DIAGNÓSTICO');
  console.log('');
  
  if (finalStatus) {
    console.log('✅ DIAGNÓSTICO COMPLETADO EXITOSAMENTE');
    console.log(`   Estado final: ${finalStatus.status}`);
    console.log(`   Decisión: ${finalStatus.decision?.status || 'N/A'}`);
  } else {
    console.log('⚠️ DIAGNÓSTICO COMPLETADO CON PROBLEMAS');
    console.log('   El polling no pudo completarse exitosamente');
  }

  console.log('');
  console.log('🔍 ANÁLISIS DEL PROBLEMA DEL 15%:');
  console.log('');
  console.log('   Si el progreso se queda en 15%, las posibles causas son:');
  console.log('   1. ❌ El polling no se está ejecutando');
  console.log('   2. ❌ El endpoint de status no responde correctamente');
  console.log('   3. ❌ La lógica de progreso en el frontend tiene un bug');
  console.log('   4. ❌ El estado de Didit no está cambiando');
  console.log('   5. ❌ Hay un error JavaScript que impide la ejecución');
  console.log('');
  console.log('🔧 PRÓXIMOS PASOS:');
  console.log('');
  console.log('   1. ✅ Revisa los logs de este script');
  console.log('   2. ✅ Verifica la consola del navegador');
  console.log('   3. ✅ Usa el componente de prueba en /test-didit');
  console.log('   4. ✅ Monitorea el progreso en tiempo real');
  console.log('');
  console.log('📝 NOTAS:');
  console.log('   - El progreso inicial es 15% cuando se crea la sesión');
  console.log('   - Debería avanzar a 20% cuando el estado es "Not Started"');
  console.log('   - Debería incrementar gradualmente durante "In Progress"');
  console.log('   - Debería llegar a 100% cuando está "Approved" o "Declined"');
}

// Ejecutar diagnóstico
if (require.main === module) {
  runDiagnosis().catch(error => {
    console.error('❌ Error ejecutando diagnóstico:', error);
    process.exit(1);
  });
}

module.exports = {
  testSessionCreation,
  testStatusPolling,
  checkServerConfiguration
};
