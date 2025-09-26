/**
 * Script de diagnóstico para problemas de registro
 */

// 1. Probar validación de teléfono
async function testPhoneValidation() {
  console.log('🔍 Probando validación de teléfono...');
  
  const testPhone = '+584121234567';
  
  try {
    const response = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: testPhone }),
    });
    
    const result = await response.json();
    console.log('📱 Resultado validación teléfono:', result);
    
    if (!result.isAvailable) {
      console.log('❌ PROBLEMA: Teléfono marcado como no disponible cuando debería estar disponible');
      console.log('🔍 Verificar:');
      console.log('  - Tabla profiles está vacía:', result.source);
      console.log('  - Tabla doctor_registrations está vacía:', result.source);
    } else {
      console.log('✅ Validación de teléfono funciona correctamente');
    }
  } catch (error) {
    console.error('❌ Error en validación de teléfono:', error);
  }
}

// 2. Probar envío de código de verificación
async function testEmailVerification() {
  console.log('🔍 Probando envío de código de verificación...');
  
  const testEmail = 'test@example.com';
  
  try {
    const response = await fetch('/api/auth/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const result = await response.json();
    console.log('📧 Resultado envío código:', result);
    
    if (result.success) {
      console.log('✅ Envío de código funciona correctamente');
      console.log('🔍 Verificar consola del servidor para ver el código generado');
    } else {
      console.log('❌ PROBLEMA: No se pudo enviar código de verificación');
    }
  } catch (error) {
    console.error('❌ Error en envío de código:', error);
  }
}

// 3. Verificar errores de JavaScript
function checkJavaScriptErrors() {
  console.log('🔍 Verificando errores de JavaScript...');
  
  // Verificar si hay errores en la consola
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Restaurar después de un tiempo
  setTimeout(() => {
    console.error = originalError;
    
    if (errors.length > 0) {
      console.log('❌ PROBLEMA: Errores de JavaScript detectados:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ No se detectaron errores de JavaScript');
    }
  }, 2000);
}

// Ejecutar todas las pruebas
async function runDiagnostics() {
  console.log('🚀 Iniciando diagnóstico de problemas...\n');
  
  await testPhoneValidation();
  console.log('');
  
  await testEmailVerification();
  console.log('');
  
  checkJavaScriptErrors();
  
  console.log('\n📋 Resumen de problemas encontrados:');
  console.log('1. Si el teléfono aparece como "no disponible" cuando debería estar disponible:');
  console.log('   - Verificar que las tablas profiles y doctor_registrations estén vacías');
  console.log('   - Revisar la lógica de validación en PhoneValidationService');
  console.log('');
  console.log('2. Si no llegan los emails de verificación:');
  console.log('   - Verificar configuración de Supabase Auth > Email Templates');
  console.log('   - Revisar logs del servidor para códigos generados');
  console.log('   - Verificar que la tabla email_verification_codes existe');
  console.log('');
  console.log('3. Si hay errores de JavaScript:');
  console.log('   - Verificar sintaxis en archivos TypeScript/JavaScript');
  console.log('   - Revisar caracteres especiales o problemas de encoding');
  console.log('   - Limpiar caché del navegador y reconstruir');
}

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  runDiagnostics();
} else {
  console.log('Ejecutar este script en la consola del navegador');
}
