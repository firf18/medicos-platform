#!/usr/bin/env tsx

/**
 * Script de diagnóstico detallado para Didit.me
 * Ayuda a identificar problemas específicos en la integración
 */

import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

class DiditDiagnostic {
  async runDiagnostic(): Promise<void> {
    console.log('🔍 DIAGNÓSTICO DETALLADO DE DIDIT.ME');
    console.log('=' .repeat(50));

    await this.checkEnvironmentVariables();
    await this.testApiEndpoint();
    await this.testAuthentication();
    await this.checkWebhookConfiguration();
    await this.provideNextSteps();
  }

  private async checkEnvironmentVariables(): Promise<void> {
    console.log('\n🔧 Verificando variables de entorno...');
    
    const vars = {
      'DIDIT_API_KEY': process.env.DIDIT_API_KEY,
      'DIDIT_WEBHOOK_SECRET': process.env.DIDIT_WEBHOOK_SECRET,
      'DIDIT_BASE_URL': process.env.DIDIT_BASE_URL,
      'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL
    };

    for (const [key, value] of Object.entries(vars)) {
      if (!value) {
        console.log(`❌ ${key}: NO CONFIGURADA`);
      } else if (value.includes('tu_') || value.includes('aqui')) {
        console.log(`⚠️  ${key}: VALOR PLACEHOLDER`);
      } else {
        console.log(`✅ ${key}: CONFIGURADA`);
        if (key === 'DIDIT_API_KEY') {
          console.log(`   Formato: ${value.startsWith('f-') ? 'Correcto' : 'Incorrecto'}`);
          console.log(`   Longitud: ${value.length} caracteres`);
        }
        if (key === 'DIDIT_WEBHOOK_SECRET') {
          console.log(`   Longitud: ${value.length} caracteres`);
        }
      }
    }
  }

  private async testApiEndpoint(): Promise<void> {
    console.log('\n🌐 Probando endpoint de API...');
    
    const baseUrl = process.env.DIDIT_BASE_URL;
    const apiKey = process.env.DIDIT_API_KEY;
    
    if (!baseUrl || !apiKey) {
      console.log('❌ No se pueden probar endpoints sin configuración básica');
      return;
    }

    try {
      // Probar endpoint de salud/status
      const healthUrl = `${baseUrl}/health`;
      console.log(`   Probando: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status}`);
      console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`   Respuesta: ${data}`);
      } else {
        const error = await response.text();
        console.log(`   Error: ${error}`);
      }
    } catch (error: any) {
      console.log(`   Error de conexión: ${error.message}`);
    }

    try {
      // Probar endpoint de sesiones
      const sessionsUrl = `${baseUrl}/v2/sessions`;
      console.log(`   Probando: ${sessionsUrl}`);
      
      const response = await fetch(sessionsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Respuesta: ${JSON.stringify(data, null, 2)}`);
      } else {
        const error = await response.text();
        console.log(`   Error: ${error}`);
      }
    } catch (error: any) {
      console.log(`   Error de conexión: ${error.message}`);
    }
  }

  private async testAuthentication(): Promise<void> {
    console.log('\n🔐 Probando autenticación...');
    
    const baseUrl = process.env.DIDIT_BASE_URL;
    const apiKey = process.env.DIDIT_API_KEY;
    
    if (!baseUrl || !apiKey) {
      console.log('❌ No se puede probar autenticación sin configuración básica');
      return;
    }

    try {
      // Probar con endpoint que requiere autenticación
      const authUrl = `${baseUrl}/v2/account`;
      console.log(`   Probando autenticación en: ${authUrl}`);
      
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('   ❌ API Key inválida o expirada');
      } else if (response.status === 403) {
        console.log('   ⚠️  API Key válida pero sin permisos suficientes');
      } else if (response.ok) {
        console.log('   ✅ Autenticación exitosa');
        const data = await response.json();
        console.log(`   Datos de cuenta: ${JSON.stringify(data, null, 2)}`);
      } else {
        const error = await response.text();
        console.log(`   Error: ${error}`);
      }
    } catch (error: any) {
      console.log(`   Error de conexión: ${error.message}`);
    }
  }

  private async checkWebhookConfiguration(): Promise<void> {
    console.log('\n🔗 Verificando configuración de webhook...');
    
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`;
    console.log(`   URL del webhook: ${webhookUrl}`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.status === 404) {
        console.log('   ⚠️  Endpoint no encontrado (normal si no está desplegado)');
      } else if (response.status === 405) {
        console.log('   ✅ Endpoint existe pero requiere POST (correcto)');
      } else {
        console.log(`   Respuesta: ${response.status}`);
      }
    } catch (error: any) {
      console.log(`   Error: ${error.message}`);
    }
  }

  private async provideNextSteps(): Promise<void> {
    console.log('\n📋 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('=' .repeat(50));
    
    console.log('\n1. 🔑 VERIFICAR API KEY:');
    console.log('   - Confirma que la API key sea válida en el dashboard de Didit');
    console.log('   - Verifica que tenga permisos para crear sesiones');
    console.log('   - Asegúrate de que no haya expirado');
    
    console.log('\n2. 🌐 VERIFICAR ENDPOINT:');
    console.log('   - Confirma que la URL base sea correcta: https://api.didit.me');
    console.log('   - Verifica que la API esté disponible');
    console.log('   - Revisa la documentación de Didit para cambios recientes');
    
    console.log('\n3. 🔗 CONFIGURAR WEBHOOK:');
    console.log('   - Ve al dashboard de Didit');
    console.log('   - Configura el webhook URL: https://red-salud.org/api/webhooks/didit');
    console.log('   - Usa el secret: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck');
    
    console.log('\n4. 🧪 PROBAR MANUALMENTE:');
    console.log('   - Usa Postman o curl para probar la API directamente');
    console.log('   - Crea una sesión de prueba desde el dashboard');
    console.log('   - Verifica que los webhooks lleguen correctamente');
    
    console.log('\n5. 📞 CONTACTAR SOPORTE:');
    console.log('   - Si todo parece correcto, contacta soporte de Didit');
    console.log('   - Proporciona la API key y los logs de error');
    console.log('   - Solicita verificación de la configuración');
    
    console.log('\n💡 COMANDOS ÚTILES:');
    console.log('   npm run test:didit          # Ejecutar pruebas completas');
    console.log('   npm run dev                 # Iniciar servidor de desarrollo');
    console.log('   npm run build               # Construir para producción');
  }
}

// Ejecutar diagnóstico
async function main() {
  try {
    const diagnostic = new DiditDiagnostic();
    await diagnostic.runDiagnostic();
  } catch (error) {
    console.error('❌ Error ejecutando diagnóstico:', error);
    process.exit(1);
  }
}

main();
