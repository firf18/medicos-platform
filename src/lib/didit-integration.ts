/**
 * 🔐 DIDIT IDENTITY VERIFICATION API v2 - INTEGRACIÓN ROBUSTA
 * 
 * Integración profesional de Didit para verificación de identidad médica
 * Específicamente diseñada para médicos venezolanos en Red-Salud
 * 
 * @see https://docs.didit.me/
 * @version 2.0.0
 * @author Red-Salud Platform Team
 */

import { z } from 'zod';

// ============================================================================
// TIPOS Y ESQUEMAS DE VALIDACIÓN MEJORADOS
// ============================================================================

// Esquema de respuesta de sesión de Didit (actualizado según API v2)
const DiditSessionSchema = z.object({
  session_id: z.string().uuid(),
  session_number: z.number(),
  session_token: z.string(),
  vendor_data: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Approved', 'Declined', 'In Review', 'Abandoned']),
  workflow_id: z.string().uuid(),
  callback: z.string().url().optional(),
  url: z.string().url(), // URL de verificación
  created_at: z.string()
});

// Esquema de decisión/resultados de verificación (según webhook payload)
const DiditDecisionSchema = z.object({
  session_id: z.string().uuid(),
  session_number: z.number(),
  session_url: z.string().url(),
  status: z.enum(['Not Started', 'In Progress', 'Approved', 'Declined', 'In Review', 'Abandoned']),
  workflow_id: z.string().uuid(),
  features: z.array(z.string()),
  vendor_data: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  expected_details: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).optional(),
  contact_details: z.object({
    email: z.string().email(),
    email_lang: z.string().optional()
  }).optional(),
  callback: z.string().url().optional(),
  // Verificación de ID (opcional según features)
  id_verification: z.object({
    status: z.enum(['Approved', 'Declined', 'In Review']),
    document_type: z.string().optional(),
    document_number: z.string().optional(),
    personal_number: z.string().optional(),
    portrait_image: z.string().url().optional(),
    front_image: z.string().url().optional(),
    back_image: z.string().url().optional(),
    date_of_birth: z.string().optional(),
    age: z.number().optional(),
    expiration_date: z.string().optional(),
    date_of_issue: z.string().optional(),
    issuing_state: z.string().optional(),
    issuing_state_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    formatted_address: z.string().optional(),
    place_of_birth: z.string().optional(),
    nationality: z.string().optional(),
    warnings: z.array(z.object({
      risk: z.string(),
      additional_data: z.any().optional(),
      log_type: z.string(),
      short_description: z.string(),
      long_description: z.string()
    })).optional()
  }).optional(),
  // Face Match (opcional según features)
  face_match: z.object({
    status: z.enum(['match', 'no_match', 'pending']),
    confidence: z.number().min(0).max(100).optional(),
    similarity: z.number().min(0).max(100).optional()
  }).optional(),
  // Liveness (opcional según features)
  liveness: z.object({
    status: z.enum(['live', 'not_live', 'pending']),
    confidence: z.number().min(0).max(100).optional()
  }).optional(),
  // AML Screening (opcional según features)
  aml: z.object({
    status: z.enum(['clear', 'hit', 'pending']),
    risk_level: z.enum(['low', 'medium', 'high']).optional(),
    matches: z.array(z.any()).optional()
  }).optional(),
  // Reviews (si hay revisión manual)
  reviews: z.array(z.object({
    user: z.string().email(),
    new_status: z.string(),
    comment: z.string(),
    created_at: z.string()
  })).optional(),
  created_at: z.string()
});

// Esquema de webhook de Didit (actualizado según documentación)
const DiditWebhookSchema = z.object({
  session_id: z.string().uuid(),
  status: z.enum(['Not Started', 'In Progress', 'Approved', 'Declined', 'In Review', 'Abandoned']),
  webhook_type: z.enum(['status.updated']),
  created_at: z.number(),
  timestamp: z.number(),
  workflow_id: z.string().uuid().optional(),
  vendor_data: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  decision: DiditDecisionSchema.optional() // Solo presente cuando status es Approved/Declined
});

// Tipos TypeScript derivados de los esquemas
export type DiditSession = z.infer<typeof DiditSessionSchema>;
export type DiditDecision = z.infer<typeof DiditDecisionSchema>;
export type DiditWebhook = z.infer<typeof DiditWebhookSchema>;

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES MEJORADAS
// ============================================================================

export interface DiditConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
  workflowId: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface VenezuelanDoctorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string; // Cédula profesional venezolana
  specialty: string;
  documentType: 'cedula_identidad' | 'pasaporte';
  documentNumber: string; // Cédula de identidad o pasaporte
  medicalBoard?: string; // Colegio médico (ej: "Colegio de Médicos de Caracas")
  university?: string; // Universidad donde se graduó
}

// Configuración por defecto mejorada
const DEFAULT_CONFIG: DiditConfig = {
  apiKey: process.env.DIDIT_API_KEY || '',
  baseUrl: process.env.DIDIT_BASE_URL || 'https://verification.didit.me',
  webhookSecret: process.env.DIDIT_WEBHOOK_SECRET_KEY || '',
  workflowId: process.env.DIDIT_WORKFLOW_ID || '',
  timeout: 45000, // 45 segundos
  retryAttempts: 3,
  retryDelay: 2000 // 2 segundos
};

// ============================================================================
// CLASE PRINCIPAL DE INTEGRACIÓN DIDIT MEJORADA
// ============================================================================

export class DiditIntegrationV2 {
  private config: DiditConfig;
  private baseHeaders: Record<string, string>;

  constructor(config: Partial<DiditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.baseHeaders = {
      'X-Api-Key': this.config.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'Red-Salud-Platform/2.0',
      'Accept': 'application/json'
    };

    // Validar configuración
    this.validateConfig();
  }

  /**
   * Valida la configuración de Didit
   */
  private validateConfig(): void {
    const requiredFields = [
      { field: 'apiKey', env: 'DIDIT_API_KEY' },
      { field: 'webhookSecret', env: 'DIDIT_WEBHOOK_SECRET_KEY' },
      { field: 'workflowId', env: 'DIDIT_WORKFLOW_ID' },
      { field: 'baseUrl', env: 'DIDIT_BASE_URL' }
    ];

    for (const { field, env } of requiredFields) {
      if (!this.config[field as keyof DiditConfig]) {
        throw new Error(`❌ ${env} es requerida para la integración con Didit`);
      }
    }

    // Validar formato de workflow ID
    if (!this.isValidUUID(this.config.workflowId)) {
      throw new Error('❌ DIDIT_WORKFLOW_ID debe ser un UUID válido');
    }

    console.log('✅ Configuración de Didit validada correctamente');
  }

  /**
   * Valida si una cadena es un UUID válido
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Realiza una petición HTTP con reintentos
   */
  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    attempt: number = 1
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok && attempt < this.config.retryAttempts) {
        console.warn(`⚠️ Intento ${attempt} falló, reintentando en ${this.config.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.warn(`⚠️ Intento ${attempt} falló con error, reintentando...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Crea una nueva sesión de verificación para médicos venezolanos
   * 
   * @param doctorData - Datos del médico venezolano a verificar
   * @param callbackUrl - URL de callback personalizada (opcional)
   * @returns Promise con los datos de la sesión creada
   */
  async createVerificationSession(
    doctorData: VenezuelanDoctorData,
    callbackUrl?: string
  ): Promise<DiditSession> {
    try {
      // Validar datos del médico
      this.validateDoctorData(doctorData);

      // Configuración de la sesión específica para médicos venezolanos
      const sessionConfig = {
        workflow_id: this.config.workflowId,
        callback: callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register/doctor/verification-complete`,
        vendor_data: doctorData.licenseNumber, // Usar cédula profesional como identificador
        metadata: {
          platform: 'red-salud-platform',
          country: 'venezuela',
          verification_type: 'doctor_registration',
          specialty: doctorData.specialty,
          medical_license: doctorData.licenseNumber,
          document_type: doctorData.documentType,
          document_number: doctorData.documentNumber,
          medical_board: doctorData.medicalBoard,
          university: doctorData.university,
          registration_timestamp: new Date().toISOString()
        },
        expected_details: {
          first_name: doctorData.firstName,
          last_name: doctorData.lastName
        },
        contact_details: {
          email: doctorData.email,
          email_lang: 'es' // Español para médicos venezolanos
        }
      };

      // Log de la solicitud
      this.logEvent('session_creation_started', {
        workflow_id: sessionConfig.workflow_id,
        vendor_data: sessionConfig.vendor_data,
        specialty: doctorData.specialty,
        document_type: doctorData.documentType
      });

      // Realizar la solicitud con reintentos
      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/v2/session/`,
        {
          method: 'POST',
          headers: this.baseHeaders,
          body: JSON.stringify(sessionConfig)
        }
      );

      // Verificar respuesta
      if (!response.ok) {
        const errorText = await response.text();
        this.logEvent('session_creation_failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Manejar errores específicos
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        } else if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status === 404) {
          throw new Error('Workflow not found');
        } else if (response.status >= 500) {
          throw new Error('Service unavailable');
        } else {
          throw new Error(`Error de API Didit: ${response.status} - ${response.statusText}: ${errorText}`);
        }
      }

      // Parsear y validar respuesta
      const result = await response.json();
      const validatedSession = DiditSessionSchema.parse(result);
      
      // Log de éxito
      this.logEvent('session_creation_success', {
        session_id: validatedSession.session_id,
        session_number: validatedSession.session_number,
        status: validatedSession.status,
        verification_url: validatedSession.url
      });

      return validatedSession;

    } catch (error) {
      this.logEvent('session_creation_error', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        doctor_license: doctorData.licenseNumber
      });
      throw error;
    }
  }

  /**
   * Obtiene los resultados de una sesión de verificación
   * 
   * @param sessionId - ID de la sesión
   * @returns Promise con los resultados de la verificación
   */
  async getVerificationResults(sessionId: string): Promise<DiditDecision> {
    try {
      this.logEvent('results_retrieval_started', { session_id: sessionId });

      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/v2/session/${sessionId}/decision/`,
        {
          method: 'GET',
          headers: this.baseHeaders
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logEvent('results_retrieval_failed', {
          session_id: sessionId,
          status: response.status,
          error: errorText
        });
        
        // Manejar errores específicos
        if (response.status === 404) {
          throw new Error('Session not found');
        } else if (response.status === 410) {
          throw new Error('Session expired');
        } else if (response.status >= 500) {
          throw new Error('Service unavailable');
        } else {
          throw new Error(`Error obteniendo resultados: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      const validatedResults = DiditDecisionSchema.parse(result);
      
      this.logEvent('results_retrieval_success', {
        session_id: sessionId,
        status: validatedResults.status,
        features: validatedResults.features
      });
      
      return validatedResults;

    } catch (error) {
      this.logEvent('results_retrieval_error', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Verifica la firma de un webhook de Didit con validación de timestamp
   * 
   * @param payload - Payload del webhook
   * @param signature - Firma HMAC del webhook
   * @param timestamp - Timestamp del webhook
   * @returns true si la firma es válida
   */
  verifyWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    try {
      // Verificar que el timestamp sea reciente (dentro de 5 minutos)
      const currentTime = Math.floor(Date.now() / 1000);
      const incomingTime = parseInt(timestamp, 10);
      
      if (Math.abs(currentTime - incomingTime) > 300) {
        this.logEvent('webhook_signature_verification_failed', {
          reason: 'timestamp_too_old',
          current_time: currentTime,
          incoming_time: incomingTime,
          difference: Math.abs(currentTime - incomingTime)
        });
        return false;
      }

      // Importar crypto para HMAC
      const crypto = require('crypto');
      
      // Crear HMAC con el webhook secret
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
        .digest('hex');
      
      // Comparar firmas usando timingSafeEqual para seguridad
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const providedBuffer = Buffer.from(signature, 'utf8');

      if (expectedBuffer.length !== providedBuffer.length) {
        this.logEvent('webhook_signature_verification_failed', {
          reason: 'signature_length_mismatch'
        });
        return false;
      }

      const isValid = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
      
      this.logEvent('webhook_signature_verification', {
        is_valid: isValid,
        timestamp_valid: true
      });
      
      return isValid;

    } catch (error) {
      this.logEvent('webhook_signature_verification_error', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Procesa un webhook de Didit
   * 
   * @param payload - Payload del webhook
   * @param signature - Firma HMAC del webhook
   * @param timestamp - Timestamp del webhook
   * @returns Datos del webhook procesado
   */
  async processWebhook(payload: string, signature: string, timestamp: string): Promise<DiditWebhook> {
    try {
      this.logEvent('webhook_processing_started', {
        payload_length: payload.length,
        has_signature: !!signature,
        has_timestamp: !!timestamp
      });

      // Verificar firma
      if (!this.verifyWebhookSignature(payload, signature, timestamp)) {
        throw new Error('Firma de webhook inválida o timestamp expirado');
      }

      // Parsear y validar payload
      const webhookData = JSON.parse(payload);
      const validatedWebhook = DiditWebhookSchema.parse(webhookData);
      
      this.logEvent('webhook_processing_success', {
        session_id: validatedWebhook.session_id,
        status: validatedWebhook.status,
        webhook_type: validatedWebhook.webhook_type,
        has_decision: !!validatedWebhook.decision
      });

      return validatedWebhook;

    } catch (error) {
      this.logEvent('webhook_processing_error', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Valida los datos del médico venezolano
   */
  private validateDoctorData(doctorData: VenezuelanDoctorData): void {
    // Validar cédula profesional venezolana (formato más completo para todos los colegios médicos)
    // Formatos aceptados:
    // - MPPS-XXXXX (Ministerio del Poder Popular para la Salud)
    // - CMC-XXXXX (Colegio de Médicos de Caracas)
    // - CMDM-XXXXX (Colegio de Médicos de Miranda)
    // - CMDC-XXXXX (Colegio de Médicos de Carabobo)
    // - CMDT-XXXXX (Colegio de Médicos de Táchira)
    // - CMDZ-XXXXX (Colegio de Médicos de Zulia)
    // - Y otros colegios médicos regionales
    const licenseRegex = /^(MPPS|CIV|CMC|CMDM|CMDC|CMDT|CMDZ|CMDA|CMDB|CMDL|CMDF|CMDG|CMDP|CMDS|CMDY|CMDCO|CMDSU|CMDTA|CMDME|CMDMO|CMDVA|CMDAP|CMDGU|CMDPO|CMDNUE|CMDBAR|CMDCAR|CMDARA|CMDBOL|CMDCOJ|CMDDEL|CMDMIRA|CMDTRU|CMDYAR)-\d{4,6}$/i;
    
    if (!licenseRegex.test(doctorData.licenseNumber)) {
      throw new Error('Número de cédula profesional venezolana inválido. Formato esperado: MPPS-XXXXX, CMC-XXXXX u otros colegios médicos reconocidos');
    }

    // Validar cédula de identidad venezolana (formato: V-XXXXXXXX o E-XXXXXXXX)
    if (doctorData.documentType === 'cedula_identidad') {
      const cedulaRegex = /^[VE]-\d{7,8}$/i;
      if (!cedulaRegex.test(doctorData.documentNumber)) {
        throw new Error('Cédula de identidad venezolana inválida. Formato esperado: V-XXXXXXXX o E-XXXXXXXX');
      }
    }

    // Validar teléfono venezolano (formato: +58XXXXXXXXX)
    const phoneRegex = /^\+58[24]\d{9}$/;
    if (!phoneRegex.test(doctorData.phone)) {
      throw new Error('Número de teléfono venezolano inválido. Formato esperado: +58XXXXXXXXX');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doctorData.email)) {
      throw new Error('Dirección de email inválida');
    }
  }

  /**
   * Log estructurado para eventos de Didit
   */
  private logEvent(eventType: string, data: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: eventType,
      service: 'didit-integration',
      version: '2.0.0',
      platform: 'red-salud-platform',
      data
    };
    
    console.log(`🔐 [DIDIT] ${eventType}:`, JSON.stringify(logEntry, null, 2));
  }

  /**
   * Obtiene la configuración actual (sin datos sensibles)
   */
  getConfig(): Omit<DiditConfig, 'apiKey' | 'webhookSecret'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKey, webhookSecret, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Verifica el estado de salud de la integración
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: Record<string, unknown> }> {
    try {
      // Verificar conectividad con Didit
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: { 'User-Agent': this.baseHeaders['User-Agent'] },
        signal: AbortSignal.timeout(5000)
      });

      const isHealthy = response.ok;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          didit_api_status: response.status,
          config_valid: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Error desconocido',
          config_valid: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// ============================================================================
// INSTANCIA SINGLETON MEJORADA
// ============================================================================

let diditInstance: DiditIntegrationV2 | null = null;

/**
 * Obtiene la instancia singleton de DiditIntegrationV2
 */
export function getDiditInstance(config?: Partial<DiditConfig>): DiditIntegrationV2 {
  if (!diditInstance) {
    diditInstance = new DiditIntegrationV2(config);
  }
  return diditInstance;
}

// ============================================================================
// UTILIDADES ADICIONALES
// ============================================================================

/**
 * Mapea el estado de Didit a un estado interno más amigable
 */
export function mapDiditStatus(status: string): {
  internal: 'pending' | 'processing' | 'approved' | 'rejected' | 'review' | 'abandoned';
  userFriendly: string;
  color: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'orange';
} {
  const statusMap = {
    'Not Started': { internal: 'pending' as const, userFriendly: 'Pendiente', color: 'gray' as const },
    'In Progress': { internal: 'processing' as const, userFriendly: 'En Proceso', color: 'blue' as const },
    'Approved': { internal: 'approved' as const, userFriendly: 'Aprobado', color: 'green' as const },
    'Declined': { internal: 'rejected' as const, userFriendly: 'Rechazado', color: 'red' as const },
    'In Review': { internal: 'review' as const, userFriendly: 'En Revisión', color: 'yellow' as const },
    'Abandoned': { internal: 'abandoned' as const, userFriendly: 'Abandonado', color: 'orange' as const }
  };

  return statusMap[status as keyof typeof statusMap] || {
    internal: 'pending' as const,
    userFriendly: 'Estado Desconocido',
    color: 'gray' as const
  };
}

/**
 * Extrae información relevante de los resultados de verificación
 */
export function extractVerificationSummary(decision: DiditDecision): {
  isFullyVerified: boolean;
  verificationScore: number;
  completedChecks: string[];
  failedChecks: string[];
  warnings: string[];
} {
  const completedChecks: string[] = [];
  const failedChecks: string[] = [];
  const warnings: string[] = [];
  let totalScore = 0;
  let checkCount = 0;

  // Verificar ID
  if (decision.id_verification) {
    checkCount++;
    if (decision.id_verification.status === 'Approved') {
      completedChecks.push('Verificación de Documento');
      totalScore += 25;
    } else {
      failedChecks.push('Verificación de Documento');
    }
    
    // Agregar warnings si existen
    if (decision.id_verification.warnings) {
      warnings.push(...decision.id_verification.warnings.map(w => w.short_description));
    }
  }

  // Verificar Face Match
  if (decision.face_match) {
    checkCount++;
    if (decision.face_match.status === 'match') {
      completedChecks.push('Coincidencia Facial');
      totalScore += 25;
    } else {
      failedChecks.push('Coincidencia Facial');
    }
  }

  // Verificar Liveness
  if (decision.liveness) {
    checkCount++;
    if (decision.liveness.status === 'live') {
      completedChecks.push('Detección de Vida');
      totalScore += 25;
    } else {
      failedChecks.push('Detección de Vida');
    }
  }

  // Verificar AML
  if (decision.aml) {
    checkCount++;
    if (decision.aml.status === 'clear') {
      completedChecks.push('Verificación AML');
      totalScore += 25;
    } else {
      failedChecks.push('Verificación AML');
    }
  }

  const verificationScore = checkCount > 0 ? Math.round(totalScore / checkCount) : 0;
  const isFullyVerified = decision.status === 'Approved' && failedChecks.length === 0;

  return {
    isFullyVerified,
    verificationScore,
    completedChecks,
    failedChecks,
    warnings
  };
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default DiditIntegrationV2;
export { 
  DiditSessionSchema, 
  DiditDecisionSchema, 
  DiditWebhookSchema
};
