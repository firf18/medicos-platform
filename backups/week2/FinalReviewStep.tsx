/**
 * Final Review Step Component - Legacy Wrapper
 * @fileoverview Wrapper component to maintain backward compatibility
 * @deprecated Use FinalReviewStep from domains/auth/components/final-review instead
 */

'use client';

import { FinalReviewStep as NewFinalReviewStep } from '@/domains/auth/components/final-review';
import { DoctorRegistrationData } from '@/types/medical/specialties';

interface FinalReviewStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'final_review') => void;
  onStepError: (step: 'final_review', error: string) => void;
  isLoading: boolean;
  onFinalSubmit?: () => Promise<void>;
}

/**
 * Legacy wrapper component for backward compatibility
 * @deprecated Use the new modular FinalReviewStep from domains/auth/components/final-review
 */
export default function FinalReviewStep(props: FinalReviewStepProps) {
  return <NewFinalReviewStep {...props} />;
}
