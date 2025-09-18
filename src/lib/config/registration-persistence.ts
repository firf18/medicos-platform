/**
 * Configuración de Persistencia de Registro - Red-Salud
 * 
 * Este archivo contiene la configuración para el comportamiento
 * de persistencia de datos en el registro de médicos.
 */

export const REGISTRATION_PERSISTENCE_CONFIG = {
  // Configuración de limpieza automática
  cleanup: {
    // Borrar datos al recargar la página (F5, Ctrl+R)
    onPageReload: true,
    
    // Borrar datos al navegar fuera del proceso de registro
    onNavigationAway: true,
    
    // Borrar datos al cambiar de pestaña
    onTabChange: true,
    
    // Borrar datos al cerrar la página
    onPageUnload: true,
    
    // Tiempo de expiración en horas (después de este tiempo se borran automáticamente)
    expirationHours: 24,
    
    // Borrar datos al reiniciar el servidor (requiere implementación adicional)
    onServerRestart: false, // No se puede detectar desde el cliente
  },
  
  // Configuración de almacenamiento
  storage: {
    // Claves para localStorage
    keys: {
      registrationData: 'doctor_registration_progress',
      progressData: 'doctor_registration_step_progress',
      sessionTimestamp: 'doctor_registration_session_timestamp',
    },
    
    // Campos que se cifran antes de guardar
    encryptedFields: [
      'password',
      'confirmPassword',
      'phone',
      'email',
      'licenseNumber'
    ],
  },
  
  // Configuración de desarrollo vs producción
  environment: {
    // En desarrollo, mostrar más logs
    verboseLogging: process.env.NODE_ENV === 'development',
    
    // En producción, ser más estricto con la limpieza
    strictCleanup: process.env.NODE_ENV === 'production',
  }
} as const;

// Función helper para verificar si la limpieza automática está habilitada
export function isAutoCleanupEnabled(): boolean {
  return REGISTRATION_PERSISTENCE_CONFIG.cleanup.onPageReload ||
         REGISTRATION_PERSISTENCE_CONFIG.cleanup.onNavigationAway ||
         REGISTRATION_PERSISTENCE_CONFIG.cleanup.onTabChange ||
         REGISTRATION_PERSISTENCE_CONFIG.cleanup.onPageUnload;
}

// Función helper para obtener el tiempo de expiración en milisegundos
export function getExpirationTimeMs(): number {
  return REGISTRATION_PERSISTENCE_CONFIG.cleanup.expirationHours * 60 * 60 * 1000;
}
