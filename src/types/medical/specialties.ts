/**
 * Tipos TypeScript para Especialidades Médicas - Red-Salud
 */

export interface WorkingDay {
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

export type DoctorRegistrationData = {
  // Información personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Información profesional
  specialtyId: string;
  subSpecialties?: string[];
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  yearsOfExperience: number;
  bio: string;
  
  // Información académica y profesional
  university?: string;
  graduationYear?: string; // Formato: dd/mm/yyyy
  medicalBoard?: string;
  
  // Verificación de identidad
  identityVerification?: {
    verificationId: string;
    status: 'pending' | 'verified' | 'failed';
    documentType: 'cedula_identidad' | 'cedula_extranjera';
    documentNumber: string;
    verifiedAt: string;
    verificationResults?: {
      faceMatch: boolean;
      documentValid: boolean;
      livenessCheck: boolean;
      amlScreening: boolean;
    };
  };
  
  // Configuración del dashboard
  selectedFeatures: string[];
  workingHours: WorkingHours;
  
  // Nuevos campos para verificación de licencia
  documentType?: 'cedula_identidad' | 'cedula_extranjera';
  documentNumber?: string;
};

export type RegistrationStep = 
  | 'personal_info'
  | 'professional_info'
  | 'specialty_selection'
  | 'license_verification'  // Nuevo paso
  | 'identity_verification'
  | 'dashboard_configuration'
  | 'final_review'
  | 'completed';

export interface RegistrationProgress {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  totalSteps: number;
  canProceed: boolean;
  errors: Record<string, string>;
}

// Para integración con Didit.me
export interface DidItVerificationRequest {
  userType: 'doctor';
  requiredChecks: string[];
  metadata: {
    specialtyId: string;
    licenseNumber: string;
    registrationContext: 'red_salud_doctor_registration';
    platform?: string;
    timestamp?: string;
  };
}

export interface DidItVerificationResponse {
  verificationId: string;
  status: 'initiated' | 'pending_document' | 'processing' | 'completed' | 'failed';
  verificationUrl?: string;
  results?: {
    identity: {
      verified: boolean;
      confidence: number;
      documentType: string;
    };
    document: {
      valid: boolean;
      extractedData: Record<string, unknown>;
    };
    biometric: {
      faceMatch: boolean;
      liveness: boolean;
      confidence: number;
    };
    compliance: {
      amlScreening: boolean;
      watchlistCheck: boolean;
    };
  };
  createdAt: string;
  completedAt?: string;
}