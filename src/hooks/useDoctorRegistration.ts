/**
 * Doctor Registration Hook - Legacy Wrapper
 * @fileoverview Wrapper hook to maintain backward compatibility
 * @deprecated Use useDoctorRegistration from domains/auth/hooks instead
 */

import { useDoctorRegistration as NewUseDoctorRegistration } from '@/domains/auth/hooks/useDoctorRegistration';
import { DoctorRegistrationData } from '@/types/medical/specialties';

interface UseDoctorRegistrationProps {
  onRegistrationComplete?: (data: DoctorRegistrationData) => void;
  onRegistrationError?: (error: string) => void;
}

/**
 * Legacy wrapper hook for backward compatibility
 * @deprecated Use the new modular useDoctorRegistration from domains/auth/hooks
 */
export function useDoctorRegistration(props: UseDoctorRegistrationProps = {}) {
  return NewUseDoctorRegistration(props);
}
