/**
 * General Registration Types
 * @fileoverview Types for the general registration form
 * @compliance Medical data types for basic registration
 */

export type UserRole = 'patient' | 'doctor';

// Basic registration form data
export interface GeneralRegistrationData {
  // Basic fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  
  // Doctor-specific fields
  specialtyId?: string;
  licenseNumber?: string;
  bio?: string;
  experienceYears?: string;
  consultationFee?: string;
  
  // Patient-specific fields
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
}

// Form validation errors
export interface GeneralRegistrationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  specialtyId?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  bloodType?: string;
  general?: string;
}

// Step configuration
export interface RegistrationStep {
  id: number;
  title: string;
  description: string;
  fields: (keyof GeneralRegistrationData)[];
}

// Form props
export interface RegistrationFormProps {
  onSuccess?: (data: GeneralRegistrationData) => void;
  onError?: (error: string) => void;
  initialData?: Partial<GeneralRegistrationData>;
}

// Step component props
export interface StepComponentProps {
  data: GeneralRegistrationData;
  errors: GeneralRegistrationErrors;
  onChange: (field: keyof GeneralRegistrationData, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

// Blood types for patients
export const BLOOD_TYPES = [
  'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

// Common allergies for patients
export const COMMON_ALLERGIES = [
  'Penicilina',
  'Sulfonamidas',
  'Aspirina',
  'Ibuprofeno',
  'Mariscos',
  'Frutos secos',
  'Látex',
  'Polen',
  'Polvo',
  'Gatos',
  'Perros'
] as const;

// Validation rules
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  },
  phone: {
    pattern: /^(\+58|0058|58)?[-.\s]?[24]\d{2}[-.\s]?\d{3}[-.\s]?\d{4}$/
  },
  licenseNumber: {
    pattern: /^\d{4,8}$/
  }
} as const;

// Registration steps configuration
export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    id: 1,
    title: 'Información Básica',
    description: 'Datos personales y de contacto',
    fields: ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']
  },
  {
    id: 2,
    title: 'Tipo de Usuario',
    description: 'Selecciona tu rol en la plataforma',
    fields: ['role']
  },
  {
    id: 3,
    title: 'Información Específica',
    description: 'Datos adicionales según tu rol',
    fields: ['specialtyId', 'licenseNumber', 'bio', 'dateOfBirth', 'bloodType', 'allergies']
  }
];

// Role configuration
export const ROLE_CONFIG = {
  patient: {
    title: 'Paciente',
    description: 'Busca y agenda citas médicas',
    icon: '🏥',
    requiredFields: ['dateOfBirth'],
    optionalFields: ['bloodType', 'allergies']
  },
  doctor: {
    title: 'Médico',
    description: 'Ofrece servicios médicos profesionales',
    icon: '👨‍⚕️',
    requiredFields: ['specialtyId', 'licenseNumber'],
    optionalFields: ['bio', 'experienceYears', 'consultationFee']
  }
} as const;



