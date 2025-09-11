#!/usr/bin/env node

/**
 * Script avanzado de debugging para verificación OTP
 * Incluye verificación de configuración de Supabase y pruebas exhaustivas
 */

const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno desde .env.local
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

// Cargar variables de entorno
const env = loadEnvLocal();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Faltan variables de entorno en .env.local');
  console.log('Necesitas:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function testSupabaseConnection() {
  console.log('🔌 Probando conexión con Supabase...\n');
  
  try {
    // Importar Supabase dinámicamente
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Cliente Supabase creado exitosamente');
    console.log('🌐 URL:', SUPABASE_URL);
    console.log('🔑 Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    // Probar una consulta simple
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe, es normal
      console.log('⚠️  Error en consulta de prueba:', error.message);
    } else {
      console.log('✅ Conexión a base de datos exitosa');
    }
    
    return supabase;
    
  } catch (error) {
    console.error('❌ Error creando cliente Supabase:', error.message);
    throw error;
  }
}

async function testOTPVerification(supabase, email, code) {
  console.log('\n🧪 Probando verificación OTP...\n');
  console.log('📧 Email:', email);
  console.log('🔢 Código:', code);
  
  // Limpiar sesión previa
  try {
    await supabase.auth.signOut();
    console.log('🧹 Sesión previa limpiada');
  } catch (error) {
    console.log('⚠️  No se pudo limpiar sesión (normal):', error.message);
  }
  
  // Normalizar email
  const normalizedEmail = email.trim().toLowerCase();
  console.log('📧 Email normalizado:', normalizedEmail);
  
  // Probar diferentes tipos de verificación
  const verificationTypes = [
    { type: 'signup', description: 'Verificación de registro' },
    { type: 'email', description: 'Verificación de email' },
    { type: 'email_change', description: 'Verificación de cambio de email' }
  ];
  
  for (const method of verificationTypes) {
    try {
      console.log(`\n🔄 Probando ${method.description} (${method.type})...`);
      
      const result = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: code,
        type: method.type
      });
      
      console.log(`📊 Resultado ${method.type}:`, {
        hasError: !!result.error,
        hasUser: !!result.data?.user,
        hasSession: !!result.data?.session,
        errorMessage: result.error?.message,
        errorCode: result.error?.status || result.error?.code
      });
      
      if (!result.error) {
        console.log(`✅ ¡Éxito con ${method.description}!`);
        console.log('👤 Usuario:', {
          id: result.data.user?.id,
          email: result.data.user?.email,
          confirmed: result.data.user?.email_confirmed_at,
          metadata: result.data.user?.user_metadata
        });
        return true;
      } else {
        console.log(`❌ ${method.description} falló:`, result.error.message);
      }
      
    } catch (error) {
      console.error(`💥 Excepción en ${method.description}:`, {
        message: error.message,
        name: error.name,
        code: error.code
      });
    }
  }
  
  return false;
}

async function checkAuthSettings(supabase) {
  console.log('\n⚙️  Verificando configuración de autenticación...\n');
  
  try {
    // Intentar obtener la configuración actual
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️  Error obteniendo sesión:', error.message);
    } else {
      console.log('📊 Estado de sesión:', data.session ? 'ACTIVA' : 'INACTIVA');
    }
    
    // Verificar configuración de URL
    console.log('🌐 Configuración de URLs:');
    console.log('   Base URL:', SUPABASE_URL);
    console.log('   Auth URL:', SUPABASE_URL.replace('/rest/v1', '/auth/v1'));
    
    // Sugerencias de configuración
    console.log('\n📋 Configuración recomendada en Supabase Dashboard:');
    console.log('   Authentication → Settings:');
    console.log('   • Enable email confirmations: ✅');
    console.log('   • Email confirmation type: OTP (código de 6 dígitos)');
    console.log('   • OTP expiry duration: 600 segundos (10 minutos)');
    console.log('   • Site URL: http://localhost:3000');
    console.log('   • Redirect URLs: http://localhost:3000/auth/verify-email');
    
  } catch (error) {
    console.error('❌ Error verificando configuración:', error.message);
  }
}

async function generateTestUser() {
  console.log('\n👤 Generando usuario de prueba...\n');
  
  const timestamp = Date.now();
  const testEmail = `test.user.${timestamp}@ejemplo.com`;
  
  console.log('📧 Email de prueba:', testEmail);
  console.log('⚠️  IMPORTANTE: Este email NO recibirá correos reales');
  console.log('   Para pruebas reales, usa tu email personal');
  
  return testEmail;
}

async function main() {
  console.log('🚀 Script de debugging avanzado OTP\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Probar conexión
    const supabase = await testSupabaseConnection();
    
    // 2. Verificar configuración
    await checkAuthSettings(supabase);
    
    // 3. Generar usuario de prueba
    const testEmail = await generateTestUser();
    
    // 4. Instrucciones para prueba manual
    console.log('\n📝 INSTRUCCIONES PARA PRUEBA MANUAL:');
    console.log('1. Registra un nuevo usuario en tu aplicación');
    console.log('2. Usa un email real para recibir el código OTP');
    console.log('3. Cuando recibas el código, ejecuta:');
    console.log(`   node scripts/debug-otp-advanced.js verify tu-email@ejemplo.com 123456`);
    
    // 5. Si se proporcionaron argumentos, hacer prueba directa
    const args = process.argv.slice(2);
    if (args.length >= 3 && args[0] === 'verify') {
      const email = args[1];
      const code = args[2];
      
      console.log('\n🧪 MODO VERIFICACIÓN DIRECTA');
      console.log('=' .repeat(30));
      
      const success = await testOTPVerification(supabase, email, code);
      
      if (success) {
        console.log('\n🎉 ¡Verificación exitosa!');
      } else {
        console.log('\n❌ Verificación falló en todos los métodos');
        console.log('\n🔍 Posibles causas:');
        console.log('• Código expirado (> 10 minutos)');
        console.log('• Código ya usado');
        console.log('• Email no coincide exactamente');
        console.log('• Configuración incorrecta en Supabase');
        console.log('• Usuario ya verificado');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Error fatal:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar script
main().catch(console.error);