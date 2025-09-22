/**
 * Script para probar el endpoint de verificación durante registro
 */

async function testRegistrationEndpoint() {
  console.log('🧪 Probando endpoint de verificación durante registro...');
  
  const testData = {
    documentType: 'cedula_identidad',
    documentNumber: 'V-13266929',
    firstName: 'ANGHINIE',
    lastName: 'SANCHEZ RODRIGUEZ'
  };

  try {
    console.log('📤 Enviando solicitud a /api/license-verification-registration');
    console.log('📋 Datos:', { ...testData, documentNumber: testData.documentNumber.replace(/\d/g, 'X') });

    const response = await fetch('http://localhost:3000/api/license-verification-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Respuesta exitosa:', {
        success: result.success,
        isValid: result.result?.isValid,
        isVerified: result.result?.isVerified,
        doctorName: result.result?.doctorName,
        specialty: result.result?.specialty,
        verificationSource: result.result?.verificationSource
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', errorText);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar si es script principal
if (typeof window === 'undefined' && require.main === module) {
  testRegistrationEndpoint();
}

module.exports = { testRegistrationEndpoint };
