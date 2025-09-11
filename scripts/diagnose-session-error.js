#!/usr/bin/env node

/**
 * Script para diagnosticar y solucionar errores de AuthSessionMissingError
 */

const fs = require('fs');
const path = require('path');

// Funcion para cargar variables de entorno desde .env.local
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
  
  return env;
}

async function diagnoseSessionError() {
  console.log('🔍 DIAGNOSTICO DE AuthSessionMissingError\n');
  console.log('=' .repeat(50));
  
  const env = loadEnvLocal();
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Faltan variables de entorno');
    return;
  }
  
  console.log('✅ Variables de entorno encontradas');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    // Crear cliente con configuracion de debugging
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: true
      }
    });
    
    console.log('\n🧪 PROBANDO OPERACIONES DE SESION...');
    console.log('-' .repeat(40));
    
    // 1. Probar getSession
    console.log('\n1. Probando getSession()...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Error en getSession:', error.message);
        if (error.message.includes('AuthSessionMissingError')) {
          console.log('🚨 CONFIRMADO: AuthSessionMissingError presente');
        }
      } else {
        console.log('✅ getSession exitoso');
        console.log('   Sesion activa:', session ? 'Si' : 'No');
        if (session) {
          console.log('   Usuario:', session.user?.email);
          console.log('   Expira:', new Date(session.expires_at * 1000).toLocaleString());
        }
      }
    } catch (error) {
      console.log('💥 Excepcion en getSession:', error.message);
      if (error.name === 'AuthSessionMissingError') {
        console.log('🚨 CONFIRMADO: AuthSessionMissingError en excepcion');
      }
    }
    
    // 2. Probar refreshSession
    console.log('\n2. Probando refreshSession()...');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.log('❌ Error en refreshSession:', error.message);
      } else {
        console.log('✅ refreshSession exitoso');
        console.log('   Sesion refrescada:', data.session ? 'Si' : 'No');
      }
    } catch (error) {
      console.log('💥 Excepcion en refreshSession:', error.message);
    }
    
    // 3. Verificar estado de autenticacion
    console.log('\n3. Verificando estado de autenticacion...');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('❌ Error en getUser:', error.message);
      } else {
        console.log('✅ getUser exitoso');
        console.log('   Usuario autenticado:', user ? 'Si' : 'No');
        if (user) {
          console.log('   Email:', user.email);
          console.log('   Rol:', user.user_metadata?.role || 'No definido');
        }
      }
    } catch (error) {
      console.log('💥 Excepcion en getUser:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error critico:', error.message);
  }
  
  console.log('\n🔧 POSIBLES SOLUCIONES:');
  console.log('=' .repeat(50));
  console.log('\n1. 🧹 Limpiar estado corrupto:');
  console.log('   - Borrar localStorage del navegador');
  console.log('   - Limpiar cookies de Supabase');
  console.log('   - Reiniciar navegador');
  
  console.log('\n2. 🔄 Refrescar configuracion:');
  console.log('   - Verificar variables de entorno');
  console.log('   - Reiniciar servidor de desarrollo');
  console.log('   - Verificar configuracion de Supabase');
  
  console.log('\n3. 🛡️ Implementar recuperacion automatica:');
  console.log('   - useSessionRecovery hook implementado');
  console.log('   - AuthContext mejorado con manejo de errores');
  console.log('   - Middleware robusto implementado');
  
  console.log('\n📝 PASOS RECOMENDADOS:');
  console.log('=' .repeat(50));
  console.log('1. Ejecutar: npm run dev (reiniciar servidor)');
  console.log('2. Abrir DevTools → Application → Storage');
  console.log('3. Limpiar localStorage y cookies');
  console.log('4. Recargar pagina');
  console.log('5. Si persiste, verificar configuracion de Supabase');
  
  console.log('\n🔗 Enlaces utiles:');
  console.log(`• Dashboard: ${SUPABASE_URL.replace('/rest/v1', '')}`);
  console.log('• Docs Auth: https://supabase.com/docs/guides/auth');
  console.log('• Auth Helpers: https://supabase.com/docs/guides/auth/auth-helpers');
}

diagnoseSessionError().catch(console.error);