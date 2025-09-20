/**
 * License Validator Types - Red-Salud Platform
 * 
 * Tipos e interfaces para validación de licencias profesionales médicas.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

export interface VenezuelanDoctorLicenseData {
  documentType: 'cedula_identidad' | 'cedula_extranjera' | 'matricula';
  documentNumber: string; // Número de cédula, pasaporte o matrícula
  firstName?: string;
  lastName?: string;
}

export interface LicenseVerificationResult {
  isValid: boolean;
  isVerified: boolean;
  verificationSource: 'sacs' | 'mpps' | 'other';
  doctorName?: string;
  licenseStatus?: string;
  specialty?: string;
  profession?: string;
  verificationDate?: string;
  verificationId?: string;
  rawData?: Record<string, unknown>;
  error?: string;
}

export interface LicenseVerificationWithAnalysis extends LicenseVerificationResult {
  analysis?: MedicalLicenseAnalysis;
}

// ============================================================================
// TIPOS DE ANÁLISIS
// ============================================================================

export interface MedicalLicenseAnalysis {
  isValidMedicalProfessional: boolean;
  specialty?: string;
  dashboardAccess: {
    primaryDashboard: string;
    allowedDashboards: string[];
  };
  nameVerification: {
    matches: boolean;
    confidence: number;
    providedName: string;
    registeredName: string;
  };
  additionalInfo?: {
    hasPostgrados: boolean;
    registrationDate?: string;
    licenseNumber?: string;
  };
}

// ============================================================================
// TIPOS DE DATOS EXTRAÍDOS
// ============================================================================

export interface SACSExtractedData {
  cedula: string | null;
  nombre: string | null;
  profesion: string | null;
  matricula: string | null;
  fecha: string | null;
  tomo: string | null;
  folio: string | null;
  postgrados: boolean;
  especialidad: string | null;
}

export interface MPPSExtractedData {
  cedula: string | null;
  nombre: string | null;
  especialidad: string | null;
  institucion: string | null;
  fecha: string | null;
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface ValidatorConfig {
  // URLs de los sitios oficiales
  SACS_URL: string;
  MPPS_URL: string;
  
  // Timeouts
  PAGE_LOAD_TIMEOUT: number;
  SELECT_TIMEOUT: number;
  INTERACTION_DELAY: number;
  
  // Configuración de retry
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  
  // User agent
  USER_AGENT: string;
  
  // Configuración de navegador
  BROWSER_ARGS: string[];
}

export interface ScrapingConfig {
  waitForNetworkIdle: boolean;
  enableJavaScript: boolean;
  bypassCSP: boolean;
  ignoreHTTPSErrors: boolean;
  defaultTimeout: number;
}

// ============================================================================
// TIPOS DE ERROR Y RESULTADO DE SCRAPING
// ============================================================================

export type VerificationErrorType = 
  | 'FORMAT_ERROR'
  | 'NETWORK_ERROR'
  | 'SCRAPING_ERROR'
  | 'PARSING_ERROR'
  | 'TIMEOUT_ERROR'
  | 'BROWSER_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR';

export interface ScrapingError {
  type: VerificationErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  source: 'sacs' | 'mpps' | 'validator';
}

export interface ScrapingResult<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: ScrapingError[];
  metadata?: {
    extractionMethod: string;
    processingTime: number;
    attempts: number;
  };
}

// ============================================================================
// TIPOS DE VALIDACIÓN DE FORMATO
// ============================================================================

export interface DocumentFormatValidation {
  isValid: boolean;
  error?: string;
  normalizedDocument?: string;
  documentPattern?: RegExp;
}

export interface FormatValidationRules {
  cedula_identidad: {
    pattern: RegExp;
    example: string;
    description: string;
  };
  cedula_extranjera: {
    pattern: RegExp;
    example: string;
    description: string;
  };
  matricula: {
    pattern: RegExp;
    example: string;
    description: string;
  };
}

// ============================================================================
// TIPOS DE ESTADO DEL NAVEGADOR
// ============================================================================

export interface BrowserState {
  isInitialized: boolean;
  isAvailable: boolean;
  lastActivity: Date | null;
  activePages: number;
  sessionId?: string;
}

export interface PageSession {
  id: string;
  url: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'error' | 'timeout';
  errors?: ScrapingError[];
}

// ============================================================================
// TIPOS DE AUDITORÍA Y LOGGING
// ============================================================================

export interface VerificationAuditLog {
  sessionId: string;
  documentType: string;
  documentNumber: string; // Solo últimos 4 dígitos por seguridad
  verificationSource: string;
  success: boolean;
  timestamp: string;
  processingTime: number;
  userAgent?: string;
  ipAddress?: string;
  errors?: ScrapingError[];
}

export interface VerificationMetrics {
  totalVerifications: number;
  successRate: number;
  averageProcessingTime: number;
  errorsByType: Record<VerificationErrorType, number>;
  sourceReliability: Record<'sacs' | 'mpps', number>;
}

// ============================================================================
// TIPOS DE ESPECIALIDADES MÉDICAS
// ============================================================================

export interface MedicalSpecialty {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  dashboardType: string;
  requiresSpecialAccess: boolean;
}

export interface SpecialtyMapping {
  [key: string]: MedicalSpecialty;
}

// ============================================================================
// TIPOS DE RESPUESTA UNIFICADA
// ============================================================================

export interface UnifiedValidationResponse {
  // Resultado básico
  isValid: boolean;
  isVerified: boolean;
  
  // Información del profesional
  professionalInfo: {
    name?: string;
    documentNumber: string;
    licenseNumber?: string;
    profession?: string;
    specialty?: string;
    registrationDate?: string;
  };
  
  // Análisis y recomendaciones
  analysis?: MedicalLicenseAnalysis;
  
  // Metadatos de verificación
  verification: {
    source: 'sacs' | 'mpps' | 'manual';
    timestamp: string;
    confidence: number;
    method: string;
    processingTime: number;
  };
  
  // Errores y advertencias
  issues?: {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
  
  // Datos crudos (para debugging)
  rawData?: Record<string, unknown>;
}

// ============================================================================
// TIPOS PARA TESTING Y MOCK
// ============================================================================

export interface MockValidationConfig {
  shouldFail: boolean;
  delayMs: number;
  customResult?: Partial<LicenseVerificationResult>;
  simulateNetworkError: boolean;
}

export interface TestCase {
  name: string;
  input: VenezuelanDoctorLicenseData;
  expectedResult: Partial<LicenseVerificationResult>;
  firstName?: string;
  lastName?: string;
}

// ============================================================================
// TIPOS PARA CACHE Y PERFORMANCE
// ============================================================================

export interface CacheEntry {
  key: string;
  result: LicenseVerificationResult;
  timestamp: Date;
  expiresAt: Date;
  hits: number;
}

export interface CacheConfig {
  enabled: boolean;
  maxEntries: number;
  ttlMinutes: number;
  cleanupIntervalMinutes: number;
}

// ============================================================================
// TIPOS EXPORTADOS PARA USO EXTERNO
// ============================================================================

export type {
  VenezuelanDoctorLicenseData as LicenseData,
  LicenseVerificationResult as VerificationResult,
  LicenseVerificationWithAnalysis as VerificationWithAnalysis,
  ValidatorConfig,
  ScrapingError,
  VerificationErrorType,
  UnifiedValidationResponse as ValidationResponse
};

// Enums para mejor type safety
export enum DocumentType {
  CEDULA_IDENTIDAD = 'cedula_identidad',
  CEDULA_EXTRANJERA = 'cedula_extranjera',
  MATRICULA = 'matricula'
}

export enum VerificationSource {
  SACS = 'sacs',
  MPPS = 'mpps',
  OTHER = 'other'
}

export enum LicenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  UNKNOWN = 'unknown'
}
