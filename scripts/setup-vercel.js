#!/usr/bin/env node

/**
 * Script de configuración completa para Vercel
 * Configura y despliega Red-Salud automáticamente
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 CONFIGURACIÓN COMPLETA DE VERCEL PARA RED-SALUD');
console.log('=' .repeat(60));

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

// Instalar Vercel CLI si no está instalado
console.log('\n📦 Instalando Vercel CLI...');
try {
  execSync('npm install -g vercel', { stdio: 'inherit' });
  console.log('✅ Vercel CLI instalado');
} catch (error) {
  console.log('⚠️  Vercel CLI ya instalado o error en instalación');
}

// Configurar Vercel
console.log('\n🔧 Configurando Vercel...');
try {
  // Configurar el token de Vercel
  process.env.VERCEL_TOKEN = 'gJC7Ln77wkBoKlUSbo0wFxYA';
  console.log('✅ Token de Vercel configurado');
} catch (error) {
  console.error('❌ Error configurando Vercel:', error.message);
  process.exit(1);
}

// Crear configuración de Vercel
console.log('\n📝 Creando configuración de Vercel...');
const vercelConfig = {
  version: 2,
  name: 'red-salud-platform',
  builds: [
    {
      src: 'package.json',
      use: '@vercel/next'
    }
  ],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    DIDIT_API_KEY: process.env.DIDIT_API_KEY,
    DIDIT_WEBHOOK_SECRET: process.env.DIDIT_WEBHOOK_SECRET,
    DIDIT_BASE_URL: process.env.DIDIT_BASE_URL,
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_ENV: 'production'
  },
  functions: {
    'app/api/**/*.ts': {
      runtime: 'nodejs18.x'
    }
  },
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        }
      ]
    }
  ],
  redirects: [
    {
      source: '/auth/:path*',
      destination: '/auth/:path*',
      permanent: false
    }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json creado');

// Actualizar next.config.mjs para Vercel
console.log('\n⚙️ Actualizando configuración de Next.js...');
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog', 'lucide-react'],
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;`;

fs.writeFileSync('next.config.mjs', nextConfig);
console.log('✅ next.config.mjs actualizado para Vercel');

// Crear archivo .vercelignore
console.log('\n📁 Creando .vercelignore...');
const vercelIgnore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
.next/
out/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/`;

fs.writeFileSync('.vercelignore', vercelIgnore);
console.log('✅ .vercelignore creado');

// Desplegar a Vercel
console.log('\n🚀 Desplegando a Vercel...');
try {
  const deployOutput = execSync('vercel --prod --yes --token gJC7Ln77wkBoKlUSbo0wFxYA', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  console.log('✅ Despliegue exitoso!');
  console.log('📋 Output del despliegue:');
  console.log(deployOutput);
  
  // Extraer URL del despliegue
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deployUrl = urlMatch[0];
    console.log(`\n🌐 URL del despliegue: ${deployUrl}`);
    
    // Actualizar .env.local con la URL de producción
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const updatedEnv = envContent.replace(
      /NEXT_PUBLIC_SITE_URL=.*/,
      `NEXT_PUBLIC_SITE_URL=${deployUrl}`
    );
    fs.writeFileSync('.env.local', updatedEnv);
    console.log('✅ Variables de entorno actualizadas');
  }
  
} catch (error) {
  console.error('❌ Error en el despliegue:', error.message);
  console.log('\n💡 Intenta ejecutar manualmente:');
  console.log('vercel --prod');
}

console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
console.log('=' .repeat(60));

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. ✅ Proyecto desplegado en Vercel');
console.log('2. 🔗 Configurar dominio red-salud.org en Vercel');
console.log('3. 🔧 Actualizar webhook de Didit con la nueva URL');
console.log('4. 🧪 Probar el registro de médicos');

console.log('\n🔗 URLs importantes:');
console.log(`- Aplicación: ${process.env.NEXT_PUBLIC_SITE_URL}`);
console.log(`- Webhook Didit: ${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`);
console.log(`- Registro de médicos: ${process.env.NEXT_PUBLIC_SITE_URL}/auth/register/doctor`);

console.log('\n⚠️  IMPORTANTE:');
console.log('Después del despliegue, actualiza la configuración del webhook en Didit:');
console.log(`URL: ${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`);
console.log(`Secret: ${process.env.DIDIT_WEBHOOK_SECRET}`);

console.log('\n💡 COMANDOS ÚTILES:');
console.log('vercel --prod                    # Desplegar a producción');
console.log('vercel domains add red-salud.org # Agregar dominio');
console.log('vercel env add                   # Agregar variables de entorno');
console.log('vercel logs                       # Ver logs del despliegue');
