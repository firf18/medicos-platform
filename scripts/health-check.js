#!/usr/bin/env node

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
    console.log(`${status} ${service.name}: ${service.status}`);
  });
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Resumen: ${healthyCount}/${totalCount} servicios funcionando`);
  
  if (healthyCount === totalCount) {
    console.log('🎉 ¡Todos los servicios están funcionando correctamente!');
  } else {
    console.log('⚠️  Algunos servicios requieren atención');
  }
}

runHealthCheck();
