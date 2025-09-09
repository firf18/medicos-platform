#!/usr/bin/env node

/**
 * Script para configurar la verificación por email en Supabase
 * 
 * Este script te guía para configurar la verificación por email en tu proyecto de Supabase.
 * Necesitas ejecutar estos pasos manualmente en el Dashboard de Supabase.
 */

console.log(`
🔧 CONFIGURACIÓN DE VERIFICACIÓN POR EMAIL
==========================================

Para habilitar la verificación por email con códigos OTP, sigue estos pasos:

1. 📧 CONFIGURACIÓN DE EMAIL
   - Ve a tu Dashboard de Supabase
   - Navega a Authentication > Settings
   - En la sección "Email", habilita:
     ✅ Enable email confirmations
     ✅ Enable email change confirmations
   
2. 🔐 CONFIGURACIÓN DE OTP
   - En la misma página, busca "Email OTP"
   - Configura:
     ✅ Enable email OTP
     ⏱️  OTP expiry: 600 seconds (10 minutos)
     📧 Email template: Personaliza el mensaje

3. 📨 PLANTILLA DE EMAIL (Opcional)
   - Ve a Authentication > Email Templates
   - Personaliza la plantilla "Confirm signup"
   - Ejemplo de mensaje:
     "Tu código de verificación es: {{ .Token }}"
     "Este código expira en 10 minutos."

4. 🌐 URL DE CONFIRMACIÓN
   - En Authentication > URL Configuration
   - Site URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
   - Redirect URLs: Agrega las URLs permitidas

5. 🔑 VARIABLES DE ENTORNO
   Asegúrate de tener estas variables en tu .env.local:
   
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

6. 🚀 FLUJO DE VERIFICACIÓN
   El flujo ahora será:
   Registro → Email con código → Verificación → Dashboard

✅ Una vez configurado, ejecuta las migraciones:
   npx supabase db push

🎉 ¡Listo! La verificación por email estará funcionando.

NOTAS IMPORTANTES:
- En desarrollo, revisa la pestaña "Logs" en Supabase para ver los emails
- En producción, configura un proveedor de email (SendGrid, etc.)
- Los códigos OTP son de 6 dígitos y expiran en 10 minutos
`);

// Verificar variables de entorno
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('\n🔍 VERIFICANDO VARIABLES DE ENTORNO:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: Configurada`);
  } else {
    console.log(`❌ ${envVar}: FALTA - Agrégala a tu .env.local`);
  }
});

console.log('\n📋 CHECKLIST:');
console.log('□ Configurar email confirmations en Supabase Dashboard');
console.log('□ Habilitar email OTP');
console.log('□ Personalizar plantilla de email (opcional)');
console.log('□ Configurar URLs de redirección');
console.log('□ Ejecutar migraciones de base de datos');
console.log('□ Probar el flujo de registro completo');

console.log('\n🔗 Enlaces útiles:');
console.log('- Dashboard de Supabase: https://app.supabase.com');
console.log('- Documentación de Auth: https://supabase.com/docs/guides/auth');
console.log('- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates');