/**
 * 🔍 VERIFICADOR DE CONFIGURACIÓN SUPABASE
 * 
 * Script para verificar la configuración completa de Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE SUPABASE');
console.log('=' .repeat(50));

// Función para cargar variables de entorno desde .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Archivo .env.local no encontrado');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

// Cargar variables de entorno
const envVars = loadEnvFile();

// Variables requeridas para Supabase
const requiredSupabaseVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Variables requeridas para Didit
const requiredDiditVars = [
  'DIDIT_API_KEY',
  'DIDIT_WEBHOOK_SECRET_KEY',
  'DIDIT_BASE_URL',
  'DIDIT_WORKFLOW_ID'
];

// Variables opcionales
const optionalVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NODE_ENV',
  'DIDIT_WEBHOOK_URL'
];

console.log('\n🏥 CONFIGURACIÓN SUPABASE:');
let supabaseOk = true;
requiredSupabaseVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    supabaseOk = false;
  }
});

console.log('\n🔐 CONFIGURACIÓN DIDIT:');
let diditOk = true;
requiredDiditVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    diditOk = false;
  }
});

console.log('\n🔧 VARIABLES OPCIONALES:');
optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: NO CONFIGURADA`);
  }
});

console.log('\n📊 RESUMEN:');
if (supabaseOk && diditOk) {
  console.log('✅ CONFIGURACIÓN COMPLETA');
  console.log('🚀 Supabase y Didit están configurados correctamente');
  
  console.log('\n🎯 ESTADO DEL PROYECTO:');
  console.log('✅ Variables de entorno: Configuradas');
  console.log('✅ Supabase URL: ' + envVars['NEXT_PUBLIC_SUPABASE_URL']);
  console.log('✅ Didit API: Configurada');
  console.log('✅ Workflow ID: ' + envVars['DIDIT_WORKFLOW_ID']);
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. ✅ Ejecuta: npm run dev');
  console.log('2. ✅ Ve a: http://localhost:3000/auth/register/doctor');
  console.log('3. ✅ Completa el registro de médico');
  console.log('4. ✅ Prueba la verificación Didit');
  
} else {
  console.log('❌ CONFIGURACIÓN INCOMPLETA');
  if (!supabaseOk) {
    console.log('❌ Faltan variables de Supabase');
  }
  if (!diditOk) {
    console.log('❌ Faltan variables de Didit');
  }
  
  console.log('\n🔧 SOLUCIÓN:');
  console.log('1. Verifica el archivo .env.local');
  console.log('2. Asegúrate de que todas las variables estén configuradas');
  console.log('3. Reinicia el servidor: npm run dev');
}

console.log('\n🏥 ¡VERIFICACIÓN COMPLETADA!');
