#!/usr/bin/env node

/**
 * Script para configurar variables de entorno en Vercel
 */

const { execSync } = require('child_process');

console.log('🔧 CONFIGURANDO VARIABLES DE ENTORNO EN VERCEL');
console.log('=' .repeat(50));

const envVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://zonmvugejshdstymfdva.supabase.co',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjE4OTQsImV4cCI6MjA3MjU5Nzg5NH0.MWyU7xDmAr5EsR661nwSC1q7D90I1_oQUhwGqtlJd6k',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://red-salud.org',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'NEXT_PUBLIC_DOMAIN',
    value: 'red-salud.org',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'DIDIT_API_KEY',
    value: 'f-zcERxhkl36e9BgfRm22XR_TUiROSLROuS7BlwRItM',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'DIDIT_WEBHOOK_SECRET',
    value: 'NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'DIDIT_BASE_URL',
    value: 'https://api.didit.me',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'NODE_ENV',
    value: 'production',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'NEXT_PUBLIC_APP_ENV',
    value: 'production',
    environments: ['production', 'preview', 'development']
  }
];

async function addEnvVar(envVar) {
  console.log(`\n📝 Agregando: ${envVar.name}`);
  
  for (const env of envVar.environments) {
    try {
      const command = `vercel env add ${envVar.name} ${env} --token gJC7Ln77wkBoKlUSbo0wFxYA`;
      
      // Simular input para el comando interactivo
      const input = `${envVar.value}\n`;
      
      execSync(command, { 
        input: input,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log(`  ✅ ${env}: Configurado`);
    } catch (error) {
      console.log(`  ⚠️  ${env}: ${error.message}`);
    }
  }
}

async function configureAllEnvVars() {
  for (const envVar of envVars) {
    await addEnvVar(envVar);
  }
}

configureAllEnvVars().then(() => {
  console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
  console.log('=' .repeat(50));
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. ✅ Variables de entorno configuradas en Vercel');
  console.log('2. 🔄 Redesplegar aplicación');
  console.log('3. 🔑 Configurar secrets en GitHub');
  
  console.log('\n🚀 COMANDOS:');
  console.log('npm run deploy:vercel    # Redesplegar con nuevas variables');
  console.log('vercel env ls            # Verificar variables');
});
