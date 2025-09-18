/**
 * Formateador de Errores de Zod - Red-Salud
 * 
 * Este módulo proporciona funciones para convertir errores de validación de Zod
 * en mensajes user-friendly para interfaces médicas.
 */

import { ZodError, ZodIssue } from 'zod';

// ============================================================================
// TIPOS DE ERRORES MÉDICOS
// ============================================================================

export interface FormattedError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ErrorSummary {
  hasErrors: boolean;
  errors: FormattedError[];
  warnings: FormattedError[];
  generalMessage?: string;
}

// ============================================================================
// MAPEO DE CÓDIGOS DE ERROR DE ZOD A MENSAJES MÉDICOS
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  // Errores de validación básica
  'too_small': 'El campo debe tener al menos {minimum} caracteres',
  'too_big': 'El campo no puede exceder {maximum} caracteres',
  'invalid_string': 'Formato inválido',
  'invalid_email': 'Formato de email inválido',
  'invalid_url': 'Formato de URL inválido',
  'invalid_date': 'Formato de fecha inválido',
  'invalid_type': 'Tipo de dato inválido',
  'invalid_format': 'El formato no es válido',
  
  // Errores específicos de campos médicos
  'invalid_phone': 'Formato de teléfono inválido. Use el formato: +1 234 567 8900',
  'invalid_license': 'Formato de cédula profesional inválido',
  'invalid_password': 'La contraseña debe cumplir con los requisitos de seguridad',
  'password_mismatch': 'Las contraseñas no coinciden',
  'email_exists': 'Este correo electrónico ya está registrado',
  'license_exists': 'Este número de cédula profesional ya está registrado',
  
  // Errores de regex
  'invalid_regex': 'El formato no es válido',
  'name_format': 'El nombre solo puede contener letras y espacios',
  'license_format': 'La cédula solo puede contener letras mayúsculas, números y guiones',
  
  // Errores de validación médica
  'invalid_specialty': 'Debe seleccionar una especialidad médica válida',
  'invalid_experience': 'Los años de experiencia deben ser realistas',
  'invalid_bio': 'La biografía debe ser profesional y apropiada',
  'invalid_working_hours': 'Los horarios de trabajo deben ser coherentes',
  
  // Errores de compliance
  'sensitive_data': 'Los datos contienen información sensible no permitida',
  'compliance_violation': 'La información no cumple con los estándares médicos',
  'audit_required': 'Se requiere auditoría para este tipo de información'
};

// ============================================================================
// FUNCIONES DE FORMATEO DE ERRORES
// ============================================================================

/**
 * Convierte un error de Zod en un mensaje user-friendly
 */
export function formatZodError(error: ZodError): ErrorSummary {
  const errors: FormattedError[] = [];
  const warnings: FormattedError[] = [];
  
  error.issues.forEach((issue: ZodIssue) => {
    const formattedError = formatZodIssue(issue);
    
    if (formattedError.severity === 'warning') {
      warnings.push(formattedError);
    } else {
      errors.push(formattedError);
    }
  });
  
  return {
    hasErrors: errors.length > 0,
    errors,
    warnings,
    generalMessage: errors.length > 0 
      ? `Se encontraron ${errors.length} error${errors.length > 1 ? 'es' : ''} en el formulario`
      : undefined
  };
}

/**
 * Convierte un issue individual de Zod en un error formateado
 */
export function formatZodIssue(issue: ZodIssue): FormattedError {
  const field = getFieldName(issue.path);
  const code = issue.code;
  const message = getErrorMessage(issue);
  const severity = getErrorSeverity(issue);
  
  return {
    field,
    message,
    code,
    severity
  };
}

/**
 * Obtiene el nombre del campo desde el path del error
 */
function getFieldName(path: PropertyKey[]): string {
  if (path.length === 0) return 'general';
  
  // Convertir PropertyKey a string para el mapeo
  const fieldKey = path[0]?.toString() || 'unknown';
  
  const fieldMap: Record<string, string> = {
    'firstName': 'nombre',
    'lastName': 'apellido',
    'email': 'correo electrónico',
    'phone': 'teléfono',
    'password': 'contraseña',
    'confirmPassword': 'confirmación de contraseña',
    'licenseNumber': 'cédula profesional',
    'licenseState': 'estado de expedición',
    'licenseExpiry': 'fecha de expiración',
    'yearsOfExperience': 'años de experiencia',
    'currentHospital': 'hospital actual',
    'bio': 'biografía profesional',
    'specialtyId': 'especialidad médica',
    'subSpecialties': 'sub-especialidades',
    'selectedFeatures': 'características del dashboard',
    'workingHours': 'horarios de trabajo',
    'identityVerification': 'verificación de identidad'
  };
  
  // fieldKey ya está definido arriba, se reutiliza aquí
  return fieldMap[fieldKey] || fieldKey;
}

/**
 * Obtiene el mensaje de error user-friendly
 */
function getErrorMessage(issue: ZodIssue): string {
  const code = issue.code;
  const field = getFieldName(issue.path);
  
  // Mensajes específicos por campo
  const fieldSpecificMessages = getFieldSpecificMessages(field, issue);
  if (fieldSpecificMessages) {
    return fieldSpecificMessages;
  }
  
  // Mensajes genéricos por código
  let message = ERROR_MESSAGES[code] || issue.message;
  
  // Reemplazar placeholders con valores reales
  if (issue.code === 'too_small' && issue.minimum !== undefined) {
    message = message.replace('{minimum}', issue.minimum.toString());
  }
  if (issue.code === 'too_big' && issue.maximum !== undefined) {
    message = message.replace('{maximum}', issue.maximum.toString());
  }
  
  return message;
}

/**
 * Obtiene mensajes específicos por campo
 */
function getFieldSpecificMessages(field: string, issue: ZodIssue): string | null {
  const fieldMessages: Record<string, Record<string, string>> = {
    'nombre': {
      'too_small': 'El nombre debe tener al menos 2 caracteres',
      'too_big': 'El nombre no puede exceder 50 caracteres',
      'invalid_format': 'El nombre solo puede contener letras y espacios'
    },
    'apellido': {
      'too_small': 'El apellido debe tener al menos 2 caracteres',
      'too_big': 'El apellido no puede exceder 50 caracteres',
      'invalid_format': 'El apellido solo puede contener letras y espacios'
    },
    'correo electrónico': {
      'invalid_format': 'Ingresa un correo electrónico válido',
      'too_small': 'El correo electrónico debe tener al menos 5 caracteres',
      'too_big': 'El correo electrónico no puede exceder 100 caracteres'
    },
    'teléfono': {
      'invalid_format': 'Formato de teléfono inválido. Use el formato: +1 234 567 8900',
      'too_small': 'El teléfono debe tener al menos 10 dígitos',
      'too_big': 'El teléfono no puede exceder 15 dígitos'
    },
    'contraseña': {
      'too_small': 'La contraseña debe tener al menos 6 caracteres',
      'too_big': 'La contraseña no puede exceder 128 caracteres',
      'invalid_format': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo especial'
    },
    'confirmación de contraseña': {
      'custom': 'Las contraseñas no coinciden'
    },
    'cédula profesional': {
      'too_small': 'La cédula profesional debe tener al menos 6 caracteres',
      'too_big': 'La cédula profesional no puede exceder 20 caracteres',
      'invalid_format': 'La cédula solo puede contener letras mayúsculas, números y guiones'
    },
    'biografía profesional': {
      'too_small': 'La biografía debe tener al menos 100 caracteres',
      'too_big': 'La biografía no debe exceder los 1000 caracteres',
      'custom': 'La biografía no debe contener información de contacto personal'
    }
  };
  
  return fieldMessages[field]?.[issue.code] || null;
}

/**
 * Determina la severidad del error
 */
function getErrorSeverity(issue: ZodIssue): 'error' | 'warning' | 'info' {
  // Errores críticos para datos médicos
  const criticalFields = ['email', 'password', 'licenseNumber', 'specialtyId'];
  const field = issue.path[0]?.toString();
  
  if (criticalFields.includes(field || '')) {
    return 'error';
  }
  
  // Errores de formato son warnings
  if (issue.code === 'invalid_format') {
    return 'warning';
  }
  
  // Errores de longitud son info
  if (issue.code === 'too_small' || issue.code === 'too_big') {
    return 'info';
  }
  
  return 'error';
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Agrupa errores por campo
 */
export function groupErrorsByField(errors: FormattedError[]): Record<string, FormattedError[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, FormattedError[]>);
}

/**
 * Obtiene el primer error de un campo específico
 */
export function getFirstErrorForField(errors: FormattedError[], field: string): string | null {
  const fieldError = errors.find(error => error.field === field);
  return fieldError?.message || null;
}

/**
 * Verifica si hay errores críticos
 */
export function hasCriticalErrors(errors: FormattedError[]): boolean {
  return errors.some(error => error.severity === 'error');
}

/**
 * Crea un mensaje de resumen de errores
 */
export function createErrorSummary(errors: FormattedError[]): string {
  if (errors.length === 0) return '';
  
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');
  
  let summary = '';
  
  if (criticalErrors.length > 0) {
    summary += `Se encontraron ${criticalErrors.length} error${criticalErrors.length > 1 ? 'es' : ''} crítico${criticalErrors.length > 1 ? 's' : ''} que deben corregirse.`;
  }
  
  if (warnings.length > 0) {
    summary += ` ${warnings.length} advertencia${warnings.length > 1 ? 's' : ''} adicional${warnings.length > 1 ? 'es' : ''}.`;
  }
  
  return summary;
}

// ============================================================================
// EXPORTACIONES PRINCIPALES
// ============================================================================

// Las funciones ya están exportadas individualmente arriba
