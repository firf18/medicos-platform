// Script para probar el envío de código de verificación
// Ejecutar en la consola del navegador

async function testEmailVerification() {
  const testEmail = 'test@example.com';
  
  console.log('🔍 Probando envío de código de verificación:', testEmail);
  
  try {
    const response = await fetch('/api/auth/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const result = await response.json();
    console.log('📧 Resultado:', result);
    
    if (result.success) {
      console.log('✅ Código enviado correctamente');
      console.log('🔍 Verificar consola del servidor para ver el código generado');
      console.log('📝 El código se muestra en la consola del servidor porque Supabase no está configurado para emails');
    } else {
      console.log('❌ PROBLEMA: No se pudo enviar código');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar prueba
testEmailVerification();
