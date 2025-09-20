/**
 * Authentication domain database types
 * @fileoverview Database types specific to authentication and user management
 * @compliance HIPAA-compliant authentication data structures
 */

import { Json } from '@/shared/types/base-database.types';

export interface AuthTables {
  doctors: {
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
  patients: {
    Row: {
      allergies: string[] | null
      blood_type: string | null
      created_at: string
      current_diagnosis: string | null
      current_treatment: string | null
      date_of_birth: string | null
      emergency_contact_name: string | null
      emergency_contact_phone: string | null
      id: string
      shared_with_caregivers: boolean | null
      updated_at: string
    }
    Insert: {
      allergies?: string[] | null
      blood_type?: string | null
      created_at?: string
      current_diagnosis?: string | null
      current_treatment?: string | null
      date_of_birth?: string | null
      emergency_contact_name?: string | null
      emergency_contact_phone?: string | null
      id: string
      shared_with_caregivers?: boolean | null
      updated_at?: string
    }
    Update: {
      allergies?: string[] | null
      blood_type?: string | null
      created_at?: string
      current_diagnosis?: string | null
      current_treatment?: string | null
      date_of_birth?: string | null
      emergency_contact_name?: string | null
      emergency_contact_phone?: string | null
      id?: string
      shared_with_caregivers?: boolean | null
      updated_at?: string
    }
  }
  profiles: {
    Row: {
      avatar_url: string | null
      created_at: string
      email: string
      first_name: string
      id: string
      last_name: string
      phone: string
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
      phone: string
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
      phone?: string
      role?: string
      updated_at?: string
    }
  }
  specialties: {
    Row: {
      created_at: string
      description: string | null
      id: number
      name: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      id?: number
      name: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      description?: string | null
      id?: number
      name?: string
      updated_at?: string
    }
  }
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

// Specialized types for auth domain
export type DoctorProfile = AuthTables['doctors']['Row'];
export type PatientProfile = AuthTables['patients']['Row'];
export type UserProfile = AuthTables['profiles']['Row'];
export type MedicalSpecialty = AuthTables['specialties']['Row'];
export type Clinic = AuthTables['clinics']['Row'];

export type DoctorInsert = AuthTables['doctors']['Insert'];
export type PatientInsert = AuthTables['patients']['Insert'];
export type UserProfileInsert = AuthTables['profiles']['Insert'];

export type DoctorUpdate = AuthTables['doctors']['Update'];
export type PatientUpdate = AuthTables['patients']['Update'];
export type UserProfileUpdate = AuthTables['profiles']['Update'];

// Auth-specific enums and constants
export const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  CLINIC_ADMIN: 'clinic_admin',
  LABORATORY: 'laboratory',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const BLOOD_TYPES = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
} as const;

export type BloodType = typeof BLOOD_TYPES[keyof typeof BLOOD_TYPES];
