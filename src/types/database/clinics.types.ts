/**
 * Clinics Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de clínicas médicas.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

export type ClinicsTables = {
  clinics: {
    Row: {
      address: string
      city: string
      country: string | null
      created_at: string
      email: string | null
      id: number
      name: string
      phone: string | null
      state: string
      updated_at: string
    }
    Insert: {
      address: string
      city: string
      country?: string | null
      created_at?: string
      email?: string | null
      id?: number
      name: string
      phone?: string | null
      state: string
      updated_at?: string
    }
    Update: {
      address?: string
      city?: string
      country?: string | null
      created_at?: string
      email?: string | null
      id?: number
      name?: string
      phone?: string | null
      state?: string
      updated_at?: string
    }
  }
  clinic_doctors: {
    Row: {
      clinic_id: string | null
      created_at: string
      doctor_id: string | null
      id: string
      is_active: boolean | null
      role: string | null
      updated_at: string
    }
    Insert: {
      clinic_id?: string | null
      created_at?: string
      doctor_id?: string | null
      id?: string
      is_active?: boolean | null
      role?: string | null
      updated_at?: string
    }
    Update: {
      clinic_id?: string | null
      created_at?: string
      doctor_id?: string | null
      id?: string
      is_active?: boolean | null
      role?: string | null
      updated_at?: string
    }
  }
}

// Tipos específicos para el dominio de clinics
export type ClinicRow = ClinicsTables['clinics']['Row'];
export type ClinicInsert = ClinicsTables['clinics']['Insert'];
export type ClinicUpdate = ClinicsTables['clinics']['Update'];

export type ClinicDoctorRow = ClinicsTables['clinic_doctors']['Row'];
export type ClinicDoctorInsert = ClinicsTables['clinic_doctors']['Insert'];
export type ClinicDoctorUpdate = ClinicsTables['clinic_doctors']['Update'];

// Roles de médicos en clínicas
export type ClinicDoctorRole = 
  | 'attending'
  | 'chief'
  | 'resident'
  | 'consultant'
  | 'visiting'
  | 'emergency';

// Tipos de clínicas médicas
export type ClinicType = 
  | 'hospital'
  | 'outpatient'
  | 'specialty'
  | 'urgent_care'
  | 'diagnostic'
  | 'rehabilitation';

// Estados venezolanos válidos para clínicas
export type VenezuelanState = 
  | 'Distrito Capital'
  | 'Amazonas'
  | 'Anzoátegui'
  | 'Apure'
  | 'Aragua'
  | 'Barinas'
  | 'Bolívar'
  | 'Carabobo'
  | 'Cojedes'
  | 'Delta Amacuro'
  | 'Falcón'
  | 'Guárico'
  | 'Lara'
  | 'Mérida'
  | 'Miranda'
  | 'Monagas'
  | 'Nueva Esparta'
  | 'Portuguesa'
  | 'Sucre'
  | 'Táchira'
  | 'Trujillo'
  | 'Vargas'
  | 'Yaracuy'
  | 'Zulia';

// Clínica extendida con información de relaciones
export interface ClinicWithDoctors extends ClinicRow {
  doctors?: Array<{
    doctor_id: string;
    doctor_name: string;
    specialty: string;
    role: ClinicDoctorRole;
    is_active: boolean;
  }>;
  totalDoctors: number;
  activeDoctors: number;
}

// Información completa de la relación clínica-médico
export interface ClinicDoctorRelation extends ClinicDoctorRow {
  clinic?: ClinicRow;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialty: string;
  };
}

// Estadísticas de clínica para dashboards
export interface ClinicStats {
  totalDoctors: number;
  activeDoctors: number;
  monthlyAppointments: number;
  patientsServed: number;
  averageRating: number;
  servicesOffered: string[];
}

// Configuración de la clínica
export interface ClinicConfiguration {
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  emergencyServices: boolean;
  insurance: string[];
  amenities: string[];
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
}
