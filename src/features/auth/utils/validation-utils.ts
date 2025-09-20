/**
 * Utilidades de Validación para Autenticación
 * 
 * Centraliza todas las funciones de validación utilizadas
 * en los formularios de autenticación y registro.
 */

interface PasswordStrength {
  score: number; // 0-4
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

/**
 * Valida un nombre (firstName o lastName)
 */
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  
  // Debe tener al menos 2 caracteres
  if (trimmedName.length < 2) return false;
  
  // Solo debe contener letras, espacios, acentos y caracteres especiales del español
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  return nameRegex.test(trimmedName);
};

/**
 * Valida un email
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const trimmedEmail = email.trim();
  
  // Regex más estricta para emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(trimmedEmail) && trimmedEmail.length <= 254;
};

/**
 * Valida un teléfono venezolano
 */
export const validateVenezuelanPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/\s+/g, '');
  
  // Formato: +58 seguido de 10 dígitos
  // Acepta códigos de área: 412, 414, 424, 416, 426 (móviles) y 212, 241, 243, 244, 245, 246, 247, 248, 249, 251, 252, 253, 254, 255, 256, 257, 258, 259, 261, 262, 263, 264, 265, 266, 267, 268, 269, 271, 272, 273, 274, 275, 276, 277, 278, 279, 281, 282, 283, 284, 285, 286, 287, 288, 289, 291, 292, 293, 294, 295 (fijos)
  const phoneRegex = /^\+58(412|414|424|416|426|212|241|243|244|245|246|247|248|249|251|252|253|254|255|256|257|258|259|261|262|263|264|265|266|267|268|269|271|272|273|274|275|276|277|278|279|281|282|283|284|285|286|287|288|289|291|292|293|294|295)\d{7}$/;
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Valida la fortaleza de una contraseña
 */
export const validatePasswordStrength = (password: string): PasswordStrength => {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      isValid: false,
      errors: ['La contraseña es requerida'],
      suggestions: ['Ingresa una contraseña']
    };
  }

  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Longitud mínima
  if (password.length < 6) {
    errors.push('Debe tener al menos 6 caracteres');
    suggestions.push('Agrega más caracteres a tu contraseña');
  } else {
    score += 1;
  }

  // Contiene mayúsculas
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
    suggestions.push('Agrega al menos una letra mayúscula');
  } else {
    score += 1;
  }

  // Contiene minúsculas
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
    suggestions.push('Agrega al menos una letra minúscula');
  } else {
    score += 1;
  }

  // Contiene números
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
    suggestions.push('Agrega al menos un número');
  } else {
    score += 1;
  }

  // Bonificaciones para contraseñas más fuertes
  if (password.length >= 8) {
    score += 0.5;
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 0.5;
    if (score > 4) score = 4;
  } else if (score >= 3) {
    suggestions.push('Considera agregar símbolos especiales para mayor seguridad');
  }

  // Penalizaciones
  if (/(.)\1{2,}/.test(password)) {
    score -= 0.5;
    suggestions.push('Evita repetir el mismo carácter consecutivamente');
  }

  if (/123|abc|qwe|password|admin|user/i.test(password)) {
    score -= 1;
    suggestions.push('Evita usar patrones comunes o palabras obvias');
  }

  // Asegurar que el score esté en el rango correcto
  score = Math.max(0, Math.min(4, Math.floor(score)));

  const isValid = errors.length === 0 && score >= 2;

  return {
    score,
    isValid,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
};

/**
 * Valida que dos contraseñas coincidan
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

/**
 * Valida un número de licencia médica venezolana
 */
export const validateMedicalLicense = (licenseNumber: string): boolean => {
  if (!licenseNumber || typeof licenseNumber !== 'string') return false;
  
  const cleanLicense = licenseNumber.trim().replace(/\s+/g, '');
  
  // Formato típico: letras seguidas de números (ej: MPPS123456, CM12345)
  const licenseRegex = /^[A-Z]{2,6}\d{4,8}$/;
  
  return licenseRegex.test(cleanLicense) && cleanLicense.length >= 6 && cleanLicense.length <= 14;
};

/**
 * Valida una fecha de expiración
 */
export const validateExpirationDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  // La fecha debe ser válida y estar en el futuro
  return !isNaN(date.getTime()) && date > now;
};

/**
 * Valida años de experiencia
 */
export const validateYearsOfExperience = (years: number): boolean => {
  return Number.isInteger(years) && years >= 0 && years <= 60;
};

/**
 * Valida un texto de biografía
 */
export const validateBio = (bio: string): boolean => {
  if (!bio || typeof bio !== 'string') return false;
  
  const trimmedBio = bio.trim();
  
  // Entre 10 y 500 caracteres
  return trimmedBio.length >= 10 && trimmedBio.length <= 500;
};

/**
 * Valida un URL
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers
};

/**
 * Valida que un string no contenga contenido malicioso
 */
export const validateSafeString = (input: string): boolean => {
  if (!input || typeof input !== 'string') return true;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Valida un código postal venezolano
 */
export const validateVenezuelanPostalCode = (postalCode: string): boolean => {
  if (!postalCode || typeof postalCode !== 'string') return false;
  
  const cleanCode = postalCode.trim().replace(/\s+/g, '');
  
  // Formato: 4 dígitos seguidos de una letra opcional
  const postalCodeRegex = /^\d{4}[A-Z]?$/;
  
  return postalCodeRegex.test(cleanCode);
};

/**
 * Valida un RIF venezolano
 */
export const validateVenezuelanRIF = (rif: string): boolean => {
  if (!rif || typeof rif !== 'string') return false;
  
  const cleanRIF = rif.trim().replace(/[-\s]/g, '');
  
  // Formato: letra seguida de 8 dígitos y un dígito verificador
  const rifRegex = /^[VEJPG]\d{9}$/;
  
  if (!rifRegex.test(cleanRIF)) return false;
  
  // Validar dígito verificador (algoritmo simplificado)
  const weights = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  const rifNumbers = cleanRIF.substring(1, 9);
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(rifNumbers[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === parseInt(cleanRIF[9]);
};