/**
 * Script de prueba para verificar la integración SACS
 * Simula exactamente el flujo que debe ocurrir cuando el usuario escribe una cédula
 */

const { validateVenezuelanMedicalLicense } = require('../src/lib/validators/professional-license-validator.ts');

async function testSacsIntegration() {
  console.log('🧪 Iniciando prueba de integración SACS...');
  
  const testCases = [
    {
      name: 'Médico con especialidad (caso exitoso)',
      cedula: 'V-13266929',
      expectedName: 'ANGHINIE DEONORA  SANCHEZ RODRIGUEZ',
      expectedSpecialty: 'ESPECIALISTA EN MEDICINA INTERNA'
    },
    {
      name: 'Cédula inexistente',
      cedula: 'V-99999999',
      expectedValid: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Probando: ${testCase.name}`);
    console.log(`🔍 Cédula: ${testCase.cedula}`);
    
    try {
      const result = await validateVenezuelanMedicalLicense({
        documentType: testCase.cedula.startsWith('E-') ? 'cedula_extranjera' : 'cedula_identidad',
        documentNumber: testCase.cedula
      });

      console.log('📊 Resultado:', {
        isValid: result.isValid,
        isVerified: result.isVerified,
        doctorName: result.doctorName,
        specialty: result.specialty,
        verificationSource: result.verificationSource
      });

      // Validaciones específicas
      if (testCase.expectedName && result.doctorName !== testCase.expectedName) {
        console.warn(`⚠️ Nombre esperado: ${testCase.expectedName}, obtenido: ${result.doctorName}`);
      }

      if (testCase.expectedSpecialty && result.specialty !== testCase.expectedSpecialty) {
        console.warn(`⚠️ Especialidad esperada: ${testCase.expectedSpecialty}, obtenida: ${result.specialty}`);
      }

      if (testCase.expectedValid === false && result.isValid) {
        console.warn(`⚠️ Se esperaba que fuera inválido pero resultó válido`);
      }

      console.log(`✅ Prueba completada para: ${testCase.name}`);

    } catch (error) {
      console.error(`❌ Error en prueba ${testCase.name}:`, error.message);
    }
  }

  console.log('\n🏁 Pruebas de integración SACS completadas');
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  testSacsIntegration().catch(console.error);
}

module.exports = { testSacsIntegration };
