// Funciones de validación y utilidades para PersonalInfoStep

// Validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Validar nombre y apellido
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  return nameRegex.test(name.trim());
};

// Validar número de teléfono venezolano
export const validateVenezuelanPhone = (phone: string): boolean => {
  // Formato: +58XXXXXXXXX o XXXXXXXXXXX
  const phoneRegex = /^(\+58)?\d{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validar fortaleza de contraseña
export interface PasswordStrength {
  score: number;
  isValid: boolean;
  errors: string[];
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const errors: string[] = [];
  
  // Longitud mínima
  if (password.length >= 6) {
    score += 25;
  } else {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  // Letra mayúscula
  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  // Letra minúscula
  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  // Número
  if (/\d/.test(password)) {
    score += 25;
  } else {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  // Caracter especial (opcional pero aumenta puntuación)
  if (/[^A-Za-z0-9]/.test(password)) {
    score = Math.min(100, score + 10);
  }
  
  return {
    score,
    isValid: errors.length === 0,
    errors
  };
};

// Verificar disponibilidad de email (simulado)
export const checkEmailAvailability = async (email: string): Promise<{isAvailable: boolean}> => {
  // En un entorno real, esto haría una llamada API
  // Simulamos una demora de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Emails reservados para testing
  const reservedEmails = ['admin@example.com', 'test@example.com', 'doctor@example.com'];
  
  return {
    isAvailable: !reservedEmails.includes(email.toLowerCase())
  };
};

// Obtener clases CSS para el campo de formulario
export const getFieldClassName = (
  field: string,
  fieldTouched: Record<string, boolean>,
  hasError: boolean,
  isValid?: boolean
): string => {
  const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
  
  if (!fieldTouched[field]) {
    return `${baseClass} border-gray-300`;
  }
  
  if (hasError) {
    return `${baseClass} border-red-500 focus:ring-red-500`;
  }
  
  if (isValid) {
    return `${baseClass} border-green-500 focus:ring-green-500`;
  }
  
  return `${baseClass} border-gray-300`;
};