/**
 * 🔧 DIDIT API CLIENT - Platform Médicos Elite
 * 
 * Cliente robusto para integración con Didit.me v2 API
 * Basado en documentación oficial con manejo de errores y reintentos
 */

import { 
  DIDIT_DOCTOR_CONFIG, 
  DiditCreateSessionRequest, 
  DiditCreateSessionResponse, 
  DiditSessionDecision,
  getDiditHeaders,
  validateDiditConfig
} from './config';

export class DiditApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'DiditApiError';
  }
}

export class DiditApiClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    const config = validateDiditConfig();
    if (!config.isValid) {
      console.error('❌ CONFIGURACIÓN DE DIDIT INVÁLIDA:');
      config.errors.forEach(error => console.error(`  - ${error}`));
      console.error('\n📋 SOLUCIÓN:');
      console.error('  1. Configurar las variables de entorno requeridas');
      console.error('  2. Obtener el WORKFLOW_ID correcto desde el dashboard de Didit.me');
      console.error('  3. Verificar que la API_KEY sea válida');
      console.error('\n📄 Ver archivo: didit-env-example.txt para más detalles');
      
      throw new Error(`Configuración de Didit inválida: ${config.errors.join(', ')}`);
    }

    this.baseUrl = DIDIT_DOCTOR_CONFIG.baseUrl;
    this.apiKey = DIDIT_DOCTOR_CONFIG.apiKey as string;
    this.timeout = DIDIT_DOCTOR_CONFIG.timeout;
  }

  /**
   * Crear sesión de verificación para doctor
   */
  async createDoctorSession(doctorData: {
    doctorId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
    documentNumber?: string;
    callbackUrl?: string; // 🔧 CORRECCIÓN: Agregar callbackUrl
  }): Promise<DiditCreateSessionResponse> {
    const payload: DiditCreateSessionRequest = {
      workflow_id: DIDIT_DOCTOR_CONFIG.doctorWorkflowId,
      vendor_data: doctorData.doctorId,
      callback: doctorData.callbackUrl || DIDIT_DOCTOR_CONFIG.callbackUrl, // 🔧 CORRECCIÓN: Usar callbackUrl personalizada
      language: DIDIT_DOCTOR_CONFIG.language,
      metadata: {
        user_type: 'doctor',
        platform: 'platform-medicos',
        country: DIDIT_DOCTOR_CONFIG.country
      },
      contact_details: {
        ...(doctorData.email && { email: doctorData.email }),
        ...(doctorData.email && { email_lang: DIDIT_DOCTOR_CONFIG.language }),
        ...(doctorData.phone && { phone: doctorData.phone })
      },
      expected_details: {
        first_name: doctorData.firstName,
        last_name: doctorData.lastName,
        date_of_birth: doctorData.dateOfBirth,
        nationality: DIDIT_DOCTOR_CONFIG.nationality,
        country: DIDIT_DOCTOR_CONFIG.country,
        ...(doctorData.documentNumber && { identification_number: doctorData.documentNumber })
      }
    };

    return this.makeRequest<DiditCreateSessionResponse>('/session/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Obtener estado de sesión
   * ✅ CORREGIDO: Usar endpoint correcto /decision/ según documentación oficial
   */
  async getSessionStatus(sessionId: string): Promise<{
    session_id: string;
    status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned' | 'Expired';
    decision?: DiditSessionDecision;
    document_name?: string;
    extracted_name?: string;
    created_at?: string;
    updated_at?: string;
    expires_at?: string;
  }> {
    return this.makeRequest(`/session/${sessionId}/decision/`, {
      method: 'GET'
    });
  }

  /**
   * Obtener decisión de sesión
   */
  async getSessionDecision(sessionId: string): Promise<DiditSessionDecision> {
    return this.makeRequest<DiditSessionDecision>(`/session/${sessionId}/decision/`, {
      method: 'GET'
    });
  }

  /**
   * Cancelar sesión de verificación
   */
  async cancelSession(sessionId: string): Promise<{ session_id: string; status: string }> {
    return this.makeRequest<{ session_id: string; status: string }>(`/session/${sessionId}/cancel/`, {
      method: 'POST'
    });
  }

  /**
   * Actualizar estado de sesión (para casos especiales)
   */
  async updateSessionStatus(sessionId: string, newStatus: 'Approved' | 'Declined', comment?: string): Promise<{ session_id: string }> {
    const payload = {
      new_status: newStatus,
      ...(comment && { comment })
    };

    return this.makeRequest<{ session_id: string }>(`/session/${sessionId}/update-status/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Realizar petición HTTP con reintentos y manejo de errores
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit & { retryCount?: number } = {}
  ): Promise<T> {
    const { retryCount = 0, ...requestOptions } = options;
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...getDiditHeaders(),
      ...requestOptions.headers
    };

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers,
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejo específico de errores según documentación
        let errorMessage = 'Error en API de Didit';
        let shouldRetry = false;

        switch (response.status) {
          case 400:
            errorMessage = errorData.detail || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'API Key inválida';
            break;
          case 403:
            errorMessage = 'Sin permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 429:
            errorMessage = 'Límite de solicitudes excedido';
            shouldRetry = true;
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Error temporal del servidor';
            shouldRetry = true;
            break;
          default:
            errorMessage = `Error HTTP ${response.status}`;
        }

        // Reintentar si es apropiado
        if (shouldRetry && retryCount < DIDIT_DOCTOR_CONFIG.retryConfig.maxRetries) {
          const delay = DIDIT_DOCTOR_CONFIG.retryConfig.exponentialBackoff 
            ? DIDIT_DOCTOR_CONFIG.retryConfig.retryDelay * Math.pow(2, retryCount)
            : DIDIT_DOCTOR_CONFIG.retryConfig.retryDelay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.makeRequest<T>(endpoint, {
            ...options,
            retryCount: retryCount + 1
          });
        }

        throw new DiditApiError(errorMessage, response.status, errorData);
      }

      const data = await response.json() as T;
      return data;

    } catch (error) {
      if (error instanceof DiditApiError) {
        throw error;
      }

      // Error de red o timeout
      if (retryCount < DIDIT_DOCTOR_CONFIG.retryConfig.maxRetries) {
        const delay = DIDIT_DOCTOR_CONFIG.retryConfig.exponentialBackoff 
          ? DIDIT_DOCTOR_CONFIG.retryConfig.retryDelay * Math.pow(2, retryCount)
          : DIDIT_DOCTOR_CONFIG.retryConfig.retryDelay;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeRequest<T>(endpoint, {
          ...options,
          retryCount: retryCount + 1
        });
      }

      throw new DiditApiError(
        error instanceof Error ? error.message : 'Error de conexión con Didit',
        undefined,
        { originalError: error }
      );
    }
  }
}

// Instancia singleton del cliente
export const diditApiClient = new DiditApiClient();
