/**
 * Tipos para el registro de clínicas en Venezuela
 */

import { z } from 'zod';

export interface ClinicRegistrationData {
  // Información básica de la clínica
  clinicName: string;
  legalName: string;
  description?: string;
  
  // Información de contacto
  email: string;
  phone: string;
  website?: string;
  
  // Dirección física
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  
  // Información legal venezolana
  rif: string; // Registro de Información Fiscal
  registrationNumber?: string; // Número de registro sanitario
  sanitaryLicense?: string; // Licencia sanitaria
  municipality: string;
  
  // Información operacional
  clinicType: 'general' | 'specialized' | 'hospital';
  specialties: string[];
  services: string[];
  
  // Horarios de atención
  workingHours: ClinicWorkingHours;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Configuración del sistema
  selectedFeatures: string[];
  
  // Verificación
  verificationStatus?: 'pending' | 'verified' | 'failed';
  documents?: ClinicDocument[];
}

export interface ClinicWorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

export interface WorkingDay {
  isOpen: boolean;
  openTime?: string; // Formato HH:MM
  closeTime?: string; // Formato HH:MM
  isEmergency?: boolean;
}

export interface ClinicDocument {
  id?: string;
  documentType: 'rif_document' | 'sanitary_license' | 'municipal_license' | 'insurance_certificate' | 'fire_safety' | 'other';
  documentName: string;
  fileUrl?: string;
  file?: File;
  verified?: boolean;
  notes?: string;
}

export interface ClinicService {
  id?: string;
  serviceName: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface ClinicStaff {
  id?: string;
  userId?: string;
  role: 'admin' | 'manager' | 'receptionist' | 'nurse' | 'doctor';
  permissions?: Record<string, boolean>;
  isActive?: boolean;
}

export type ClinicRegistrationStep = 
  | 'basic_info'
  | 'legal_documents'
  | 'services_config'
  | 'final_review';

export interface ClinicRegistrationResponse {
  success: boolean;
  clinicId?: string;
  error?: string;
  needsVerification?: boolean;
  nextStep?: ClinicRegistrationStep;
}

// Tipos específicos para Venezuela
export interface VenezuelanClinicRequirements {
  rif: string; // Formato: J-12345678-9
  sanitaryLicense: string;
  municipalLicense: string;
  fireSafetyCertificate: string;
  insuranceCertificate: string;
}

export interface VenezuelanState {
  id: string;
  name: string;
  municipalities: VenezuelanMunicipality[];
}

export interface VenezuelanMunicipality {
  id: string;
  name: string;
  stateId: string;
}

// Estados y municipios de Venezuela
export const VENEZUELAN_STATES: VenezuelanState[] = [
  {
    id: 'distrito_capital',
    name: 'Distrito Capital',
    municipalities: [
      { id: 'libertador', name: 'Libertador', stateId: 'distrito_capital' }
    ]
  },
  {
    id: 'miranda',
    name: 'Miranda',
    municipalities: [
      { id: 'baruta', name: 'Baruta', stateId: 'miranda' },
      { id: 'chacao', name: 'Chacao', stateId: 'miranda' },
      { id: 'el_hatillo', name: 'El Hatillo', stateId: 'miranda' },
      { id: 'sucre', name: 'Sucre', stateId: 'miranda' },
      { id: 'plaza', name: 'Plaza', stateId: 'miranda' },
      { id: 'zamora', name: 'Zamora', stateId: 'miranda' },
      { id: 'guaicaipuro', name: 'Guaicaipuro', stateId: 'miranda' },
      { id: 'los_salias', name: 'Los Salias', stateId: 'miranda' }
    ]
  },
  {
    id: 'carabobo',
    name: 'Carabobo',
    municipalities: [
      { id: 'valencia', name: 'Valencia', stateId: 'carabobo' },
      { id: 'naguanagua', name: 'Naguanagua', stateId: 'carabobo' },
      { id: 'san_diego', name: 'San Diego', stateId: 'carabobo' },
      { id: 'los_guayos', name: 'Los Guayos', stateId: 'carabobo' }
    ]
  },
  {
    id: 'zulia',
    name: 'Zulia',
    municipalities: [
      { id: 'maracaibo', name: 'Maracaibo', stateId: 'zulia' },
      { id: 'san_francisco', name: 'San Francisco', stateId: 'zulia' },
      { id: 'cabimas', name: 'Cabimas', stateId: 'zulia' }
    ]
  },
  {
    id: 'aragua',
    name: 'Aragua',
    municipalities: [
      { id: 'girardot', name: 'Girardot', stateId: 'aragua' },
      { id: 'mario_briceño', name: 'Mario Briceño Iragorry', stateId: 'aragua' },
      { id: 'santos_michelena', name: 'Santos Michelena', stateId: 'aragua' }
    ]
  },
  {
    id: 'lara',
    name: 'Lara',
    municipalities: [
      { id: 'iribarren', name: 'Iribarren', stateId: 'lara' },
      { id: 'palavecino', name: 'Palavecino', stateId: 'lara' },
      { id: 'torres', name: 'Torres', stateId: 'lara' }
    ]
  },
  {
    id: 'anzoategui',
    name: 'Anzoátegui',
    municipalities: [
      { id: 'simon_bolivar', name: 'Simón Bolívar', stateId: 'anzoategui' },
      { id: 'sotillo', name: 'Sotillo', stateId: 'anzoategui' },
      { id: 'guanta', name: 'Guanta', stateId: 'anzoategui' }
    ]
  },
  {
    id: 'bolivar',
    name: 'Bolívar',
    municipalities: [
      { id: 'caroni', name: 'Caroní', stateId: 'bolivar' },
      { id: 'hercules', name: 'Heres', stateId: 'bolivar' },
      { id: 'piar', name: 'Piar', stateId: 'bolivar' }
    ]
  },
  {
    id: 'tachira',
    name: 'Táchira',
    municipalities: [
      { id: 'san_cristobal', name: 'San Cristóbal', stateId: 'tachira' },
      { id: 'libertad', name: 'Libertad', stateId: 'tachira' },
      { id: 'fernandez_feo', name: 'Fernández Feo', stateId: 'tachira' }
    ]
  },
  {
    id: 'merida',
    name: 'Mérida',
    municipalities: [
      { id: 'libertador_merida', name: 'Libertador', stateId: 'merida' },
      { id: 'campo_elias', name: 'Campo Elías', stateId: 'merida' },
      { id: 'santos_marquina', name: 'Santos Marquina', stateId: 'merida' }
    ]
  }
];

// Tipos de clínicas disponibles
export const CLINIC_TYPES = [
  { id: 'general', name: 'Clínica General', description: 'Atención médica general' },
  { id: 'specialized', name: 'Clínica Especializada', description: 'Especializada en áreas específicas' },
  { id: 'hospital', name: 'Hospital', description: 'Centro médico de alta complejidad' }
] as const;

// Servicios comunes de clínicas
export const COMMON_CLINIC_SERVICES = [
  'Consulta General',
  'Consulta Especializada',
  'Emergencias 24/7',
  'Laboratorio Clínico',
  'Rayos X',
  'Ecografía',
  'Electrocardiograma',
  'Fisioterapia',
  'Cirugía Ambulatoria',
  'Hospitalización',
  'Farmacia',
  'Ambulancia',
  'Cuidados Intensivos',
  'Maternidad',
  'Pediatría',
  'Cardiología',
  'Neurología',
  'Ortopedia',
  'Ginecología',
  'Urología'
] as const;

// Características del sistema disponibles
export const CLINIC_FEATURES = [
  'appointment_scheduling',
  'patient_management',
  'medical_records',
  'billing_system',
  'inventory_management',
  'staff_management',
  'reporting_analytics',
  'telemedicine',
  'mobile_app',
  'integration_lab',
  'integration_pharmacy',
  'emergency_alerts'
] as const;

// Esquema de validación Zod para el registro de clínicas
export const clinicRegistrationSchema = z.object({
  // Información básica de la clínica
  clinicName: z.string().min(2, 'El nombre de la clínica debe tener al menos 2 caracteres').max(100, 'El nombre de la clínica no puede tener más de 100 caracteres'),
  legalName: z.string().min(2, 'El nombre legal debe tener al menos 2 caracteres').max(100, 'El nombre legal no puede tener más de 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede tener más de 500 caracteres').optional(),
  
  // Información de contacto
  email: z.string().email('Email válido requerido'),
  phone: z.string().min(10, 'Teléfono válido requerido (mínimo 10 caracteres)'),
  website: z.string().url('Formato de sitio web inválido').optional().or(z.literal('')),
  
  // Dirección física
  address: z.string().min(10, 'Dirección completa requerida (mínimo 10 caracteres)'),
  city: z.string().min(2, 'Ciudad requerida (mínimo 2 caracteres)'),
  state: z.string().min(2, 'Estado requerido (mínimo 2 caracteres)'),
  postalCode: z.string().max(10, 'El código postal no puede tener más de 10 caracteres').optional(),
  
  // Información legal venezolana
  rif: z.string().regex(/^[JGVEP]-?\d{8}-?\d$/, 'RIF válido requerido (formato: J-12345678-9)'),
  registrationNumber: z.string().max(50, 'El número de registro no puede tener más de 50 caracteres').optional(),
  sanitaryLicense: z.string().max(50, 'La licencia sanitaria no puede tener más de 50 caracteres').optional(),
  municipality: z.string().min(2, 'Municipio requerido (mínimo 2 caracteres)'),
  
  // Información operacional
  clinicType: z.enum(['general', 'specialized', 'hospital'], {
    message: 'Selecciona el tipo de clínica',
  }),
  specialties: z.array(z.string()).min(1, 'Selecciona al menos una especialidad'),
  services: z.array(z.string()).min(1, 'Selecciona al menos un servicio'),
  
  // Horarios de atención
  workingHours: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      isEmergency: z.boolean().optional()
    })
  }),
  emergencyContactName: z.string().min(2, 'Nombre del contacto de emergencia requerido'),
  emergencyContactPhone: z.string().min(10, 'Teléfono del contacto de emergencia requerido'),
  
  // Configuración del sistema
  selectedFeatures: z.array(z.string()).min(1, 'Selecciona al menos una característica del sistema'),
  
  // Verificación
  verificationStatus: z.enum(['pending', 'verified', 'failed']).optional(),
  documents: z.array(z.object({
    id: z.string().optional(),
    documentType: z.enum(['rif_document', 'sanitary_license', 'municipal_license', 'insurance_certificate', 'fire_safety', 'other']),
    documentName: z.string(),
    fileUrl: z.string().optional(),
    file: z.any().optional(),
    verified: z.boolean().optional(),
    notes: z.string().optional()
  })).optional()
});
