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
  // Rutas de clínica
  CLINIC: {
    DASHBOARD: '/clinic/dashboard',
    DOCTORS: '/clinic/doctors',
    APPOINTMENTS: '/clinic/appointments',
  },
  // Rutas de laboratorio
  LABORATORY: {
    DASHBOARD: '/laboratory/dashboard',
    RESULTS: '/laboratory/results',
    TESTS: '/laboratory/tests',
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

// Función para verificar si una ruta es protegida
export const isProtectedRoute = (pathname: string): boolean => {
  // Verificar si la ruta comienza con alguno de los prefijos protegidos
  const protectedPrefixes = ['/admin', '/doctor', '/patient', '/clinic', '/laboratory', '/profile', '/settings'];
  
  return protectedPrefixes.some(prefix => 
    pathname.startsWith(prefix) && pathname !== '/patient/dashboard/preview'
  );
};

// Función para obtener el rol requerido para una ruta
export const getRequiredRole = (pathname: string): string | null => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/doctor')) return 'doctor';
  if (pathname.startsWith('/patient')) return 'patient';
  if (pathname.startsWith('/clinic')) return 'clinic';
  if (pathname.startsWith('/laboratory')) return 'laboratory';
  return null;
};