/**
 * Professional Info Components Index
 * @fileoverview Export all professional info related components
 * @compliance Organized exports for medical authentication components
 */

export { ProfessionalInfoStep } from './ProfessionalInfoStep';
export { DocumentInfoSection } from './DocumentInfoSection';
export { AcademicInfoSection } from './AcademicInfoSection';
export { ProfessionalDetailsSection } from './ProfessionalDetailsSection';

// Re-export types for convenience
export type {
  ProfessionalInfoStepProps,
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  LicenseVerificationResult,
  DocumentType
} from '../../types/professional-info.types';
