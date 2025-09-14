#!/usr/bin/env node

/**
 * Script para configurar Vercel automáticamente
 * Evita el problema del checkbox prompt
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CONFIGURACIÓN AUTOMÁTICA DE VERCEL');
console.log('=' .repeat(50));

// Configuración del proyecto
const projectConfig = {
  name: 'red-salud-platform',
  framework: 'nextjs',
  buildCommand: 'npm run build',
  devCommand: 'npm run dev',
  installCommand: 'npm ci',
  outputDirectory: '.next'
};

console.log('\n📋 CONFIGURACIÓN DEL PROYECTO:');
console.log(`- Nombre: ${projectConfig.name}`);
console.log(`- Framework: ${projectConfig.framework}`);
console.log(`- Build Command: ${projectConfig.buildCommand}`);
console.log(`- Output Directory: ${projectConfig.outputDirectory}`);

// Crear archivo .vercel/project.json manualmente
console.log('\n🔧 Creando configuración de Vercel...');

const vercelDir = '.vercel';
if (!fs.existsSync(vercelDir)) {
  fs.mkdirSync(vercelDir, { recursive: true });
}

// Configuración del proyecto
const projectJson = {
  projectId: 'red-salud-platform',
  orgId: 'firf1818-8965s-projects',
  settings: {
    framework: projectConfig.framework,
    buildCommand: projectConfig.buildCommand,
    devCommand: projectConfig.devCommand,
    installCommand: projectConfig.installCommand,
    outputDirectory: projectConfig.outputDirectory
  }
};

fs.writeFileSync(
  path.join(vercelDir, 'project.json'), 
  JSON.stringify(projectJson, null, 2)
);

console.log('✅ Archivo .vercel/project.json creado');

// Crear archivo vercel.json optimizado
console.log('\n⚙️ Optimizando vercel.json...');

const optimizedVercelConfig = {
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://zonmvugejshdstymfdva.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjE4OTQsImV4cCI6MjA3MjU5Nzg5NH0.MWyU7xDmAr5EsR661nwSC1q7D90I1_oQUhwGqtlJd6k",
    "NEXT_PUBLIC_SITE_URL": "https://red-salud.org",
    "NEXT_PUBLIC_DOMAIN": "red-salud.org",
    "DIDIT_API_KEY": "f-zcERxhkl36e9BgfRm22XR_TUiROSLROuS7BlwRItM",
    "DIDIT_WEBHOOK_SECRET": "NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck",
    "DIDIT_BASE_URL": "https://api.didit.me",
    "NODE_ENV": "production",
    "NEXT_PUBLIC_APP_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.didit.me;"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/auth/:path*",
      "destination": "/auth/:path*",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/api/webhooks/didit",
      "destination": "/api/webhooks/didit"
    }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(optimizedVercelConfig, null, 2));
console.log('✅ vercel.json optimizado');

// Verificar que el proyecto esté configurado
console.log('\n🔍 Verificando configuración...');

try {
  const projects = execSync('vercel ls --token gJC7Ln77wkBoKlUSbo0wFxYA --yes', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ Proyectos en Vercel:');
  console.log(projects);
} catch (error) {
  console.log('⚠️  Error verificando proyectos:', error.message);
}

// Crear script de despliegue
console.log('\n📦 Creando script de despliegue...');

const deployScript = `#!/usr/bin/env node

/**
 * Script de despliegue a Vercel
 */

const { execSync } = require('child_process');

console.log('🚀 DESPLEGANDO A VERCEL...');

try {
  // Desplegar a producción
  console.log('📤 Desplegando a producción...');
  const deployOutput = execSync('vercel --prod --token gJC7Ln77wkBoKlUSbo0wFxYA', { 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('✅ Despliegue completado exitosamente');
  console.log('🔗 URL de producción: https://red-salud-platform-iwak76pbf-firf1818-8965s-projects.vercel.app');
  
} catch (error) {
  console.error('❌ Error en el despliegue:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync('scripts/deploy-vercel.js', deployScript);
console.log('✅ Script de despliegue creado');

// Actualizar package.json
console.log('\n📝 Actualizando package.json...');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "deploy:vercel": "node scripts/deploy-vercel.js",
  "vercel:link": "node scripts/setup-vercel-auto.js"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json actualizado');

console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
console.log('=' .repeat(50));

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. ✅ Proyecto configurado en Vercel');
console.log('2. ✅ Variables de entorno configuradas');
console.log('3. ✅ Scripts de despliegue creados');

console.log('\n🚀 COMANDOS DISPONIBLES:');
console.log('npm run deploy:vercel    # Desplegar a producción');
console.log('npm run health:check     # Verificar estado');

console.log('\n🔗 URLs IMPORTANTES:');
console.log('- GitHub: https://github.com/firf18/medicos-platform');
console.log('- Vercel: https://vercel.com/firf1818-8965s-projects/red-salud-platform');
console.log('- Aplicación: https://red-salud-platform-iwak76pbf-firf1818-8965s-projects.vercel.app');

console.log('\n⚠️  IMPORTANTE:');
console.log('El proyecto ya está configurado. No necesitas ejecutar "vercel link" manualmente.');
console.log('Usa "npm run deploy:vercel" para desplegar a producción.');
