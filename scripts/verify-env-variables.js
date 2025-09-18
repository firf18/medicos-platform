/**
 * 🔍 VERIFICADOR DE VARIABLES DE ENTORNO
 * 
 * Script para verificar que las variables de Didit estén configuradas correctamente
 */

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO PARA DIDIT');
console.log('=' .repeat(50));

// Verificar variables de entorno
const requiredVars = [
  'DIDIT_API_KEY',
  'DIDIT_WEBHOOK_SECRET_KEY',
  'DIDIT_BASE_URL',
  'DIDIT_WORKFLOW_ID',
  'NEXT_PUBLIC_SITE_URL'
];

const optionalVars = [
  'DIDIT_WEBHOOK_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NODE_ENV'
];

console.log('\n🔑 VARIABLES REQUERIDAS:');
let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allRequiredPresent = false;
  }
});

console.log('\n🔧 VARIABLES OPCIONALES:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`⚠️  ${varName}: NO CONFIGURADA`);
  }
});

console.log('\n📊 RESUMEN:');
if (allRequiredPresent) {
  console.log('✅ Todas las variables requeridas están configuradas');
  console.log('🚀 El registro de médicos debería funcionar correctamente');
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. ✅ Reinicia el servidor de desarrollo (npm run dev)');
  console.log('2. ✅ Ve a http://localhost:3000/auth/register/doctor');
  console.log('3. ✅ Completa el formulario hasta el paso de verificación');
  console.log('4. ✅ Haz clic en "Iniciar Verificación de Identidad"');
  console.log('5. ✅ La verificación Didit debería funcionar sin errores');
  
} else {
  console.log('❌ Faltan variables requeridas');
  console.log('🔧 SOLUCIÓN:');
  console.log('1. Asegúrate de que el archivo .env.local existe');
  console.log('2. Verifica que contiene todas las variables requeridas');
  console.log('3. Reinicia el servidor después de hacer cambios');
}

console.log('\n🏥 ¡VERIFICACIÓN COMPLETADA!');
