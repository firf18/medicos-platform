/**
 * Didit Validation Service
 * @fileoverview Validation and business logic for Didit verification
 * @compliance Medical compliance validation for identity verification
 */

import { VenezuelanDoctorData, DiditDecision } from '../types/didit-api.types';

/**
 * Validate Venezuelan ID number format
 */
export const validateVenezuelanId = (
  documentType: string,
  documentNumber: string
): { isValid: boolean; error?: string } => {
  // Venezuelan ID format: V-12345678 or E-12345678
  const idPattern = /^[VE]-?\d{7,8}$/i;
  
  if (!idPattern.test(`${documentType}-${documentNumber}`)) {
    return {
      isValid: false,
      error: 'Formato de cédula inválido. Debe ser V-12345678 o E-12345678'
    };
  }

  // Additional validation for document number
  const numberOnly = documentNumber.replace(/\D/g, '');
  if (numberOnly.length < 7 || numberOnly.length > 8) {
    return {
      isValid: false,
      error: 'El número de cédula debe tener 7 u 8 dígitos'
    };
  }

  return { isValid: true };
};

/**
 * Validate medical license number
 */
export const validateMedicalLicense = (
  licenseNumber: string,
  medicalBoard?: string
): { isValid: boolean; error?: string } => {
  // Venezuelan medical license format varies by state
  const licensePattern = /^\d{4,8}$/;
  
  if (!licensePattern.test(licenseNumber)) {
    return {
      isValid: false,
      error: 'Formato de matrícula médica inválido. Debe contener entre 4 y 8 dígitos'
    };
  }

  // Optional: Validate against specific medical board formats
  if (medicalBoard) {
    // Add specific validation rules per medical board if needed
    // This is a placeholder for future implementation
  }

  return { isValid: true };
};

/**
 * Validate doctor data completeness
 */
export const validateDoctorDataCompleteness = (
  data: VenezuelanDoctorData
): { isComplete: boolean; missingFields: string[] } => {
  const requiredFields: (keyof VenezuelanDoctorData)[] = [
    'firstName',
    'lastName',
    'documentType',
    'documentNumber',
    'email',
    'licenseNumber'
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};

/**
 * Calculate verification score based on decision
 */
export const calculateVerificationScore = (decision: DiditDecision): number => {
  let score = 0;
  let totalChecks = 0;

  // ID Verification (40 points)
  if (decision.id_verification) {
    totalChecks += 40;
    if (decision.id_verification.status === 'Approved') {
      score += 40;
    } else if (decision.id_verification.status === 'In Review') {
      score += 20;
    }
  }

  // Face Match (30 points)
  if (decision.face_match) {
    totalChecks += 30;
    if (decision.face_match.status === 'match') {
      score += 30;
    } else if (decision.face_match.confidence && decision.face_match.confidence >= 70) {
      score += 15;
    }
  }

  // Liveness (20 points)
  if (decision.liveness) {
    totalChecks += 20;
    if (decision.liveness.status === 'live') {
      score += 20;
    } else if (decision.liveness.confidence && decision.liveness.confidence >= 70) {
      score += 10;
    }
  }

  // AML Check (10 points)
  if (decision.aml) {
    totalChecks += 10;
    if (decision.aml.status === 'clear') {
      score += 10;
    } else if (decision.aml.risk_level === 'low') {
      score += 5;
    }
  }

  // Return percentage score
  return totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 0;
};

/**
 * Determine if verification meets medical compliance standards
 */
export const meetsMedicalCompliance = (
  decision: DiditDecision,
  minimumScore: number = 80
): { compliant: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  const score = calculateVerificationScore(decision);

  // Check minimum score
  if (score < minimumScore) {
    reasons.push(`Puntaje de verificación (${score}%) por debajo del mínimo requerido (${minimumScore}%)`);
  }

  // Check critical components
  if (decision.id_verification?.status !== 'Approved') {
    reasons.push('Verificación de identidad no aprobada');
  }

  if (decision.face_match?.status === 'no_match') {
    reasons.push('La verificación facial no coincide');
  }

  if (decision.liveness?.status === 'not_live') {
    reasons.push('Prueba de vida fallida');
  }

  if (decision.aml?.status === 'hit' && decision.aml.risk_level !== 'low') {
    reasons.push('Alerta de riesgo en verificación AML');
  }

  return {
    compliant: reasons.length === 0,
    reasons
  };
};

/**
 * Generate verification summary for medical records
 */
export const generateVerificationSummary = (
  doctorData: VenezuelanDoctorData,
  decision: DiditDecision
): {
  summary: string;
  details: Record<string, any>;
  recommendations: string[];
} => {
  const score = calculateVerificationScore(decision);
  const compliance = meetsMedicalCompliance(decision);
  const recommendations: string[] = [];

  // Build summary
  let summary = `Verificación de identidad para ${doctorData.firstName} ${doctorData.lastName} `;
  summary += `(${doctorData.documentType}-${doctorData.documentNumber}) `;
  summary += `completada con un puntaje de ${score}%. `;
  summary += compliance.compliant ? 'APROBADA' : 'REQUIERE REVISIÓN';

  // Build details
  const details = {
    verificationDate: new Date().toISOString(),
    doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
    documentNumber: doctorData.documentNumber,
    licenseNumber: doctorData.licenseNumber,
    verificationScore: score,
    complianceStatus: compliance.compliant ? 'compliant' : 'non-compliant',
    sessionId: decision.session_id,
    workflowId: decision.workflow_id
  };

  // Add component details
  if (decision.id_verification) {
    details.idVerification = {
      status: decision.id_verification.status,
      documentType: decision.id_verification.document_type,
      warnings: decision.id_verification.warnings?.length || 0
    };
  }

  if (decision.face_match) {
    details.faceMatch = {
      status: decision.face_match.status,
      confidence: decision.face_match.confidence
    };
  }

  if (decision.liveness) {
    details.liveness = {
      status: decision.liveness.status,
      confidence: decision.liveness.confidence
    };
  }

  // Generate recommendations
  if (!compliance.compliant) {
    if (decision.id_verification?.status === 'In Review') {
      recommendations.push('Revisar manualmente los documentos de identidad');
    }
    
    if (decision.face_match?.status === 'no_match') {
      recommendations.push('Solicitar nueva foto del rostro con mejor iluminación');
    }
    
    if (decision.liveness?.status === 'not_live') {
      recommendations.push('Repetir prueba de vida siguiendo las instrucciones');
    }
    
    if (decision.aml?.status === 'hit') {
      recommendations.push('Realizar verificación adicional de antecedentes');
    }
  }

  return {
    summary,
    details,
    recommendations
  };
};

/**
 * Check if re-verification is needed
 */
export const needsReverification = (
  lastVerificationDate: Date,
  verificationScore: number,
  daysThreshold: number = 365
): { needed: boolean; reason?: string } => {
  const daysSinceVerification = Math.floor(
    (Date.now() - lastVerificationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check if verification is too old
  if (daysSinceVerification > daysThreshold) {
    return {
      needed: true,
      reason: `Han pasado ${daysSinceVerification} días desde la última verificación`
    };
  }

  // Check if score was too low
  if (verificationScore < 70) {
    return {
      needed: true,
      reason: `El puntaje de verificación anterior (${verificationScore}%) es muy bajo`
    };
  }

  return { needed: false };
};
