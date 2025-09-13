// Constantes de la aplicación

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'Platform Médicos',
  DESCRIPTION: 'Plataforma integral para la gestión médica',
  VERSION: '1.0.0',
} as const;

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  CLINIC: 'clinic',
  LABORATORY: 'laboratory',
} as const;

// Estados de autenticación
export const AUTH_STATUS = {
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED: 'authenticated',
  LOADING: 'loading',
} as const;

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Estados de citas
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Especialidades médicas
export const MEDICAL_SPECIALTIES = [
  { id: 1, name: 'Cardiología', description: 'Especialidad médica que se enfoca en el corazón y el sistema cardiovascular' },
  { id: 2, name: 'Dermatología', description: 'Especialidad médica que se enfoca en la piel, cabello y uñas' },
  { id: 3, name: 'Neurología', description: 'Especialidad médica que se enfoca en el sistema nervioso' },
  { id: 4, name: 'Pediatría', description: 'Especialidad médica que se enfoca en la salud de los niños' },
  { id: 5, name: 'Ginecología', description: 'Especialidad médica que se enfoca en la salud reproductiva femenina' },
  { id: 6, name: 'Oftalmología', description: 'Especialidad médica que se enfoca en los ojos y la visión' },
  { id: 7, name: 'Ortopedia', description: 'Especialidad médica que se enfoca en el sistema musculoesquelético' },
  { id: 8, name: 'Psiquiatría', description: 'Especialidad médica que se enfoca en la salud mental' },
] as const;