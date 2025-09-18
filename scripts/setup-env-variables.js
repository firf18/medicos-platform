/**
 * 🔧 CONFIGURADOR DE VARIABLES DE ENTORNO PARA DIDIT
 * 
 * Script para crear el archivo .env.local con las variables necesarias
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CONFIGURANDO VARIABLES DE ENTORNO PARA DIDIT');
console.log('=' .repeat(50));

// Variables de entorno para Didit
const envContent = `# 🔐 CONFIGURACIÓN DIDIT - VARIABLES DE ENTORNO
# Archivo de configuración para la integración con Didit.me

# API Key de Didit
DIDIT_API_KEY=iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk

# Webhook Secret Key
DIDIT_WEBHOOK_SECRET_KEY=NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck

# Base URL de Didit
DIDIT_BASE_URL=https://verification.didit.me

# Webhook URL
DIDIT_WEBHOOK_URL=https://red-salud.org/api/webhooks/didit

# Workflow ID para verificación de médicos
DIDIT_WORKFLOW_ID=3176221b-c77c-4fea-b2b3-da185ef18122

# URL del sitio (para callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zonmvugejshdstymfdva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjE4OTQsImV4cCI6MjA3MjU5Nzg5NH0.MWyU7xDmAr5EsR661nwSC1q7D90I1_oQUhwGqtlJd6k
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Configuración de la aplicación
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Red-Salud
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuración de seguridad
RATE_LIMIT_ENABLED=true
SESSION_TIMEOUT_MINUTES=30
MAX_LOGIN_ATTEMPTS=3
`;

// Crear el archivo .env.local
const envPath = path.join(process.cwd(), '.env.local');

try {
  // Verificar si el archivo ya existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env.local ya existe');
    console.log('📝 Actualizando con las variables de Didit...');
    
    // Leer el contenido actual
    const currentContent = fs.readFileSync(envPath, 'utf8');
    
    // Verificar si ya tiene las variables de Didit
    if (currentContent.includes('DIDIT_API_KEY')) {
      console.log('✅ Las variables de Didit ya están configuradas');
      console.log('🔍 Verificando configuración...');
      
      // Verificar que la API key esté correcta
      if (currentContent.includes('iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk')) {
        console.log('✅ API Key de Didit configurada correctamente');
      } else {
        console.log('❌ API Key de Didit no coincide');
        console.log('🔄 Actualizando archivo...');
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Archivo .env.local actualizado');
      }
    } else {
      console.log('➕ Agregando variables de Didit al archivo existente...');
      const updatedContent = currentContent + '\n\n' + envContent;
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ Variables de Didit agregadas');
    }
  } else {
    console.log('📝 Creando archivo .env.local...');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env.local creado exitosamente');
  }
  
  console.log('\n🔑 VARIABLES CONFIGURADAS:');
  console.log('   DIDIT_API_KEY: iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk');
  console.log('   DIDIT_WEBHOOK_SECRET_KEY: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck');
  console.log('   DIDIT_WORKFLOW_ID: 3176221b-c77c-4fea-b2b3-da185ef18122');
  console.log('   NEXT_PUBLIC_SITE_URL: http://localhost:3000');
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. ✅ Reinicia el servidor de desarrollo');
  console.log('2. ✅ Ve a http://localhost:3000/auth/register/doctor');
  console.log('3. ✅ Prueba el registro de médico');
  console.log('4. ✅ La verificación Didit debería funcionar ahora');
  
  console.log('\n🏥 ¡CONFIGURACIÓN COMPLETADA!');

} catch (error) {
  console.error('❌ Error configurando variables de entorno:', error);
  console.log('\n🔧 SOLUCIÓN MANUAL:');
  console.log('1. Crea un archivo .env.local en la raíz del proyecto');
  console.log('2. Agrega las siguientes líneas:');
  console.log('');
  console.log('DIDIT_API_KEY=iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk');
  console.log('DIDIT_WEBHOOK_SECRET_KEY=NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck');
  console.log('DIDIT_WORKFLOW_ID=3176221b-c77c-4fea-b2b3-da185ef18122');
  console.log('NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  console.log('');
  console.log('3. Reinicia el servidor');
}
