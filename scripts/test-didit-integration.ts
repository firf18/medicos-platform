#!/usr/bin/env tsx

/**
 * Script de verificación de integración con Didit.me
 * Verifica cada servicio paso a paso para asegurar conectividad completa
 */

import { config } from 'dotenv';
import { DiditIntegration } from '../src/lib/didit-integration';

// Cargar variables de entorno
config({ path: '.env.local' });

interface TestResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

class DiditTester {
  private didit: DiditIntegration;
  private results: TestResult[] = [];

  constructor() {
    const config = {
      apiKey: process.env.DIDIT_API_KEY!,
      baseUrl: process.env.DIDIT_BASE_URL!,
      webhookSecret: process.env.DIDIT_WEBHOOK_SECRET!,
      timeout: 30000
    };
    this.didit = new DiditIntegration(config);
  }

  private addResult(service: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ service, status, message, details });
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
    console.log(`${emoji} ${service}: ${message}`);
    if (details) {
      console.log(`   Detalles: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async testEnvironmentVariables(): Promise<void> {
    console.log('\n🔧 Verificando variables de entorno...');
    
    const requiredVars = [
      'DIDIT_API_KEY',
      'DIDIT_WEBHOOK_SECRET',
      'DIDIT_BASE_URL',
      'NEXT_PUBLIC_SITE_URL'
    ];

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value || value.includes('tu_') || value.includes('aqui')) {
        this.addResult('Environment Variables', 'error', `Variable ${varName} no configurada correctamente`);
        return;
      }
    }

    this.addResult('Environment Variables', 'success', 'Todas las variables de entorno están configuradas');
  }

  async testApiConnection(): Promise<void> {
    console.log('\n🌐 Probando conexión con API de Didit...');
    
    try {
      // Crear una sesión de prueba
      const testData = {
        firstName: 'Test',
        lastName: 'Doctor',
        email: 'test@red-salud.org',
        phone: '+525512345678',
        licenseNumber: 'TEST123456',
        specialty: 'Medicina General',
        documentType: 'national_id' as const,
        documentNumber: 'TEST123456'
      };

      const session = await this.didit.createVerificationSession(testData);
      
      if (session && session.sessionId) {
        this.addResult('API Connection', 'success', 'Conexión exitosa con API de Didit', {
          sessionId: session.sessionId,
          url: session.verificationUrl
        });
      } else {
        this.addResult('API Connection', 'error', 'No se pudo crear sesión de verificación');
      }
    } catch (error: any) {
      this.addResult('API Connection', 'error', `Error en conexión API: ${error.message}`, {
        error: error.message,
        status: error.status
      });
    }
  }

  async testWebhookEndpoint(): Promise<void> {
    console.log('\n🔗 Verificando endpoint de webhook...');
    
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`;
    
    try {
      // Simular una petición de prueba al webhook
      const testPayload = {
        event: 'verification.completed',
        sessionId: 'test-session-id',
        status: 'completed',
        verification: {
          document: { status: 'verified' },
          biometric: { status: 'verified' },
          liveness: { status: 'verified' }
        }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Didit-Signature': 'test-signature'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        this.addResult('Webhook Endpoint', 'success', 'Endpoint de webhook accesible', {
          url: webhookUrl,
          status: response.status
        });
      } else {
        this.addResult('Webhook Endpoint', 'warning', `Endpoint accesible pero con error: ${response.status}`);
      }
    } catch (error: any) {
      this.addResult('Webhook Endpoint', 'error', `Error accediendo al webhook: ${error.message}`);
    }
  }

  async testVerificationFlow(): Promise<void> {
    console.log('\n🔄 Probando flujo completo de verificación...');
    
    try {
      // Paso 1: Crear sesión
      const sessionData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'doctor.test@red-salud.org',
        phone: '+525512345678',
        licenseNumber: 'CED123456789',
        specialty: 'Medicina General',
        documentType: 'national_id' as const,
        documentNumber: 'CED123456789'
      };

      const session = await this.didit.createVerificationSession(sessionData);
      
      if (!session || !session.sessionId) {
        this.addResult('Verification Flow', 'error', 'No se pudo crear sesión de verificación');
        return;
      }

      // Paso 2: Verificar estado
      const status = await this.didit.getVerificationStatus(session.sessionId);
      
      if (status) {
        this.addResult('Verification Flow', 'success', 'Flujo de verificación funcionando correctamente', {
          sessionId: session.sessionId,
          status: status.status,
          steps: status.steps
        });
      } else {
        this.addResult('Verification Flow', 'warning', 'Sesión creada pero no se pudo obtener estado');
      }
    } catch (error: any) {
      this.addResult('Verification Flow', 'error', `Error en flujo de verificación: ${error.message}`);
    }
  }

  async testDocumentTypes(): Promise<void> {
    console.log('\n📄 Verificando tipos de documento soportados...');
    
    const supportedTypes = [
      'national_id',
      'passport',
      'drivers_license'
    ];

    for (const docType of supportedTypes) {
      try {
        const testData = {
          firstName: 'Test',
          lastName: 'Doctor',
          email: `test.${docType}@red-salud.org`,
          phone: '+525512345678',
          licenseNumber: `TEST${docType.toUpperCase()}123`,
          specialty: 'Medicina General',
          documentType: docType as 'national_id' | 'passport' | 'drivers_license',
          documentNumber: `TEST${docType.toUpperCase()}123`
        };

        const session = await this.didit.createVerificationSession(testData);
        
        if (session && session.sessionId) {
          this.addResult('Document Types', 'success', `Tipo de documento ${docType} soportado`);
        } else {
          this.addResult('Document Types', 'warning', `Tipo de documento ${docType} no disponible`);
        }
      } catch (error: any) {
        this.addResult('Document Types', 'error', `Error con tipo ${docType}: ${error.message}`);
      }
    }
  }

  async testSecurityFeatures(): Promise<void> {
    console.log('\n🔒 Verificando características de seguridad...');
    
    try {
      // Verificar que el webhook secret esté configurado
      const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET;
      
      if (!webhookSecret || webhookSecret.length < 20) {
        this.addResult('Security Features', 'error', 'Webhook secret no configurado correctamente');
        return;
      }

      // Verificar que la API key tenga el formato correcto
      const apiKey = process.env.DIDIT_API_KEY;
      
      if (!apiKey || !apiKey.startsWith('f-')) {
        this.addResult('Security Features', 'error', 'API key no tiene formato correcto');
        return;
      }

      this.addResult('Security Features', 'success', 'Características de seguridad configuradas correctamente', {
        apiKeyFormat: 'correcto',
        webhookSecretLength: webhookSecret.length
      });
    } catch (error: any) {
      this.addResult('Security Features', 'error', `Error verificando seguridad: ${error.message}`);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DE DIDIT.ME');
    console.log('=' .repeat(60));

    await this.testEnvironmentVariables();
    await this.testApiConnection();
    await this.testWebhookEndpoint();
    await this.testVerificationFlow();
    await this.testDocumentTypes();
    await this.testSecurityFeatures();

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN DIDIT.ME');
    console.log('='.repeat(60));

    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;

    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`⚠️  Advertencias: ${warningCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 ¡INTEGRACIÓN CON DIDIT.ME COMPLETAMENTE FUNCIONAL!');
      console.log('✅ Todos los servicios están operativos');
      console.log('✅ El registro de médicos está listo para producción');
    } else {
      console.log('\n⚠️  Se encontraron errores que requieren atención:');
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`   ❌ ${r.service}: ${r.message}`));
    }

    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Configurar webhook en el dashboard de Didit.me');
    console.log('2. Probar registro completo de médico');
    console.log('3. Verificar notificaciones en tiempo real');
    console.log('4. Configurar monitoreo de eventos');
  }
}

// Ejecutar las pruebas
async function main() {
  try {
    const tester = new DiditTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error);
    process.exit(1);
  }
}

main();
