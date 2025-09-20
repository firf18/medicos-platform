import { validateVenezuelanMedicalLicense } from '../lib/validators/professional-license-validator';
import { closeLicenseValidator } from '../lib/validators/professional-license-validator';

async function testLicenseVerification() {
  console.log('Iniciando prueba de verificación de licencia...');
  
  try {
    // Probar con la cédula proporcionada: 7983901
    // Para cédula venezolana, el formato debe ser V-XXXXXXXX o E-XXXXXXXX
    const result = await validateVenezuelanMedicalLicense({
      documentType: 'cedula_identidad',
      documentNumber: 'V-7983901'  // Formato correcto para cédula venezolana
    });
    
    console.log('Resultado de la verificación:');
    console.log(JSON.stringify(result, null, 2));
    
    // También probamos con el formato E
    console.log('\n--- Probando con formato E ---');
    const result2 = await validateVenezuelanMedicalLicense({
      documentType: 'cedula_identidad',
      documentNumber: 'E-7983901'
    });
    
    console.log('Resultado de la verificación (E):');
    console.log(JSON.stringify(result2, null, 2));
    
  } catch (error) {
    console.error('Error durante la prueba:', error);
  } finally {
    // Cerrar el validador para liberar recursos
    await closeLicenseValidator();
    console.log('Validador cerrado.');
  }
}

// Ejecutar la prueba
testLicenseVerification().catch(console.error);