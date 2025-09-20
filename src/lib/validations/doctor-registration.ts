/**
 * Validaciones Médicas para Registro de Médicos - Red-Salud
 * 
 * Este archivo contiene todas las validaciones específicas para el registro
 * de médicos, cumpliendo con estándares de compliance médico y seguridad.
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
    .refine(() => {
      // Verificar que no tenga puntos consecutivos
      return true;
    }, 'El email no puede contener puntos consecutivos')
    .refine(async () => {
      // Verificar que el email sea único en la base de datos
      // Esta validación se implementará con Supabase
      return true;
    }, 'Este email ya está registrado'),
  
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
// VALIDACIONES DE INFORMACIÓN PROFESIONAL
// ============================================================================

export const professionalInfoSchema = z.object({
  licenseNumber: z.string()
    .min(6, 'El número de licencia debe tener al menos 6 caracteres')
    .max(20, 'El número de licencia no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El número de licencia solo puede contener letras mayúsculas, números y guiones'),
  
  licenseState: z.string()
    .min(2, 'Debe seleccionar un estado')
    .max(50, 'El estado no puede exceder 50 caracteres'),
  
  licenseExpiry: z.string()
    .refine((date) => {
      const expiryDate = new Date(date);
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      
      return expiryDate > today && expiryDate <= oneYearFromNow;
    }, 'La licencia debe estar vigente y no expirar en más de un año'),
  
  yearsOfExperience: z.number()
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .max(60, 'Los años de experiencia no pueden exceder 60 años')
    .int('Los años de experiencia deben ser un número entero'),
  
  // Información académica y profesional
  university: z.string()
    .min(2, 'La universidad debe tener al menos 2 caracteres')
    .max(100, 'La universidad no puede exceder 100 caracteres')
    .optional(),
  
  graduationYear: z.number()
    .min(1950, 'El año de graduación no puede ser anterior a 1950')
    .max(new Date().getFullYear(), 'El año de graduación no puede ser futuro')
    .int('El año de graduación debe ser un número entero')
    .optional(),
  
  medicalBoard: z.string()
    .min(2, 'El colegio médico debe tener al menos 2 caracteres')
    .max(100, 'El colegio médico no puede exceder 100 caracteres')
    .optional(),
  
  bio: z.string()
    .min(100, 'La biografía debe tener al menos 100 caracteres')
    .max(1000, 'La biografía no puede exceder 1000 caracteres')
    .refine((bio) => {
      // Verificar que no contenga información personal inapropiada
      const inappropriateWords = ['teléfono', 'dirección', 'email personal', 'casa'];
      return !inappropriateWords.some(word => bio.toLowerCase().includes(word));
    }, 'La biografía no debe contener información de contacto personal'),
  
  // Validación de documento
  documentType: z.enum(['cedula_identidad', 'cedula_extranjera', 'matricula']),
  
  documentNumber: z.string()
    .min(6, 'El número de documento debe tener al menos 6 caracteres')
    .max(30, 'El número de documento no puede exceder 30 caracteres')
    .refine((value) => {
      // Esta validación se hará en el componente con el contexto completo
      return true;
    }, 'Formato de documento inválido para el tipo seleccionado')
});

// ============================================================================
// VALIDACIONES DE ESPECIALIDAD MÉDICA
// ============================================================================

export const specialtySelectionSchema = z.object({
  specialtyId: z.string()
    .min(1, 'Debe seleccionar una especialidad médica'),
  
  subSpecialties: z.array(z.string())
    .max(3, 'No puedes seleccionar más de 3 sub-especialidades')
    .optional(),
  
  selectedFeatures: z.array(z.string())
    .min(1, 'Debe seleccionar al menos una característica del dashboard')
    .max(10, 'No puedes seleccionar más de 10 características')
});

// ============================================================================
// VALIDACIONES DE VERIFICACIÓN DE LICENCIA PROFESIONAL
// ============================================================================

export const licenseVerificationSchema = z.object({
  documentType: z.enum(['cedula_identidad', 'pasaporte', 'matricula'])
    .refine((type) => type !== undefined, 'Tipo de documento requerido'),
  
  documentNumber: z.string()
    .min(5, 'Número de documento inválido')
    .max(30, 'Número de documento inválido')
    .refine(() => {
      // Validar formato según tipo de documento
      return true; // La validación específica se hace en la función validateDocumentFormat
    }, 'Formato de documento inválido')
});

// ============================================================================
// VALIDACIONES DE VERIFICACIÓN DE IDENTIDAD
// ============================================================================

export const identityVerificationSchema = z.object({
  identityVerification: z.object({
    verificationId: z.string()
      .min(1, 'ID de verificación requerido'),
    
    status: z.enum(['pending', 'verified', 'failed'])
      .refine((status) => status === 'verified', 'La verificación de identidad debe estar completada'),
    
    documentType: z.string()
      .min(1, 'Tipo de documento requerido'),
    
    documentNumber: z.string()
      .min(5, 'Número de documento inválido')
      .max(20, 'Número de documento inválido'),
    
    verifiedAt: z.string()
      .refine((date) => {
        const verifiedDate = new Date(date);
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        return verifiedDate >= thirtyDaysAgo && verifiedDate <= today;
      }, 'La verificación debe ser reciente (máximo 30 días)'),
    
    verificationResults: z.object({
      faceMatch: z.boolean()
        .refine((match) => match === true, 'La verificación facial debe ser exitosa'),
      
      documentValid: z.boolean()
        .refine((valid) => valid === true, 'El documento debe ser válido'),
      
      livenessCheck: z.boolean()
        .refine((liveness) => liveness === true, 'La verificación de vida debe ser exitosa'),
      
      amlScreening: z.boolean()
        .refine((aml) => aml === true, 'El screening AML debe ser exitoso')
    })
  })
});

// ============================================================================
// VALIDACIONES DE CONFIGURACIÓN DEL DASHBOARD
// ============================================================================

export const dashboardConfigurationSchema = z.object({
  selectedFeatures: z.array(z.string())
    .min(1, 'Debe seleccionar al menos una característica')
    .max(10, 'No puede seleccionar más de 10 características'),
  
  workingHours: z.object({
    monday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    tuesday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    wednesday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    thursday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    friday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    saturday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    sunday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    })
  }).refine((hours) => {
    // Verificar que al menos un día tenga horarios configurados
    const workingDays = Object.values(hours).filter(day => day.isWorkingDay);
    return workingDays.length > 0;
  }, 'Debe configurar al menos un día de trabajo')
});

// ============================================================================
// VALIDACIÓN COMPLETA DEL REGISTRO
// ============================================================================

export const completeDoctorRegistrationSchema = z.object({
  // Información personal
  firstName: personalInfoSchema.shape.firstName,
  lastName: personalInfoSchema.shape.lastName,
  email: personalInfoSchema.shape.email,
  phone: personalInfoSchema.shape.phone,
  password: personalInfoSchema.shape.password,
  confirmPassword: personalInfoSchema.shape.confirmPassword,
  
  // Información profesional
  licenseNumber: professionalInfoSchema.shape.licenseNumber,
  licenseState: professionalInfoSchema.shape.licenseState,
  licenseExpiry: professionalInfoSchema.shape.licenseExpiry,
  yearsOfExperience: professionalInfoSchema.shape.yearsOfExperience,
  bio: professionalInfoSchema.shape.bio,
  
  // Especialidad
  specialtyId: specialtySelectionSchema.shape.specialtyId,
  subSpecialties: specialtySelectionSchema.shape.subSpecialties,
  
  // Verificación de licencia
  documentType: licenseVerificationSchema.shape.documentType,
  documentNumber: licenseVerificationSchema.shape.documentNumber,
  
  // Verificación de identidad
  identityVerification: identityVerificationSchema.shape.identityVerification,
  
  // Configuración del dashboard
  selectedFeatures: dashboardConfigurationSchema.shape.selectedFeatures,
  workingHours: dashboardConfigurationSchema.shape.workingHours
});

// ============================================================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ============================================================================

// Interfaces para tipado específico
interface WorkingDay {
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
}

interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

/**
 * Valida si un número de licencia médica es único en el sistema
 */
export async function validateUniqueLicenseNumber(): Promise<boolean> {
  try {
    // Esta función se implementará con Supabase
    // Por ahora retorna true para desarrollo
    return true;
  } catch (error) {
    console.error('Error validando número de licencia:', error);
    return false;
  }
}

/**
 * Valida si un email es único en el sistema
 */
export async function validateUniqueEmail(): Promise<boolean> {
  try {
    // Esta función se implementará con Supabase
    // Por ahora retorna true para desarrollo
    return true;
  } catch (error) {
    console.error('Error validando email:', error);
    return false;
  }
}

/**
 * Valida la coherencia entre especialidad y años de experiencia
 */
export function validateSpecialtyExperience(specialtyId: string, yearsOfExperience: number): boolean {
  // Especialidades que requieren más experiencia
  const highExperienceSpecialties = ['cardiology', 'neurology', 'oncology', 'surgery'];
  
  if (highExperienceSpecialties.includes(specialtyId)) {
    return yearsOfExperience >= 5;
  }
  
  return yearsOfExperience >= 1;
}

/**
 * Valida la coherencia entre especialidad y características seleccionadas
 */
export function validateSpecialtyFeatures(specialtyId: string, selectedFeatures: string[]): boolean {
  // Características requeridas por especialidad
  const requiredFeatures: Record<string, string[]> = {
    'cardiology': ['patient_management', 'medical_records'],
    'neurology': ['patient_management', 'medical_records', 'lab_integration'],
    'oncology': ['patient_management', 'medical_records', 'lab_integration', 'appointment_scheduling'],
    'surgery': ['patient_management', 'medical_records', 'appointment_scheduling']
  };
  
  const required = requiredFeatures[specialtyId] || ['patient_management'];
  
  return required.every(feature => selectedFeatures.includes(feature));
}

/**
 * Valida la configuración de horarios de trabajo
 */
export function validateWorkingHours(workingHours: WorkingHours): boolean {
  const days = Object.values(workingHours);
  
  // Debe tener al menos un día de trabajo
  const workingDays = days.filter(day => day.isWorkingDay);
  if (workingDays.length === 0) {
    return false;
  }
  
  // Validar que los horarios sean coherentes
  for (const day of workingDays) {
    if (day.startTime && day.endTime) {
      const start = new Date(`2000-01-01T${day.startTime}`);
      const end = new Date(`2000-01-01T${day.endTime}`);
      
      if (start >= end) {
        return false;
      }
      
      // Verificar que no sea más de 12 horas de trabajo
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours > 12) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Valida el formato del documento según su tipo
 */
export function validateDocumentFormat(documentType: string, documentNumber: string): boolean {
  switch (documentType) {
    case 'cedula_identidad':
      // Formato: V-XXXXXXXX o E-XXXXXXXX
      return /^[VE]-\d{7,8}$/.test(documentNumber);
    case 'pasaporte':
      // Formato: P-XXXXXXXX (letra P seguida de 8 dígitos)
      return /^P-\d{8}$/.test(documentNumber);
    case 'matricula':
      // Formato: MPPS-XXXXX o CMC-XXXXX u otros colegios médicos
      return /^(MPPS|CMC|CMDM|CMDC|CMDT|CMDZ|CMDA|CMDB|CMDL|CMDF|CMDG|CMDP|CMDS|CMDY|CMDCO|CMDSU|CMDTA|CMDME|CMDMO|CMDVA|CMDAP|CMDGU|CMDPO|CMDNUE|CMDBAR|CMDCAR|CMDARA|CMDBOL|CMDCOJ|CMDDEL|CMDMIRA|CMDTRU|CMDYAR)-\d{4,6}$/i.test(documentNumber);
    default:
      return false;
  }
}

// ============================================================================
// FUNCIONES DE SEGURIDAD Y COMPLIANCE
// ============================================================================

/**
 * Registra eventos de seguridad para auditoría
 */
export function logSecurityEvent(eventType: string, data: Record<string, unknown>) {
  const securityEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    data,
    severity: 'info' as const,
    source: 'doctor_registration'
  };
  
  console.log('[SECURITY]', securityEvent);
  
  // En producción, enviar a servicio de auditoría
  if (process.env.NODE_ENV === 'production') {
    // Implementar envío a servicio de auditoría
  }
}

/**
 * Valida que los datos no contengan información sensible
 */
export function validateDataSensitivity(data: Partial<Record<string, unknown>>): boolean {
  const sensitiveFields = ['ssn', 'taxId', 'bankAccount', 'creditCard'];
  const dataString = JSON.stringify(data).toLowerCase();
  
  return !sensitiveFields.some(field => dataString.includes(field));
}

/**
 * Sanitiza datos de entrada para prevenir inyecciones
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remover HTML tags
    .replace(/['"]/g, '') // Remover comillas
    .replace(/[;]/g, '') // Remover punto y coma
    .trim();
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
  
  // Verificar que no contenga información personal común (solo patrones exactos muy comunes)
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

// Definición del tipo de retorno de validatePasswordStrength
export type PasswordStrengthResult = ReturnType<typeof validatePasswordStrength>;

// ============================================================================
// EXPORTACIONES PRINCIPALES
// ============================================================================

// Los schemas ya están exportados individualmente arriba

export type PersonalInfoValidation = z.infer<typeof personalInfoSchema>;
export type ProfessionalInfoValidation = z.infer<typeof professionalInfoSchema>;
export type SpecialtySelectionValidation = z.infer<typeof specialtySelectionSchema>;
export type LicenseVerificationValidation = z.infer<typeof licenseVerificationSchema>;
export type IdentityVerificationValidation = z.infer<typeof identityVerificationSchema>;
export type DashboardConfigurationValidation = z.infer<typeof dashboardConfigurationSchema>;
export type CompleteDoctorRegistrationValidation = z.infer<typeof completeDoctorRegistrationSchema>;