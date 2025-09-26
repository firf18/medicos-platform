// Script para probar la validación de teléfono
// Ejecutar en la consola del navegador

async function testPhoneValidation() {
  const testPhone = '+584121234567';
  
  console.log('🔍 Probando validación de teléfono:', testPhone);
  
  try {
    const response = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: testPhone }),
    });
    
    const result = await response.json();
    console.log('📱 Resultado:', result);
    
    if (result.isAvailable) {
      console.log('✅ Teléfono está disponible (correcto)');
    } else {
      console.log('❌ PROBLEMA: Teléfono marcado como no disponible');
      console.log('🔍 Verificar logs del servidor para más detalles');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar prueba
testPhoneValidation();
