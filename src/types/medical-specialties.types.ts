/**
 * Medical Specialties Types - Red-Salud Platform
 * 
 * Tipos e interfaces para especialidades médicas y configuración de dashboards.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  category: SpecialtyCategory;
  icon: string;
  color: string;
  dashboardFeatures: DashboardFeature[];
  requiredValidations: ValidationRequirement[];
  estimatedPatients: PatientVolume;
  complexity: SpecialtyComplexity;
  additionalInfo?: SpecialtyAdditionalInfo;
}

export interface DashboardFeature {
  id: string;
  name: string;
  description: string;
  component: string;
  priority: FeaturePriority;
  category: FeatureCategory;
  dependencies?: string[];
  requiredPermissions?: string[];
  estimatedImplementationTime?: number; // en días
}

export interface ValidationRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documentType: DocumentType;
  validityPeriod?: number; // en meses
  verificationLevel?: VerificationLevel;
}

// ============================================================================
// TIPOS Y ENUMS
// ============================================================================

export type SpecialtyCategory = 
  | 'medicina_general'
  | 'especialidades_medicas'
  | 'especialidades_quirurgicas'
  | 'medicina_diagnostica'
  | 'medicina_alternativa'
  | 'salud_mental'
  | 'pediatria_especializada'
  | 'medicina_emergencia'
  | 'medicina_preventiva'
  | 'medicina_rehabilitacion';

export type FeaturePriority = 'essential' | 'important' | 'optional' | 'future';

export type FeatureCategory = 
  | 'patient_management'
  | 'diagnostics'
  | 'treatments'
  | 'analytics'
  | 'communication'
  | 'administration'
  | 'education'
  | 'research';

export type DocumentType = 
  | 'license'
  | 'certificate'
  | 'specialty_board'
  | 'hospital_affiliation'
  | 'continuing_education'
  | 'malpractice_insurance';

export type PatientVolume = 'low' | 'medium' | 'high' | 'very_high';

export type SpecialtyComplexity = 'basic' | 'intermediate' | 'advanced' | 'expert';

export type VerificationLevel = 'basic' | 'enhanced' | 'premium';

// ============================================================================
// INTERFACES ADICIONALES
// ============================================================================

export interface SpecialtyAdditionalInfo {
  subspecialties?: string[];
  relatedSpecialties?: string[];
  averageConsultationTime?: number; // en minutos
  commonProcedures?: string[];
  emergencyCapable?: boolean;
  telemedicineCompatible?: boolean;
  requiredEquipment?: string[];
  commonDiagnoses?: string[];
}

export interface SpecialtyStatistics {
  totalSpecialists: number;
  averageExperience: number;
  patientSatisfactionRate: number;
  waitTimeAverage: number; // en días
  consultationRate: number; // por mes
}

export interface DashboardConfiguration {
  specialtyId: string;
  userId: string;
  enabledFeatures: string[];
  customizations: {
    layout: string;
    theme: string;
    notifications: boolean;
    autoRefresh: boolean;
  };
  lastModified: Date;
}

// ============================================================================
// INTERFACES PARA BÚSQUEDA Y FILTRADO
// ============================================================================

export interface SpecialtySearchCriteria {
  category?: SpecialtyCategory;
  complexity?: SpecialtyComplexity;
  patientVolume?: PatientVolume;
  keywords?: string[];
  hasFeature?: string;
  requiresValidation?: string;
}

export interface SpecialtySearchResult {
  specialty: MedicalSpecialty;
  relevanceScore: number;
  matchedKeywords: string[];
  suggestedFeatures: DashboardFeature[];
}

export interface FeatureSearchCriteria {
  category?: FeatureCategory;
  priority?: FeaturePriority;
  specialty?: string;
  keywords?: string[];
}

// ============================================================================
// INTERFACES PARA VALIDACIÓN
// ============================================================================

export interface ValidationCheck {
  requirementId: string;
  status: 'pending' | 'verified' | 'expired' | 'rejected';
  verifiedAt?: Date;
  expiresAt?: Date;
  verificationMethod?: string;
  documentUrl?: string;
  notes?: string;
}

export interface SpecialtyEligibility {
  specialtyId: string;
  isEligible: boolean;
  missingRequirements: ValidationRequirement[];
  warnings: string[];
  recommendations: string[];
  estimatedCompletionTime?: number; // en días
}

// ============================================================================
// INTERFACES PARA DASHBOARD CUSTOMIZATION
// ============================================================================

export interface WidgetConfiguration {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  minimized: boolean;
  customProps?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfiguration[];
  gridSettings: {
    columns: number;
    rowHeight: number;
    margin: [number, number];
  };
  responsive: boolean;
}

// ============================================================================
// INTERFACES PARA MÉTRICAS Y ANALYTICS
// ============================================================================

export interface SpecialtyMetrics {
  specialtyId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalPatients: number;
    newPatients: number;
    consultations: number;
    procedures: number;
    averageWaitTime: number;
    patientSatisfaction: number;
    revenue: number;
  };
  comparisons: {
    previousPeriod: number; // porcentaje de cambio
    specialtyAverage: number; // comparación con promedio de la especialidad
    national: number; // comparación con promedio nacional
  };
}

export interface FeatureUsageMetrics {
  featureId: string;
  specialtyId: string;
  usage: {
    totalUsers: number;
    activeUsers: number;
    sessionsPerUser: number;
    timeSpentPerSession: number; // en minutos
    completionRate: number; // porcentaje
  };
  performance: {
    loadTime: number; // en milisegundos
    errorRate: number; // porcentaje
    userSatisfaction: number; // escala 1-5
  };
}

// ============================================================================
// INTERFACES PARA CONFIGURACIÓN DEL SISTEMA
// ============================================================================

export interface SystemConfiguration {
  availableSpecialties: string[];
  enabledFeatures: string[];
  defaultDashboardLayout: string;
  validationSettings: {
    autoVerification: boolean;
    reminderDays: number;
    gracePeriod: number; // días después de expiración
  };
  uiSettings: {
    theme: string;
    language: string;
    timeZone: string;
    dateFormat: string;
  };
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type SpecialtyId = MedicalSpecialty['id'];
export type FeatureId = DashboardFeature['id'];
export type ValidationId = ValidationRequirement['id'];

export type SpecialtyMap = Record<SpecialtyId, MedicalSpecialty>;
export type FeatureMap = Record<FeatureId, DashboardFeature>;
export type ValidationMap = Record<ValidationId, ValidationRequirement>;

// ============================================================================
// INTERFACES PARA MIGRACIÓN Y VERSIONADO
// ============================================================================

export interface SpecialtyMigration {
  version: string;
  description: string;
  changes: {
    added: MedicalSpecialty[];
    modified: Partial<MedicalSpecialty>[];
    removed: string[];
  };
  migrationDate: Date;
  compatibility: {
    backward: boolean;
    forward: boolean;
  };
}

export interface FeatureMigration {
  version: string;
  description: string;
  changes: {
    added: DashboardFeature[];
    modified: Partial<DashboardFeature>[];
    removed: string[];
    dependencies: Record<string, string[]>;
  };
  migrationDate: Date;
}

// ============================================================================
// TIPOS PARA TESTING Y MOCK DATA
// ============================================================================

export interface MockSpecialtyData {
  specialty: MedicalSpecialty;
  samplePatients: number;
  sampleMetrics: SpecialtyMetrics;
  testScenarios: string[];
}

export interface TestConfiguration {
  enableMockData: boolean;
  defaultSpecialty: SpecialtyId;
  simulateLatency: boolean;
  mockValidationResults: boolean;
}

// ============================================================================
// INTERFACES PARA INTEGRACIÓN
// ============================================================================

export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'ehr' | 'billing' | 'lab' | 'imaging' | 'pharmacy';
  supportedSpecialties: SpecialtyId[];
  requiredFeatures: FeatureId[];
  configuration: Record<string, any>;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface IntegrationCapability {
  specialtyId: SpecialtyId;
  availableIntegrations: ExternalIntegration[];
  recommendedIntegrations: ExternalIntegration[];
  customIntegrations: boolean;
}

// ============================================================================
// EXPORT DE TIPOS PRINCIPALES
// ============================================================================

export type {
  MedicalSpecialty,
  DashboardFeature,
  ValidationRequirement,
  SpecialtyCategory,
  FeaturePriority,
  FeatureCategory,
  DocumentType
};

// Enums para mayor type safety
export enum SpecialtyCategoryEnum {
  MEDICINA_GENERAL = 'medicina_general',
  ESPECIALIDADES_MEDICAS = 'especialidades_medicas',
  ESPECIALIDADES_QUIRURGICAS = 'especialidades_quirurgicas',
  MEDICINA_DIAGNOSTICA = 'medicina_diagnostica',
  SALUD_MENTAL = 'salud_mental',
  PEDIATRIA_ESPECIALIZADA = 'pediatria_especializada'
}

export enum FeaturePriorityEnum {
  ESSENTIAL = 'essential',
  IMPORTANT = 'important',
  OPTIONAL = 'optional',
  FUTURE = 'future'
}

export enum FeatureCategoryEnum {
  PATIENT_MANAGEMENT = 'patient_management',
  DIAGNOSTICS = 'diagnostics',
  TREATMENTS = 'treatments',
  ANALYTICS = 'analytics',
  COMMUNICATION = 'communication'
}
