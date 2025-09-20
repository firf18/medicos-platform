/**
 * Tipos de Entidades Médicas
 * 
 * Contiene todos los tipos relacionados con entidades médicas:
 * pacientes, registros médicos, documentos, medicamentos, etc.
 */

import type { Json } from './base-types';

export interface PatientsTable {
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

export interface MedicalRecordsTable {
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

export interface MedicalDocumentsTable {
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
    document_type: string
    updated_at: string
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
    document_type: string
    updated_at?: string
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
    document_type?: string
    updated_at?: string
  }
}

export interface PatientMedicationsTable {
  Row: {
    adherence_percentage: number | null
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
    adherence_percentage?: number | null
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
    adherence_percentage?: number | null
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

export interface PatientCaregiversTable {
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

export interface SecondOpinionRequestsTable {
  Row: {
    case_description: string
    case_title: string
    created_at: string
    current_diagnosis: string | null
    current_treatment: string | null
    id: string
    original_doctor_id: string | null
    patient_id: string
    requested_at: string
    responded_at: string | null
    specialist_id: string | null
    specialist_recommendations: string | null
    specialist_response: string | null
    specific_questions: string | null
    status: string | null
    urgency_level: string | null
  }
  Insert: {
    case_description: string
    case_title: string
    created_at?: string
    current_diagnosis?: string | null
    current_treatment?: string | null
    id?: string
    original_doctor_id?: string | null
    patient_id: string
    requested_at?: string
    responded_at?: string | null
    specialist_id?: string | null
    specialist_recommendations?: string | null
    specialist_response?: string | null
    specific_questions?: string | null
    status?: string | null
    urgency_level?: string | null
  }
  Update: {
    case_description?: string
    case_title?: string
    created_at?: string
    current_diagnosis?: string | null
    current_treatment?: string | null
    id?: string
    original_doctor_id?: string | null
    patient_id?: string
    requested_at?: string
    responded_at?: string | null
    specialist_id?: string | null
    specialist_recommendations?: string | null
    specialist_response?: string | null
    specific_questions?: string | null
    status?: string | null
    urgency_level?: string | null
  }
}

// Tipos adicionales para entidades médicas
export interface HealthPlansTable {
  Row: {
    id: string
    patient_id: string
    doctor_id: string | null
    title: string
    description: string | null
    goals: string[] | null
    start_date: string
    end_date: string | null
    status: 'active' | 'completed' | 'paused' | 'cancelled'
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    patient_id: string
    doctor_id?: string | null
    title: string
    description?: string | null
    goals?: string[] | null
    start_date: string
    end_date?: string | null
    status?: 'active' | 'completed' | 'paused' | 'cancelled'
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    patient_id?: string
    doctor_id?: string | null
    title?: string
    description?: string | null
    goals?: string[] | null
    start_date?: string
    end_date?: string | null
    status?: 'active' | 'completed' | 'paused' | 'cancelled'
    created_at?: string
    updated_at?: string
  }
}

export interface HealthPlanTasksTable {
  Row: {
    id: string
    health_plan_id: string
    title: string
    description: string | null
    due_date: string | null
    is_completed: boolean
    completed_at: string | null
    priority: 'low' | 'medium' | 'high'
    category: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    health_plan_id: string
    title: string
    description?: string | null
    due_date?: string | null
    is_completed?: boolean
    completed_at?: string | null
    priority?: 'low' | 'medium' | 'high'
    category?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    health_plan_id?: string
    title?: string
    description?: string | null
    due_date?: string | null
    is_completed?: boolean
    completed_at?: string | null
    priority?: 'low' | 'medium' | 'high'
    category?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface HealthMetricsTable {
  Row: {
    id: string
    patient_id: string
    metric_type: string
    value: number
    unit: string
    recorded_at: string
    notes: string | null
    doctor_id: string | null
    is_critical: boolean | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    patient_id: string
    metric_type: string
    value: number
    unit: string
    recorded_at: string
    notes?: string | null
    doctor_id?: string | null
    is_critical?: boolean | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    patient_id?: string
    metric_type?: string
    value?: number
    unit?: string
    recorded_at?: string
    notes?: string | null
    doctor_id?: string | null
    is_critical?: boolean | null
    created_at?: string
    updated_at?: string
  }
}

export interface EmergencyMedicalInfoTable {
  Row: {
    id: string
    patient_id: string
    blood_type: string | null
    allergies: string[] | null
    chronic_conditions: string[] | null
    current_medications: string[] | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    emergency_contact_relationship: string | null
    insurance_provider: string | null
    insurance_policy_number: string | null
    preferred_hospital: string | null
    special_instructions: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    patient_id: string
    blood_type?: string | null
    allergies?: string[] | null
    chronic_conditions?: string[] | null
    current_medications?: string[] | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
    emergency_contact_relationship?: string | null
    insurance_provider?: string | null
    insurance_policy_number?: string | null
    preferred_hospital?: string | null
    special_instructions?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    patient_id?: string
    blood_type?: string | null
    allergies?: string[] | null
    chronic_conditions?: string[] | null
    current_medications?: string[] | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
    emergency_contact_relationship?: string | null
    insurance_provider?: string | null
    insurance_policy_number?: string | null
    preferred_hospital?: string | null
    special_instructions?: string | null
    created_at?: string
    updated_at?: string
  }
}