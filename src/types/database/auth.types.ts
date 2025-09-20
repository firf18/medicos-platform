/**
 * Authentication Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para autenticación y perfiles de usuarios médicos.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

export type AuthTables = {
  profiles: {
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
  specialties: {
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
}

// Tipos específicos para el dominio de auth
export type ProfileRow = AuthTables['profiles']['Row'];
export type ProfileInsert = AuthTables['profiles']['Insert'];
export type ProfileUpdate = AuthTables['profiles']['Update'];

export type SpecialtyRow = AuthTables['specialties']['Row'];
export type SpecialtyInsert = AuthTables['specialties']['Insert'];
export type SpecialtyUpdate = AuthTables['specialties']['Update'];

// Roles válidos en la plataforma médica
export type UserRole = 
  | 'patient'
  | 'doctor'
  | 'clinic'
  | 'laboratory'
  | 'admin';

// Estados de verificación para usuarios médicos
export type VerificationStatus = 
  | 'pending'
  | 'in_progress'
  | 'verified'
  | 'rejected'
  | 'expired';

// Perfil extendido con información de rol específico
export interface ExtendedProfile extends ProfileRow {
  roleSpecificData?: {
    doctor?: {
      licenseNumber: string;
      specialtyId: number;
      specialty?: SpecialtyRow;
      yearsOfExperience: number;
      bio?: string;
    };
    patient?: {
      dateOfBirth?: string;
      bloodType?: string;
      allergies?: string[];
    };
    clinic?: {
      clinicName: string;
      address: string;
      city: string;
    };
    laboratory?: {
      labName: string;
      certifications: string[];
    };
  };
}

// Configuración de sesión médica
export interface MedicalSession {
  userId: string;
  role: UserRole;
  permissions: string[];
  verificationStatus: VerificationStatus;
  lastActivity: string;
  sessionDuration: number;
  medicalContext?: {
    currentPatient?: string;
    activeEmergency?: boolean;
    complianceLevel: 'basic' | 'enhanced' | 'critical';
  };
}
