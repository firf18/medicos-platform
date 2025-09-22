/**
 * Professional Info Types
 * @fileoverview Types specific to doctor professional information step
 * @compliance HIPAA-compliant professional data structures
 */

import { DoctorRegistrationData } from '@/types/medical/specialties';

// Document types for Venezuelan medical professionals
export type DocumentType = 'cedula_identidad' | 'cedula_extranjera';

// Form data interface for professional info step
export interface ProfessionalInfoFormData {
  yearsOfExperience: number;
  bio: string;
  documentType: DocumentType;
  documentNumber: string;
  university: string;
  graduationYear: string; // Formato: dd/mm/yyyy
  medicalBoard: string;
}

// Form validation errors
export interface ProfessionalInfoFormErrors {
  yearsOfExperience?: string;
  bio?: string;
  documentType?: string;
  documentNumber?: string;
  university?: string;
  graduationYear?: string;
  medicalBoard?: string;
}

// License verification result structure
export interface LicenseVerificationResult {
  isValid: boolean;
  isVerified: boolean;
  doctorName?: string;
  licenseStatus?: string;
  profession?: string;
  specialty?: string;
  error?: string;
  analysis?: {
    isValidMedicalProfessional: boolean;
    specialty: string;
    dashboardAccess: {
      primaryDashboard: string;
      allowedDashboards: string[];
      reason: string;
      requiresApproval: boolean;
    };
    nameVerification: {
      matches: boolean;
      confidence: number;
    };
    recommendations: string[];
  };
}

// Component props interface
export interface ProfessionalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'professional_info') => void;
  onStepError: (step: 'professional_info', error: string) => void;
  isLoading: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ProfessionalInfoFormErrors;
}

// Document validation patterns
export const DOCUMENT_PATTERNS = {
  cedula_identidad: /^[VE]-?\d{7,8}$/i,
  cedula_extranjera: /^[E]-?\d{7,8}$/i
} as const;

// (Eliminado) Patrones de matrícula médica: ya no se solicitan en Fase 2

// Experience validation constants
export const EXPERIENCE_VALIDATION = {
  MIN_YEARS: 0,
  MAX_YEARS: 50,
  TYPICAL_MIN: 1,
  TYPICAL_MAX: 40
} as const;

// Bio validation constants
export const BIO_VALIDATION = {
  MIN_LENGTH: 50, // Reducido para permitir registro más fácil
  MAX_LENGTH: 1000, // Aumentado para coincidir con schema
  RECOMMENDED_MIN: 100,
  RECOMMENDED_MAX: 300
} as const;

// Graduation year validation
export const GRADUATION_YEAR_VALIDATION = {
  MIN_YEAR: 1950,
  MAX_YEAR: new Date().getFullYear(),
  TYPICAL_MIN_AGE_AT_GRADUATION: 24,
  TYPICAL_MAX_AGE_AT_GRADUATION: 35
} as const;

// Verification status types
export type VerificationStatus = 
  | 'idle'
  | 'verifying'
  | 'verified'
  | 'failed'
  | 'error';

// Field validation status
export interface FieldValidationStatus {
  isValid: boolean;
  isVerifying: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'success' | 'info';
}

// Form validation context
export interface ValidationContext {
  documentType: DocumentType;
  documentNumber: string;
  licenseNumber: string;
  university: string;
  graduationYear?: number;
  medicalBoard: string;
}
