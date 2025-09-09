#!/usr/bin/env node

/**
 * Script para configurar Supabase Auth para usar códigos OTP
 * en lugar de enlaces de verificación
 */

const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local
let supabaseUrl = '';

try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const [key, value] = line.split('=');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value;
      }
    });
  }
} catch (error) {
  console.log('⚠️  No se pudo leer .env.local');
}

if (!supabaseUrl) {
  console.error('❌ Error: Falta la variable NEXT_PUBLIC_SUPABASE_URL en .env.local');
  console.log('Asegúrate de tener esta variable en tu archivo .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  process.exit(1);
}

async function configureAuthSettings() {
  console.log('🔧 Configurando Supabase Auth para usar códigos OTP...\n');

  try {
    // Configurar las plantillas de email para OTP
    const emailTemplates = {
      // Plantilla para confirmación de registro
      confirmation: {
        subject: 'Confirma tu cuenta - Código de verificación',
        body: `
          <h2>Confirma tu cuenta</h2>
          <p>Hola,</p>
          <p>Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">{{ .Token }}</h1>
          </div>
          <p><strong>Este código expira en 10 minutos.</strong></p>
          <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de Plataforma Médicos</p>
        `
      },
      
      // Plantilla para recuperación de contraseña
      recovery: {
        subject: 'Recupera tu contraseña - Código de verificación',
        body: `
          <h2>Recupera tu contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Ingresa el siguiente código:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">{{ .Token }}</h1>
          </div>
          <p><strong>Este código expira en 10 minutos.</strong></p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de Plataforma Médicos</p>
        `
      }
    };

    console.log('📧 Configurando plantillas de email...');
    
    // Nota: La configuración de plantillas de email debe hacerse desde el Dashboard de Supabase
    // Este script proporciona las plantillas que debes copiar manualmente
    
    console.log('\n✅ Plantillas de email generadas. Debes configurarlas manualmente en:');
    console.log('   Supabase Dashboard → Authentication → Email Templates\n');
    
    console.log('📋 Plantilla para CONFIRMACIÓN DE REGISTRO:');
    console.log('   Asunto:', emailTemplates.confirmation.subject);
    console.log('   Cuerpo:', emailTemplates.confirmation.body);
    console.log('\n📋 Plantilla para RECUPERACIÓN DE CONTRASEÑA:');
    console.log('   Asunto:', emailTemplates.recovery.subject);
    console.log('   Cuerpo:', emailTemplates.recovery.body);
    
    console.log('\n🔧 CONFIGURACIÓN MANUAL REQUERIDA:');
    console.log('1. Ve a tu Dashboard de Supabase');
    console.log('2. Navega a Authentication → Settings');
    console.log('3. En "Email" configura:');
    console.log('   - Enable email confirmations: ✅ Activado');
    console.log('   - Enable email change confirmations: ✅ Activado');
    console.log('   - Secure email change: ✅ Activado');
    console.log('4. En "Email Templates" configura las plantillas mostradas arriba');
    console.log('5. En "URL Configuration":');
    console.log('   - Site URL: http://localhost:3000 (desarrollo) o tu dominio (producción)');
    console.log('   - Redirect URLs: http://localhost:3000/auth/verify-email');

  } catch (error) {
    console.error('❌ Error al configurar Auth:', error.message);
    process.exit(1);
  }
}

async function checkSupabaseSettings() {
  console.log('\n🔍 Verificando configuración de Supabase...\n');

  try {
    // Verificar que la URL sea válida
    if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
      console.log('✅ URL de Supabase encontrada');
      console.log(`   Dashboard: ${supabaseUrl.replace('/rest/v1', '')}`);
    } else {
      console.log('⚠️  Verifica la URL de Supabase en .env.local');
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

// Ejecutar configuración
async function runConfiguration() {
  await configureAuthSettings();
  await checkSupabaseSettings();
  
  console.log('\n🎉 Configuración completada!');
  console.log('\nPróximos pasos:');
  console.log('1. Configura manualmente las plantillas en el Dashboard de Supabase');
  console.log('2. Ejecuta: npm run test:auth para probar la configuración');
  console.log('3. Reinicia tu aplicación: npm run dev');
}

runConfiguration().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});