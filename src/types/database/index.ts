/**
 * Database Types Index - Red-Salud Platform
 * 
 * Archivo principal que combina todos los tipos de base de datos por dominio médico.
 * Cumple con compliance médico y principio de responsabilidad única.
 */

// Importar tipos base
export type { Json, Database, DatabaseFunctions } from './base.types';

// Importar tipos por dominio médico
export type { 
  AppointmentsTables,
  AppointmentRow,
  AppointmentInsert,
  AppointmentUpdate,
  AppointmentStatus,
  AppointmentWithRelations,
  AppointmentFilters,
  AppointmentStats
} from './appointments.types';

export type {
  AuthTables,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  SpecialtyRow,
  SpecialtyInsert,
  SpecialtyUpdate,
  UserRole,
  VerificationStatus,
  ExtendedProfile,
  MedicalSession
} from './auth.types';

export type {
  ClinicsTables,
  ClinicRow,
  ClinicInsert,
  ClinicUpdate,
  ClinicDoctorRow,
  ClinicDoctorInsert,
  ClinicDoctorUpdate,
  ClinicDoctorRole,
  ClinicType,
  VenezuelanState,
  ClinicWithDoctors,
  ClinicDoctorRelation,
  ClinicStats,
  ClinicConfiguration
} from './clinics.types';

export type {
  DoctorsTables,
  DoctorRow,
  DoctorInsert,
  DoctorUpdate,
  DoctorAvailabilityStatus,
  ExperienceLevel,
  VenezuelanMedicalLicense,
  DoctorWithProfile,
  DoctorProfessionalInfo,
  DoctorStats,
  DoctorSchedule,
  DoctorPreferences
} from './doctors.types';

export type {
  LaboratoryTables,
  LaboratoryRow,
  LaboratoryInsert,
  LaboratoryUpdate,
  LaboratoryServiceRow,
  LaboratoryServiceInsert,
  LaboratoryServiceUpdate,
  LabResultRow,
  LabResultInsert,
  LabResultUpdate,
  LabResultStatus,
  LabTestPriority,
  LabServiceCategory,
  LabCertification,
  LaboratoryWithServices,
  LabResultWithRelations,
  LabResultData,
  LaboratoryStats,
  LaboratoryConfiguration,
  LabOrder
} from './laboratory.types';

export type {
  MedicalRecordsTables,
  MedicalRecordRow,
  MedicalRecordInsert,
  MedicalRecordUpdate,
  MedicalDocumentRow,
  MedicalDocumentInsert,
  MedicalDocumentUpdate,
  SecondOpinionRequestRow,
  SecondOpinionRequestInsert,
  SecondOpinionRequestUpdate,
  ConfidentialityLevel,
  MedicalDocumentType,
  SecondOpinionStatus,
  UrgencyLevel,
  MedicalRecordWithRelations,
  MedicalDocumentWithMetadata,
  SecondOpinionRequestWithDetails,
  PatientMedicalHistory,
  MedicalRecordMetrics,
  MedicalRecordPrivacySettings
} from './medical-records.types';

export type {
  NotificationsTables,
  NotificationRow,
  NotificationInsert,
  NotificationUpdate,
  MedicalNotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationPreferences,
  NotificationWithRecipient,
  NotificationTemplate,
  NotificationStats,
  NotificationCampaign,
  EmergencyNotificationConfig
} from './notifications.types';

export type {
  PatientsTables,
  PatientRow,
  PatientInsert,
  PatientUpdate,
  PatientCaregiverRow,
  PatientCaregiverInsert,
  PatientCaregiverUpdate,
  EmergencyContactRow,
  EmergencyContactInsert,
  EmergencyContactUpdate,
  PatientMedicationRow,
  PatientMedicationInsert,
  PatientMedicationUpdate,
  BloodType,
  FamilyRelationship,
  CaregiverAccessLevel,
  MedicationFrequency,
  PatientWithProfile,
  ComprehensivePatientInfo,
  CaregiverWithPermissions,
  MedicationWithDetails,
  PatientStats,
  PatientPrivacySettings,
  PatientAllergy,
  PatientCarePlan
} from './patients.types';

export type {
  HealthTables,
  HealthMetricRow,
  HealthMetricInsert,
  HealthMetricUpdate,
  HealthPlanRow,
  HealthPlanInsert,
  HealthPlanUpdate,
  HealthPlanTaskRow,
  HealthPlanTaskInsert,
  HealthPlanTaskUpdate,
  HealthMetricType,
  HealthMetricSource,
  HealthPlanType,
  HealthPlanStatus,
  HealthPlanTaskType,
  HealthMetricWithContext,
  HealthPlanWithTasks,
  HealthPlanTaskWithDetails,
  PatientHealthSummary,
  HealthMetricRanges,
  HealthMetricTrend,
  HealthGoal
} from './health.types';

// Importar tipos de todas las tablas
import type { AppointmentsTables } from './appointments.types';
import type { AuthTables } from './auth.types';
import type { ClinicsTables } from './clinics.types';
import type { DoctorsTables } from './doctors.types';
import type { LaboratoryTables } from './laboratory.types';
import type { MedicalRecordsTables } from './medical-records.types';
import type { NotificationsTables } from './notifications.types';
import type { PatientsTables } from './patients.types';
import type { HealthTables } from './health.types';

// Tipo consolidado de todas las tablas
export type AllDatabaseTables = 
  & AppointmentsTables
  & AuthTables
  & ClinicsTables
  & DoctorsTables
  & LaboratoryTables
  & MedicalRecordsTables
  & NotificationsTables
  & PatientsTables
  & HealthTables;

// Re-exportar tipos utilitarios desde base.types
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes
} from './base.types';

// Tipo completo de base de datos con todas las tablas
export interface CompleteMedicalDatabase {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: AllDatabaseTables
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_clinic: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_doctor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_laboratory: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_patient: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Export default como la base de datos completa
export default CompleteMedicalDatabase;