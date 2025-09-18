#!/usr/bin/env node

/**
 * Script para preparar el despliegue en Vercel
 * Genera las variables de entorno necesarias y verifica la configuración
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando despliegue para Vercel...\n');

// Leer variables de entorno actuales
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

console.log('📋 Variables de entorno encontradas:');
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : '❌ Faltante');
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : '❌ Faltante');

// Generar archivo .env.example para Vercel
const envExample = `# Variables de entorno para Vercel
# Copia estas variables en tu dashboard de Vercel

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL || 'tu_url_de_supabase'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu_clave_anonima'}

# App Configuration
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

# Optional: Service Role Key (para funciones avanzadas)
# SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
`;

fs.writeFileSync('.env.example', envExample);
console.log('\n✅ Archivo .env.example creado para Vercel');

// Verificar archivos necesarios para el despliegue
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json'
];

console.log('\n🔍 Verificando archivos necesarios:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Crear next.config.js si no existe
if (!fs.existsSync('next.config.js')) {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react']
  },
  images: {
    domains: ['zonmvugejshdstymfdva.supabase.co']
  }
}

module.exports = nextConfig
`;
  fs.writeFileSync('next.config.js', nextConfig);
  console.log('✅ next.config.js creado');
}

// Verificar scripts en package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasVercelScript = packageJson.scripts && packageJson.scripts.build;

console.log('\n📦 Scripts de package.json:');
console.log('✅ build:', hasVercelScript ? 'Configurado' : '❌ Faltante');

console.log('\n🎯 Instrucciones para desplegar en Vercel:');
console.log('1. Instala Vercel CLI: npm i -g vercel');
console.log('2. Ejecuta: vercel');
console.log('3. Sigue las instrucciones del CLI');
console.log('4. Configura las variables de entorno en el dashboard de Vercel');
console.log('5. Redespliega: vercel --prod');

console.log('\n📋 Variables para configurar en Vercel Dashboard:');
console.log('NEXT_PUBLIC_SUPABASE_URL =', envVars.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY =', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('NEXT_PUBLIC_APP_URL = https://tu-dominio.vercel.app');

console.log('\n🔗 URLs importantes:');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Supabase Dashboard: https://zonmvugejshdstymfdva.supabase.co');

console.log('\n✅ Preparación completada!');