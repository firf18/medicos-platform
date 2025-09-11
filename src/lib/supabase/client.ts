import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

// Función para limpiar cookies corruptas de Supabase
const clearCorruptedCookies = () => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('🔍 Checking for corrupted auth state...');
    
    // Limpiar localStorage corrupto
    let cleanedLocalStorage = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase')) {
        try {
          const value = localStorage.getItem(key);
          if (value && (value.startsWith('base64-') || value.includes('"base64-'))) {
            localStorage.removeItem(key);
            cleanedLocalStorage++;
            console.log(`🧹 Removed corrupted localStorage: ${key}`);
          }
        } catch (e) {
          localStorage.removeItem(key);
          cleanedLocalStorage++;
          console.log(`🧹 Removed invalid localStorage: ${key}`);
        }
      }
    });

    // Limpiar cookies corruptas
    let cleanedCookies = 0;
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('supabase')) {
        try {
          const value = cookie.substr(eqPos + 1);
          if (value && (value.startsWith('base64-') || value.includes('"base64-'))) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
            cleanedCookies++;
            console.log(`🧹 Removed corrupted cookie: ${name}`);
          }
        } catch (e) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
          cleanedCookies++;
          console.log(`🧹 Removed invalid cookie: ${name}`);
        }
      }
    });
    
    if (cleanedLocalStorage > 0 || cleanedCookies > 0) {
      console.log(`✅ Cleaned ${cleanedLocalStorage} localStorage items and ${cleanedCookies} cookies`);
    } else {
      console.log('✅ No corrupted auth state found');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning corrupted auth state:', error);
  }
};

// Función para validar variables de entorno
const validateEnvironment = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  
  if (!url.includes('supabase.co') && !url.includes('localhost')) {
    console.warn('⚠️ Unusual Supabase URL detected:', url);
  }
  
  if (key.length < 100) {
    console.warn('⚠️ Unusually short Supabase anon key');
  }
  
  return { url, key };
};

// Cliente singleton para evitar múltiples instancias
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Función para crear un cliente de Supabase
export const createClient = () => {
  // Reutilizar cliente existente si está disponible
  if (supabaseClient) {
    return supabaseClient;
  }
  
  try {
    // Validar variables de entorno
    const { url, key } = validateEnvironment();
    
    // Limpiar cookies corruptas antes de crear el cliente
    clearCorruptedCookies();
    
    console.log('🔧 Creating Supabase client...');
    console.log('🌐 URL:', url);
    console.log('🔑 Key:', key.substring(0, 20) + '...');
    
    supabaseClient = createBrowserClient<Database>(url, key, {
      cookieOptions: {
        name: 'supabase-auth-token',
        domain: undefined,
        path: '/',
        sameSite: 'lax',
        secure: url.includes('https')
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        autoRefreshToken: true,
        debug: process.env.NODE_ENV === 'development'
      }
    });
    
    console.log('✅ Supabase client created successfully');
    
    // Agregar listener para errores de auth
    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session ? 'Session active' : 'No session');
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
      } else if (event === 'SIGNED_IN') {
        console.log('👤 User signed in:', session?.user?.email);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
    });
    
    return supabaseClient;
    
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw error;
  }
};

// Función para resetear el cliente (útil para testing)
export const resetClient = () => {
  console.log('🔄 Resetting Supabase client...');
  supabaseClient = null;
  clearCorruptedCookies();
};

// Alias para compatibilidad
export const getSupabaseBrowserClient = createClient;

export type SupabaseClient = ReturnType<typeof createClient>;
