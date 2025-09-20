/**
 * Barrel Export para Tipos de Base de Datos
 * 
 * Centraliza todas las exportaciones de tipos de base de datos
 * organizados por categorías para facilitar las importaciones.
 */

// Tipos base
export type { Json, Database, DatabaseFunctions } from './base-types';
export type {
  AppointmentsTable,
  ClinicsTable,
  ClinicDoctorsTable,
  DoctorsTable,
  ProfilesTable,
  SpecialtiesTable
} from './base-types';

// Tipos médicos
export type {
  PatientsTable,
  MedicalRecordsTable,
  MedicalDocumentsTable,
  PatientMedicationsTable,
  PatientCaregiversTable,
  SecondOpinionRequestsTable,
  HealthPlansTable,
  HealthPlanTasksTable,
  HealthMetricsTable,
  EmergencyMedicalInfoTable
} from './medical-types';

// Tipos de laboratorio
export type {
  LaboratoriesTable,
  LaboratoryServicesTable,
  LabResultsTable,
  LabOrdersTable,
  LabEquipmentTable,
  QualityControlTable
} from './laboratory-types';

// Tipos de notificaciones
export type {
  NotificationsTable,
  PatientNotificationsTable,
  DoctorNotificationsTable,
  NotificationTemplatesTable,
  NotificationPreferencesTable,
  MedicationRemindersTable
} from './notification-types';

// Tipos de utilidad
export type {
  DatabaseWithoutInternals,
  DefaultSchema,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  // Tipos de conveniencia
  AppointmentRow,
  AppointmentInsert,
  AppointmentUpdate,
  PatientRow,
  PatientInsert,
  PatientUpdate,
  DoctorRow,
  DoctorInsert,
  DoctorUpdate,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  MedicalRecordRow,
  MedicalRecordInsert,
  MedicalRecordUpdate,
  MedicalDocumentRow,
  MedicalDocumentInsert,
  MedicalDocumentUpdate,
  NotificationRow,
  NotificationInsert,
  NotificationUpdate,
  LabResultRow,
  LabResultInsert,
  LabResultUpdate,
  SpecialtyRow,
  SpecialtyInsert,
  SpecialtyUpdate,
  // Tipos con relaciones
  PatientWithProfile,
  DoctorWithProfile,
  AppointmentWithDetails,
  MedicalRecordWithDetails,
  LabResultWithDetails,
  // Tipos para dashboards
  PatientDashboardData,
  DoctorDashboardData,
  // Tipos para operaciones
  SearchFilters,
  PaginationParams,
  PaginatedResponse,
  DatabaseOperation,
  BulkOperation,
  AuditLog,
  RLSPolicy
} from './utility-types';

// Re-exportar el tipo Database principal para compatibilidad
export type { Database } from './base-types';

// Constantes útiles
export const TABLE_NAMES = {
  APPOINTMENTS: 'appointments',
  CLINICS: 'clinics',
  CLINIC_DOCTORS: 'clinic_doctors',
  DOCTORS: 'doctors',
  LAB_RESULTS: 'lab_results',
  LABORATORY_SERVICES: 'laboratory_services',
  LABORATORIES: 'laboratories',
  MEDICAL_RECORDS: 'medical_records',
  MEDICAL_DOCUMENTS: 'medical_documents',
  NOTIFICATIONS: 'notifications',
  PATIENT_CAREGIVERS: 'patient_caregivers',
  PATIENT_MEDICATIONS: 'patient_medications',
  SECOND_OPINION_REQUESTS: 'second_opinion_requests',
  PATIENTS: 'patients',
  PROFILES: 'profiles',
  SPECIALTIES: 'specialties',
  HEALTH_PLANS: 'health_plans',
  HEALTH_PLAN_TASKS: 'health_plan_tasks',
  HEALTH_METRICS: 'health_metrics',
  EMERGENCY_MEDICAL_INFO: 'emergency_medical_info',
  PATIENT_NOTIFICATIONS: 'patient_notifications',
  DOCTOR_NOTIFICATIONS: 'doctor_notifications',
  NOTIFICATION_TEMPLATES: 'notification_templates',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  MEDICATION_REMINDERS: 'medication_reminders',
  LAB_ORDERS: 'lab_orders',
  LAB_EQUIPMENT: 'lab_equipment',
  QUALITY_CONTROL: 'quality_control'
} as const;

export const FUNCTION_NAMES = {
  IS_ADMIN: 'is_admin',
  IS_CLINIC: 'is_clinic',
  IS_DOCTOR: 'is_doctor',
  IS_LABORATORY: 'is_laboratory',
  IS_PATIENT: 'is_patient'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  CLINIC: 'clinic',
  LABORATORY: 'laboratory'
} as const;

export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  MEDICATION: 'medication',
  LAB_RESULT: 'lab_result',
  GENERAL: 'general',
  EMERGENCY: 'emergency',
  SYSTEM: 'system'
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const DOCUMENT_TYPES = {
  LAB_RESULT: 'lab_result',
  PRESCRIPTION: 'prescription',
  REPORT: 'report',
  IMAGE: 'image',
  CERTIFICATE: 'certificate',
  CONSENT: 'consent',
  INSURANCE: 'insurance',
  OTHER: 'other'
} as const;

export const BLOOD_TYPES = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
} as const;

// Tipos para validación de esquemas
export type TableName = keyof DefaultSchema['Tables'];
export type FunctionName = keyof DefaultSchema['Functions'];

// Helpers para type-safe database operations
export type SelectQuery<T extends TableName> = {
  table: T;
  select?: string;
  filters?: Partial<Tables<T>>;
  orderBy?: {
    column: keyof Tables<T>;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
};

export type InsertQuery<T extends TableName> = {
  table: T;
  data: TablesInsert<T> | TablesInsert<T>[];
  returning?: string;
};

export type UpdateQuery<T extends TableName> = {
  table: T;
  data: TablesUpdate<T>;
  filters: Partial<Tables<T>>;
  returning?: string;
};

export type DeleteQuery<T extends TableName> = {
  table: T;
  filters: Partial<Tables<T>>;
  returning?: string;
};