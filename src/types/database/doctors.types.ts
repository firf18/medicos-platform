/**
 * Doctors Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de médicos profesionales.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

export type DoctorsTables = {
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
}

// Tipos específicos para el dominio de doctors
export type DoctorRow = DoctorsTables['doctors']['Row'];
export type DoctorInsert = DoctorsTables['doctors']['Insert'];
export type DoctorUpdate = DoctorsTables['doctors']['Update'];

// Estados de disponibilidad del médico
export type DoctorAvailabilityStatus = 
  | 'available'
  | 'busy'
  | 'in_consultation'
  | 'emergency'
  | 'offline'
  | 'on_vacation'
  | 'suspended';

// Niveles de experiencia médica
export type ExperienceLevel = 
  | 'junior' // 0-5 años
  | 'senior' // 5-15 años
  | 'expert' // 15+ años
  | 'specialist'; // Especialista certificado

// Tipos de licencias médicas venezolanas
export type VenezuelanMedicalLicense = 
  | 'MPPS' // Ministerio del Poder Popular para la Salud
  | 'CMC' // Colegio de Médicos de Caracas
  | 'CMDM' // Colegio de Médicos del Estado Miranda
  | 'CMDC' // Colegio de Médicos de Carabobo
  | 'CMDT' // Colegio de Médicos del Estado Táchira
  | 'CMDZ' // Colegio de Médicos del Zulia
  | 'OTHER'; // Otros colegios médicos

// Médico extendido con información relacionada
export interface DoctorWithProfile extends DoctorRow {
  profile?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
  specialty?: {
    id: number;
    name: string;
    description: string;
  };
  clinics?: Array<{
    clinic_id: string;
    clinic_name: string;
    role: string;
    is_active: boolean;
  }>;
}

// Información profesional completa del médico
export interface DoctorProfessionalInfo {
  licenseDetails: {
    number: string;
    issuingBody: VenezuelanMedicalLicense;
    issueDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'suspended' | 'revoked';
  };
  education: {
    medicalSchool: string;
    graduationYear: number;
    additionalCertifications: string[];
    boardCertifications: string[];
  };
  experience: {
    years: number;
    level: ExperienceLevel;
    specializations: string[];
    previousHospitals: string[];
  };
  verification: {
    identityVerified: boolean;
    licenseVerified: boolean;
    educationVerified: boolean;
    verificationDate?: string;
    verificationProvider?: string;
  };
}

// Estadísticas del médico para dashboard
export interface DoctorStats {
  totalPatients: number;
  appointmentsThisMonth: number;
  appointmentsCompleted: number;
  averageRating: number;
  totalReviews: number;
  consultationRevenue: number;
  availabilityHours: number;
  cancellationRate: number;
}

// Configuración del horario del médico
export interface DoctorSchedule {
  workingDays: {
    monday: { isWorking: boolean; startTime?: string; endTime?: string };
    tuesday: { isWorking: boolean; startTime?: string; endTime?: string };
    wednesday: { isWorking: boolean; startTime?: string; endTime?: string };
    thursday: { isWorking: boolean; startTime?: string; endTime?: string };
    friday: { isWorking: boolean; startTime?: string; endTime?: string };
    saturday: { isWorking: boolean; startTime?: string; endTime?: string };
    sunday: { isWorking: boolean; startTime?: string; endTime?: string };
  };
  timeSlotDuration: number; // en minutos
  breakTime: {
    startTime: string;
    endTime: string;
  };
  vacationDays: string[];
  publicHolidays: boolean;
}

// Preferencias del médico para la plataforma
export interface DoctorPreferences {
  notifications: {
    newAppointments: boolean;
    cancellations: boolean;
    emergencies: boolean;
    patientMessages: boolean;
    systemUpdates: boolean;
  };
  dashboard: {
    defaultView: 'calendar' | 'patients' | 'analytics';
    widgetsEnabled: string[];
    refreshInterval: number;
  };
  consultation: {
    allowOnlineConsultations: boolean;
    consultationTypes: string[];
    maxPatientsPerDay: number;
    emergencyAvailability: boolean;
  };
}
