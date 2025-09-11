#!/usr/bin/env node

/**
 * Script para probar la configuración de email OTP
 * Ejecutar después de configurar las plantillas en Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Función para cargar variables del archivo .env.local
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Archivo .env.local no encontrado');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
}

// Cargar variables de entorno
loadEnvLocal();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailOTP() {
  console.log('🧪 Probando configuración de Email OTP...\n');

  // Email de prueba
  const testEmail = 'test@example.com';
  
  try {
    console.log('1. Enviando OTP de prueba...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: false // No crear usuario, solo probar envío
      }
    });

    if (error) {
      console.error('❌ Error enviando OTP:', error.message);
      return;
    }

    console.log('✅ OTP enviado exitosamente!');
    console.log('📧 Revisa el email para verificar que llegó el CÓDIGO y no un enlace');
    
    console.log('\n📋 Próximos pasos:');
    console.log('1. Revisa tu bandeja de entrada (o spam)');
    console.log('2. Verifica que el email contenga un código de 6 dígitos');
    console.log('3. Si ves un enlace en lugar de código, revisa las plantillas en Supabase');
    console.log('4. ¡Probar con un usuario real en tu aplicación!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkSupabaseConfig() {
  console.log('🔍 Verificando configuración de Supabase...\n');

  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL no configurada');
    console.log('   Agrega esta variable a tu .env.local');
    return false;
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada');
    console.log('   Agrega esta variable a tu .env.local');
    return false;
  }

  console.log('✅ Variables de entorno configuradas');
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);
  
  return true;
}

async function main() {
  console.log('🔧 Test de Configuración Email OTP\n');
  console.log('================================\n');

  // Verificar configuración
  const configOk = await checkSupabaseConfig();
  if (!configOk) {
    process.exit(1);
  }

  console.log('\n📝 CHECKLIST DE CONFIGURACIÓN:');
  console.log('□ Plantilla "Confirm signup" actualizada con {{ .Token }}');
  console.log('□ Plantilla "Reset Password" actualizada con {{ .Token }}');
  console.log('□ Site URL configurada: http://localhost:3000');
  console.log('□ Redirect URLs configuradas');
  console.log('\n¿Has completado todos los pasos? (y/n)');

  // En un entorno real, aquí podrías usar readline para esperar input
  // Por ahora, ejecutamos el test directamente
  console.log('Ejecutando test...\n');
  await testEmailOTP();
}

main().catch(console.error);