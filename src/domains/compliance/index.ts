/**
 * Compliance Domain Index
 * @fileoverview Export all compliance-related components, hooks, and services
 * @compliance Organized exports for medical compliance functionality
 */

// Hooks
export { useDiditVerification } from './hooks/useDiditVerification';

// Services
export * from './services/didit-verification.service';

// Types
export type {
  VerificationState,
  VerificationSummary,
  SuspiciousActivity,
  UseDiditVerificationOptions,
  UseDiditVerificationReturn,
  VerificationMetrics,
  VerificationStep,
  SessionConfig,
  VerificationResult,
  VerificationError,
  VerificationErrorType
} from './types/didit-verification.types';

// Constants
export {
  VERIFICATION_STATUS,
  SUSPICIOUS_ACTIVITY_TYPES,
  SECURITY_LEVELS,
  DEFAULT_CONFIG
} from './types/didit-verification.types';
