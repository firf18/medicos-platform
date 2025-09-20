/**
 * Identity Verification Validations - Red-Salud Platform
 * 
 * Validaciones específicas para verificación de identidad médica con Didit.me.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { z } from 'zod';

// ============================================================================
// VALIDACIONES DE VERIFICACIÓN DE IDENTIDAD
// ============================================================================

export const identityVerificationSchema = z.object({
  identityVerification: z.object({
    verificationId: z.string()
      .min(1, 'ID de verificación requerido'),
    
    status: z.enum(['pending', 'verified', 'failed', 'expired'])
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
    }),
    
    verificationProvider: z.string()
      .default('didit.me'),
    
    confidenceScore: z.number()
      .min(0)
      .max(100)
      .optional(),
    
    biometricData: z.object({
      faceMatchScore: z.number().min(0).max(100).optional(),
      livenessScore: z.number().min(0).max(100).optional(),
      documentQualityScore: z.number().min(0).max(100).optional()
    }).optional()
  })
});

// ============================================================================
// TIPOS DE VERIFICACIÓN Y ESTADOS
// ============================================================================

export type VerificationStatus = 
  | 'pending'
  | 'in_progress'
  | 'verified'
  | 'failed'
  | 'expired'
  | 'rejected';

export type VerificationProvider = 
  | 'didit.me'
  | 'jumio'
  | 'onfido'
  | 'manual';

export interface VerificationCheck {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  score?: number;
  details?: string;
  required: boolean;
}

export interface BiometricVerificationResult {
  faceMatch: {
    status: 'match' | 'no_match' | 'uncertain';
    score: number;
    threshold: number;
  };
  liveness: {
    status: 'live' | 'not_live' | 'uncertain';
    score: number;
    threshold: number;
  };
  documentAuthenticity: {
    status: 'authentic' | 'suspicious' | 'fake';
    score: number;
    checks: string[];
  };
}

// ============================================================================
// CONFIGURACIONES DE VERIFICACIÓN
// ============================================================================

export const VERIFICATION_REQUIREMENTS = {
  medical_professional: {
    minConfidenceScore: 85,
    requiredChecks: [
      'face_match',
      'document_validity',
      'liveness_check',
      'aml_screening'
    ],
    optionalChecks: [
      'address_verification',
      'phone_verification',
      'education_verification'
    ],
    biometricThresholds: {
      faceMatch: 0.85,
      liveness: 0.80,
      documentQuality: 0.75
    }
  },
  patient: {
    minConfidenceScore: 75,
    requiredChecks: [
      'face_match',
      'document_validity',
      'liveness_check'
    ],
    optionalChecks: [
      'phone_verification'
    ],
    biometricThresholds: {
      faceMatch: 0.80,
      liveness: 0.75,
      documentQuality: 0.70
    }
  }
} as const;

// ============================================================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ============================================================================

/**
 * Valida si los resultados de verificación cumplen con los estándares médicos
 */
export function validateVerificationResults(
  results: BiometricVerificationResult,
  userType: 'medical_professional' | 'patient' = 'medical_professional'
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requirements = VERIFICATION_REQUIREMENTS[userType];
  
  // Validar face match
  if (results.faceMatch.score < requirements.biometricThresholds.faceMatch) {
    errors.push(`La puntuación de coincidencia facial (${results.faceMatch.score}) está por debajo del umbral requerido (${requirements.biometricThresholds.faceMatch})`);
  }
  
  if (results.faceMatch.status !== 'match') {
    errors.push('La verificación facial no fue exitosa');
  }
  
  // Validar liveness
  if (results.liveness.score < requirements.biometricThresholds.liveness) {
    errors.push(`La puntuación de detección de vida (${results.liveness.score}) está por debajo del umbral requerido (${requirements.biometricThresholds.liveness})`);
  }
  
  if (results.liveness.status !== 'live') {
    errors.push('La verificación de vida no fue exitosa');
  }
  
  // Validar autenticidad del documento
  if (results.documentAuthenticity.score < requirements.biometricThresholds.documentQuality) {
    warnings.push(`La calidad del documento (${results.documentAuthenticity.score}) está por debajo del umbral recomendado (${requirements.biometricThresholds.documentQuality})`);
  }
  
  if (results.documentAuthenticity.status === 'fake') {
    errors.push('El documento presenta signos de falsificación');
  } else if (results.documentAuthenticity.status === 'suspicious') {
    warnings.push('El documento presenta algunas irregularidades que requieren revisión manual');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida la vigencia temporal de una verificación
 */
export function validateVerificationAge(verifiedAt: string, maxAgeInDays: number = 30): { isValid: boolean; error?: string } {
  const verificationDate = new Date(verifiedAt);
  const currentDate = new Date();
  const daysDifference = Math.floor((currentDate.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference > maxAgeInDays) {
    return {
      isValid: false,
      error: `La verificación tiene ${daysDifference} días de antigüedad. Se requiere una verificación más reciente (máximo ${maxAgeInDays} días).`
    };
  }
  
  return { isValid: true };
}

/**
 * Calcula la puntuación general de confianza de verificación
 */
export function calculateVerificationConfidence(
  results: BiometricVerificationResult,
  additionalFactors?: {
    providerReliability?: number;
    documentType?: string;
    verificationTime?: number;
  }
): number {
  let confidence = 0;
  let totalWeight = 0;
  
  // Peso de cada componente
  const weights = {
    faceMatch: 0.35,
    liveness: 0.25,
    documentAuthenticity: 0.30,
    providerReliability: 0.10
  };
  
  // Face match score
  confidence += results.faceMatch.score * weights.faceMatch;
  totalWeight += weights.faceMatch;
  
  // Liveness score
  confidence += results.liveness.score * weights.liveness;
  totalWeight += weights.liveness;
  
  // Document authenticity score
  confidence += results.documentAuthenticity.score * weights.documentAuthenticity;
  totalWeight += weights.documentAuthenticity;
  
  // Provider reliability (opcional)
  if (additionalFactors?.providerReliability) {
    confidence += additionalFactors.providerReliability * weights.providerReliability;
    totalWeight += weights.providerReliability;
  }
  
  return Math.round((confidence / totalWeight) * 100) / 100;
}

/**
 * Valida que la verificación de identidad sea apropiada para el rol médico
 */
export function validateMedicalRoleVerification(
  verificationData: any,
  medicalRole: 'doctor' | 'nurse' | 'technician' | 'administrator'
): { isValid: boolean; errors: string[]; recommendations: string[] } {
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  // Requisitos específicos por rol médico
  const roleRequirements = {
    doctor: {
      minConfidence: 90,
      requiredDocs: ['medical_license', 'identity_document'],
      additionalChecks: ['professional_background', 'medical_board_verification']
    },
    nurse: {
      minConfidence: 85,
      requiredDocs: ['nursing_license', 'identity_document'],
      additionalChecks: ['professional_background']
    },
    technician: {
      minConfidence: 80,
      requiredDocs: ['technical_certification', 'identity_document'],
      additionalChecks: ['professional_background']
    },
    administrator: {
      minConfidence: 75,
      requiredDocs: ['identity_document'],
      additionalChecks: ['background_check']
    }
  };
  
  const requirements = roleRequirements[medicalRole];
  
  // Validar confianza mínima
  if (verificationData.confidenceScore < requirements.minConfidence) {
    errors.push(`La puntuación de confianza (${verificationData.confidenceScore}%) está por debajo del mínimo requerido para ${medicalRole} (${requirements.minConfidence}%)`);
  }
  
  // Validar documentos requeridos
  const providedDocs = verificationData.documentsVerified || [];
  const missingDocs = requirements.requiredDocs.filter(doc => !providedDocs.includes(doc));
  
  if (missingDocs.length > 0) {
    errors.push(`Faltan documentos requeridos para ${medicalRole}: ${missingDocs.join(', ')}`);
  }
  
  // Recomendaciones adicionales
  requirements.additionalChecks.forEach(check => {
    if (!providedDocs.includes(check)) {
      recommendations.push(`Se recomienda completar: ${check}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    recommendations
  };
}

/**
 * Genera un resumen de la verificación para auditoría
 */
export function generateVerificationAuditSummary(verificationData: any): {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  const { verificationResults, confidenceScore, verifiedAt } = verificationData;
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const recommendations: string[] = [];
  
  // Evaluar nivel de riesgo
  if (confidenceScore < 75) {
    riskLevel = 'high';
    recommendations.push('Requerir verificación adicional');
  } else if (confidenceScore < 85) {
    riskLevel = 'medium';
    recommendations.push('Considerar checks adicionales');
  }
  
  // Verificar tiempo de verificación
  const verificationAge = validateVerificationAge(verifiedAt);
  if (!verificationAge.isValid) {
    riskLevel = 'medium';
    recommendations.push('Actualizar verificación por antigüedad');
  }
  
  const summary = `Verificación de identidad completada con ${confidenceScore}% de confianza. ` +
    `Checks principales: Face Match (${verificationResults.faceMatch ? '✓' : '✗'}), ` +
    `Liveness (${verificationResults.livenessCheck ? '✓' : '✗'}), ` +
    `Documento Válido (${verificationResults.documentValid ? '✓' : '✗'}), ` +
    `AML (${verificationResults.amlScreening ? '✓' : '✗'}).`;
  
  return {
    summary,
    riskLevel,
    recommendations
  };
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type IdentityVerificationValidation = z.infer<typeof identityVerificationSchema>;

export interface VerificationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}
