/**
 * Didit Verification Professional Hook - Legacy Wrapper
 * @fileoverview Wrapper hook to maintain backward compatibility
 * @deprecated Use useDiditVerification from domains/compliance/hooks instead
 */

import { useDiditVerification } from '@/domains/compliance/hooks/useDiditVerification';
import type { UseDiditVerificationOptions } from '@/domains/compliance/types/didit-verification.types';

/**
 * Legacy wrapper hook for backward compatibility
 * @deprecated Use the new modular useDiditVerification from domains/compliance/hooks
 */
export function useDiditVerificationProfessional(options: UseDiditVerificationOptions = {}) {
  return useDiditVerification(options);
}

export default useDiditVerificationProfessional;
