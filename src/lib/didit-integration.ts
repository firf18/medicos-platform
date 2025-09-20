/**
 * Didit Integration - Legacy Wrapper
 * @fileoverview Wrapper to maintain backward compatibility with the refactored Didit services
 * @deprecated Use the modular services from domains/compliance/services instead
 */

// Re-export all types for backward compatibility
export type {
  DiditSession,
  DiditDecision,
  VenezuelanDoctorData,
  DiditConfig,
  DiditError,
  DiditWebhookPayload
} from '@/domains/compliance/types/didit-api.types';

export {
  DiditSessionSchema,
  DiditDecisionSchema,
  VenezuelanDoctorDataSchema,
  DIDIT_STATUS,
  DECISION_STATUS
} from '@/domains/compliance/types/didit-api.types';

// Re-export API services
export {
  getDiditConfig,
  getApiBaseUrl,
  generateVendorData,
  createDiditSession,
  getSessionStatus,
  verifyWebhookSignature,
  processVerificationDecision,
  createDiditError,
  extractDoctorDataFromVerification
} from '@/domains/compliance/services/didit-api.service';

// Re-export validation services
export {
  validateVenezuelanId,
  validateMedicalLicense,
  validateDoctorDataCompleteness,
  calculateVerificationScore,
  meetsMedicalCompliance,
  generateVerificationSummary,
  needsReverification
} from '@/domains/compliance/services/didit-validation.service';

// Legacy function aliases for backward compatibility
export const createSession = createDiditSession;
export const fetchSessionStatus = getSessionStatus;
export const validateDoctorData = validateDoctorDataCompleteness;

// Default export for backward compatibility
export default {
  createDiditSession,
  getSessionStatus,
  validateVenezuelanId,
  validateMedicalLicense,
  calculateVerificationScore,
  meetsMedicalCompliance
};
