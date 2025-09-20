/**
 * Tipos específicos para el Registro de Médicos
 * 
 * Centraliza todos los tipos relacionados con el registro médico
 * para mejorar la organización y reutilización.
 */

import { DoctorRegistrationData, RegistrationStep, RegistrationProgress } from '@/types/medical/specialties';

// Re-exportar tipos principales
export type { DoctorRegistrationData, RegistrationStep, RegistrationProgress };

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationContext {
  step: RegistrationStep;
  data: Partial<DoctorRegistrationData>;
  timestamp: string;
}

// Tipos para API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmailAvailabilityResponse {
  available: boolean;
}

export interface LicenseVerificationResponse {
  verified: boolean;
  details?: {
    licenseNumber: string;
    licenseState: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'suspended';
    practitioner: {
      name: string;
      specialties: string[];
    };
  };
}

export interface IdentityVerificationResponse {
  verificationId: string;
  verificationUrl: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface RegistrationFinalizeResponse {
  userId: string;
  profileId: string;
  needsEmailVerification: boolean;
}

// Tipos para logging
export interface LogContext {
  userId?: string;
  sessionId?: string;
  email?: string;
  licenseNumber?: string;
  step?: RegistrationStep;
  timestamp?: string;
}

export interface SecurityEvent {
  eventType: string;
  data: Record<string, any>;
  context: LogContext;
}

// Tipos para persistencia
export interface PersistenceOptions {
  encrypt?: boolean;
  expirationHours?: number;
  autoSave?: boolean;
}

export interface SavedRegistrationData {
  data: Partial<DoctorRegistrationData>;
  progress: RegistrationProgress;
  timestamp: string;
  sessionId: string;
  encrypted: boolean;
}

// Tipos para hooks
export interface UseDoctorRegistrationProps {
  onRegistrationComplete?: (data: DoctorRegistrationData) => void;
  onRegistrationError?: (error: string) => void;
  autoSave?: boolean;
  persistenceOptions?: PersistenceOptions;
}

export interface UseDoctorRegistrationReturn {
  // Estado
  registrationData: DoctorRegistrationData;
  progress: RegistrationProgress;
  isLoading: boolean;
  currentStep: RegistrationStep;
  
  // Acciones
  updateRegistrationData: (data: Partial<DoctorRegistrationData>) => void;
  markStepAsCompleted: (step: RegistrationStep) => void;
  setStepError: (step: RegistrationStep, error: string) => void;
  navigateToStep: (step: RegistrationStep) => void;
  
  // Validación
  validateStep: (step: RegistrationStep) => Promise<ValidationResult>;
  validateAllSteps: () => Promise<ValidationResult>;
  
  // API
  checkEmailAvailability: (email: string) => Promise<boolean>;
  verifyMedicalLicense: (licenseData: any) => Promise<LicenseVerificationResponse>;
  initiateIdentityVerification: () => Promise<IdentityVerificationResponse>;
  
  // Persistencia
  saveProgress: () => void;
  loadProgress: () => void;
  clearProgress: () => void;
  
  // Finalización
  submitRegistration: () => Promise<void>;
  
  // Estado de errores
  formErrors: {
    hasErrors: boolean;
    errors: Record<RegistrationStep, string>;
    clearError: (step: RegistrationStep) => void;
    setError: (step: RegistrationStep, error: string) => void;
  };
}

// Tipos para componentes
export interface StepComponentProps {
  data: Partial<DoctorRegistrationData>;
  onDataChange: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: RegistrationStep) => void;
  onStepError: (step: RegistrationStep, error: string) => void;
  formErrors?: {
    hasErrors: boolean;
    errors: Record<RegistrationStep, string>;
  };
  isLoading?: boolean;
}

export interface NavigationProps {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  onStepClick: (step: RegistrationStep) => void;
  canNavigateToStep: (step: RegistrationStep) => boolean;
}

// Tipos para servicios
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ValidationService {
  validateStep(step: RegistrationStep, data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validatePersonalInfo(data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validateProfessionalInfo(data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validateSpecialtySelection(data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validateLicenseVerification(data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validateIdentityVerification(data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validateDashboardConfiguration(data: Partial<DoctorRegistrationData>): Promise<ValidationResult>;
  validateCompleteRegistration(data: DoctorRegistrationData): Promise<ValidationResult>;
}

export interface ApiService {
  checkEmailAvailability(email: string): Promise<ApiResponse<EmailAvailabilityResponse>>;
  verifyMedicalLicense(licenseData: any): Promise<ApiResponse<LicenseVerificationResponse>>;
  initiateIdentityVerification(userData: any): Promise<ApiResponse<IdentityVerificationResponse>>;
  checkIdentityVerificationStatus(verificationId: string): Promise<ApiResponse<any>>;
  uploadLicenseDocument(file: File, licenseNumber: string): Promise<ApiResponse<any>>;
  finalizeRegistration(data: DoctorRegistrationData): Promise<ApiResponse<RegistrationFinalizeResponse>>;
  getMedicalSpecialties(): Promise<ApiResponse<any[]>>;
  saveRegistrationProgress(sessionId: string, data: Partial<DoctorRegistrationData>): Promise<ApiResponse<any>>;
}

export interface LoggingService {
  logRegistrationStarted(context: LogContext): void;
  logStepProgress(step: RegistrationStep, context: LogContext): void;
  logStepCompleted(step: RegistrationStep, context: LogContext): void;
  logStepError(step: RegistrationStep, error: string, context: LogContext): void;
  logDataUpdate(updatedFields: string[], context: LogContext): void;
  logRegistrationCompleted(context: LogContext): void;
  logRegistrationFailed(error: string, context: LogContext): void;
  createContext(data: Partial<DoctorRegistrationData>, sessionId?: string, userId?: string, step?: RegistrationStep): LogContext;
}

// Tipos para configuración
export interface RegistrationConfig {
  steps: RegistrationStep[];
  validation: {
    enableRealTimeValidation: boolean;
    debounceMs: number;
    strictMode: boolean;
  };
  persistence: {
    enabled: boolean;
    autoSave: boolean;
    encryptSensitiveData: boolean;
    expirationHours: number;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includePerformanceMetrics: boolean;
  };
}

// Constantes de tipos
export const REGISTRATION_STEPS: RegistrationStep[] = [
  'personal_info',
  'professional_info',
  'specialty_selection',
  'license_verification',
  'identity_verification',
  'dashboard_configuration',
  'final_review'
];

export const STEP_LABELS: Record<RegistrationStep, string> = {
  personal_info: 'Información Personal',
  professional_info: 'Información Profesional',
  specialty_selection: 'Selección de Especialidad',
  license_verification: 'Verificación de Licencia',
  identity_verification: 'Verificación de Identidad',
  dashboard_configuration: 'Configuración del Dashboard',
  final_review: 'Revisión Final'
};

export const STEP_DESCRIPTIONS: Record<RegistrationStep, string> = {
  personal_info: 'Ingresa tu información personal básica',
  professional_info: 'Proporciona detalles de tu práctica médica',
  specialty_selection: 'Selecciona tu especialidad médica',
  license_verification: 'Verifica tu licencia médica',
  identity_verification: 'Completa la verificación de identidad',
  dashboard_configuration: 'Configura tu dashboard personalizado',
  final_review: 'Revisa y confirma tu información'
};