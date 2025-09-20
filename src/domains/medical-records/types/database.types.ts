/**
 * Medical Records domain database types
 * @fileoverview Database types specific to medical records and patient documents
 * @compliance HIPAA-compliant medical record data structures
 */

import { Json } from '@/shared/types/base-database.types';

export interface MedicalRecordTables {
  medical_records: {
    Row: {
      appointment_id: number | null
      created_at: string
      diagnosis: string
      doctor_id: string
      id: number
      notes: string | null
      patient_id: string
      treatment: string | null
      updated_at: string
    }
    Insert: {
      appointment_id?: number | null
      created_at?: string
      diagnosis: string
      doctor_id: string
      id?: number
      notes?: string | null
      patient_id: string
      treatment?: string | null
      updated_at?: string
    }
    Update: {
      appointment_id?: number | null
      created_at?: string
      diagnosis?: string
      doctor_id?: string
      id?: number
      notes?: string | null
      patient_id?: string
      treatment?: string | null
      updated_at?: string
    }
  }
  medical_documents: {
    Row: {
      created_at: string
      description: string | null
      doctor_id: string | null
      file_size: number | null
      file_type: string | null
      file_url: string | null
      id: string
      is_critical: boolean | null
      patient_id: string
      shared_with_caregivers: boolean | null
      tags: string[] | null
      title: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      doctor_id?: string | null
      file_size?: number | null
      file_type?: string | null
      file_url?: string | null
      id?: string
      is_critical?: boolean | null
      patient_id: string
      shared_with_caregivers?: boolean | null
      tags?: string[] | null
      title: string
    }
    Update: {
      created_at?: string
      description?: string | null
      doctor_id?: string | null
      file_size?: number | null
      file_type?: string | null
      file_url?: string | null
      id?: string
      is_critical?: boolean | null
      patient_id?: string
      shared_with_caregivers?: boolean | null
      tags?: string[] | null
      title?: string
    }
  }
  patient_medications: {
    Row: {
      adherence_score: number | null
      created_at: string
      dosage: string
      end_date: string | null
      frequency: string
      id: string
      instructions: string | null
      medication_name: string
      patient_id: string
      prescribed_by: string
      side_effects_reported: string[] | null
      start_date: string
      updated_at: string
    }
    Insert: {
      adherence_score?: number | null
      created_at?: string
      dosage: string
      end_date?: string | null
      frequency: string
      id?: string
      instructions?: string | null
      medication_name: string
      patient_id: string
      prescribed_by: string
      side_effects_reported?: string[] | null
      start_date: string
      updated_at?: string
    }
    Update: {
      adherence_score?: number | null
      created_at?: string
      dosage?: string
      end_date?: string | null
      frequency?: string
      id?: string
      instructions?: string | null
      medication_name?: string
      patient_id?: string
      prescribed_by?: string
      side_effects_reported?: string[] | null
      start_date?: string
      updated_at?: string
    }
  }
  health_metrics: {
    Row: {
      created_at: string
      id: string
      metric_type: string
      patient_id: string
      recorded_at: string
      target_value: Json | null
      unit: string
      updated_at: string
      value: number
    }
    Insert: {
      created_at?: string
      id?: string
      metric_type: string
      patient_id: string
      recorded_at: string
      target_value?: Json | null
      unit: string
      updated_at?: string
      value: number
    }
    Update: {
      created_at?: string
      id?: string
      metric_type?: string
      patient_id?: string
      recorded_at?: string
      target_value?: Json | null
      unit?: string
      updated_at?: string
      value?: number
    }
  }
  health_plans: {
    Row: {
      created_at: string
      description: string | null
      end_date: string | null
      id: string
      milestones: Json | null
      patient_id: string
      plan_type: string
      start_date: string
      status: string | null
      title: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      end_date?: string | null
      id?: string
      milestones?: Json | null
      patient_id: string
      plan_type: string
      start_date: string
      status?: string | null
      title: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      description?: string | null
      end_date?: string | null
      id?: string
      milestones?: Json | null
      patient_id?: string
      plan_type?: string
      start_date?: string
      status?: string | null
      title?: string
      updated_at?: string
    }
  }
  health_plan_tasks: {
    Row: {
      completed_at: string | null
      created_at: string
      description: string | null
      due_date: string | null
      health_plan_id: string
      id: string
      is_completed: boolean | null
      priority: number | null
      task_type: string
      title: string
      updated_at: string
    }
    Insert: {
      completed_at?: string | null
      created_at?: string
      description?: string | null
      due_date?: string | null
      health_plan_id: string
      id?: string
      is_completed?: boolean | null
      priority?: number | null
      task_type: string
      title: string
      updated_at?: string
    }
    Update: {
      completed_at?: string | null
      created_at?: string
      description?: string | null
      due_date?: string | null
      health_plan_id?: string
      id?: string
      is_completed?: boolean | null
      priority?: number | null
      task_type?: string
      title?: string
      updated_at?: string
    }
  }
  second_opinion_requests: {
    Row: {
      case_description: string
      case_title: string
      created_at: string
      id: string
      original_doctor_id: string | null
      patient_id: string
      requested_at: string
      responded_at: string | null
      specialist_id: string | null
      specialist_recommendations: string | null
      specialist_response: string | null
      specific_questions: string | null
      status: string
      updated_at: string
      urgency_level: string | null
    }
    Insert: {
      case_description: string
      case_title: string
      created_at?: string
      id?: string
      original_doctor_id?: string | null
      patient_id: string
      requested_at: string
      responded_at?: string | null
      specialist_id?: string | null
      specialist_recommendations?: string | null
      specialist_response?: string | null
      specific_questions?: string | null
      status: string
      updated_at?: string
      urgency_level?: string | null
    }
    Update: {
      case_description?: string
      case_title?: string
      created_at?: string
      id?: string
      original_doctor_id?: string | null
      patient_id?: string
      requested_at?: string
      responded_at?: string | null
      specialist_id?: string | null
      specialist_recommendations?: string | null
      specialist_response?: string | null
      specific_questions?: string | null
      status?: string
      updated_at?: string
      urgency_level?: string | null
    }
  }
}

// Specialized types for medical records domain
export type MedicalRecord = MedicalRecordTables['medical_records']['Row'];
export type MedicalDocument = MedicalRecordTables['medical_documents']['Row'];
export type PatientMedication = MedicalRecordTables['patient_medications']['Row'];
export type HealthMetric = MedicalRecordTables['health_metrics']['Row'];
export type HealthPlan = MedicalRecordTables['health_plans']['Row'];
export type HealthPlanTask = MedicalRecordTables['health_plan_tasks']['Row'];
export type SecondOpinionRequest = MedicalRecordTables['second_opinion_requests']['Row'];

// Insert types
export type MedicalRecordInsert = MedicalRecordTables['medical_records']['Insert'];
export type MedicalDocumentInsert = MedicalRecordTables['medical_documents']['Insert'];
export type PatientMedicationInsert = MedicalRecordTables['patient_medications']['Insert'];
export type HealthMetricInsert = MedicalRecordTables['health_metrics']['Insert'];

// Update types
export type MedicalRecordUpdate = MedicalRecordTables['medical_records']['Update'];
export type MedicalDocumentUpdate = MedicalRecordTables['medical_documents']['Update'];
export type PatientMedicationUpdate = MedicalRecordTables['patient_medications']['Update'];

// Medical record specific enums and constants
export const DOCUMENT_TYPES = {
  LAB_RESULT: 'lab_result',
  PRESCRIPTION: 'prescription',
  IMAGING: 'imaging',
  DISCHARGE_SUMMARY: 'discharge_summary',
  CONSULTATION_NOTE: 'consultation_note',
  VACCINATION_RECORD: 'vaccination_record',
  ALLERGY_RECORD: 'allergy_record'
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

export const METRIC_TYPES = {
  BLOOD_PRESSURE: 'blood_pressure',
  HEART_RATE: 'heart_rate',
  WEIGHT: 'weight',
  HEIGHT: 'height',
  TEMPERATURE: 'temperature',
  GLUCOSE: 'glucose',
  CHOLESTEROL: 'cholesterol',
  BMI: 'bmi'
} as const;

export type MetricType = typeof METRIC_TYPES[keyof typeof METRIC_TYPES];

export const MEDICATION_FREQUENCY = {
  ONCE_DAILY: 'once_daily',
  TWICE_DAILY: 'twice_daily',
  THREE_TIMES_DAILY: 'three_times_daily',
  FOUR_TIMES_DAILY: 'four_times_daily',
  AS_NEEDED: 'as_needed',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const;

export type MedicationFrequency = typeof MEDICATION_FREQUENCY[keyof typeof MEDICATION_FREQUENCY];

export const SECOND_OPINION_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type SecondOpinionStatus = typeof SECOND_OPINION_STATUS[keyof typeof SECOND_OPINION_STATUS];
