/**
 * Medical Validations Index - Red-Salud Platform
 * 
 * Archivo principal que combina todas las validaciones médicas por dominio.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// ============================================================================
// IMPORTACIONES POR DOMINIO MÉDICO
// ============================================================================

// Validaciones de información personal
export * from './personal-info.validations';
export {
  personalInfoSchema,
  validateUniqueEmail,
  validateVenezuelanPhone,
  validatePasswordStrength,
  sanitizePersonalInput
} from './personal-info.validations';

// Validaciones de información profesional
export * from './professional-info.validations';
export {
  professionalInfoSchema,
  validateUniqueLicenseNumber,
  validateDocumentFormat,
  validateGraduationExperience,
  validateProfessionalBio,
  validateExperienceBySpecialty,
  VENEZUELAN_MEDICAL_BOARDS
} from './professional-info.validations';

// Validaciones de especialidades médicas
export * from './specialty.validations';
export {
  specialtySelectionSchema,
  validateSpecialtyFeatures,
  validateSubSpecialties,
  validateSpecialtyExperience,
  getRecommendedFeatures,
  SPECIALTY_REQUIRED_FEATURES
} from './specialty.validations';

// Validaciones de verificación de licencias
export * from './license-verification.validations';
export {
  licenseVerificationSchema,
  validateMedicalLicenseFormat,
  validateLicenseDates,
  validateLicenseDocumentConsistency,
  canVerifyLicenseOnline,
  VENEZUELAN_DOCUMENT_TYPES,
  VENEZUELAN_MEDICAL_AUTHORITIES
} from './license-verification.validations';

// Validaciones de verificación de identidad
export * from './identity-verification.validations';
export {
  identityVerificationSchema,
  validateVerificationResults,
  validateVerificationAge,
  calculateVerificationConfidence,
  validateMedicalRoleVerification,
  generateVerificationAuditSummary,
  VERIFICATION_REQUIREMENTS
} from './identity-verification.validations';

// Validaciones de configuración de dashboard
export * from './dashboard-config.validations';
export {
  dashboardConfigurationSchema,
  validateWorkingHours,
  validateFeaturesForRole,
  validateDashboardConfiguration,
  generateDefaultConfiguration,
  DASHBOARD_FEATURES
} from './dashboard-config.validations';

// Validaciones de seguridad y compliance
export * from './security.validations';
export {
  logSecurityEvent,
  validateDataSensitivity,
  sanitizeInput,
  sanitizeMedicalInput,
  validateMedicalAccessLevel,
  validateMedicalSession,
  validateCompliancePolicy,
  encryptMedicalData
} from './security.validations';

// ============================================================================
// ESQUEMAS COMBINADOS PARA COMPATIBILIDAD
// ============================================================================

import { z } from 'zod';
import { 
  personalInfoSchema,
  type PersonalInfoValidation 
} from './personal-info.validations';
import { 
  professionalInfoSchema,
  type ProfessionalInfoValidation 
} from './professional-info.validations';
import { 
  specialtySelectionSchema,
  type SpecialtySelectionValidation 
} from './specialty.validations';
import { 
  licenseVerificationSchema,
  type LicenseVerificationValidation 
} from './license-verification.validations';
import { 
  identityVerificationSchema,
  type IdentityVerificationValidation 
} from './identity-verification.validations';
import { 
  dashboardConfigurationSchema,
  type DashboardConfigurationValidation 
} from './dashboard-config.validations';

/**
 * Esquema completo del registro de médicos
 * Combina todas las validaciones por dominio
 */
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
  university: professionalInfoSchema.shape.university,
  graduationYear: professionalInfoSchema.shape.graduationYear,
  medicalBoard: professionalInfoSchema.shape.medicalBoard,
  bio: professionalInfoSchema.shape.bio,
  documentType: professionalInfoSchema.shape.documentType,
  documentNumber: professionalInfoSchema.shape.documentNumber,
  
  // Especialidad
  specialtyId: specialtySelectionSchema.shape.specialtyId,
  subSpecialties: specialtySelectionSchema.shape.subSpecialties,
  
  // Verificación de licencia
  issuingAuthority: licenseVerificationSchema.shape.issuingAuthority.optional(),
  issueDate: licenseVerificationSchema.shape.issueDate.optional(),
  expiryDate: licenseVerificationSchema.shape.expiryDate.optional(),
  
  // Verificación de identidad
  identityVerification: identityVerificationSchema.shape.identityVerification.optional(),
  
  // Configuración del dashboard
  selectedFeatures: dashboardConfigurationSchema.shape.selectedFeatures,
  workingHours: dashboardConfigurationSchema.shape.workingHours,
  dashboardLayout: dashboardConfigurationSchema.shape.dashboardLayout.optional(),
  notificationPreferences: dashboardConfigurationSchema.shape.notificationPreferences.optional()
});

// ============================================================================
// FUNCIONES DE VALIDACIÓN INTEGRADAS
// ============================================================================

/**
 * Valida un registro completo de médico integrando todas las validaciones
 */
export async function validateCompleteDoctorRegistration(data: any): Promise<{
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  recommendations: string[];
}> {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const recommendations: string[] = [];

  try {
    // Validar esquema general
    completeDoctorRegistrationSchema.parse(data);
  } catch (schemaError: any) {
    if (schemaError.errors) {
      schemaError.errors.forEach((error: any) => {
        const field = error.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(error.message);
      });
    }
  }

  // Validaciones específicas por dominio
  
  // 1. Información personal
  if (data.email) {
    const emailValidation = await validateUniqueEmail(data.email);
    if (!emailValidation.isValid && emailValidation.error) {
      if (!errors.email) errors.email = [];
      errors.email.push(emailValidation.error);
    }
  }

  // 2. Información profesional
  if (data.licenseNumber) {
    const licenseValidation = await validateUniqueLicenseNumber(data.licenseNumber);
    if (!licenseValidation.isValid && licenseValidation.error) {
      if (!errors.licenseNumber) errors.licenseNumber = [];
      errors.licenseNumber.push(licenseValidation.error);
    }
  }

  if (data.documentType && data.documentNumber) {
    const docValidation = validateDocumentFormat(data.documentType, data.documentNumber);
    if (!docValidation.isValid && docValidation.error) {
      if (!errors.documentNumber) errors.documentNumber = [];
      errors.documentNumber.push(docValidation.error);
    }
  }

  // 3. Especialidades
  if (data.specialtyId && data.selectedFeatures) {
    const specialtyValidation = validateSpecialtyFeatures(data.specialtyId, data.selectedFeatures);
    if (!specialtyValidation.isValid) {
      if (!errors.selectedFeatures) errors.selectedFeatures = [];
      errors.selectedFeatures.push(...specialtyValidation.errors);
    }
  }

  // 4. Horarios de trabajo
  if (data.workingHours) {
    const hoursValidation = validateWorkingHours(data.workingHours);
    if (!hoursValidation.isValid) {
      if (!errors.workingHours) errors.workingHours = [];
      errors.workingHours.push(...hoursValidation.errors);
    }
    if (hoursValidation.warnings.length > 0) {
      warnings.workingHours = hoursValidation.warnings;
    }
  }

  // 5. Verificación de identidad (si existe)
  if (data.identityVerification) {
    const identityValidation = validateVerificationAge(data.identityVerification.verifiedAt);
    if (!identityValidation.isValid && identityValidation.error) {
      if (!errors.identityVerification) errors.identityVerification = [];
      errors.identityVerification.push(identityValidation.error);
    }
  }

  // Generar recomendaciones
  if (data.specialtyId) {
    const recommended = getRecommendedFeatures(data.specialtyId);
    const missing = recommended.filter(feature => !data.selectedFeatures?.includes(feature));
    if (missing.length > 0) {
      recommendations.push(`Características recomendadas para ${data.specialtyId}: ${missing.join(', ')}`);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    recommendations
  };
}

/**
 * Valida datos médicos según nivel de compliance requerido
 */
export function validateMedicalCompliance(
  data: any,
  complianceLevel: 'basic' | 'enhanced' | 'critical' = 'enhanced'
): {
  isCompliant: boolean;
  violations: string[];
  requirements: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  const violations: string[] = [];
  const requirements: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Validar sensibilidad de datos
  const sensitivityValidation = validateDataSensitivity(data);
  if (!sensitivityValidation.isValid) {
    violations.push(...sensitivityValidation.violations);
    riskLevel = sensitivityValidation.riskLevel;
  }

  // Validar según nivel de compliance
  switch (complianceLevel) {
    case 'critical':
      requirements.push('Auditoría completa requerida');
      requirements.push('Encriptación de extremo a extremo requerida');
      requirements.push('Verificación biométrica requerida');
      if (!data.identityVerification) {
        violations.push('Verificación de identidad requerida para nivel crítico');
        riskLevel = 'high';
      }
      break;
      
    case 'enhanced':
      requirements.push('Registro de auditoría requerido');
      requirements.push('Verificación de licencia profesional requerida');
      if (!data.licenseNumber) {
        violations.push('Licencia profesional requerida para nivel mejorado');
        if (riskLevel === 'low') riskLevel = 'medium';
      }
      break;
      
    case 'basic':
      requirements.push('Validación básica de identidad requerida');
      break;
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    requirements,
    riskLevel
  };
}

// ============================================================================
// TIPOS EXPORTADOS PARA COMPATIBILIDAD
// ============================================================================

export type CompleteDoctorRegistrationValidation = z.infer<typeof completeDoctorRegistrationSchema>;

// Re-exportar tipos específicos
export type {
  PersonalInfoValidation,
  ProfessionalInfoValidation,
  SpecialtySelectionValidation,
  LicenseVerificationValidation,
  IdentityVerificationValidation,
  DashboardConfigurationValidation
};

// Tipos adicionales para validación integrada
export interface MedicalValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  recommendations: string[];
  complianceLevel: 'basic' | 'enhanced' | 'critical';
}

export interface ValidationSummary {
  personalInfo: boolean;
  professionalInfo: boolean;
  specialty: boolean;
  licenseVerification: boolean;
  identityVerification: boolean;
  dashboardConfig: boolean;
  overallCompliance: boolean;
}
