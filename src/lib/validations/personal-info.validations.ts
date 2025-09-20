/**
 * Personal Info Validations - Red-Salud Platform
 * 
 * Validaciones específicas para información personal de usuarios médicos.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { z } from 'zod';

// ============================================================================
// VALIDACIONES DE INFORMACIÓN PERSONAL
// ============================================================================

export const personalInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(100, 'El email no puede exceder 100 caracteres')
    .refine((email) => {
      // Verificar que no tenga puntos consecutivos
      return !email.includes('..');
    }, 'El email no puede contener puntos consecutivos'),
  
  phone: z.string()
    .regex(/^\+58[24]\d{9}$/, 'Debe ser un número de teléfono venezolano válido (+58XXXXXXXXX)')
    .min(13, 'El teléfono venezolano debe tener 13 caracteres (+58XXXXXXXXX)')
    .max(13, 'El teléfono venezolano debe tener 13 caracteres (+58XXXXXXXXX)'),
  
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&._-]*$/, 
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// ============================================================================
// VALIDACIONES ESPECÍFICAS DE INFORMACIÓN PERSONAL
// ============================================================================

/**
 * Valida si un email es único en el sistema
 */
export async function validateUniqueEmail(email: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    // TODO: Implementar validación con Supabase
    // const { data, error } = await supabase
    //   .from('profiles')
    //   .select('email')
    //   .eq('email', email)
    //   .single();
    
    // Por ahora retorna true para desarrollo
    return { isValid: true };
  } catch (error) {
    console.error('Error validando email único:', error);
    return { 
      isValid: false, 
      error: 'Error al verificar la disponibilidad del email' 
    };
  }
}

/**
 * Valida el formato de teléfono venezolano
 */
export function validateVenezuelanPhone(phone: string): { isValid: boolean; error?: string } {
  // Formato esperado: +58424XXXXXXX o +58414XXXXXXX
  const venezuelanPhoneRegex = /^\+58(412|414|416|424|426)\d{7}$/;
  
  if (!venezuelanPhoneRegex.test(phone)) {
    return {
      isValid: false,
      error: 'Debe ser un número de teléfono venezolano válido (ej: +58424XXXXXXX)'
    };
  }
  
  return { isValid: true };
}

/**
 * Valida el formato de contraseña según estándares médicos profesionales
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;
  
  // Longitud mínima para médicos
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  } else {
    score += 25;
  }
  
  // Mayúscula requerida
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  } else {
    score += 25;
  }
  
  // Minúscula requerida
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  } else {
    score += 25;
  }
  
  // Número requerido
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  } else {
    score += 25;
  }
  
  // Caracteres especiales son opcionales pero suman puntos
  if (/[@$!%*?&._-]/.test(password)) {
    score += 10; // Bonus por caracteres especiales
  }
  
  // Verificar que no contenga patrones comunes
  const commonPatterns = ['123456', 'password', 'admin', 'qwerty', '123123'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('No debe contener patrones comunes como "123456", "password", etc.');
    score -= 20;
  }
  
  // Verificar longitud adicional (bonus)
  if (password.length >= 8) {
    score += 10; // Bonus por longitud extra
  }
  
  // Verificar diversidad de caracteres
  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars >= 8) {
    score += 10; // Bonus por diversidad
  }
  
  return {
    isValid: errors.length === 0 && score >= 75,
    errors,
    score: Math.min(100, Math.max(0, score))
  };
}

/**
 * Sanitiza datos de entrada para prevenir inyecciones
 */
export function sanitizePersonalInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remover HTML tags
    .replace(/['"]/g, '') // Remover comillas
    .replace(/[;]/g, '') // Remover punto y coma
    .trim();
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type PersonalInfoValidation = z.infer<typeof personalInfoSchema>;
export type PasswordStrengthResult = ReturnType<typeof validatePasswordStrength>;
