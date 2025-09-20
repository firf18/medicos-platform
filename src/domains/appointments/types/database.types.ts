/**
 * Appointments domain database types
 * @fileoverview Database types specific to medical appointments and scheduling
 * @compliance HIPAA-compliant appointment data structures
 */

import { Json } from '@/shared/types/base-database.types';

export interface AppointmentTables {
  appointments: {
    Row: {
      appointment_date: string
      clinic_id: number | null
      created_at: string
      diagnosis: string | null
      doctor_id: string
      id: number
      notes: string | null
      patient_id: string
      prescription: string | null
      status: string
      updated_at: string
    }
    Insert: {
      appointment_date: string
      clinic_id?: number | null
      created_at?: string
      diagnosis?: string | null
      doctor_id: string
      id?: number
      notes?: string | null
      patient_id: string
      prescription?: string | null
      status: string
      updated_at?: string
    }
    Update: {
      appointment_date?: string
      clinic_id?: number | null
      created_at?: string
      diagnosis?: string | null
      doctor_id?: string
      id?: number
      notes?: string | null
      patient_id?: string
      prescription?: string | null
      status?: string
      updated_at?: string
    }
  }
}

// Specialized types for appointments domain
export type Appointment = AppointmentTables['appointments']['Row'];
export type AppointmentInsert = AppointmentTables['appointments']['Insert'];
export type AppointmentUpdate = AppointmentTables['appointments']['Update'];

// Appointment-specific enums and constants
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled'
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_PRIORITY = {
  ROUTINE: 'routine',
  URGENT: 'urgent',
  EMERGENCY: 'emergency',
  FOLLOW_UP: 'follow_up'
} as const;

export type AppointmentPriority = typeof APPOINTMENT_PRIORITY[keyof typeof APPOINTMENT_PRIORITY];

// Extended appointment types with relationships
export interface AppointmentWithDetails extends Appointment {
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string;
  };
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
  clinic?: {
    id: number;
    name: string;
    address: string;
  };
}

// Appointment scheduling types
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  doctor_id: string;
  date: string;
}

export interface AppointmentRequest {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  preferred_time?: string;
  reason?: string;
  priority: AppointmentPriority;
  notes?: string;
}

export interface AppointmentConfirmation {
  appointment_id: number;
  confirmed_at: string;
  confirmation_method: 'email' | 'sms' | 'phone' | 'app';
  reminder_sent: boolean;
}
