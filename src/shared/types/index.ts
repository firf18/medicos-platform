/**
 * Shared types index
 * @fileoverview Central export point for all shared types across the medical platform
 * @compliance HIPAA-compliant type exports organized by medical domain
 */

// Base database types
export * from './base-database.types';

// Domain-specific database types
export * from '@/domains/auth/types/database.types';
export * from '@/domains/appointments/types/database.types';
export * from '@/domains/medical-records/types/database.types';
export * from '@/domains/laboratory/types/database.types';
export * from '@/domains/notifications/types/database.types';
export * from '@/domains/dashboard/types/database.types';
export * from '@/domains/emergency/types/database.types';

// Re-export commonly used types with domain prefixes for clarity
export type {
  // Auth domain
  DoctorProfile,
  PatientProfile,
  UserProfile,
  MedicalSpecialty,
  Clinic,
  UserRole,
  BloodType
} from '@/domains/auth/types/database.types';

export type {
  // Appointments domain
  Appointment,
  AppointmentWithDetails,
  AppointmentStatus,
  AppointmentPriority,
  TimeSlot,
  AppointmentRequest
} from '@/domains/appointments/types/database.types';

export type {
  // Medical Records domain
  MedicalRecord,
  MedicalDocument,
  PatientMedication,
  HealthMetric,
  HealthPlan,
  SecondOpinionRequest,
  DocumentType,
  MetricType,
  MedicationFrequency
} from '@/domains/medical-records/types/database.types';

export type {
  // Laboratory domain
  Laboratory,
  LaboratoryService,
  LabResult,
  LabResultWithDetails,
  LabTestType,
  LabResultStatus,
  LabPriorityLevel,
  LabOrder
} from '@/domains/laboratory/types/database.types';

export type {
  // Notifications domain
  Notification,
  NotificationWithRecipient,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationTemplate,
  NotificationPreferences
} from '@/domains/notifications/types/database.types';

export type {
  // Emergency domain
  EmergencyContact,
  PatientCaregiver,
  EmergencyContactWithDetails,
  EmergencyRelationship,
  AccessLevel,
  EmergencyPriority,
  EmergencyAlert,
  EmergencyProtocol
} from '@/domains/emergency/types/database.types';

export type {
  // Dashboard domain
  DoctorDashboardStats,
  PatientDashboardStats,
  ClinicDashboardStats,
  LaboratoryDashboardStats,
  DashboardWidget,
  DashboardLayout,
  AppointmentAnalytics,
  PatientAnalytics,
  RevenueAnalytics
} from '@/domains/dashboard/types/database.types';
