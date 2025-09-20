/**
 * Configuración centralizada de logging para la aplicación
 */

export const LOGGING_CONFIG = {
  // Nivel general de logging
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  
  // Configuración específica por módulo
  modules: {
    supabase: {
      enabled: process.env.NODE_ENV === 'development',
      level: 'info', // Reducido de debug a info
      debug: false
    },
    registration: {
      enabled: true,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      // Reducir frecuencia de logs de actualización de datos
      dataUpdateLogFrequency: 0.1 // Solo 10% de las actualizaciones
    },
    validation: {
      enabled: process.env.NODE_ENV === 'development',
      level: 'debug'
    },
    persistence: {
      enabled: process.env.NODE_ENV === 'development',
      level: 'info'
    }
  },
  
  // Configuración de performance
  performance: {
    // Reducir logs de violaciones de performance en desarrollo
    violationThreshold: 1000, // ms
    logViolations: process.env.NODE_ENV === 'development'
  }
};

/**
 * Función helper para verificar si un log debe ser mostrado
 */
export const shouldLog = (module: keyof typeof LOGGING_CONFIG.modules, level: string = 'debug'): boolean => {
  const moduleConfig = LOGGING_CONFIG.modules[module];
  if (!moduleConfig?.enabled) return false;
  
  // Lógica simple de niveles: error > warn > info > debug
  const levels = ['debug', 'info', 'warn', 'error'];
  const moduleLevel = levels.indexOf(moduleConfig.level);
  const requestedLevel = levels.indexOf(level);
  
  return requestedLevel >= moduleLevel;
};

/**
 * Función helper para logs de actualización de datos con frecuencia reducida
 */
export const shouldLogDataUpdate = (): boolean => {
  return shouldLog('registration') && 
         Math.random() < LOGGING_CONFIG.modules.registration.dataUpdateLogFrequency;
};