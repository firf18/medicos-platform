// Rutas de autenticación
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  UNAUTHORIZED: '/auth/unauthorized',
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
  // Rutas de paciente - RUTA PRINCIPAL CONSOLIDADA
  PATIENT: {
    DASHBOARD: '/patient/dashboard', // Ruta principal única
    APPOINTMENTS: '/patient/appointments',
    DOCTORS: '/patient/doctors',
    RECORDS: '/patient/records',
    MEDICAL_HISTORY: '/patient/medical-history',
    MEDICATIONS: '/patient/medications',
    PROFILE: '/patient/profile',
  },
  // Rutas generales
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Rutas públicas
export const PUBLIC_ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  PRICING: '/precios',
  SUPPORT: '/support',
  NOSOTROS: '/nosotros',
  SERVICIOS: '/servicios',
  MEDICOS: '/medicos',
  CONTACTO: '/contacto',
  DEMO: '/demo',
  FAQ: '/faq',
  TERMINOS: '/terminos',
  PRIVACIDAD: '/privacidad',
  AVISO_LEGAL: '/aviso-legal',
} as const;

// Rutas obsoletas que redirigen a la principal
export const LEGACY_ROUTES = {
  PATIENT_PORTAL: '/patient-portal', // → /patient/dashboard
  PATIENT_DASHBOARD: '/patient-dashboard', // → /patient/dashboard
} as const;
