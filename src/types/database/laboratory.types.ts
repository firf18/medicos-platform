/**
 * Laboratory Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de laboratorios médicos.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import type { Json } from './base.types';

export type LaboratoryTables = {
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

// Tipos específicos para el dominio de laboratory
export type LaboratoryRow = LaboratoryTables['laboratories']['Row'];
export type LaboratoryInsert = LaboratoryTables['laboratories']['Insert'];
export type LaboratoryUpdate = LaboratoryTables['laboratories']['Update'];

export type LaboratoryServiceRow = LaboratoryTables['laboratory_services']['Row'];
export type LaboratoryServiceInsert = LaboratoryTables['laboratory_services']['Insert'];
export type LaboratoryServiceUpdate = LaboratoryTables['laboratory_services']['Update'];

export type LabResultRow = LaboratoryTables['lab_results']['Row'];
export type LabResultInsert = LaboratoryTables['lab_results']['Insert'];
export type LabResultUpdate = LaboratoryTables['lab_results']['Update'];

// Estados de resultados de laboratorio
export type LabResultStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'reviewed'
  | 'sent_to_doctor'
  | 'sent_to_patient'
  | 'archived';

// Prioridades de exámenes de laboratorio
export type LabTestPriority = 
  | 'routine'
  | 'urgent'
  | 'stat'
  | 'emergency'
  | 'critical';

// Categorías de servicios de laboratorio
export type LabServiceCategory = 
  | 'hematology'
  | 'biochemistry'
  | 'microbiology'
  | 'immunology'
  | 'pathology'
  | 'toxicology'
  | 'genetics'
  | 'molecular'
  | 'endocrinology'
  | 'cardiology'
  | 'oncology';

// Certificaciones de laboratorio
export type LabCertification = 
  | 'ISO_15189'
  | 'CAP'
  | 'CLIA'
  | 'AABB'
  | 'COVENIN'
  | 'ONA'
  | 'FONDONORMA';

// Laboratorio extendido con servicios
export interface LaboratoryWithServices extends LaboratoryRow {
  services?: LaboratoryServiceRow[];
  serviceCount: number;
  activeServices: number;
  certifications?: LabCertification[];
}

// Resultado de laboratorio extendido
export interface LabResultWithRelations extends LabResultRow {
  laboratory?: LaboratoryRow;
  service?: LaboratoryServiceRow;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

// Estructura de resultados de laboratorio
export interface LabResultData {
  testName: string;
  category: LabServiceCategory;
  priority: LabTestPriority;
  status: LabResultStatus;
  values: Array<{
    parameter: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    isCritical: boolean;
  }>;
  interpretation?: string;
  technician?: string;
  reviewedBy?: string;
  qualityControl: {
    controlsRun: boolean;
    calibrationDate: string;
    instrumentId: string;
  };
}

// Estadísticas de laboratorio
export interface LaboratoryStats {
  totalTests: number;
  testsThisMonth: number;
  pendingResults: number;
  criticalResults: number;
  averageProcessingTime: number; // en horas
  revenue: number;
  patientsSeen: number;
  mostRequestedTests: Array<{
    testName: string;
    count: number;
  }>;
}

// Configuración del laboratorio
export interface LaboratoryConfiguration {
  operatingHours: {
    weekdays: { open: string; close: string };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  samplingSchedule: {
    homeCollection: boolean;
    emergencyService: boolean;
    fastingTests: string[];
  };
  equipment: Array<{
    name: string;
    model: string;
    calibrationDate: string;
    maintenanceSchedule: string;
    status: 'operational' | 'maintenance' | 'out_of_service';
  }>;
  qualityAssurance: {
    internalQC: boolean;
    externalQC: boolean;
    accreditation: LabCertification[];
    lastInspection: string;
  };
}

// Orden de laboratorio (para integración con médicos)
export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  laboratoryId: string;
  requestedTests: string[];
  priority: LabTestPriority;
  clinicalInfo: string;
  fastingRequired: boolean;
  specialInstructions?: string;
  sampleCollection: {
    date: string;
    collectedBy: string;
    sampleType: string[];
    conditions: Json;
  };
  orderDate: string;
  expectedResultDate: string;
  status: 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
}
