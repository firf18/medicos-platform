import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'
import Logger from '@/lib/logger'

const logger = new Logger({ 
  level: process.env.NODE_ENV === 'development' ? 'info' : 'error', 
  prefix: 'Supabase' 
})

// Función para limpiar cookies corruptas de Supabase
const clearCorruptedCookies = () => {
  if (typeof window === 'undefined') return;
  
  try {
    logger.debug('Checking for corrupted auth state');
    
    // Limpiar localStorage corrupto
    let cleanedLocalStorage = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase')) {
        try {
          const value = localStorage.getItem(key);
          if (value && (value.startsWith('base64-') || value.includes('"base64-'))) {
            localStorage.removeItem(key);
            cleanedLocalStorage++;
            logger.debug(`Removed corrupted localStorage: ${key}`);
          }
        } catch (e) {
          localStorage.removeItem(key);
          cleanedLocalStorage++;
          logger.debug(`Removed invalid localStorage: ${key}`);
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
            logger.debug(`Removed corrupted cookie: ${name}`);
          }
        } catch (e) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
          cleanedCookies++;
          logger.debug(`Removed invalid cookie: ${name}`);
        }
      }
    });
    
    if (cleanedLocalStorage > 0 || cleanedCookies > 0) {
      logger.info(`Cleaned ${cleanedLocalStorage} localStorage items and ${cleanedCookies} cookies`);
    } else {
      logger.debug('No corrupted auth state found');
    }
    
  } catch (error) {
    logger.error('Error cleaning corrupted auth state:', error);
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
    logger.warn('Unusual Supabase URL detected:', url);
  }
  
  if (key.length < 100) {
    logger.warn('Unusually short Supabase anon key');
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
    
    logger.debug('Creating Supabase client');
    logger.debug('URL:', url);
    logger.debug('Key:', key.substring(0, 20) + '...');
    
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
        debug: false // Desactivar debug de Supabase para reducir logs
      }
    });
    
    logger.info('Supabase client created successfully');
    
    // Agregar listener para errores de auth
    supabaseClient.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed:', event, session ? 'Session active' : 'No session');
      
      if (event === 'SIGNED_OUT') {
        logger.info('User signed out');
      } else if (event === 'SIGNED_IN') {
        logger.info('User signed in:', session?.user?.email);
      } else if (event === 'TOKEN_REFRESHED') {
        logger.debug('Token refreshed');
      }
    });
    
    return supabaseClient;
    
  } catch (error) {
    logger.error('Failed to create Supabase client:', error);
    throw error;
  }
};

// Función para resetear el cliente (útil para testing)
export const resetClient = () => {
  logger.debug('Resetting Supabase client');
  supabaseClient = null;
  clearCorruptedCookies();
};

// Alias para compatibilidad
export const getSupabaseBrowserClient = createClient;

export type SupabaseClient = ReturnType<typeof createClient>;