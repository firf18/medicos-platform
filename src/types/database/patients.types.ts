/**
 * Patients Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de pacientes y cuidadores.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import type { Json } from './base.types';

export type PatientsTables = {
  patients: {
    Row: {
      allergies: string[] | null
      blood_type: string | null
      created_at: string
      date_of_birth: string | null
      emergency_contact_name: string | null
      emergency_contact_phone: string | null
      id: string
      updated_at: string
    }
    Insert: {
      allergies?: string[] | null
      blood_type?: string | null
      created_at?: string
      date_of_birth?: string | null
      emergency_contact_name?: string | null
      emergency_contact_phone?: string | null
      id: string
      updated_at?: string
    }
    Update: {
      allergies?: string[] | null
      blood_type?: string | null
      created_at?: string
      date_of_birth?: string | null
      emergency_contact_name?: string | null
      emergency_contact_phone?: string | null
      id?: string
      updated_at?: string
    }
  }
  patient_caregivers: {
    Row: {
      access_level: string
      caregiver_email: string
      caregiver_name: string
      created_at: string
      expires_at: string | null
      id: string
      is_active: boolean | null
      is_emergency_contact: boolean | null
      patient_id: string
      permissions: Json | null
      relationship: string
      updated_at: string
    }
    Insert: {
      access_level?: string
      caregiver_email: string
      caregiver_name: string
      created_at?: string
      expires_at?: string | null
      id?: string
      is_active?: boolean | null
      is_emergency_contact?: boolean | null
      patient_id: string
      permissions?: Json | null
      relationship: string
      updated_at?: string
    }
    Update: {
      access_level?: string
      caregiver_email?: string
      caregiver_name?: string
      created_at?: string
      expires_at?: string | null
      id?: string
      is_active?: boolean | null
      is_emergency_contact?: boolean | null
      patient_id?: string
      permissions?: Json | null
      relationship?: string
      updated_at?: string
    }
  }
  emergency_contacts: {
    Row: {
      created_at: string
      id: string
      is_active: boolean | null
      name: string
      patient_id: string
      phone: string
      priority: number | null
      relationship: string
    }
    Insert: {
      created_at?: string
      id?: string
      is_active?: boolean | null
      name: string
      patient_id: string
      phone: string
      priority?: number | null
      relationship: string
    }
    Update: {
      created_at?: string
      id?: string
      is_active?: boolean | null
      name?: string
      patient_id?: string
      phone?: string
      priority?: number | null
      relationship?: string
    }
  }
  patient_medications: {
    Row: {
      adherence_score: number | null
      created_at: string
      doctor_id: string | null
      dosage: string
      end_date: string | null
      frequency: string
      id: string
      instructions: string | null
      is_active: boolean | null
      medication_name: string
      patient_id: string
      side_effects_reported: string[] | null
      start_date: string
      updated_at: string
    }
    Insert: {
      adherence_score?: number | null
      created_at?: string
      doctor_id?: string | null
      dosage: string
      end_date?: string | null
      frequency: string
      id?: string
      instructions?: string | null
      is_active?: boolean | null
      medication_name: string
      patient_id: string
      side_effects_reported?: string[] | null
      start_date: string
      updated_at?: string
    }
    Update: {
      adherence_score?: number | null
      created_at?: string
      doctor_id?: string | null
      dosage?: string
      end_date?: string | null
      frequency?: string
      id?: string
      instructions?: string | null
      is_active?: boolean | null
      medication_name?: string
      patient_id?: string
      side_effects_reported?: string[] | null
      start_date?: string
      updated_at?: string
    }
  }
}

// Tipos específicos para el dominio de patients
export type PatientRow = PatientsTables['patients']['Row'];
export type PatientInsert = PatientsTables['patients']['Insert'];
export type PatientUpdate = PatientsTables['patients']['Update'];

export type PatientCaregiverRow = PatientsTables['patient_caregivers']['Row'];
export type PatientCaregiverInsert = PatientsTables['patient_caregivers']['Insert'];
export type PatientCaregiverUpdate = PatientsTables['patient_caregivers']['Update'];

export type EmergencyContactRow = PatientsTables['emergency_contacts']['Row'];
export type EmergencyContactInsert = PatientsTables['emergency_contacts']['Insert'];
export type EmergencyContactUpdate = PatientsTables['emergency_contacts']['Update'];

export type PatientMedicationRow = PatientsTables['patient_medications']['Row'];
export type PatientMedicationInsert = PatientsTables['patient_medications']['Insert'];
export type PatientMedicationUpdate = PatientsTables['patient_medications']['Update'];

// Tipos de sangre válidos
export type BloodType = 
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

// Relaciones familiares válidas
export type FamilyRelationship = 
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'uncle_aunt'
  | 'cousin'
  | 'friend'
  | 'guardian'
  | 'caregiver'
  | 'other';

// Niveles de acceso para cuidadores
export type CaregiverAccessLevel = 
  | 'view_only'
  | 'limited'
  | 'standard'
  | 'full'
  | 'emergency_only';

// Frecuencias de medicación
export type MedicationFrequency = 
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'four_times_daily'
  | 'every_6_hours'
  | 'every_8_hours'
  | 'every_12_hours'
  | 'as_needed'
  | 'weekly'
  | 'monthly'
  | 'custom';

// Paciente extendido con información del perfil
export interface PatientWithProfile extends PatientRow {
  profile?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
  age?: number;
  caregivers?: PatientCaregiverRow[];
  emergencyContacts?: EmergencyContactRow[];
  currentMedications?: PatientMedicationRow[];
}

// Información completa del paciente para dashboard médico
export interface ComprehensivePatientInfo extends PatientWithProfile {
  medicalSummary: {
    primaryConditions: string[];
    chronicDiseases: string[];
    lastVisit?: string;
    nextAppointment?: string;
    riskFactors: string[];
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
      height?: number;
      bmi?: number;
    };
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    copay?: number;
    deductible?: number;
  };
  preferences: {
    language: string;
    communicationMethod: 'email' | 'sms' | 'phone' | 'portal';
    appointmentReminders: boolean;
    medicationReminders: boolean;
    healthTips: boolean;
  };
}

// Cuidador extendido con permisos específicos
export interface CaregiverWithPermissions extends PatientCaregiverRow {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  };
  detailedPermissions: {
    viewMedicalRecords: boolean;
    viewAppointments: boolean;
    scheduleAppointments: boolean;
    viewLabResults: boolean;
    accessEmergencyInfo: boolean;
    receiveMedicalAlerts: boolean;
    communicateWithDoctors: boolean;
    viewBilling: boolean;
    manageMedications: boolean;
    accessCaregivers: boolean;
  };
  accessHistory: Array<{
    accessedAt: string;
    action: string;
    resource: string;
    ipAddress?: string;
  }>;
}

// Medicación extendida con información del médico
export interface MedicationWithDetails extends PatientMedicationRow {
  prescribingDoctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  adherenceHistory: Array<{
    date: string;
    taken: boolean;
    time?: string;
    notes?: string;
  }>;
  interactions?: Array<{
    medicationName: string;
    severity: 'mild' | 'moderate' | 'severe' | 'contraindicated';
    description: string;
  }>;
  renewalInfo?: {
    refillsRemaining: number;
    lastRefilled?: string;
    nextRefillDue?: string;
    autoRefill: boolean;
  };
}

// Estadísticas del paciente para dashboard
export interface PatientStats {
  totalAppointments: number;
  completedAppointments: number;
  missedAppointments: number;
  activeMedications: number;
  averageAdherence: number;
  lastVisit?: string;
  upcomingAppointments: number;
  labResultsPending: number;
  healthGoalsProgress: number;
}

// Configuración de privacidad del paciente
export interface PatientPrivacySettings {
  dataSharing: {
    allowResearch: boolean;
    allowMarketing: boolean;
    allowThirdPartyAccess: boolean;
    allowCaregiverAccess: boolean;
  };
  communication: {
    allowSMS: boolean;
    allowEmail: boolean;
    allowPhoneCalls: boolean;
    allowPortalMessages: boolean;
  };
  emergencyAccess: {
    allowEmergencyOverride: boolean;
    emergencyContactsCanAccess: boolean;
    emergencyInfoVisible: boolean;
  };
  auditLevel: 'basic' | 'enhanced' | 'comprehensive';
}

// Alergias clasificadas por severidad
export interface PatientAllergy {
  allergen: string;
  category: 'food' | 'medication' | 'environmental' | 'contact' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  symptoms: string[];
  firstReported: string;
  lastReaction?: string;
  treatment?: string;
  verified: boolean;
}

// Plan de cuidado del paciente
export interface PatientCarePlan {
  patientId: string;
  primaryDoctorId: string;
  careTeam: Array<{
    doctorId: string;
    role: 'primary' | 'specialist' | 'consultant';
    specialty: string;
  }>;
  goals: Array<{
    id: string;
    description: string;
    targetDate: string;
    status: 'active' | 'achieved' | 'paused' | 'cancelled';
    progress: number; // 0-100
  }>;
  interventions: Array<{
    type: 'medication' | 'therapy' | 'lifestyle' | 'monitoring';
    description: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }>;
  monitoring: Array<{
    parameter: string;
    frequency: string;
    targetRange?: string;
    lastValue?: string;
    nextDue?: string;
  }>;
}
