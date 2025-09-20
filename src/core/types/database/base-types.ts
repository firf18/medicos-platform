/**
 * Tipos Base de la Base de Datos
 * 
 * Contiene los tipos fundamentales y la estructura principal
 * de la base de datos generada por Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: AppointmentsTable
      clinics: ClinicsTable
      clinic_doctors: ClinicDoctorsTable
      doctors: DoctorsTable
      lab_results: LabResultsTable
      laboratory_services: LaboratoryServicesTable
      laboratories: LaboratoriesTable
      medical_records: MedicalRecordsTable
      medical_documents: MedicalDocumentsTable
      notifications: NotificationsTable
      patient_caregivers: PatientCaregiversTable
      patient_medications: PatientMedicationsTable
      second_opinion_requests: SecondOpinionRequestsTable
      patients: PatientsTable
      profiles: ProfilesTable
      specialties: SpecialtiesTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: DatabaseFunctions
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de funciones de la base de datos
export interface DatabaseFunctions {
  is_admin: {
    Args: Record<PropertyKey, never>
    Returns: boolean
  }
  is_clinic: {
    Args: Record<PropertyKey, never>
    Returns: boolean
  }
  is_doctor: {
    Args: Record<PropertyKey, never>
    Returns: boolean
  }
  is_laboratory: {
    Args: Record<PropertyKey, never>
    Returns: boolean
  }
  is_patient: {
    Args: Record<PropertyKey, never>
    Returns: boolean
  }
}

// Tipos auxiliares para las tablas
export interface AppointmentsTable {
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

export interface ClinicsTable {
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

export interface ClinicDoctorsTable {
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

export interface DoctorsTable {
  Row: {
    bio: string | null
    consultation_fee: number | null
    created_at: string
    experience_years: number | null
    id: string
    is_available: boolean | null
    license_number: string
    rating: number | null
    specialty_id: number
    updated_at: string
  }
  Insert: {
    bio?: string | null
    consultation_fee?: number | null
    created_at?: string
    experience_years?: number | null
    id: string
    is_available?: boolean | null
    license_number: string
    rating?: number | null
    specialty_id: number
    updated_at?: string
  }
  Update: {
    bio?: string | null
    consultation_fee?: number | null
    created_at?: string
    experience_years?: number | null
    id?: string
    is_available?: boolean | null
    license_number?: string
    rating?: number | null
    specialty_id?: number
    updated_at?: string
  }
}

export interface ProfilesTable {
  Row: {
    avatar_url: string | null
    created_at: string
    email: string
    first_name: string
    id: string
    last_name: string
    phone: string | null
    role: string
    updated_at: string
  }
  Insert: {
    avatar_url?: string | null
    created_at?: string
    email: string
    first_name: string
    id: string
    last_name: string
    phone?: string | null
    role: string
    updated_at?: string
  }
  Update: {
    avatar_url?: string | null
    created_at?: string
    email?: string
    first_name?: string
    id?: string
    last_name?: string
    phone?: string | null
    role?: string
    updated_at?: string
  }
}

export interface SpecialtiesTable {
  Row: {
    created_at: string
    description: string | null
    id: number
    name: string
  }
  Insert: {
    created_at?: string
    description?: string | null
    id?: number
    name: string
  }
  Update: {
    created_at?: string
    description?: string | null
    id?: number
    name?: string
  }
}

// Tipos auxiliares para trabajar con la base de datos
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type { DatabaseWithoutInternals, DefaultSchema };