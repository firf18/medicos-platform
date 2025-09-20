/**
 * Specialized Registration Types
 * @fileoverview Types for specialized user registration (doctors, clinics, labs, patients)
 * @compliance HIPAA-compliant registration data structures
 */

export type UserType = 'patient' | 'doctor' | 'clinic' | 'laboratory';

// Base registration data
export interface BaseRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

// Patient-specific registration data
export interface PatientRegistrationData extends BaseRegistrationData {
  dateOfBirth: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
}

// Doctor-specific registration data
export interface DoctorRegistrationData extends BaseRegistrationData {
  licenseNumber: string;
  specialtyId: string;
  yearsOfExperience?: number;
  bio?: string;
}

// Clinic-specific registration data
export interface ClinicRegistrationData extends BaseRegistrationData {
  clinicName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website?: string;
  description?: string;
}

// Laboratory-specific registration data
export interface LaboratoryRegistrationData extends BaseRegistrationData {
  labName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website?: string;
  certifications?: string;
  services?: string;
}

// Union type for all registration data
export type SpecializedRegistrationData = 
  | PatientRegistrationData
  | DoctorRegistrationData
  | ClinicRegistrationData
  | LaboratoryRegistrationData;

// Form validation errors
export interface RegistrationFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  
  // Patient-specific errors
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Doctor-specific errors
  licenseNumber?: string;
  specialtyId?: string;
  yearsOfExperience?: string;
  
  // Clinic-specific errors
  clinicName?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  
  // Laboratory-specific errors
  labName?: string;
  certifications?: string;
  services?: string;
}

// Registration form props
export interface RegistrationFormProps {
  userType: UserType;
  onSubmit: (data: SpecializedRegistrationData) => Promise<void>;
  isLoading: boolean;
  errors: RegistrationFormErrors;
  onErrorsChange: (errors: RegistrationFormErrors) => void;
}

// Medical specialties for doctor registration
export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

// Venezuelan states for location selection
export const VENEZUELAN_STATES = [
  'Amazonas',
  'Anzoátegui', 
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Vargas',
  'Yaracuy',
  'Zulia'
] as const;

export type VenezuelanState = typeof VENEZUELAN_STATES[number];

// Registration validation rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    MESSAGE: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula y número'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Ingresa un correo electrónico válido'
  },
  PHONE: {
    PATTERN: /^(\+58|0058|58)?[-.\s]?[24]\d{2}[-.\s]?\d{3}[-.\s]?\d{4}$/,
    MESSAGE: 'Ingresa un número de teléfono venezolano válido'
  },
  LICENSE: {
    PATTERN: /^\d{4,8}$/,
    MESSAGE: 'El número de matrícula debe ser numérico de 4-8 dígitos'
  }
} as const;

// User type configurations
export const USER_TYPE_CONFIG = {
  patient: {
    title: 'Registro de Paciente',
    description: 'Regístrate para acceder a servicios médicos',
    redirectPath: '/patient/dashboard'
  },
  doctor: {
    title: 'Registro de Médico',
    description: 'Únete como profesional de la salud',
    redirectPath: '/doctor/dashboard'
  },
  clinic: {
    title: 'Registro de Clínica',
    description: 'Registra tu centro médico',
    redirectPath: '/clinic/dashboard'
  },
  laboratory: {
    title: 'Registro de Laboratorio',
    description: 'Registra tu laboratorio clínico',
    redirectPath: '/laboratory/dashboard'
  }
} as const;
