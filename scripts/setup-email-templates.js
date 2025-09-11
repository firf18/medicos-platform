#!/usr/bin/env node

/**
 * Script para mostrar exactamente cómo configurar las plantillas de email en Supabase
 * Este script proporciona las plantillas exactas que necesitas copiar en el Dashboard
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

function displayEmailTemplates() {
  console.log('📧 CONFIGURACION DE PLANTILLAS DE EMAIL SUPABASE');
  console.log('=' .repeat(60));
  
  const env = loadEnvLocal();
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    console.error('❌ Error: No se encontró NEXT_PUBLIC_SUPABASE_URL en .env.local');
    return;
  }
  
  const dashboardUrl = SUPABASE_URL.replace('/rest/v1', '');
  
  console.log('🌐 Tu Dashboard de Supabase:', dashboardUrl);
  console.log('📍 Ve a: Authentication → Email Templates\n');
  
  console.log('📝 PASOS A SEGUIR:');
  console.log('=' .repeat(40));
  console.log('1. Ve a tu Dashboard de Supabase');
  console.log('2. Navega a Authentication → Email Templates');
  console.log('3. Configura las siguientes plantillas:\n');
  
  // Plantilla de confirmación de registro
  console.log('🔹 CONFIRM SIGNUP TEMPLATE');
  console.log('-' .repeat(30));
  console.log('Subject:');
  console.log('Confirma tu cuenta - Código: {{ .Token }}');
  console.log('');
  console.log('Body HTML:');
  console.log(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirma tu cuenta</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">Confirma tu cuenta</h2>
        
        <p>Hola,</p>
        
        <p>Gracias por registrarte en nuestra plataforma médica. Para completar tu registro, ingresa el siguiente código de verificación:</p>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; border: 2px solid #e9ecef;">
            <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">{{ .Token }}</h1>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ Este código expira en 15 minutos.</p>
        </div>
        
        <p>Si no solicitaste esta verificación, puedes ignorar este correo de forma segura.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
        
        <p style="text-align: center; color: #6c757d; font-size: 14px;">
            Saludos,<br>
            El equipo de Plataforma Médicos
        </p>
    </div>
</body>
</html>`);
  
  console.log('\n🔹 MAGIC LINK TEMPLATE (Opcional - puedes deshabilitarlo)');
  console.log('-' .repeat(50));
  console.log('Subject:');
  console.log('Accede a tu cuenta - Código: {{ .Token }}');
  console.log('');
  console.log('Body HTML:');
  console.log(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Accede a tu cuenta</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">Accede a tu cuenta</h2>
        
        <p>Hola,</p>
        
        <p>Ingresa el siguiente código para acceder a tu cuenta:</p>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; border: 2px solid #e9ecef;">
            <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">{{ .Token }}</h1>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ Este código expira en 15 minutos.</p>
        </div>
        
        <p>Si no solicitaste este acceso, puedes ignorar este correo de forma segura.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
        
        <p style="text-align: center; color: #6c757d; font-size: 14px;">
            Saludos,<br>
            El equipo de Plataforma Médicos
        </p>
    </div>
</body>
</html>`);
  
  console.log('\n⚙️  CONFIGURACIONES ADICIONALES:');
  console.log('=' .repeat(40));
  console.log('En Authentication → Settings:');
  console.log('✅ Enable email confirmations: ACTIVADO');
  console.log('✅ Confirm email: ACTIVADO');
  console.log('✅ Secure email change: ACTIVADO');
  console.log('❌ Enable phone confirmations: DESACTIVADO');
  console.log('');
  console.log('En Authentication → URL Configuration:');
  console.log('• Site URL: http://localhost:3000');
  console.log('• Redirect URLs: http://localhost:3000/auth/verify-email');
  console.log('');
  
  console.log('🚨 IMPORTANTE:');
  console.log('=' .repeat(40));
  console.log('• Las plantillas DEBEN usar {{ .Token }} para códigos OTP');
  console.log('• NO uses {{ .ConfirmationURL }} - eso envía enlaces');
  console.log('• Después de configurar, prueba con: npm run test:email-templates');
  console.log('• Si sigues teniendo problemas, verifica la carpeta de spam');
  
  console.log('\n🔗 Enlaces directos:');
  console.log(`• Dashboard: ${dashboardUrl}`);
  console.log(`• Auth Settings: ${dashboardUrl}/auth/settings`);
  console.log(`• Email Templates: ${dashboardUrl}/auth/templates`);
  console.log(`• URL Configuration: ${dashboardUrl}/auth/urls`);
}

displayEmailTemplates();