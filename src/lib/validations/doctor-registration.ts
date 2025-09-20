/**
 * ⚠️ DEPRECATED: Doctor Registration Validations - Red-Salud Platform
 * 
 * Este archivo ha sido refactorizado por dominios médicos para cumplir con el
 * principio de responsabilidad única y mejorar la mantenibilidad.
 * 
 * NUEVA ESTRUCTURA MODULAR:
 * - src/lib/validations/personal-info.validations.ts
 * - src/lib/validations/professional-info.validations.ts
 * - src/lib/validations/specialty.validations.ts
 * - src/lib/validations/license-verification.validations.ts
 * - src/lib/validations/identity-verification.validations.ts
 * - src/lib/validations/dashboard-config.validations.ts
 * - src/lib/validations/security.validations.ts
 * - src/lib/validations/index.ts (archivo principal)
 * 
 * @deprecated Usar imports desde src/lib/validations/ en lugar de este archivo
 */

console.warn(`
⚠️  DEPRECATION WARNING: doctor-registration.ts
Este archivo ha sido refactorizado por dominios médicos.
Usa los nuevos archivos modulares en src/lib/validations/

Ejemplo de migración:
ANTES: import { personalInfoSchema } from './doctor-registration'
DESPUÉS: import { personalInfoSchema } from './validations'

O más específico:
import { personalInfoSchema } from './validations/personal-info.validations'
`);

// ============================================================================
// RE-EXPORTACIONES PARA COMPATIBILIDAD HACIA ATRÁS
// ============================================================================

// Re-exportar todos los schemas y funciones desde la nueva estructura modular
export * from './index';

// Mantener exportaciones específicas que podrían estar siendo usadas
export {
  // Esquemas principales
  personalInfoSchema,
  professionalInfoSchema,
  specialtySelectionSchema,
  licenseVerificationSchema,
  identityVerificationSchema,
  dashboardConfigurationSchema,
  completeDoctorRegistrationSchema,
  
  // Funciones de validación específicas
  validateUniqueEmail,
  validateUniqueLicenseNumber,
  validateDocumentFormat,
  validateSpecialtyFeatures,
  validateSpecialtyExperience,
  validateWorkingHours,
  validatePasswordStrength,
  
  // Funciones de seguridad
  logSecurityEvent,
  validateDataSensitivity,
  sanitizeInput,
  
  // Tipos
  type PersonalInfoValidation,
  type ProfessionalInfoValidation,
  type SpecialtySelectionValidation,
  type LicenseVerificationValidation,
  type IdentityVerificationValidation,
  type DashboardConfigurationValidation,
  type CompleteDoctorRegistrationValidation,
  type PasswordStrengthResult
} from './index';

// ============================================================================
// ALIASES LEGACY PARA MÁXIMA COMPATIBILIDAD
// ============================================================================

import {
  validatePasswordStrength as newValidatePasswordStrength,
  sanitizeInput as newSanitizeInput,
  logSecurityEvent as newLogSecurityEvent
} from './index';

// validatePasswordStrength ya está exportado arriba en el export principal

// sanitizeInput ya está exportado arriba en el export principal

// logSecurityEvent ya está exportado arriba en el export principal

// ============================================================================
// DOCUMENTACIÓN DE MIGRACIÓN
// ============================================================================

/**
 * GUÍA DE MIGRACIÓN RÁPIDA:
 * 
 * 1. INFORMACIÓN PERSONAL:
 *    ANTES: import { personalInfoSchema } from './doctor-registration'
 *    DESPUÉS: import { personalInfoSchema } from './validations/personal-info.validations'
 * 
 * 2. INFORMACIÓN PROFESIONAL:
 *    ANTES: import { professionalInfoSchema } from './doctor-registration'
 *    DESPUÉS: import { professionalInfoSchema } from './validations/professional-info.validations'
 * 
 * 3. ESPECIALIDADES:
 *    ANTES: import { specialtySelectionSchema } from './doctor-registration'
 *    DESPUÉS: import { specialtySelectionSchema } from './validations/specialty.validations'
 * 
 * 4. VERIFICACIÓN DE LICENCIAS:
 *    ANTES: import { licenseVerificationSchema } from './doctor-registration'
 *    DESPUÉS: import { licenseVerificationSchema } from './validations/license-verification.validations'
 * 
 * 5. VERIFICACIÓN DE IDENTIDAD:
 *    ANTES: import { identityVerificationSchema } from './doctor-registration'
 *    DESPUÉS: import { identityVerificationSchema } from './validations/identity-verification.validations'
 * 
 * 6. CONFIGURACIÓN DE DASHBOARD:
 *    ANTES: import { dashboardConfigurationSchema } from './doctor-registration'
 *    DESPUÉS: import { dashboardConfigurationSchema } from './validations/dashboard-config.validations'
 * 
 * 7. SEGURIDAD Y COMPLIANCE:
 *    ANTES: import { logSecurityEvent } from './doctor-registration'
 *    DESPUÉS: import { logSecurityEvent } from './validations/security.validations'
 * 
 * 8. IMPORTACIÓN COMPLETA:
 *    NUEVO: import * from './validations' // Importa todo desde el índice
 * 
 * BENEFICIOS DE LA NUEVA ESTRUCTURA:
 * ✅ Principio de responsabilidad única cumplido
 * ✅ Archivos más pequeños y mantenibles (<300 líneas)
 * ✅ Mejor organización por dominio médico
 * ✅ Reutilización de componentes mejorada
 * ✅ Testing más granular y específico
 * ✅ Compliance HIPAA mejorado
 */