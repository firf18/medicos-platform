#!/usr/bin/env node

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
