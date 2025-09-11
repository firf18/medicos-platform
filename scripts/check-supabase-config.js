#!/usr/bin/env node

/**
 * Script para verificar y diagnosticar configuracion de Supabase Auth
 */

const fs = require('fs');
const path = require('path');

// Funcion para cargar variables de entorno desde .env.local
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
  
  return env;
}

async function checkSupabaseConfiguration() {
  console.log('🔍 Diagnostico de configuracion Supabase Auth\n');
  console.log('=' .repeat(50));
  
  // Cargar variables de entorno
  const env = loadEnvLocal();
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Faltan variables de entorno');
    return;
  }
  
  console.log('✅ Variables de entorno encontradas');
  console.log('🌐 URL:', SUPABASE_URL);
  console.log('🔑 Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');
  
  try {
    // Importar Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verificar conexion
    console.log('🔌 Probando conexion...');
    const { data, error } = await supabase.from('test').select('*').limit(1);
    
    if (error && !error.message.includes('relation "test" does not exist')) {
      console.log('⚠️  Error de conexion:', error.message);
    } else {
      console.log('✅ Conexion exitosa');
    }
    
    // Verificar configuracion de auth
    console.log('\n📋 Verificando configuracion Auth...');
    
    // Intentar registrar un usuario de prueba (esto fallara pero nos dara info)
    const testEmail = `test.diagnostico.${Date.now()}@ejemplo.com`;
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/verify-email'
      }
    });
    
    console.log('🧪 Resultado de registro de prueba:');
    if (signupError) {
      console.log('❌ Error:', signupError.message);
      
      if (signupError.message.includes('Invalid login credentials')) {
        console.log('💡 Esto es normal - indica que el auth esta funcionando');
      } else if (signupError.message.includes('email rate limit')) {
        console.log('💡 Rate limit alcanzado - esto es esperado');
      } else if (signupError.message.includes('signup is disabled')) {
        console.log('⚠️  PROBLEMA: El registro esta deshabilitado en Supabase');
        console.log('   Solucion: Ve a Supabase Dashboard → Authentication → Settings');
        console.log('   Habilita "Enable email confirmations"');
      }
    } else {
      console.log('✅ Registro funcionando');
      console.log('👤 Usuario creado:', signupData.user ? 'Si' : 'No');
      console.log('📧 Confirmacion requerida:', !signupData.user?.email_confirmed_at);
    }
    
  } catch (error) {
    console.error('❌ Error durante verificacion:', error.message);
  }
  
  // Recomendaciones
  console.log('\n📝 RECOMENDACIONES DE CONFIGURACION:');
  console.log('=' .repeat(50));
  console.log('\n1. 🎛️  Supabase Dashboard → Authentication → Settings:');
  console.log('   • Enable email confirmations: ✅ ACTIVADO');
  console.log('   • Confirm email: ✅ ACTIVADO');
  console.log('   • Enable phone confirmations: ❌ DESACTIVADO (opcional)');
  console.log('   • Secure email change: ✅ ACTIVADO');
  
  console.log('\n2. ⏱️  Auth → Settings → Session:');
  console.log('   • Session timeout: 604800 (7 dias)');
  console.log('   • Refresh token rotation: ✅ ACTIVADO');
  
  console.log('\n3. 🌐 Auth → URL Configuration:');
  console.log('   • Site URL: http://localhost:3000');
  console.log('   • Redirect URLs:');
  console.log('     - http://localhost:3000/auth/verify-email');
  console.log('     - http://localhost:3000/auth/callback');
  
  console.log('\n4. 📧 Auth → Email Templates:');
  console.log('   • Confirm signup:');
  console.log('     - Subject: "Confirma tu cuenta - Codigo: {{ .Token }}"');
  console.log('     - Body: Usar {{ .Token }} en lugar de {{ .ConfirmationURL }}');
  console.log('   • Magic Link: DESACTIVADO o usar solo {{ .Token }}');
  
  console.log('\n5. 🔧 Auth → Providers:');
  console.log('   • Email: ✅ ACTIVADO');
  console.log('   • Confirm email: ✅ ACTIVADO');
  console.log('   • Otros providers: Configurar segun necesidad');
  
  console.log('\n⚠️  PROBLEMAS COMUNES Y SOLUCIONES:');
  console.log('=' .repeat(50));
  console.log('\n• Error 500 "Error confirming user":');
  console.log('  - Revisar que las plantillas de email usen {{ .Token }}');
  console.log('  - Verificar que "Confirm email" este activado');
  console.log('  - Comprobar que el codigo no haya expirado (< 10 min)');
  
  console.log('\n• Error 403 "Token has expired":');
  console.log('  - Solicitar un nuevo codigo');
  console.log('  - Verificar que el tiempo de expiracion sea suficiente');
  console.log('  - Limpiar cookies/localStorage corruptos');
  
  console.log('\n• Codigo no llega por email:');
  console.log('  - Verificar configuracion SMTP en Supabase');
  console.log('  - Revisar carpeta de spam');
  console.log('  - Comprobar plantillas de email');
  
  console.log('\n🚀 PROXIMOS PASOS:');
  console.log('=' .repeat(50));
  console.log('1. Ve a tu Supabase Dashboard y verifica la configuracion arriba');
  console.log('2. Ejecuta: npm run debug:otp:advanced verify email@ejemplo.com 123456');
  console.log('3. Si sigue fallando, comparte los logs de este script');
  
  console.log('\n🔗 Enlaces utiles:');
  console.log(`• Dashboard: ${SUPABASE_URL.replace('/rest/v1', '')}`);
  console.log('• Docs Auth: https://supabase.com/docs/guides/auth');
  console.log('• Docs Email: https://supabase.com/docs/guides/auth/auth-email');
}

checkSupabaseConfiguration().catch(console.error);