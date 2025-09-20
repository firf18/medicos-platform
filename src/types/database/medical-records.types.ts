/**
 * Medical Records Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de registros médicos.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import type { Json } from './base.types';

export type MedicalRecordsTables = {
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
  second_opinion_requests: {
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
}

// Tipos específicos para el dominio de medical records
export type MedicalRecordRow = MedicalRecordsTables['medical_records']['Row'];
export type MedicalRecordInsert = MedicalRecordsTables['medical_records']['Insert'];
export type MedicalRecordUpdate = MedicalRecordsTables['medical_records']['Update'];

export type MedicalDocumentRow = MedicalRecordsTables['medical_documents']['Row'];
export type MedicalDocumentInsert = MedicalRecordsTables['medical_documents']['Insert'];
export type MedicalDocumentUpdate = MedicalRecordsTables['medical_documents']['Update'];

export type SecondOpinionRequestRow = MedicalRecordsTables['second_opinion_requests']['Row'];
export type SecondOpinionRequestInsert = MedicalRecordsTables['second_opinion_requests']['Insert'];
export type SecondOpinionRequestUpdate = MedicalRecordsTables['second_opinion_requests']['Update'];

// Niveles de confidencialidad para registros médicos
export type ConfidentialityLevel = 
  | 'public'
  | 'restricted'
  | 'confidential'
  | 'secret';

// Tipos de documentos médicos
export type MedicalDocumentType = 
  | 'lab_result'
  | 'imaging'
  | 'prescription'
  | 'discharge_summary'
  | 'surgical_report'
  | 'consultation_note'
  | 'insurance_form'
  | 'consent_form'
  | 'vaccination_record'
  | 'emergency_contact'
  | 'allergy_record'
  | 'other';

// Estados de segunda opinión
export type SecondOpinionStatus = 
  | 'pending'
  | 'assigned'
  | 'in_review'
  | 'completed'
  | 'cancelled'
  | 'expired';

// Niveles de urgencia para segunda opinión
export type UrgencyLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'emergency';

// Registro médico extendido con relaciones
export interface MedicalRecordWithRelations extends MedicalRecordRow {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    bloodType?: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    licenseNumber: string;
  };
  appointment?: {
    id: number;
    appointmentDate: string;
    status: string;
  };
  documents?: MedicalDocumentRow[];
}

// Documento médico extendido
export interface MedicalDocumentWithMetadata extends MedicalDocumentRow {
  uploadedBy?: {
    id: string;
    name: string;
    role: string;
  };
  accessLog?: Array<{
    userId: string;
    userName: string;
    accessedAt: string;
    action: 'view' | 'download' | 'share' | 'edit';
  }>;
  encryption?: {
    isEncrypted: boolean;
    algorithm?: string;
    keyId?: string;
  };
}

// Solicitud de segunda opinión extendida
export interface SecondOpinionRequestWithDetails extends SecondOpinionRequestRow {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
  };
  originalDoctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  specialist?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    yearsOfExperience: number;
  };
  attachedDocuments?: MedicalDocumentRow[];
}

// Historial médico completo del paciente
export interface PatientMedicalHistory {
  patientId: string;
  summary: {
    totalRecords: number;
    firstVisit: string;
    lastVisit: string;
    primaryDiagnoses: string[];
    chronicConditions: string[];
    allergies: string[];
    currentMedications: string[];
  };
  records: MedicalRecordWithRelations[];
  documents: MedicalDocumentWithMetadata[];
  timeline: Array<{
    date: string;
    type: 'visit' | 'lab' | 'imaging' | 'prescription' | 'surgery';
    description: string;
    doctor: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

// Métricas de registro médico para compliance
export interface MedicalRecordMetrics {
  totalRecords: number;
  recordsThisMonth: number;
  averageRecordLength: number;
  complianceScore: number;
  auditTrail: Array<{
    recordId: string;
    action: 'created' | 'viewed' | 'modified' | 'shared' | 'archived';
    userId: string;
    timestamp: string;
    ipAddress?: string;
    details?: Json;
  }>;
  dataRetention: {
    retentionPeriod: number; // en años
    scheduledDeletion: string[];
    archivalSchedule: string[];
  };
}

// Configuración de privacidad para registros médicos
export interface MedicalRecordPrivacySettings {
  defaultConfidentiality: ConfidentialityLevel;
  sharingPreferences: {
    allowCaregiverAccess: boolean;
    allowEmergencyAccess: boolean;
    allowResearchUse: boolean;
    allowSecondOpinions: boolean;
  };
  accessControls: {
    requireTwoFactorAuth: boolean;
    sessionTimeout: number; // en minutos
    allowOfflineAccess: boolean;
    allowPrintAccess: boolean;
  };
  auditingLevel: 'basic' | 'enhanced' | 'comprehensive';
}
