/**
 * Final Review Types
 * @fileoverview Types for the final review step of doctor registration
 * @compliance HIPAA-compliant registration review data structures
 */

import { DoctorRegistrationData } from '@/types/medical/specialties';

// Props for the main final review step
export interface FinalReviewStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'final_review') => void;
  onStepError: (step: 'final_review', error: string) => void;
  isLoading: boolean;
  onFinalSubmit?: () => Promise<void>;
}

// Review section configuration
export interface ReviewSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

// Field configuration for inline editing
export interface EditableField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'number';
  maxLength?: number;
  placeholder?: string;
  isEditable: boolean;
}

// Agreement state
export interface AgreementState {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  complianceAccepted: boolean;
}

// Modal visibility state
export interface ModalState {
  showTerms: boolean;
  showPrivacy: boolean;
  showCompliance: boolean;
}

// Working hours display format
export interface WorkingHoursDisplay {
  day: string;
  hours: string;
  isWorkingDay: boolean;
}

// Review summary statistics
export interface ReviewSummaryStats {
  completedSections: number;
  totalSections: number;
  workingDays: number;
  selectedFeatures: number;
  subSpecialties: number;
}

// Section props for individual review sections
export interface ReviewSectionProps {
  data: DoctorRegistrationData;
  onEdit?: (field: string, value: string) => void;
  isEditing?: boolean;
  editingField?: string | null;
}

// Personal information section props
export interface PersonalInfoSectionProps extends ReviewSectionProps {
  editingField: string | null;
  fieldValue: string;
  onStartEdit: (field: string, value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

// Professional information section props
export interface ProfessionalInfoSectionProps extends ReviewSectionProps {
  specialty: any; // Should be imported from medical specialties
}

// Verification section props
export interface VerificationSectionProps extends ReviewSectionProps {
  hasIdentityVerification: boolean;
  hasLicenseVerification: boolean;
}

// Agreement section props
export interface AgreementSectionProps {
  agreements: AgreementState;
  onAgreementChange: (type: keyof AgreementState, value: boolean) => void;
  onShowModal: (type: keyof ModalState) => void;
}

// Constants for section configuration
export const REVIEW_SECTIONS: ReviewSection[] = [
  {
    id: 'personal',
    title: 'Información Personal',
    description: 'Datos básicos y de contacto'
  },
  {
    id: 'professional',
    title: 'Información Profesional',
    description: 'Especialidad y experiencia médica'
  },
  {
    id: 'verification',
    title: 'Verificación',
    description: 'Estado de verificación de identidad y licencia'
  },
  {
    id: 'dashboard',
    title: 'Configuración del Dashboard',
    description: 'Características y horarios de atención'
  }
];

// Constants for agreement types
export const AGREEMENT_TYPES = {
  TERMS: 'terms',
  PRIVACY: 'privacy',
  COMPLIANCE: 'compliance'
} as const;

export type AgreementType = typeof AGREEMENT_TYPES[keyof typeof AGREEMENT_TYPES];

// Field validation rules for inline editing
export const FIELD_VALIDATION = {
  phone: {
    pattern: /^(\+58|0058|58)?[-.\s]?[24]\d{2}[-.\s]?\d{3}[-.\s]?\d{4}$/,
    message: 'Formato de teléfono venezolano inválido'
  },
  yearsOfExperience: {
    min: 0,
    max: 50,
    message: 'Los años de experiencia deben estar entre 0 y 50'
  },
  bio: {
    maxLength: 500,
    message: 'La biografía no puede exceder 500 caracteres'
  }
} as const;
