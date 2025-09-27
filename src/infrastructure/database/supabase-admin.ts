/**
 * Supabase Admin Client
 * @fileoverview Cliente administrativo de Supabase para operaciones server-side
 * Permite consultar auth.users y tablas públicas con privilegios administrativos
 */

import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno estén disponibles
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

// Crear cliente administrativo con service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Verificar disponibilidad de email en auth.users
 */
export async function checkEmailInAuthUsers(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (error) {
      // Si el error es "User not found", el email está disponible
      if (error.message?.includes('User not found') || error.message?.includes('not found')) {
        return true;
      }
      console.error('Error checking email in auth.users:', error);
      return false;
    }
    
    // Si encontramos un usuario, el email no está disponible
    return !data.user;
  } catch (error) {
    console.error('Exception checking email in auth.users:', error);
    return false;
  }
}

/**
 * Verificar disponibilidad de teléfono en auth.users
 */
export async function checkPhoneInAuthUsers(phone: string): Promise<boolean> {
  try {
    // Normalizar el teléfono para búsqueda
    const normalizedPhone = normalizeVenezuelanPhone(phone);
    
    // Buscar usuarios por teléfono usando RPC o consulta directa
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('phone')
      .eq('phone', normalizedPhone)
      .limit(1);
    
    if (error) {
      console.error('Error checking phone in profiles:', error);
      return false;
    }
    
    // Si no encontramos registros, el teléfono está disponible
    return data.length === 0;
  } catch (error) {
    console.error('Exception checking phone in profiles:', error);
    return false;
  }
}

/**
 * Verificar disponibilidad de email en tablas temporales de registro
 */
export async function checkEmailInTempTables(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_registration_temp')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .in('status', ['pending_verification', 'email_verified'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
      .limit(1);
    
    if (error) {
      console.error('Error checking email in temp tables:', error);
      return false;
    }
    
    // Si no encontramos registros activos, el email está disponible
    return data.length === 0;
  } catch (error) {
    console.error('Exception checking email in temp tables:', error);
    return false;
  }
}

/**
 * Verificar disponibilidad de teléfono en tablas temporales de registro
 */
export async function checkPhoneInTempTables(phone: string): Promise<boolean> {
  try {
    const normalizedPhone = normalizeVenezuelanPhone(phone);
    
    const { data, error } = await supabaseAdmin
      .from('doctor_registration_temp')
      .select('registration_data')
      .in('status', ['pending_verification', 'email_verified'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
      .limit(10); // Obtener varios registros para verificar en JSON
    
    if (error) {
      console.error('Error checking phone in temp tables:', error);
      return false;
    }
    
    // Verificar si algún registro tiene el teléfono en registration_data
    const phoneExists = data.some(record => {
      try {
        const registrationData = record.registration_data as any;
        return registrationData?.phone === normalizedPhone;
      } catch {
        return false;
      }
    });
    
    return !phoneExists;
  } catch (error) {
    console.error('Exception checking phone in temp tables:', error);
    return false;
  }
}

/**
 * Normalizar número de teléfono venezolano
 */
export function normalizeVenezuelanPhone(phone: string): string {
  // Remover espacios y caracteres especiales
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si empieza con +58, mantenerlo
  if (normalized.startsWith('+58')) {
    return normalized;
  }
  
  // Si empieza con 58, agregar +
  if (normalized.startsWith('58')) {
    return '+' + normalized;
  }
  
  // Si tiene 10 dígitos, agregar +58
  if (normalized.length === 10) {
    return '+58' + normalized;
  }
  
  // Si tiene 11 dígitos y empieza con 0, remover el 0 y agregar +58
  if (normalized.length === 11 && normalized.startsWith('0')) {
    return '+58' + normalized.substring(1);
  }
  
  return normalized;
}

/**
 * Verificar disponibilidad completa de email
 */
export async function checkEmailAvailability(email: string): Promise<{ available: boolean }> {
  try {
    // Verificar en auth.users
    const authAvailable = await checkEmailInAuthUsers(email);
    if (!authAvailable) {
      return { available: false };
    }
    
    // Verificar en tablas temporales
    const tempAvailable = await checkEmailInTempTables(email);
    if (!tempAvailable) {
      return { available: false };
    }
    
    return { available: true };
  } catch (error) {
    console.error('Error checking email availability:', error);
    return { available: false };
  }
}

/**
 * Verificar disponibilidad completa de teléfono
 */
export async function checkPhoneAvailability(phone: string): Promise<{ available: boolean; normalized?: string }> {
  try {
    const normalizedPhone = normalizeVenezuelanPhone(phone);
    
    // Verificar en auth.users/profiles
    const authAvailable = await checkPhoneInAuthUsers(normalizedPhone);
    if (!authAvailable) {
      return { available: false, normalized: normalizedPhone };
    }
    
    // Verificar en tablas temporales
    const tempAvailable = await checkPhoneInTempTables(normalizedPhone);
    if (!tempAvailable) {
      return { available: false, normalized: normalizedPhone };
    }
    
    return { available: true, normalized: normalizedPhone };
  } catch (error) {
    console.error('Error checking phone availability:', error);
    return { available: false, normalized: normalizeVenezuelanPhone(phone) };
  }
}