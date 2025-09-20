/**
 * Laboratory domain database types
 * @fileoverview Database types specific to laboratory services and test results
 * @compliance HIPAA-compliant laboratory data structures
 */

import { Json } from '@/shared/types/base-database.types';

export interface LaboratoryTables {
  laboratories: {
    Row: {
      address: string | null
      city: string | null
      country: string | null
      created_at: string
      description: string | null
      email: string | null
      id: string
      name: string
      phone: string | null
      state: string | null
      updated_at: string
      website: string | null
    }
    Insert: {
      address?: string | null
      city?: string | null
      country?: string | null
      created_at?: string
      description?: string | null
      email?: string | null
      id: string
      name: string
      phone?: string | null
      state?: string | null
      updated_at?: string
      website?: string | null
    }
    Update: {
      address?: string | null
      city?: string | null
      country?: string | null
      created_at?: string
      description?: string | null
      email?: string | null
      id?: string
      name?: string
      phone?: string | null
      state?: string | null
      updated_at?: string
      website?: string | null
    }
  }
  laboratory_services: {
    Row: {
      created_at: string
      description: string | null
      id: string
      is_active: boolean | null
      laboratory_id: string | null
      name: string
      price: number | null
      updated_at: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      id?: string
      is_active?: boolean | null
      laboratory_id?: string | null
      name: string
      price?: number | null
      updated_at?: string
    }
    Update: {
      created_at?: string
      description?: string | null
      id?: string
      is_active?: boolean | null
      laboratory_id?: string | null
      name?: string
      price?: number | null
      updated_at?: string
    }
  }
  lab_results: {
    Row: {
      created_at: string
      doctor_id: string | null
      id: string
      is_critical: boolean | null
      laboratory_id: string | null
      patient_id: string | null
      performed_at: string | null
      result: string | null
      result_file_url: string | null
      service_id: string | null
      test_name: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      doctor_id?: string | null
      id?: string
      is_critical?: boolean | null
      laboratory_id?: string | null
      patient_id?: string | null
      performed_at?: string | null
      result?: string | null
      result_file_url?: string | null
      service_id?: string | null
      test_name: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      doctor_id?: string | null
      id?: string
      is_critical?: boolean | null
      laboratory_id?: string | null
      patient_id?: string | null
      performed_at?: string | null
      result?: string | null
      result_file_url?: string | null
      service_id?: string | null
      test_name?: string
      updated_at?: string
    }
  }
}

// Specialized types for laboratory domain
export type Laboratory = LaboratoryTables['laboratories']['Row'];
export type LaboratoryService = LaboratoryTables['laboratory_services']['Row'];
export type LabResult = LaboratoryTables['lab_results']['Row'];

export type LaboratoryInsert = LaboratoryTables['laboratories']['Insert'];
export type LaboratoryServiceInsert = LaboratoryTables['laboratory_services']['Insert'];
export type LabResultInsert = LaboratoryTables['lab_results']['Insert'];

export type LaboratoryUpdate = LaboratoryTables['laboratories']['Update'];
export type LaboratoryServiceUpdate = LaboratoryTables['laboratory_services']['Update'];
export type LabResultUpdate = LaboratoryTables['lab_results']['Update'];

// Laboratory-specific enums and constants
export const LAB_TEST_TYPES = {
  BLOOD_TEST: 'blood_test',
  URINE_TEST: 'urine_test',
  IMAGING: 'imaging',
  BIOPSY: 'biopsy',
  CULTURE: 'culture',
  GENETIC_TEST: 'genetic_test',
  HORMONE_TEST: 'hormone_test',
  CARDIAC_TEST: 'cardiac_test',
  PULMONARY_TEST: 'pulmonary_test',
  NEUROLOGICAL_TEST: 'neurological_test'
} as const;

export type LabTestType = typeof LAB_TEST_TYPES[keyof typeof LAB_TEST_TYPES];

export const LAB_RESULT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REQUIRES_RETEST: 'requires_retest'
} as const;

export type LabResultStatus = typeof LAB_RESULT_STATUS[keyof typeof LAB_RESULT_STATUS];

export const LAB_PRIORITY_LEVELS = {
  ROUTINE: 'routine',
  URGENT: 'urgent',
  STAT: 'stat',
  CRITICAL: 'critical'
} as const;

export type LabPriorityLevel = typeof LAB_PRIORITY_LEVELS[keyof typeof LAB_PRIORITY_LEVELS];

// Extended laboratory types with relationships
export interface LabResultWithDetails extends LabResult {
  laboratory?: Laboratory;
  service?: LaboratoryService;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string;
  };
}

export interface LaboratoryWithServices extends Laboratory {
  services: LaboratoryService[];
  total_tests_performed?: number;
  average_turnaround_time?: number;
}

// Laboratory order types
export interface LabOrder {
  patient_id: string;
  doctor_id: string;
  laboratory_id: string;
  service_ids: string[];
  priority: LabPriorityLevel;
  clinical_notes?: string;
  requested_date: string;
  expected_completion?: string;
}

export interface LabOrderConfirmation {
  order_id: string;
  confirmation_number: string;
  estimated_completion: string;
  total_cost: number;
  instructions?: string;
}
