/**
 * Professional Info Step Component - Legacy Wrapper
 * @fileoverview Wrapper component to maintain backward compatibility
 * @deprecated Use ProfessionalInfoStep from domains/auth/components instead
 */

'use client';

import { ProfessionalInfoStep as NewProfessionalInfoStep } from '@/domains/auth/components/professional-info';
import { DoctorRegistrationData } from '@/types/medical/specialties';

interface ProfessionalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'professional_info') => void;
  onStepError: (step: 'professional_info', error: string) => void;
  isLoading: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

/**
 * Legacy wrapper component for backward compatibility
 * @deprecated Use the new modular ProfessionalInfoStep from domains/auth/components
 */
export default function ProfessionalInfoStep(props: ProfessionalInfoStepProps) {
  return <NewProfessionalInfoStep {...props} />;
}
