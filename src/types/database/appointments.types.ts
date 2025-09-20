/**
 * Appointments Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de citas médicas.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

export type AppointmentsTables = {
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

// Tipos específicos para el dominio de appointments
export type AppointmentRow = AppointmentsTables['appointments']['Row'];
export type AppointmentInsert = AppointmentsTables['appointments']['Insert'];
export type AppointmentUpdate = AppointmentsTables['appointments']['Update'];

// Status válidos para citas médicas
export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

// Tipos auxiliares para el dominio de appointments
export interface AppointmentWithRelations extends AppointmentRow {
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  clinic?: {
    id: number;
    name: string;
    address: string;
  };
}

// Filtros específicos para appointments
export interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  clinicId?: number;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
}

// Estadísticas de appointments para dashboards médicos
export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  todayAppointments: number;
  upcomingAppointments: number;
}
