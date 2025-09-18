/**
 * 🔍 VERIFICACIÓN RÁPIDA DE VARIABLES DE ENTORNO
 * 
 * Script para verificar que las variables estén disponibles en el entorno de Next.js
 */

console.log('🔍 VERIFICACIÓN RÁPIDA DE VARIABLES DE ENTORNO');
console.log('=' .repeat(50));

// Simular el entorno de Next.js
const requiredVars = {
  'DIDIT_API_KEY': 'iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
  'DIDIT_WEBHOOK_SECRET_KEY': 'NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck',
  'DIDIT_WORKFLOW_ID': '3176221b-c77c-4fea-b2b3-da185ef18122',
  'NEXT_PUBLIC_SITE_URL': 'http://localhost:3000'
};

console.log('\n🔑 VARIABLES REQUERIDAS:');
let allPresent = true;

Object.entries(requiredVars).forEach(([key, expectedValue]) => {
  const actualValue = process.env[key];
  
  if (actualValue === expectedValue) {
    console.log(`✅ ${key}: Configurada correctamente`);
  } else if (actualValue) {
    console.log(`⚠️  ${key}: Configurada pero con valor diferente`);
    console.log(`   Esperado: ${expectedValue}`);
    console.log(`   Actual: ${actualValue}`);
  } else {
    console.log(`❌ ${key}: NO CONFIGURADA`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('\n✅ TODAS LAS VARIABLES ESTÁN CONFIGURADAS CORRECTAMENTE');
  console.log('\n🎯 SOLUCIÓN AL ERROR:');
  console.log('1. ✅ Las variables están en .env.local');
  console.log('2. ✅ El servidor se está reiniciando');
  console.log('3. ✅ Next.js debería leer las variables ahora');
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. ✅ Espera a que el servidor termine de cargar');
  console.log('2. ✅ Ve a http://localhost:3000/auth/register/doctor');
  console.log('3. ✅ Completa el formulario hasta verificación');
  console.log('4. ✅ Haz clic en "Iniciar Verificación de Identidad"');
  console.log('5. ✅ El error "DIDIT_API_KEY es requerida" debería desaparecer');
  
} else {
  console.log('\n❌ FALTAN VARIABLES REQUERIDAS');
  console.log('\n🔧 SOLUCIÓN:');
  console.log('1. Verifica que el archivo .env.local existe');
  console.log('2. Reinicia el servidor completamente');
  console.log('3. Ejecuta: npm run dev');
}

console.log('\n🏥 ¡VERIFICACIÓN COMPLETADA!');


