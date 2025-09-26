/**
 * 🔧 DIDIT CONFIGURATION - Platform Médicos Elite
 * 
 * Configuración centralizada para integración con Didit.me
 * Basada en documentación oficial v2
 */

// Configuración de Didit para doctores
export const DIDIT_DOCTOR_CONFIG = {
  // API Configuration
  apiKey: process.env.DIDIT_API_KEY,
  webhookSecret: process.env.DIDIT_WEBHOOK_SECRET_KEY,
  baseUrl: 'https://verification.didit.me/v2',
  timeout: 30000, // 30 segundos
  
  // Workflow específico para doctores venezolanos
  // IMPORTANTE: Este ID debe obtenerse desde el dashboard de Didit.me
  doctorWorkflowId: process.env.DIDIT_DOCTOR_WORKFLOW_ID || 'default-doctor-workflow',
  
  // Callback URL para webhooks
  callbackUrl: process.env.DIDIT_CALLBACK_URL || 
    (process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/auth/didit/callback'
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback`),
  
  // Configuración de idioma
  language: 'es', // Español para Venezuela
  
  // Configuración de país
  country: 'VEN', // Venezuela ISO 3166-1 alpha-3
  nationality: 'VEN',
  
  // Features habilitadas para doctores
  features: [
    'ID_VERIFICATION',
    'LIVENESS', 
    'FACE_MATCH',
    'AML',
    'IP_ANALYSIS'
  ] as const,
  
  // Configuración de reintentos
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    exponentialBackoff: true
  },
  
  // Configuración de webhook
  webhookConfig: {
    maxRetries: 2,
    retryDelay: 60000, // 1 minuto
    timeout: 300000 // 5 minutos
  }
} as const;

// Tipos TypeScript basados en documentación oficial
export interface DiditCreateSessionRequest {
  workflow_id: string;
  vendor_data: string;
  callback?: string;
  metadata?: Record<string, any>;
  language?: string;
  contact_details?: {
    email?: string;
    email_lang?: string;
    phone?: string;
  };
  expected_details?: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: 'M' | 'F';
    nationality?: string;
    country?: string;
    address?: string;
    identification_number?: string;
  };
  portrait_image?: string; // Base64 encoded
}

export interface DiditCreateSessionResponse {
  session_id: string;
  session_number: number;
  session_token: string;
  vendor_data: string;
  metadata?: Record<string, any>;
  status: string;
  workflow_id: string;
  callback?: string;
  url: string;
}

export interface DiditSessionDecision {
  session_id: string;
  session_number: number;
  session_url: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned';
  workflow_id: string;
  features: string[];
  vendor_data: string;
  metadata?: Record<string, any>;
  expected_details?: Record<string, any>;
  contact_details?: Record<string, any>;
  callback?: string;
  id_verification?: {
    status: string;
    document_type: string;
    document_number: string;
    personal_number?: string;
    portrait_image?: string;
    front_image?: string;
    back_image?: string;
    date_of_birth: string;
    age: number;
    expiration_date?: string;
    date_of_issue?: string;
    issuing_state: string;
    issuing_state_name: string;
    first_name: string;
    last_name: string;
    full_name: string;
    gender: string;
    address?: string;
    formatted_address?: string;
    place_of_birth?: string;
    marital_status?: string;
    nationality: string;
    warnings?: Array<{
      risk: string;
      additional_data?: any;
      log_type: string;
      short_description: string;
      long_description: string;
    }>;
  };
  liveness?: {
    status: string;
    method: string;
    score: number;
    reference_image?: string;
    video_url?: string;
    age_estimation?: number;
    warnings?: Array<{
      risk: string;
      additional_data?: any;
      log_type: string;
      short_description: string;
      long_description: string;
    }>;
  };
  face_match?: {
    status: string;
    score: number;
    source_image?: string;
    target_image?: string;
    warnings?: Array<{
      risk: string;
      additional_data?: any;
      log_type: string;
      short_description: string;
      long_description: string;
    }>;
  };
  aml?: {
    status: string;
    total_hits: number;
    hits: Array<{
      id: string;
      url: string;
      match: boolean;
      score: number;
      caption: string;
      datasets: string[];
      risk_view: {
        crimes: { score: number; weightage: number; risk_level: string; risk_scores: Record<string, any> };
        countries: { score: number; weightage: number; risk_level: string; risk_scores: Record<string, any> };
        categories: { score: number; weightage: number; risk_level: string; risk_scores: Record<string, any> };
        custom_list: Record<string, any>;
      };
    }>;
    score: number;
    screened_data: {
      full_name: string;
      nationality: string;
      date_of_birth: string;
      document_number?: string;
    };
    warnings?: Array<{
      risk: string;
      additional_data?: any;
      log_type: string;
      short_description: string;
      long_description: string;
    }>;
  };
  ip_analysis?: {
    status: string;
    device_brand?: string;
    device_model?: string;
    browser_family?: string;
    os_family?: string;
    platform?: string;
    ip_country: string;
    ip_country_code: string;
    ip_state?: string;
    ip_city?: string;
    latitude?: number;
    longitude?: number;
    ip_address: string;
    isp?: string;
    organization?: string;
    is_vpn_or_tor: boolean;
    is_data_center: boolean;
    time_zone?: string;
    time_zone_offset?: string;
    warnings?: Array<{
      risk: string;
      additional_data?: any;
      log_type: string;
      short_description: string;
      long_description: string;
    }>;
  };
  reviews?: Array<{
    user: string;
    new_status: string;
    comment: string;
    created_at: string;
  }>;
  created_at: string;
}

export interface DiditWebhookPayload {
  session_id: string;
  status: string;
  webhook_type: 'status.updated' | 'data.updated';
  created_at: number;
  timestamp: number;
  workflow_id?: string;
  vendor_data?: string;
  metadata?: Record<string, any>;
  decision?: DiditSessionDecision;
}

// Utilidades de configuración
export function validateDiditConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!DIDIT_DOCTOR_CONFIG.apiKey) {
    errors.push('DIDIT_API_KEY no configurada - Requerida para autenticación con Didit.me');
  }
  
  if (!DIDIT_DOCTOR_CONFIG.webhookSecret) {
    errors.push('DIDIT_WEBHOOK_SECRET_KEY no configurada - Requerida para validar webhooks');
  }
  
  if (!DIDIT_DOCTOR_CONFIG.doctorWorkflowId || DIDIT_DOCTOR_CONFIG.doctorWorkflowId === 'default-doctor-workflow') {
    errors.push('DIDIT_DOCTOR_WORKFLOW_ID no configurada o usando valor por defecto - Debe obtenerse desde el dashboard de Didit.me');
  }
  
  // Validar que el workflow_id no sea el valor por defecto
  if (DIDIT_DOCTOR_CONFIG.doctorWorkflowId === 'default-doctor-workflow') {
    errors.push('⚠️ CRÍTICO: Se está usando un workflow_id por defecto que no existe en Didit.me. Esto causará errores 404.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getDiditHeaders(): Record<string, string> {
  return {
    'x-api-key': DIDIT_DOCTOR_CONFIG.apiKey as string,
    'Content-Type': 'application/json',
    'accept': 'application/json',
    'User-Agent': 'Platform-Medicos-Doctor/2.0.0'
  };
}
