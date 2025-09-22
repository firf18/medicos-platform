/**
 * 🔍 PRUEBA ESPECÍFICA: CÉDULA 15229045
 * 
 * Script para probar por qué la cédula 15229045 no muestra especialidades
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🔍 PRUEBA ESPECÍFICA: CÉDULA 15229045');
console.log('='.repeat(60));

// Datos de prueba para la cédula específica
const testData = {
  documentType: 'cedula_identidad',
  documentNumber: 'V-15229045',
  firstName: 'Test',
  lastName: 'Doctor'
};

/**
 * Probar verificación de licencia para la cédula específica
 */
async function testSpecificCedula() {
  console.log('\n🔍 PROBANDO CÉDULA ESPECÍFICA: V-15229045');
  console.log('-'.repeat(50));

  try {
    console.log('📡 Enviando solicitud de verificación...');
    console.log(`   Documento: ${testData.documentNumber}`);
    console.log(`   Tipo: ${testData.documentType}`);

    const response = await fetch('http://localhost:3000/api/license-verification-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN VERIFICACIÓN:');
      console.log(`   Error: ${errorText}`);
      return null;
    }

    const result = await response.json();
    
    console.log('✅ RESULTADO DE VERIFICACIÓN:');
    console.log(`   Success: ${result.success}`);
    
    if (result.result) {
      console.log(`   Valid: ${result.result.isValid}`);
      console.log(`   Verified: ${result.result.isVerified}`);
      console.log(`   Doctor Name: ${result.result.doctorName || 'N/A'}`);
      console.log(`   License Status: ${result.result.licenseStatus || 'N/A'}`);
      console.log(`   Specialty: ${result.result.specialty || 'N/A'}`);
      console.log(`   Verification Source: ${result.result.verificationSource || 'N/A'}`);
      
      if (!result.result.specialty || result.result.specialty === 'N/A') {
        console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
        console.log('   La cédula no tiene especialidad registrada');
        console.log('   Esto puede significar:');
        console.log('   1. El médico no tiene especialidad (solo medicina general)');
        console.log('   2. La especialidad no se detectó correctamente');
        console.log('   3. Error en el scraping de datos');
      }
    } else {
      console.log('❌ No se obtuvieron resultados');
    }

    return result;

  } catch (error) {
    console.log('❌ ERROR EN PRUEBA:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Probar directamente el validador de licencias
 */
async function testDirectValidator() {
  console.log('\n🔧 PROBANDO VALIDADOR DIRECTO');
  console.log('-'.repeat(50));

  try {
    // Importar el validador directamente
    const { validateVenezuelanMedicalLicense } = require('../src/lib/validators/professional-license-validator');
    
    console.log('📡 Ejecutando validación directa...');
    
    const result = await validateVenezuelanMedicalLicense({
      documentType: testData.documentType,
      documentNumber: testData.documentNumber,
      firstName: testData.firstName,
      lastName: testData.lastName
    });
    
    console.log('✅ RESULTADO DEL VALIDADOR DIRECTO:');
    console.log(`   Valid: ${result.isValid}`);
    console.log(`   Verified: ${result.isVerified}`);
    console.log(`   Doctor Name: ${result.doctorName || 'N/A'}`);
    console.log(`   License Status: ${result.licenseStatus || 'N/A'}`);
    console.log(`   Specialty: ${result.specialty || 'N/A'}`);
    console.log(`   Verification Source: ${result.verificationSource || 'N/A'}`);
    
    return result;

  } catch (error) {
    console.log('❌ ERROR EN VALIDADOR DIRECTO:');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

/**
 * Analizar el problema de especialidades múltiples
 */
function analyzeSpecialtyIssue() {
  console.log('\n📊 ANÁLISIS DEL PROBLEMA DE ESPECIALIDADES');
  console.log('-'.repeat(50));

  console.log('🎯 PROBLEMA IDENTIFICADO:');
  console.log('');
  console.log('   La cédula V-15229045 no muestra especialidades porque:');
  console.log('');
  console.log('   1. ❌ El médico puede no tener especialidad registrada');
  console.log('   2. ❌ La especialidad puede no detectarse correctamente');
  console.log('   3. ❌ El scraping puede fallar para esta cédula específica');
  console.log('   4. ❌ El médico puede tener múltiples especialidades no detectadas');
  console.log('');
  console.log('🔧 SOLUCIONES PROPUESTAS:');
  console.log('');
  console.log('   1. ✅ Mejorar la detección de especialidades múltiples');
  console.log('   2. ✅ Mostrar "Sin especialidad" cuando no hay especialidad');
  console.log('   3. ✅ Mostrar todas las especialidades cuando hay múltiples');
  console.log('   4. ✅ Mejorar el scraping para detectar especialidades');
  console.log('   5. ✅ Agregar logs detallados para debugging');
}

/**
 * Función principal de prueba
 */
async function runTest() {
  console.log('🚀 INICIANDO PRUEBA ESPECÍFICA...\n');

  // 1. Probar verificación de licencia
  await testSpecificCedula();

  // 2. Probar validador directo
  await testDirectValidator();

  // 3. Analizar el problema
  analyzeSpecialtyIssue();

  console.log('\n' + '='.repeat(60));
  console.log('✅ PRUEBA ESPECÍFICA COMPLETADA');
  console.log('');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('');
  console.log('   1. ✅ Verificar si el servidor está ejecutándose: npm run dev');
  console.log('   2. ✅ Revisar los logs del servidor para errores');
  console.log('   3. ✅ Mejorar la detección de especialidades múltiples');
  console.log('   4. ✅ Implementar lógica para mostrar "Sin especialidad"');
  console.log('   5. ✅ Agregar logs detallados para debugging');
  console.log('');
  console.log('🎯 El problema de especialidades debe ser investigado más a fondo');
}

// Ejecutar prueba
if (require.main === module) {
  runTest().catch(error => {
    console.error('❌ Error ejecutando prueba:', error);
    process.exit(1);
  });
}

module.exports = {
  testSpecificCedula,
  testDirectValidator,
  analyzeSpecialtyIssue
};
