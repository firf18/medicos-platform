/**
 * License Verification Service
 * @fileoverview Service for verifying medical licenses with external APIs
 * @compliance HIPAA-compliant license verification with audit logging
 */

import { LicenseVerificationResult } from '../types/professional-info.types';

/**
 * Verify medical license with external service
 * @param documentNumber - Doctor's identification number
 * @param licenseNumber - Medical license number
 * @param fullName - Doctor's full name for verification
 * @returns Promise with verification result
 */
export const verifyMedicalLicense = async (
  documentNumber: string,
  fullName?: string
): Promise<LicenseVerificationResult> => {
  try {
    // Log the verification attempt for audit trail
    console.log('[LICENSE_VERIFICATION] Starting verification', {
      documentNumber: documentNumber.replace(/\d/g, 'X'), // Mask for security
      timestamp: new Date().toISOString()
    });

    const response = await fetch('/api/license-verification-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentType: documentNumber.startsWith('E-') ? 'cedula_extranjera' : 'cedula_identidad',
        documentNumber,
        firstName: fullName?.split(' ')[0] || '',
        lastName: fullName?.split(' ').slice(1).join(' ') || ''
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LICENSE_VERIFICATION] HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
    }

    const api = await response.json();
    const result: LicenseVerificationResult = api.result ?? api;

    // Log successful verification (without sensitive data)
    console.log('[LICENSE_VERIFICATION] Verification completed', {
      isValid: result.isValid,
      isVerified: result.isVerified,
      hasAnalysis: !!result.analysis,
      timestamp: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('[LICENSE_VERIFICATION] Error during verification:', error);
    
    // Return error result
    return {
      isValid: false,
      isVerified: false,
      error: error instanceof Error ? error.message : 'Error desconocido durante la verificación'
    };
  }
};

/**
 * Validate license format before API call
 * @param licenseNumber - License number to validate
 * @returns Boolean indicating if format is valid
 */
export const isValidLicenseFormat = (licenseNumber: string): boolean => {
  // Basic format validation
  const trimmedLicense = licenseNumber.trim();
  
  if (!trimmedLicense) return false;
  
  // Venezuelan medical license patterns
  const patterns = [
    /^\d{4,8}$/, // Pure numeric
    /^[A-Z]{1,3}\d{4,8}$/i, // Letters + numbers
    /^MP\d{4,8}$/i, // Medical professional prefix
    /^DR\d{4,8}$/i  // Doctor prefix
  ];
  
  return patterns.some(pattern => pattern.test(trimmedLicense));
};

/**
 * Extract specialty from verification result
 * @param result - Verification result
 * @returns Extracted specialty or default
 */
export const extractSpecialty = (result: LicenseVerificationResult): string => {
  if (result.analysis?.specialty) {
    return result.analysis.specialty;
  }
  
  if (result.specialty) {
    return result.specialty;
  }
  
  return 'Medicina General';
};

/**
 * Extract dashboard access from verification result
 * @param result - Verification result
 * @returns Dashboard access configuration
 */
export const extractDashboardAccess = (result: LicenseVerificationResult) => {
  if (result.analysis?.dashboardAccess) {
    return result.analysis.dashboardAccess;
  }
  
  // Default dashboard access for verified doctors
  return {
    primaryDashboard: 'medicina-general',
    allowedDashboards: ['medicina-general'],
    reason: 'Acceso por defecto para médico verificado',
    requiresApproval: false
  };
};

/**
 * Check if name matches verification result
 * @param providedName - Name provided by user
 * @param result - Verification result
 * @returns Match confidence and status
 */
export const checkNameMatch = (
  providedName: string, 
  result: LicenseVerificationResult
): { matches: boolean; confidence: number; message?: string } => {
  if (!result.doctorName) {
    return {
      matches: false,
      confidence: 0,
      message: 'No se pudo obtener el nombre del registro oficial'
    };
  }

  if (result.analysis?.nameVerification) {
    return {
      matches: result.analysis.nameVerification.matches,
      confidence: result.analysis.nameVerification.confidence,
      message: result.analysis.nameVerification.matches 
        ? 'Nombre verificado correctamente'
        : 'El nombre no coincide con el registro oficial'
    };
  }

  // Simple name comparison fallback
  const normalizedProvided = normalizeNameForComparison(providedName);
  const normalizedOfficial = normalizeNameForComparison(result.doctorName);
  
  const similarity = calculateNameSimilarity(normalizedProvided, normalizedOfficial);
  const matches = similarity > 0.8;
  
  return {
    matches,
    confidence: similarity,
    message: matches 
      ? 'Nombre verificado (comparación básica)'
      : `Posible discrepancia en el nombre. Oficial: ${result.doctorName}`
  };
};

/**
 * Normalize name for comparison
 * @param name - Name to normalize
 * @returns Normalized name
 */
const normalizeNameForComparison = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Calculate name similarity using Levenshtein distance
 * @param name1 - First name
 * @param name2 - Second name
 * @returns Similarity score (0-1)
 */
const calculateNameSimilarity = (name1: string, name2: string): number => {
  const matrix = Array(name2.length + 1).fill(null).map(() => 
    Array(name1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= name1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= name2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= name2.length; j++) {
    for (let i = 1; i <= name1.length; i++) {
      const substitutionCost = name1[i - 1] === name2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  const distance = matrix[name2.length][name1.length];
  const maxLength = Math.max(name1.length, name2.length);
  
  return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
};

/**
 * Generate verification summary for UI display
 * @param result - Verification result
 * @returns Human-readable summary
 */
export const generateVerificationSummary = (result: LicenseVerificationResult): string => {
  if (!result.isValid) {
    return result.error || 'Verificación fallida';
  }
  
  if (!result.isVerified) {
    return 'Licencia no encontrada en el registro oficial';
  }
  
  const parts = ['Licencia verificada exitosamente'];
  
  if (result.doctorName) {
    parts.push(`Nombre: ${result.doctorName}`);
  }
  
  if (result.specialty || result.analysis?.specialty) {
    const specialty = result.analysis?.specialty || result.specialty;
    parts.push(`Especialidad: ${specialty}`);
  }
  
  if (result.licenseStatus) {
    parts.push(`Estado: ${result.licenseStatus}`);
  }
  
  return parts.join(' | ');
};
