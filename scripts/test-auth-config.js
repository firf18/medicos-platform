#!/usr/bin/env node

/**
 * Script para probar la configuración de autenticación
 * Verifica si Supabase está enviando códigos OTP correctamente
 */

const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const [key, value] = line.split('=');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value;
      } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        supabaseAnonKey = value;
      }
    });
  }
} catch (error) {
  console.log('⚠️  No se pudo leer .env.local');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan las variables de entorno de Supabase en .env.local');
  console.log('Asegúrate de tener estas variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima');
  process.exit(1);
}

async function testAuthConfiguration() {
  console.log('🧪 Probando configuración de autenticación...\n');
  
  console.log('Para probar completamente la configuración:');
  console.log('1. Ve a tu aplicación en el navegador');
  console.log('2. Intenta registrarte con un email real');
  console.log('3. Verifica si recibes un código de 6 dígitos o un enlace');
  console.log('4. Si recibes un enlace, necesitas configurar las plantillas en Supabase Dashboard');
  
  console.log('\n✅ URLs de configuración:');
  console.log(`   Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '')}`);
  console.log('   Sección: Authentication → Settings → Email Templates');
}

async function checkSupabaseSettings() {
  console.log('\n🔍 Verificando configuración de Supabase...\n');

  try {
    if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
      console.log('✅ URL de Supabase válida');
    } else {
      console.log('⚠️  Verifica la URL de Supabase');
    }
    
    if (supabaseAnonKey && supabaseAnonKey.length > 50) {
      console.log('✅ Clave anónima encontrada');
    } else {
      console.log('⚠️  Verifica la clave anónima de Supabase');
    }

    console.log('\n📋 Configuración recomendada para Supabase Dashboard:');
    console.log('   Authentication → Settings:');
    console.log('   • Enable email confirmations: ✅');
    console.log('   • Enable email change confirmations: ✅');
    console.log('   • Secure email change: ✅');
    console.log('   • Double confirm email changes: ✅');
    console.log('   • Enable phone confirmations: ❌ (opcional)');
    console.log('\n   URL Configuration:');
    console.log('   • Site URL: http://localhost:3000');
    console.log('   • Redirect URLs: http://localhost:3000/auth/verify-email');
    console.log('\n   Email Templates:');
    console.log('   • Usar plantillas personalizadas con {{ .Token }}');
    console.log('   • No incluir enlaces de confirmación automática');

  } catch (error) {
    console.error('❌ Error verificando configuración:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  await testAuthConfiguration();
  await checkSupabaseSettings();
  
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Configura las plantillas de email en Supabase Dashboard');
  console.log('2. Asegúrate de que las plantillas usen {{ .Token }}');
  console.log('3. Verifica que no incluyan enlaces automáticos');
  console.log('4. Prueba el flujo completo registrándote en la aplicación');
  
  process.exit(0);
}

runTests().catch(console.error);