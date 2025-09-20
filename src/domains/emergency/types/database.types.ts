/**
 * Emergency domain database types
 * @fileoverview Database types specific to emergency contacts and critical care
 * @compliance HIPAA-compliant emergency data structures
 */

import { Json } from '@/shared/types/base-database.types';

export interface EmergencyTables {
  emergency_contacts: {
    Row: {
      access_level: string
      additional_data: Json | null
      caregiver_email: string
      caregiver_name: string
      created_at: string
      id: string
      is_emergency_contact: boolean | null
      patient_id: string
      permissions: Json | null
      relationship: string
      source: string | null
      updated_at: string
    }
    Insert: {
      access_level: string
      additional_data?: Json | null
      caregiver_email: string
      caregiver_name: string
      created_at?: string
      id?: string
      is_emergency_contact?: boolean | null
      patient_id: string
      permissions?: Json | null
      relationship: string
      source?: string | null
      updated_at?: string
    }
    Update: {
      access_level?: string
      additional_data?: Json | null
      caregiver_email?: string
      caregiver_name?: string
      created_at?: string
      id?: string
      is_emergency_contact?: boolean | null
      patient_id?: string
      permissions?: Json | null
      relationship?: string
      source?: string | null
      updated_at?: string
    }
  }
  patient_caregivers: {
    Row: {
      access_level: string
      additional_data: Json | null
      caregiver_email: string
      caregiver_name: string
      created_at: string
      expires_at: string | null
      id: string
      is_emergency_contact: boolean | null
      patient_id: string
      permissions: Json | null
      relationship: string
      source: string | null
      updated_at: string
    }
    Insert: {
      access_level: string
      additional_data?: Json | null
      caregiver_email: string
      caregiver_name: string
      created_at?: string
      expires_at?: string | null
      id?: string
      is_emergency_contact?: boolean | null
      patient_id: string
      permissions?: Json | null
      relationship: string
      source?: string | null
      updated_at?: string
    }
    Update: {
      access_level?: string
      additional_data?: Json | null
      caregiver_email?: string
      caregiver_name?: string
      created_at?: string
      expires_at?: string | null
      id?: string
      is_emergency_contact?: boolean | null
      patient_id?: string
      permissions?: Json | null
      relationship?: string
      source?: string | null
      updated_at?: string
    }
  }
}

// Specialized types for emergency domain
export type EmergencyContact = EmergencyTables['emergency_contacts']['Row'];
export type PatientCaregiver = EmergencyTables['patient_caregivers']['Row'];

export type EmergencyContactInsert = EmergencyTables['emergency_contacts']['Insert'];
export type PatientCaregiverInsert = EmergencyTables['patient_caregivers']['Insert'];

export type EmergencyContactUpdate = EmergencyTables['emergency_contacts']['Update'];
export type PatientCaregiverUpdate = EmergencyTables['patient_caregivers']['Update'];

// Emergency-specific enums and constants
export const EMERGENCY_RELATIONSHIPS = {
  SPOUSE: 'spouse',
  PARENT: 'parent',
  CHILD: 'child',
  SIBLING: 'sibling',
  GUARDIAN: 'guardian',
  FRIEND: 'friend',
  CAREGIVER: 'caregiver',
  HEALTHCARE_PROXY: 'healthcare_proxy',
  OTHER: 'other'
} as const;

export type EmergencyRelationship = typeof EMERGENCY_RELATIONSHIPS[keyof typeof EMERGENCY_RELATIONSHIPS];

export const ACCESS_LEVELS = {
  FULL: 'full',
  LIMITED: 'limited',
  EMERGENCY_ONLY: 'emergency_only',
  VIEW_ONLY: 'view_only'
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];

export const EMERGENCY_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export type EmergencyPriority = typeof EMERGENCY_PRIORITIES[keyof typeof EMERGENCY_PRIORITIES];

// Emergency-specific permissions
export interface EmergencyPermissions {
  can_view_medical_records: boolean;
  can_receive_notifications: boolean;
  can_make_medical_decisions: boolean;
  can_access_lab_results: boolean;
  can_schedule_appointments: boolean;
  can_communicate_with_doctors: boolean;
  emergency_contact_priority: number;
}

// Extended emergency types
export interface EmergencyContactWithDetails extends EmergencyContact {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
  last_contacted?: string;
  contact_attempts?: number;
  preferred_contact_method?: 'phone' | 'email' | 'sms';
}

export interface EmergencyAlert {
  id: string;
  patient_id: string;
  alert_type: 'medical_emergency' | 'system_alert' | 'medication_alert' | 'vital_signs_critical';
  severity: EmergencyPriority;
  message: string;
  triggered_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  contacts_notified: string[];
  resolution_notes?: string;
  resolved_at?: string;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  condition_triggers: string[];
  notification_sequence: {
    contact_id: string;
    delay_minutes: number;
    contact_methods: ('phone' | 'sms' | 'email')[];
  }[];
  escalation_rules: {
    no_response_timeout: number;
    escalate_to: string[];
  };
  active: boolean;
}
