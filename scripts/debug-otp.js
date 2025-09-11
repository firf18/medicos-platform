#!/usr/bin/env node

/**
 * Script de depuración para probar la verificación OTP
 * Usa este script para probar la verificación directamente
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes');
  console.log('\nVariables encontradas:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NO ENCONTRADA');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NO ENCONTRADA');
  console.log('\nAsegúrate de tener estas variables en tu .env.local');
  process.exit(1);
}

console.log('✅ Variables de entorno cargadas correctamente');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
console.log();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function debugOTPVerification() {
  console.log('🔍 DEBUG: Verificación OTP\n');
  
  try {
    const email = await askQuestion('Email a verificar: ');
    const code = await askQuestion('Código OTP (6 dígitos): ');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.error('❌ El código debe ser de 6 dígitos');
      rl.close();
      return;
    }

    console.log('\n🧪 Probando verificación con diferentes tipos...\n');

    // Probar con tipo 'signup'
    console.log('1. Probando con type: "signup"');
    const signupResult = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup'
    });

    if (signupResult.error) {
      console.log('❌ Signup failed:', {
        message: signupResult.error.message,
        status: signupResult.error.status,
        details: signupResult.error
      });
    } else {
      console.log('✅ Signup success:', {
        userId: signupResult.data?.user?.id || 'No user data',
        email: signupResult.data?.user?.email,
        emailConfirmed: signupResult.data?.user?.email_confirmed_at
      });
    }

    // Probar con tipo 'email'
    console.log('\n2. Probando con type: "email"');
    const emailResult = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    });

    if (emailResult.error) {
      console.log('❌ Email failed:', {
        message: emailResult.error.message,
        status: emailResult.error.status,
        details: emailResult.error
      });
    } else {
      console.log('✅ Email success:', {
        userId: emailResult.data?.user?.id || 'No user data',
        email: emailResult.data?.user?.email,
        emailConfirmed: emailResult.data?.user?.email_confirmed_at
      });
    }

    // Verificar el estado del usuario
    console.log('\n3. Verificando estado del usuario...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Error getting user:', userError.message);
    } else if (user.user) {
      console.log('✅ Usuario autenticado:', user.user.id);
      console.log('📧 Email confirmado:', user.user.email_confirmed_at ? 'Sí' : 'No');
    } else {
      console.log('❌ No hay usuario autenticado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

async function main() {
  console.log('🔧 Script de Depuración OTP');
  console.log('===========================\n');
  
  await debugOTPVerification();
}

main().catch(console.error);