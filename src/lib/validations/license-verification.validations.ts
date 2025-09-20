/**
 * License Verification Validations - Red-Salud Platform
 * 
 * Validaciones específicas para verificación de licencias médicas profesionales.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { z } from 'zod';

// ============================================================================
// VALIDACIONES DE VERIFICACIÓN DE LICENCIA PROFESIONAL
// ============================================================================

export const licenseVerificationSchema = z.object({
  documentType: z.enum(['cedula_identidad', 'cedula_extranjera', 'matricula_profesional'])
    .refine((type) => type !== undefined, 'Tipo de documento requerido'),
  
  documentNumber: z.string()
    .min(5, 'Número de documento inválido')
    .max(30, 'Número de documento inválido'),
  
  licenseNumber: z.string()
    .min(5, 'Número de licencia médica requerido')
    .max(20, 'Número de licencia médica inválido'),
  
  issuingAuthority: z.string()
    .min(2, 'Autoridad emisora requerida')
    .max(100, 'Nombre de autoridad emisora demasiado largo'),
  
  issueDate: z.string()
    .refine((date) => {
      const issueDate = new Date(date);
      const currentDate = new Date();
      const minDate = new Date('1950-01-01');
      
      return issueDate >= minDate && issueDate <= currentDate;
    }, 'Fecha de emisión inválida'),
  
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const expiryDate = new Date(date);
      const currentDate = new Date();
      
      return expiryDate > currentDate;
    }, 'La licencia debe estar vigente')
});

// ============================================================================
// TIPOS DE DOCUMENTOS Y AUTORIDADES VENEZOLANAS
// ============================================================================

export const VENEZUELAN_DOCUMENT_TYPES = {
  cedula_identidad: {
    name: 'Cédula de Identidad',
    format: /^[VE]-\d{7,8}$/,
    description: 'Formato: V-12345678 o E-12345678'
  },
  cedula_extranjera: {
    name: 'Cédula de Extranjero',
    format: /^E-\d{7,8}$/,
    description: 'Formato: E-12345678'
  },
  matricula_profesional: {
    name: 'Matrícula Profesional',
    format: /^[A-Z]{2,6}-\d{4,6}$/,
    description: 'Formato: MPPS-12345, CMC-67890, etc.'
  }
} as const;

export const VENEZUELAN_MEDICAL_AUTHORITIES = [
  {
    code: 'MPPS',
    name: 'Ministerio del Poder Popular para la Salud',
    type: 'nacional',
    licenseFormat: /^MPPS-\d{4,6}$/
  },
  {
    code: 'CMC',
    name: 'Colegio de Médicos de Caracas',
    type: 'estadal',
    licenseFormat: /^CMC-\d{4,6}$/
  },
  {
    code: 'CMDM',
    name: 'Colegio de Médicos del Estado Miranda',
    type: 'estadal',
    licenseFormat: /^CMDM-\d{4,6}$/
  },
  {
    code: 'CMDC',
    name: 'Colegio de Médicos de Carabobo',
    type: 'estadal',
    licenseFormat: /^CMDC-\d{4,6}$/
  },
  {
    code: 'CMDT',
    name: 'Colegio de Médicos del Estado Táchira',
    type: 'estadal',
    licenseFormat: /^CMDT-\d{4,6}$/
  },
  {
    code: 'CMDZ',
    name: 'Colegio de Médicos del Zulia',
    type: 'estadal',
    licenseFormat: /^CMDZ-\d{4,6}$/
  },
  {
    code: 'CMDA',
    name: 'Colegio de Médicos de Anzoátegui',
    type: 'estadal',
    licenseFormat: /^CMDA-\d{4,6}$/
  },
  {
    code: 'CMDB',
    name: 'Colegio de Médicos de Bolívar',
    type: 'estadal',
    licenseFormat: /^CMDB-\d{4,6}$/
  },
  {
    code: 'CMDL',
    name: 'Colegio de Médicos de Lara',
    type: 'estadal',
    licenseFormat: /^CMDL-\d{4,6}$/
  }
] as const;

// ============================================================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ============================================================================

/**
 * Valida el formato del documento según su tipo
 */
export function validateDocumentFormat(documentType: string, documentNumber: string): { isValid: boolean; error?: string } {
  const docType = VENEZUELAN_DOCUMENT_TYPES[documentType as keyof typeof VENEZUELAN_DOCUMENT_TYPES];
  
  if (!docType) {
    return {
      isValid: false,
      error: 'Tipo de documento no válido'
    };
  }
  
  if (!docType.format.test(documentNumber)) {
    return {
      isValid: false,
      error: `El documento debe tener el formato: ${docType.description}`
    };
  }
  
  return { isValid: true };
}

/**
 * Valida el formato de la licencia médica según la autoridad emisora
 */
export function validateMedicalLicenseFormat(licenseNumber: string, issuingAuthority: string): { isValid: boolean; error?: string } {
  const authority = VENEZUELAN_MEDICAL_AUTHORITIES.find(auth => 
    auth.code === issuingAuthority || auth.name === issuingAuthority
  );
  
  if (!authority) {
    return {
      isValid: false,
      error: 'Autoridad emisora no reconocida'
    };
  }
  
  if (!authority.licenseFormat.test(licenseNumber)) {
    return {
      isValid: false,
      error: `La licencia de ${authority.name} debe tener el formato ${authority.code}-XXXXX`
    };
  }
  
  return { isValid: true };
}

/**
 * Valida la coherencia entre fechas de emisión y vencimiento
 */
export function validateLicenseDates(issueDate: string, expiryDate?: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const issue = new Date(issueDate);
  const currentDate = new Date();
  
  // Validar fecha de emisión
  if (issue > currentDate) {
    errors.push('La fecha de emisión no puede ser futura');
  }
  
  const minIssueDate = new Date('1950-01-01');
  if (issue < minIssueDate) {
    errors.push('La fecha de emisión es demasiado antigua');
  }
  
  // Validar fecha de vencimiento si existe
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    
    if (expiry <= currentDate) {
      errors.push('La licencia debe estar vigente (no expirada)');
    }
    
    if (expiry <= issue) {
      errors.push('La fecha de vencimiento debe ser posterior a la fecha de emisión');
    }
    
    // Verificar que no sea una licencia con vigencia excesiva (más de 20 años)
    const maxValidityYears = 20;
    const maxExpiryDate = new Date(issue);
    maxExpiryDate.setFullYear(maxExpiryDate.getFullYear() + maxValidityYears);
    
    if (expiry > maxExpiryDate) {
      errors.push(`La vigencia de la licencia no puede exceder ${maxValidityYears} años`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida que la licencia corresponda al documento de identidad
 */
export function validateLicenseDocumentConsistency(
  documentType: string, 
  documentNumber: string, 
  licenseNumber: string
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Extraer número de la cédula
  const cedulaMatch = documentNumber.match(/^[VE]-(\d{7,8})$/);
  
  if (cedulaMatch && documentType === 'cedula_identidad') {
    const cedulaNumero = cedulaMatch[1];
    
    // Verificar si el número de la cédula coincide parcialmente con la licencia
    // Esta es una validación suave ya que no todos los sistemas usan el mismo formato
    if (!licenseNumber.includes(cedulaNumero.slice(-4))) {
      warnings.push('El número de licencia no parece corresponder con el documento de identidad. Verifica que ambos datos sean correctos.');
    }
  }
  
  return {
    isValid: true, // Solo genera warnings, no errores
    warnings
  };
}

/**
 * Obtiene información sobre una autoridad médica por código
 */
export function getMedicalAuthorityInfo(code: string) {
  return VENEZUELAN_MEDICAL_AUTHORITIES.find(auth => auth.code === code);
}

/**
 * Verifica si una licencia está en formato válido para verificación online
 */
export function canVerifyLicenseOnline(licenseNumber: string): { canVerify: boolean; reason?: string } {
  // Solo ciertas autoridades tienen sistemas de verificación online disponibles
  const onlineVerifiableAuthorities = ['MPPS', 'CMC', 'CMDM'];
  
  const authorityCode = licenseNumber.split('-')[0];
  
  if (!onlineVerifiableAuthorities.includes(authorityCode)) {
    return {
      canVerify: false,
      reason: `La verificación online no está disponible para ${authorityCode}. Se requerirá verificación manual.`
    };
  }
  
  return { canVerify: true };
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type LicenseVerificationValidation = z.infer<typeof licenseVerificationSchema>;

export type VenezuelanDocumentType = keyof typeof VENEZUELAN_DOCUMENT_TYPES;

export type VenezuelanMedicalAuthority = typeof VENEZUELAN_MEDICAL_AUTHORITIES[number];

export interface LicenseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canVerifyOnline: boolean;
  authorityInfo?: VenezuelanMedicalAuthority;
}
