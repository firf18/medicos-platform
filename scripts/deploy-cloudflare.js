#!/usr/bin/env node

/**
 * Script de despliegue para Cloudflare Pages
 * Configura y despliega la aplicación Red-Salud
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO DESPLIEGUE A CLOUDFLARE PAGES');
console.log('=' .repeat(50));

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('package.json')) {
  console.error('❌ No se encontró package.json. Ejecuta este script desde la raíz del proyecto.');
  process.exit(1);
}

// Verificar variables de entorno
const envFile = '.env.local';
if (!fs.existsSync(envFile)) {
  console.error('❌ No se encontró .env.local. Copia env.example y configura las variables.');
  process.exit(1);
}

console.log('✅ Verificando configuración...');

// Construir la aplicación
console.log('\n🔨 Construyendo aplicación...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado exitosamente');
} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
}

// Verificar que se creó el directorio out
if (!fs.existsSync('out')) {
  console.error('❌ No se creó el directorio "out". Verifica la configuración de Next.js.');
  process.exit(1);
}

console.log('✅ Directorio "out" creado correctamente');

// Crear archivo de configuración para Cloudflare
console.log('\n📝 Creando configuración para Cloudflare...');

const cloudflareConfig = {
  build: {
    command: 'npm run build',
    cwd: '/',
    watch_dir: 'src'
  },
  environment_variables: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    DIDIT_API_KEY: process.env.DIDIT_API_KEY,
    DIDIT_WEBHOOK_SECRET: process.env.DIDIT_WEBHOOK_SECRET,
    DIDIT_BASE_URL: process.env.DIDIT_BASE_URL,
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_ENV: 'production'
  }
};

fs.writeFileSync('cloudflare-pages.json', JSON.stringify(cloudflareConfig, null, 2));
console.log('✅ Archivo cloudflare-pages.json creado');

// Crear archivo de redirecciones para SPA
console.log('\n🔄 Configurando redirecciones...');
const redirectsContent = `# Redirecciones para SPA
/*    /index.html   200

# Redirecciones específicas para autenticación
/auth/*    /auth/*   200
/api/*     /api/*    200
`;

fs.writeFileSync('out/_redirects', redirectsContent);
console.log('✅ Archivo _redirects creado');

// Crear archivo de headers de seguridad
console.log('\n🔒 Configurando headers de seguridad...');
const headersContent = `# Headers de seguridad
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=31536000; includeSubDomains
`;

fs.writeFileSync('out/_headers', headersContent);
console.log('✅ Archivo _headers creado');

console.log('\n🎉 DESPLIEGUE PREPARADO EXITOSAMENTE');
console.log('=' .repeat(50));

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. Ve a Cloudflare Pages: https://dash.cloudflare.com/pages');
console.log('2. Crea un nuevo proyecto');
console.log('3. Conecta tu repositorio de GitHub');
console.log('4. Configura las variables de entorno desde cloudflare-pages.json');
console.log('5. Despliega la aplicación');

console.log('\n🔗 URLs importantes:');
console.log(`- Aplicación: ${process.env.NEXT_PUBLIC_SITE_URL}`);
console.log(`- Webhook Didit: ${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`);
console.log(`- Registro de médicos: ${process.env.NEXT_PUBLIC_SITE_URL}/auth/register/doctor`);

console.log('\n💡 COMANDOS ÚTILES:');
console.log('npm run deploy:prepare  # Preparar para despliegue');
console.log('npm run build           # Construir aplicación');
console.log('npm run dev             # Desarrollo local');

console.log('\n⚠️  IMPORTANTE:');
console.log('Después del despliegue, actualiza la configuración del webhook en Didit:');
console.log(`URL: ${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`);
console.log(`Secret: ${process.env.DIDIT_WEBHOOK_SECRET}`);
