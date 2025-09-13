#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE CONFIGURACIÓN DE DOMINIO - RED-SALUD.ORG
 * 
 * Script para configurar automáticamente el dominio red-salud.org
 * con Cloudflare y Vercel
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface DomainConfig {
  domain: string;
  cloudflareZoneId: string;
  cloudflareApiToken: string;
  vercelProjectId: string;
  vercelToken: string;
  supabaseUrl: string;
}

class DomainSetup {
  private config: DomainConfig;

  constructor(config: DomainConfig) {
    this.config = config;
  }

  /**
   * Configurar DNS en Cloudflare
   */
  async setupCloudflareDNS() {
    console.log('🌐 Configurando DNS en Cloudflare...');

    try {
      // Crear registro CNAME para www
      const cnameCommand = `curl -X POST "https://api.cloudflare.com/client/v4/zones/${this.config.cloudflareZoneId}/dns_records" \
        -H "Authorization: Bearer ${this.config.cloudflareApiToken}" \
        -H "Content-Type: application/json" \
        --data '{
          "type": "CNAME",
          "name": "www",
          "content": "cname.vercel-dns.com",
          "ttl": 1,
          "proxied": true
        }'`;

      execSync(cnameCommand, { stdio: 'inherit' });
      console.log('✅ Registro CNAME creado para www.red-salud.org');

      // Crear registro A para dominio raíz
      const aRecordCommand = `curl -X POST "https://api.cloudflare.com/client/v4/zones/${this.config.cloudflareZoneId}/dns_records" \
        -H "Authorization: Bearer ${this.config.cloudflareApiToken}" \
        -H "Content-Type: application/json" \
        --data '{
          "type": "A",
          "name": "@",
          "content": "76.76.19.61",
          "ttl": 1,
          "proxied": true
        }'`;

      execSync(aRecordCommand, { stdio: 'inherit' });
      console.log('✅ Registro A creado para red-salud.org');

      // Configurar Page Rules para redirección
      const pageRuleCommand = `curl -X POST "https://api.cloudflare.com/client/v4/zones/${this.config.cloudflareZoneId}/pagerules" \
        -H "Authorization: Bearer ${this.config.cloudflareApiToken}" \
        -H "Content-Type: application/json" \
        --data '{
          "targets": [
            {
              "target": "url",
              "constraint": {
                "operator": "matches",
                "value": "red-salud.org/*"
              }
            }
          ],
          "actions": [
            {
              "id": "forwarding_url",
              "value": {
                "url": "https://www.red-salud.org/$1",
                "status_code": 301
              }
            }
          ],
          "priority": 1,
          "status": "active"
        }'`;

      execSync(pageRuleCommand, { stdio: 'inherit' });
      console.log('✅ Page Rule configurada para redirección');

    } catch (error) {
      console.error('❌ Error configurando Cloudflare DNS:', error);
      throw error;
    }
  }

  /**
   * Configurar dominio en Vercel
   */
  async setupVercelDomain() {
    console.log('🚀 Configurando dominio en Vercel...');

    try {
      // Agregar dominio al proyecto
      const addDomainCommand = `vercel domains add red-salud.org --project ${this.config.vercelProjectId}`;
      execSync(addDomainCommand, { stdio: 'inherit' });

      console.log('✅ Dominio agregado a Vercel');

      // Configurar variables de entorno
      const envVars = [
        `NEXT_PUBLIC_SITE_URL=https://red-salud.org`,
        `NEXT_PUBLIC_DOMAIN=red-salud.org`,
        `CLOUDFLARE_ZONE_ID=${this.config.cloudflareZoneId}`,
        `CLOUDFLARE_API_TOKEN=${this.config.cloudflareApiToken}`
      ];

      for (const envVar of envVars) {
        const [key, value] = envVar.split('=');
        const setEnvCommand = `vercel env add ${key} ${value} --project ${this.config.vercelProjectId}`;
        execSync(setEnvCommand, { stdio: 'inherit' });
      }

      console.log('✅ Variables de entorno configuradas');

    } catch (error) {
      console.error('❌ Error configurando Vercel:', error);
      throw error;
    }
  }

  /**
   * Configurar Supabase para el dominio personalizado
   */
  async setupSupabaseDomain() {
    console.log('🗄️ Configurando Supabase para dominio personalizado...');

    try {
      // Actualizar configuración de Supabase
      const supabaseConfig = {
        siteUrl: 'https://red-salud.org',
        redirectUrls: [
          'https://red-salud.org/auth/verify-email',
          'https://red-salud.org/auth/callback',
          'https://www.red-salud.org/auth/verify-email',
          'https://www.red-salud.org/auth/callback'
        ]
      };

      // Crear archivo de configuración
      const configPath = path.join(process.cwd(), 'supabase-domain-config.json');
      fs.writeFileSync(configPath, JSON.stringify(supabaseConfig, null, 2));

      console.log('✅ Configuración de Supabase creada');
      console.log('📋 Instrucciones manuales:');
      console.log('1. Ve a tu dashboard de Supabase');
      console.log('2. Authentication > Settings');
      console.log('3. Actualiza Site URL a: https://red-salud.org');
      console.log('4. Agrega Redirect URLs:');
      supabaseConfig.redirectUrls.forEach(url => {
        console.log(`   - ${url}`);
      });

    } catch (error) {
      console.error('❌ Error configurando Supabase:', error);
      throw error;
    }
  }

  /**
   * Verificar configuración DNS
   */
  async verifyDNS() {
    console.log('🔍 Verificando configuración DNS...');

    try {
      // Verificar resolución DNS
      const dnsCheck = execSync('nslookup red-salud.org', { encoding: 'utf8' });
      console.log('DNS Resolution:', dnsCheck);

      // Verificar conectividad HTTPS
      const httpsCheck = execSync('curl -I https://red-salud.org', { encoding: 'utf8' });
      console.log('HTTPS Check:', httpsCheck);

      console.log('✅ Verificación DNS completada');

    } catch (error) {
      console.error('❌ Error en verificación DNS:', error);
      throw error;
    }
  }

  /**
   * Ejecutar configuración completa
   */
  async setup() {
    console.log('🚀 Iniciando configuración de dominio red-salud.org...\n');

    try {
      await this.setupCloudflareDNS();
      console.log('');
      
      await this.setupVercelDomain();
      console.log('');
      
      await this.setupSupabaseDomain();
      console.log('');
      
      await this.verifyDNS();
      console.log('');

      console.log('🎉 ¡Configuración completada exitosamente!');
      console.log('🌐 Tu sitio estará disponible en: https://red-salud.org');
      console.log('📧 Recuerda configurar manualmente las URLs en Supabase');

    } catch (error) {
      console.error('💥 Error durante la configuración:', error);
      process.exit(1);
    }
  }
}

// Función principal
async function main() {
  const config: DomainConfig = {
    domain: 'red-salud.org',
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID || '',
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    vercelProjectId: process.env.VERCEL_PROJECT_ID || '',
    vercelToken: process.env.VERCEL_TOKEN || '',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  };

  // Validar configuración
  if (!config.cloudflareZoneId || !config.cloudflareApiToken) {
    console.error('❌ Error: CLOUDFLARE_ZONE_ID y CLOUDFLARE_API_TOKEN son requeridos');
    process.exit(1);
  }

  if (!config.vercelProjectId) {
    console.error('❌ Error: VERCEL_PROJECT_ID es requerido');
    process.exit(1);
  }

  const setup = new DomainSetup(config);
  await setup.setup();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { DomainSetup };
