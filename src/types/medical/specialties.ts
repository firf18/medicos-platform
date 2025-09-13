/**
 * Tipos TypeScript para Especialidades Médicas - Red-Salud
 */

export interface DoctorRegistrationData {
  // Datos básicos del médico
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Información médica
  specialtyId: string;
  subSpecialties?: string[];
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  
  // Información profesional
  yearsOfExperience: number;
  currentHospital?: string;
  clinicAffiliations?: string[];
  bio: string;
  
  // Configuración del dashboard
  selectedFeatures: string[];
  workingHours: WorkingHours;
  
  // Validación de identidad (Didit.me)
  identityVerification?: IdentityVerificationData;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorkingDay: boolean;
  startTime?: string; // "09:00"
  endTime?: string;   // "17:00"
  breakStart?: string;
  breakEnd?: string;
}

export interface IdentityVerificationData {
  verificationId: string;
  status: 'pending' | 'verified' | 'failed';
  documentType: string;
  documentNumber: string;
  verifiedAt?: string;
  verificationResults?: {
    faceMatch: boolean;
    documentValid: boolean;
    livenessCheck: boolean;
    amlScreening: boolean;
  };
}

export interface DashboardConfiguration {
  doctorId: string;
  specialtyId: string;
  enabledFeatures: string[];
  layout: DashboardLayout;
  preferences: DashboardPreferences;
}

export interface DashboardLayout {
  widgets: WidgetPosition[];
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
}

export interface WidgetPosition {
  widgetId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
}

export interface DashboardPreferences {
  language: 'es' | 'en';
  timezone: string;
  notifications: NotificationPreferences;
  dataRetention: DataRetentionSettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  emergencyOnly: boolean;
  appointmentReminders: boolean;
  labResults: boolean;
  patientMessages: boolean;
}

export interface DataRetentionSettings {
  patientDataRetention: number; // days
  appointmentHistory: number;   // days
  communicationLogs: number;    // days
  analyticsData: number;        // days
}

// Estados del registro médico
export type RegistrationStep = 
  | 'personal_info'
  | 'professional_info'
  | 'specialty_selection'
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
      extractedData: Record<string, any>;
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
