/**
 * Script de prueba para verificar el scraping de SACs
 * Prueba con la cédula V-13266929
 */

const { validateVenezuelanMedicalLicense } = require('./src/lib/validators/professional-license-validator.ts');

async function testScraping() {
  console.log('🔍 Iniciando prueba de scraping con cédula V-13266929...');
  
  try {
    const result = await validateVenezuelanMedicalLicense({
      documentType: 'cedula_identidad',
      documentNumber: 'V-13266929'
    });
    
    console.log('✅ Resultado del scraping:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.isValid) {
      console.log('🎉 ¡Scraping exitoso! La cédula está registrada.');
      if (result.doctorName) {
        console.log(`👨‍⚕️ Médico: ${result.doctorName}`);
      }
      if (result.specialty) {
        console.log(`🏥 Especialidad: ${result.specialty}`);
      }
    } else {
      console.log('❌ La cédula no se pudo verificar.');
    }
    
  } catch (error) {
    console.error('💥 Error durante el scraping:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testScraping();
