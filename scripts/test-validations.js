/**
 * 🧪 SCRIPT DE PRUEBA PARA VALIDACIONES
 * 
 * Script para probar las validaciones del formulario de registro
 * de médicos venezolanos
 * 
 * Uso: node scripts/test-validations.js
 */

// ============================================================================
// FUNCIONES DE VALIDACIÓN (COPIADAS PARA TESTING)
// ============================================================================

/**
 * Valida números de teléfono venezolanos
 */
function validateVenezuelanPhone(phone) {
  const venezuelanPhoneRegex = /^\+58[24]\d{9}$/;
  return venezuelanPhoneRegex.test(phone);
}

/**
 * Valida email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Verificar formato básico
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Verificar que no tenga puntos consecutivos
  if (email.includes('..')) {
    return false;
  }
  
  return true;
}

/**
 * Valida nombres
 */
function validateName(name) {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return name.trim().length >= 2 && nameRegex.test(name);
}

/**
 * Valida contraseña profesional
 */
function validatePasswordStrength(password) {
  const errors = [];
  let score = 0;
  
  // Longitud mínima para médicos
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  } else {
    score += 25;
  }
  
  // Mayúscula requerida
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  } else {
    score += 25;
  }
  
  // Minúscula requerida
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  } else {
    score += 25;
  }
  
  // Número requerido
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  } else {
    score += 25;
  }
  
  // Caracteres especiales son opcionales pero suman puntos
  if (/[@$!%*?&._-]/.test(password)) {
    score += 10; // Bonus por caracteres especiales
  }
  
  // Verificar que no contenga información personal común
  const commonPatterns = ['123456', 'password', 'admin', 'qwerty'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('No debe contener patrones comunes como "123456", "password", etc.');
    score -= 20;
  }
  
  // Verificar longitud adicional (bonus)
  if (password.length >= 8) {
    score += 10; // Bonus por longitud extra
  }
  
  // Verificar diversidad de caracteres
  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars >= 8) {
    score += 10; // Bonus por diversidad
  }
  
  return {
    isValid: errors.length === 0 && score >= 75,
    errors,
    score: Math.min(100, Math.max(0, score))
  };
}

// ============================================================================
// CASOS DE PRUEBA
// ============================================================================

const testCases = {
  phones: [
    // Válidos
    { input: '+584241234567', expected: true, description: 'Móvil Movilnet válido' },
    { input: '+584161234567', expected: true, description: 'Móvil Movistar válido' },
    { input: '+584121234567', expected: true, description: 'Móvil Digitel válido' },
    { input: '+582121234567', expected: true, description: 'Fijo Caracas válido' },
    { input: '+582611234567', expected: true, description: 'Fijo Maracaibo válido' },
    
    // Inválidos
    { input: '+581234567890', expected: false, description: 'Código de área inválido' },
    { input: '+58424123456', expected: false, description: 'Muy corto' },
    { input: '+5842412345678', expected: false, description: 'Muy largo' },
    { input: '04241234567', expected: false, description: 'Sin código de país' },
    { input: '+1234567890', expected: false, description: 'País incorrecto' },
    { input: '+58424123456a', expected: false, description: 'Contiene letras' }
  ],
  
  emails: [
    // Válidos
    { input: 'doctor@gmail.com', expected: true, description: 'Email básico válido' },
    { input: 'dr.carlos@hospital.org.ve', expected: true, description: 'Email profesional válido' },
    { input: 'medico123@yahoo.com', expected: true, description: 'Email con números válido' },
    
    // Inválidos
    { input: 'doctor', expected: false, description: 'Sin @ ni dominio' },
    { input: 'doctor@', expected: false, description: 'Sin dominio' },
    { input: '@gmail.com', expected: false, description: 'Sin usuario' },
    { input: 'doctor@gmail', expected: false, description: 'Sin TLD' },
    { input: 'doctor..test@gmail.com', expected: false, description: 'Puntos consecutivos' }
  ],
  
  names: [
    // Válidos
    { input: 'Carlos', expected: true, description: 'Nombre simple válido' },
    { input: 'María José', expected: true, description: 'Nombre compuesto válido' },
    { input: 'José María', expected: true, description: 'Nombre con acentos válido' },
    { input: 'Ñoño', expected: true, description: 'Nombre con ñ válido' },
    
    // Inválidos
    { input: 'C', expected: false, description: 'Muy corto' },
    { input: 'Carlos123', expected: false, description: 'Con números' },
    { input: 'Carlos@', expected: false, description: 'Con símbolos' },
    { input: '', expected: false, description: 'Vacío' },
    { input: '   ', expected: false, description: 'Solo espacios' }
  ],
  
  passwords: [
    // Válidas
    { input: 'Medico123', expected: true, description: 'Contraseña básica válida' },
    { input: 'Seguro2024', expected: true, description: 'Contraseña profesional válida' },
    { input: 'Venezuela123', expected: true, description: 'Contraseña larga válida' },
    { input: 'Hospital2024!', expected: true, description: 'Contraseña con especiales válida' },
    { input: 'Carlos123', expected: true, description: 'Contraseña simple válida' },
    { input: 'Maria456', expected: true, description: 'Contraseña nombre válida' },
    
    // Inválidas
    { input: 'password', expected: false, description: 'Patrón común' },
    { input: '123456789', expected: false, description: 'Solo números' },
    { input: 'PASSWORD', expected: false, description: 'Solo mayúsculas' },
    { input: 'password123', expected: false, description: 'Patrón común con números' },
    { input: 'Ab1', expected: false, description: 'Muy corta' },
    { input: 'admin123456', expected: false, description: 'Patrón común admin' }
  ]
};

// ============================================================================
// FUNCIÓN DE PRUEBA
// ============================================================================

function runTest(testName, testFunction, testCases) {
  console.log(`\n🧪 PROBANDO ${testName.toUpperCase()}`);
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = testFunction(testCase.input);
    const success = result === testCase.expected || (typeof result === 'object' && result.isValid === testCase.expected);
    
    if (success) {
      console.log(`✅ ${index + 1}. ${testCase.description}`);
      console.log(`   Input: "${testCase.input}" → ${result === true || (result && result.isValid) ? 'VÁLIDO' : 'INVÁLIDO'}`);
      passed++;
    } else {
      console.log(`❌ ${index + 1}. ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Esperado: ${testCase.expected ? 'VÁLIDO' : 'INVÁLIDO'}`);
      console.log(`   Obtenido: ${result === true || (result && result.isValid) ? 'VÁLIDO' : 'INVÁLIDO'}`);
      if (typeof result === 'object' && result.errors) {
        console.log(`   Errores: ${result.errors.join(', ')}`);
      }
      failed++;
    }
  });
  
  console.log(`\n📊 Resultados: ${passed} ✅ | ${failed} ❌`);
  return { passed, failed };
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS DE VALIDACIÓN PARA MÉDICOS VENEZOLANOS');
  console.log('='.repeat(70));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Probar teléfonos
  const phoneResults = runTest('Teléfonos Venezolanos', validateVenezuelanPhone, testCases.phones);
  totalPassed += phoneResults.passed;
  totalFailed += phoneResults.failed;
  
  // Probar emails
  const emailResults = runTest('Emails', validateEmail, testCases.emails);
  totalPassed += emailResults.passed;
  totalFailed += emailResults.failed;
  
  // Probar nombres
  const nameResults = runTest('Nombres', validateName, testCases.names);
  totalPassed += nameResults.passed;
  totalFailed += nameResults.failed;
  
  // Probar contraseñas
  const passwordResults = runTest('Contraseñas', validatePasswordStrength, testCases.passwords);
  totalPassed += passwordResults.passed;
  totalFailed += passwordResults.failed;
  
  // Resumen final
  console.log('\n' + '='.repeat(70));
  console.log('📋 RESUMEN FINAL DE PRUEBAS');
  console.log('='.repeat(70));
  console.log(`Total de pruebas: ${totalPassed + totalFailed}`);
  console.log(`Exitosas: ${totalPassed} ✅`);
  console.log(`Fallidas: ${totalFailed} ❌`);
  console.log(`Porcentaje de éxito: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! Las validaciones están funcionando correctamente.');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisa las validaciones que necesitan corrección.');
  }
  
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Corregir las validaciones que fallaron');
  console.log('   2. Probar en la interfaz de usuario');
  console.log('   3. Verificar que los errores se muestren correctamente');
  console.log('   4. Probar el flujo completo de registro');
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

if (require.main === module) {
  runAllTests();
}

module.exports = {
  validateVenezuelanPhone,
  validateEmail,
  validateName,
  validatePasswordStrength,
  testCases
};