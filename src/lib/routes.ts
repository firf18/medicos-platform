// Rutas de autenticación
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const;

// Rutas protegidas
export const PROTECTED_ROUTES = {
  // Rutas de administrador
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
  },
  // Rutas de doctor
  DOCTOR: {
    DASHBOARD: '/doctor/dashboard',
    APPOINTMENTS: '/doctor/appointments',
    PATIENTS: '/doctor/patients',
    RECORDS: '/doctor/records',
  },
  // Rutas de paciente
  PATIENT: {
    DASHBOARD: '/patient/dashboard',
    APPOINTMENTS: '/patient/appointments',
    DOCTORS: '/patient/doctors',
    RECORDS: '/patient/records',
  },
  // Rutas generales
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Rutas públicas
export const PUBLIC_ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  PRICING: '/pricing',
  SUPPORT: '/support',
} as const;
