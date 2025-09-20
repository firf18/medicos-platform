/**
 * License Validator Configuration - Red-Salud Platform
 * 
 * Configuración centralizada para validación de licencias profesionales.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { ValidatorConfig, ScrapingConfig, FormatValidationRules, CacheConfig } from '@/types/license-validator.types';

// ============================================================================
// CONFIGURACIÓN PRINCIPAL DEL VALIDADOR
// ============================================================================

export const VALIDATOR_CONFIG: ValidatorConfig = {
  // URLs de los sitios oficiales para verificación
  SACS_URL: 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud',
  MPPS_URL: 'https://mpps.gob.ve/consulta-publica/',
  
  // Tiempo de espera para cargar páginas (aumentado para sitios lentos)
  PAGE_LOAD_TIMEOUT: 60000, // 60 segundos
  
  // Tiempo de espera para selecciones e interacciones
  SELECT_TIMEOUT: 10000, // 10 segundos
  INTERACTION_DELAY: 2000, // 2 segundos entre interacciones
  
  // Configuración de reintentos
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 segundos entre reintentos
  
  // User agent para evitar detección de bot
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Argumentos del navegador para entornos de producción
  BROWSER_ARGS: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--ignore-certificate-errors',
    '--ignore-ssl-errors',
    '--ignore-certificate-errors-spki-list',
    '--disable-web-security',
    '--allow-running-insecure-content',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows'
  ]
};

// ============================================================================
// CONFIGURACIÓN DE SCRAPING
// ============================================================================

export const SCRAPING_CONFIG: ScrapingConfig = {
  waitForNetworkIdle: true,
  enableJavaScript: true,
  bypassCSP: true,
  ignoreHTTPSErrors: true,
  defaultTimeout: 30000
};

// ============================================================================
// CONFIGURACIÓN DE CACHE
// ============================================================================

export const CACHE_CONFIG: CacheConfig = {
  enabled: true,
  maxEntries: 1000,
  ttlMinutes: 60, // Cache por 1 hora
  cleanupIntervalMinutes: 30 // Limpiar cada 30 minutos
};

// ============================================================================
// REGLAS DE VALIDACIÓN DE FORMATO
// ============================================================================

export const FORMAT_VALIDATION_RULES: FormatValidationRules = {
  cedula_identidad: {
    pattern: /^V-\d{7,8}$/,
    example: 'V-12345678',
    description: 'Cédula de identidad venezolana (V-XXXXXXXX)'
  },
  cedula_extranjera: {
    pattern: /^E-\d{7,8}$/,
    example: 'E-12345678',
    description: 'Cédula de extranjero (E-XXXXXXXX)'
  },
  matricula: {
    pattern: /^MPPS-\d{4,6}$/,
    example: 'MPPS-12345',
    description: 'Matrícula profesional MPPS (MPPS-XXXXX)'
  }
};

// ============================================================================
// CONFIGURACIÓN DE SELECTORES CSS/XPATH
// ============================================================================

export const SACS_SELECTORS = {
  // Selectores para el formulario de búsqueda
  SEARCH_INPUT: 'input[name="cedula"]',
  SEARCH_BUTTON: 'button[type="submit"]',
  
  // Selectores para los resultados
  RESULTS_TABLE: 'table',
  RESULTS_ROWS: 'table tr',
  
  // XPath específicos para elementos complejos
  POSTGRADO_BUTTON_XPATH: '/html/body/main/div/div/div/div/div[2]/div/div[3]/div/div/div[3]/div[2]/table/tbody/tr/td[6]/button',
  
  // Selectores para datos específicos
  DATA_CELLS: 'td, th',
  NAME_CELL: '[data-field="nombre"]',
  PROFESSION_CELL: '[data-field="profesion"]',
  LICENSE_CELL: '[data-field="matricula"]',
  
  // Selectores para estados de carga
  LOADING_INDICATOR: '.loading, .spinner, [class*="load"]',
  ERROR_MESSAGE: '.error, .alert-danger, [class*="error"]'
};

export const MPPS_SELECTORS = {
  // Selectores para MPPS (a implementar)
  SEARCH_FORM: 'form',
  SEARCH_INPUT: 'input[type="text"]',
  SUBMIT_BUTTON: 'input[type="submit"], button[type="submit"]',
  RESULTS_CONTAINER: '.results, #results, [class*="result"]'
};

// ============================================================================
// CONFIGURACIÓN DE TIMEOUTS ESPECÍFICOS
// ============================================================================

export const TIMEOUTS = {
  // Timeouts para diferentes operaciones
  PAGE_NAVIGATION: 30000,
  ELEMENT_WAIT: 10000,
  AJAX_RESPONSE: 15000,
  FILE_DOWNLOAD: 20000,
  
  // Delays entre acciones para evitar detección
  HUMAN_DELAY_MIN: 1000,
  HUMAN_DELAY_MAX: 3000,
  TYPING_DELAY: 100,
  CLICK_DELAY: 500,
  
  // Timeouts para retry logic
  RETRY_BACKOFF_BASE: 2000,
  RETRY_BACKOFF_MAX: 30000
};

// ============================================================================
// CONFIGURACIÓN DE LOGS Y AUDITORÍA
// ============================================================================

export const LOGGING_CONFIG = {
  // Niveles de log
  LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  
  // Configuración de auditoría
  AUDIT_ENABLED: true,
  AUDIT_RETENTION_DAYS: 90,
  
  // Campos sensibles que no deben loggearse completos
  SENSITIVE_FIELDS: ['documentNumber', 'cedula', 'nombre'],
  
  // Configuración de métricas
  METRICS_ENABLED: true,
  METRICS_INTERVAL_MINUTES: 5
};

// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================================

export const SECURITY_CONFIG = {
  // Máximo número de verificaciones por IP por hora
  RATE_LIMIT_PER_HOUR: 100,
  
  // Máximo número de verificaciones fallidas consecutivas
  MAX_FAILED_ATTEMPTS: 5,
  
  // Tiempo de bloqueo después de muchos fallos (minutos)
  LOCKOUT_DURATION_MINUTES: 15,
  
  // Encriptación de datos sensibles en cache
  ENCRYPT_CACHE: true,
  
  // Headers de seguridad adicionales
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// ============================================================================
// CONFIGURACIÓN DE ENTORNO
// ============================================================================

export const ENVIRONMENT_CONFIG = {
  // Configuración según el entorno
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Variables de entorno específicas
  ENABLE_HEADLESS: process.env.PUPPETEER_HEADLESS !== 'false',
  ENABLE_DEBUG: process.env.DEBUG === 'true',
  ENABLE_SCREENSHOTS: process.env.ENABLE_SCREENSHOTS === 'true',
  
  // Configuración de proxy (si es necesario)
  PROXY_URL: process.env.PROXY_URL,
  PROXY_USERNAME: process.env.PROXY_USERNAME,
  PROXY_PASSWORD: process.env.PROXY_PASSWORD
};

// ============================================================================
// CONFIGURACIÓN DE ESPECIALIDADES MÉDICAS
// ============================================================================

export const SPECIALTY_KEYWORDS = {
  // Palabras clave para identificar especialidades
  MEDICINA_GENERAL: ['médico general', 'medicina general', 'médico(a) cirujano(a)'],
  CARDIOLOGIA: ['cardiólogo', 'cardiología', 'corazón', 'cardiovascular'],
  NEUROLOGIA: ['neurólogo', 'neurología', 'nervioso', 'cerebro'],
  PEDIATRIA: ['pediatra', 'pediatría', 'niños', 'infantil'],
  GINECOLOGIA: ['ginecólogo', 'ginecología', 'obstétrica', 'mujer'],
  CIRUGIA: ['cirujano', 'cirugía', 'quirúrgico', 'operaciones'],
  MEDICINA_INTERNA: ['internista', 'medicina interna', 'adultos'],
  PSIQUIATRIA: ['psiquiatra', 'psiquiatría', 'mental', 'psicológico'],
  DERMATOLOGIA: ['dermatólogo', 'dermatología', 'piel', 'cutáneo'],
  OFTALMOLOGIA: ['oftalmólogo', 'oftalmología', 'ojos', 'visual']
};

// ============================================================================
// CONFIGURACIÓN DE VALIDACIÓN DE NOMBRES
// ============================================================================

export const NAME_VALIDATION_CONFIG = {
  // Configuración para matching de nombres
  SIMILARITY_THRESHOLD: 0.8, // 80% de similitud mínima
  NORMALIZE_ACCENTS: true,
  IGNORE_CASE: true,
  IGNORE_MIDDLE_NAMES: true,
  
  // Patrones comunes de nombres
  COMMON_PREFIXES: ['DR.', 'DRA.', 'DR', 'DRA', 'DOCTOR', 'DOCTORA'],
  COMMON_SUFFIXES: ['MD', 'M.D.', 'MÉDICO', 'MEDICO'],
  
  // Configuración de fuzzy matching
  FUZZY_MATCHING_ENABLED: true,
  MAX_EDIT_DISTANCE: 2
};

// ============================================================================
// CONFIGURACIÓN DE TESTING
// ============================================================================

export const TEST_CONFIG = {
  // Configuración para tests automatizados
  MOCK_RESPONSES: process.env.NODE_ENV === 'test',
  SKIP_NETWORK_CALLS: process.env.SKIP_NETWORK === 'true',
  
  // Datos de prueba
  TEST_DOCUMENTS: {
    VALID_CEDULA: 'V-12345678',
    INVALID_CEDULA: 'X-123',
    VALID_MATRICULA: 'MPPS-12345'
  },
  
  // Timeouts reducidos para tests
  TEST_TIMEOUTS: {
    PAGE_LOAD: 10000,
    ELEMENT_WAIT: 5000,
    TOTAL_TEST: 30000
  }
};

// ============================================================================
// FUNCIONES DE UTILIDAD PARA CONFIGURACIÓN
// ============================================================================

/**
 * Obtiene la configuración según el entorno
 */
export function getEnvironmentConfig() {
  if (ENVIRONMENT_CONFIG.IS_TEST) {
    return {
      ...VALIDATOR_CONFIG,
      PAGE_LOAD_TIMEOUT: TEST_CONFIG.TEST_TIMEOUTS.PAGE_LOAD,
      SELECT_TIMEOUT: TEST_CONFIG.TEST_TIMEOUTS.ELEMENT_WAIT
    };
  }
  
  if (ENVIRONMENT_CONFIG.IS_DEVELOPMENT) {
    return {
      ...VALIDATOR_CONFIG,
      BROWSER_ARGS: VALIDATOR_CONFIG.BROWSER_ARGS.filter(arg => 
        !arg.includes('--headless')
      )
    };
  }
  
  return VALIDATOR_CONFIG;
}

/**
 * Valida que toda la configuración necesaria esté presente
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar URLs
  if (!VALIDATOR_CONFIG.SACS_URL || !VALIDATOR_CONFIG.SACS_URL.startsWith('http')) {
    errors.push('SACS_URL debe ser una URL válida');
  }
  
  if (!VALIDATOR_CONFIG.MPPS_URL || !VALIDATOR_CONFIG.MPPS_URL.startsWith('http')) {
    errors.push('MPPS_URL debe ser una URL válida');
  }
  
  // Validar timeouts
  if (VALIDATOR_CONFIG.PAGE_LOAD_TIMEOUT < 1000) {
    errors.push('PAGE_LOAD_TIMEOUT debe ser al menos 1000ms');
  }
  
  // Validar user agent
  if (!VALIDATOR_CONFIG.USER_AGENT || VALIDATOR_CONFIG.USER_AGENT.length < 10) {
    errors.push('USER_AGENT debe ser válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORT POR DEFECTO
// ============================================================================

export default {
  VALIDATOR_CONFIG,
  SCRAPING_CONFIG,
  CACHE_CONFIG,
  FORMAT_VALIDATION_RULES,
  SACS_SELECTORS,
  MPPS_SELECTORS,
  TIMEOUTS,
  LOGGING_CONFIG,
  SECURITY_CONFIG,
  ENVIRONMENT_CONFIG,
  getEnvironmentConfig,
  validateConfig
};
