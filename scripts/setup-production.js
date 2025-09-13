#!/usr/bin/env node

/**
 * Script de configuración completa para producción
 * Configura Vercel, GitHub, Cloudflare y automatización
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 CONFIGURACIÓN COMPLETA PARA PRODUCCIÓN - RED-SALUD');
console.log('=' .repeat(60));

// Verificar estado actual
console.log('\n📊 VERIFICANDO ESTADO ACTUAL...');

// Verificar GitHub
try {
  const gitRemote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  console.log(`✅ GitHub conectado: ${gitRemote}`);
} catch (error) {
  console.error('❌ No se encontró repositorio de GitHub');
  process.exit(1);
}

// Verificar Vercel
try {
  const vercelProjects = execSync('vercel ls --token gJC7Ln77wkBoKlUSbo0wFxYA', { encoding: 'utf8' });
  console.log('✅ Vercel conectado');
  console.log('📋 Proyectos en Vercel:');
  console.log(vercelProjects);
} catch (error) {
  console.log('⚠️  Error verificando Vercel:', error.message);
}

console.log('\n🔧 CONFIGURANDO AUTOMATIZACIÓN...');

// Crear archivo de configuración de GitHub Actions
console.log('\n📝 Creando GitHub Actions para despliegue automático...');
const githubActionsDir = '.github/workflows';
if (!fs.existsSync(githubActionsDir)) {
  fs.mkdirSync(githubActionsDir, { recursive: true });
}

const deployWorkflow = `name: Deploy to Vercel

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test:run
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        working-directory: ./
`;

fs.writeFileSync(`${githubActionsDir}/deploy.yml`, deployWorkflow);
console.log('✅ GitHub Actions configurado');

// Crear archivo de configuración de Vercel optimizado
console.log('\n⚙️ Optimizando configuración de Vercel...');
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

// Crear script de configuración de Cloudflare
console.log('\n☁️ Creando configuración de Cloudflare...');
const cloudflareConfig = `# Configuración de Cloudflare para red-salud.org

## 1. CONFIGURAR DNS
Ve a tu dashboard de Cloudflare y configura:

### Registros DNS:
- Tipo: CNAME
- Nombre: @
- Valor: cname.vercel-dns.com
- Proxy: ✅ Activado

- Tipo: CNAME  
- Nombre: www
- Valor: cname.vercel-dns.com
- Proxy: ✅ Activado

## 2. CONFIGURAR SSL/TLS
- Modo de encriptación: "Completo (estricto)"
- Siempre usar HTTPS: ✅ Activado
- HSTS: ✅ Activado

## 3. CONFIGURAR CACHE
- Nivel de caché: "Estándar"
- TTL del navegador: "Respetar encabezados existentes"

## 4. CONFIGURAR SEGURIDAD
- Nivel de seguridad: "Alto"
- Bot Fight Mode: ✅ Activado
- Challenge Passage: 30 minutos

## 5. CONFIGURAR PÁGINAS DE ERROR
- 404: https://red-salud.org/404
- 500: https://red-salud.org/500

## 6. CONFIGURAR REDIRECCIONES
- HTTP a HTTPS: ✅ Automático
- www a non-www: ✅ Configurado

## 7. CONFIGURAR WEBHOOKS
Una vez que el dominio esté funcionando:
- Ve al panel de Didit
- Configura webhook URL: https://red-salud.org/api/webhooks/didit
- Configura webhook secret: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
`;

fs.writeFileSync('CLOUDFLARE_SETUP.md', cloudflareConfig);
console.log('✅ Guía de Cloudflare creada');

// Crear script de monitoreo
console.log('\n📊 Creando configuración de monitoreo...');
const monitoringScript = `#!/usr/bin/env node

/**
 * Script de monitoreo para Red-Salud
 * Verifica el estado de todos los servicios
 */

const https = require('https');

const services = [
  {
    name: 'Aplicación Principal',
    url: 'https://red-salud.org',
    expectedStatus: 200
  },
  {
    name: 'API Webhook Didit',
    url: 'https://red-salud.org/api/webhooks/didit',
    expectedStatus: 405 // Method Not Allowed es correcto para GET
  },
  {
    name: 'Registro de Médicos',
    url: 'https://red-salud.org/auth/register/doctor',
    expectedStatus: 200
  },
  {
    name: 'Supabase',
    url: 'https://zonmvugejshdstymfdva.supabase.co',
    expectedStatus: 200
  },
  {
    name: 'Didit API',
    url: 'https://api.didit.me',
    expectedStatus: 401 // Unauthorized es correcto sin token
  }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const req = https.request(service.url, { method: 'GET' }, (res) => {
      const isHealthy = res.statusCode === service.expectedStatus;
      resolve({
        ...service,
        status: res.statusCode,
        healthy: isHealthy,
        responseTime: Date.now()
      });
    });
    
    req.on('error', () => {
      resolve({
        ...service,
        status: 'ERROR',
        healthy: false,
        responseTime: Date.now()
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        ...service,
        status: 'TIMEOUT',
        healthy: false,
        responseTime: Date.now()
      });
    });
    
    req.end();
  });
}

async function runHealthCheck() {
  console.log('🏥 VERIFICACIÓN DE SALUD - RED-SALUD');
  console.log('=' .repeat(50));
  
  const results = await Promise.all(services.map(checkService));
  
  results.forEach(service => {
    const status = service.healthy ? '✅' : '❌';
    console.log(\`\${status} \${service.name}: \${service.status}\`);
  });
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(\`\\n📊 Resumen: \${healthyCount}/\${totalCount} servicios funcionando\`);
  
  if (healthyCount === totalCount) {
    console.log('🎉 ¡Todos los servicios están funcionando correctamente!');
  } else {
    console.log('⚠️  Algunos servicios requieren atención');
  }
}

runHealthCheck();
`;

fs.writeFileSync('scripts/health-check.js', monitoringScript);
console.log('✅ Script de monitoreo creado');

// Actualizar package.json con nuevos scripts
console.log('\n📦 Actualizando package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "deploy:auto": "vercel --prod --token gJC7Ln77wkBoKlUSbo0wFxYA",
  "health:check": "node scripts/health-check.js",
  "setup:production": "node scripts/setup-production.js",
  "monitor": "node scripts/health-check.js"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json actualizado');

console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
console.log('=' .repeat(60));

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. 🔧 Configurar DNS en Cloudflare (ver CLOUDFLARE_SETUP.md)');
console.log('2. 🔑 Agregar secrets a GitHub (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)');
console.log('3. 🔗 Actualizar webhook de Didit con la URL de producción');
console.log('4. 🧪 Probar el sistema completo');

console.log('\n🔗 URLs importantes:');
console.log('- Aplicación: https://red-salud.org (una vez configurado DNS)');
console.log('- GitHub: https://github.com/firf18/medicos-platform');
console.log('- Vercel: https://vercel.com/firf1818-8965s-projects/red-salud-platform');

console.log('\n💡 COMANDOS ÚTILES:');
console.log('npm run deploy:auto    # Desplegar manualmente');
console.log('npm run health:check   # Verificar estado de servicios');
console.log('npm run monitor        # Monitoreo continuo');

console.log('\n⚠️  IMPORTANTE:');
console.log('Después de configurar DNS, ejecuta: npm run health:check');
console.log('Esto verificará que todos los servicios estén funcionando correctamente.');
