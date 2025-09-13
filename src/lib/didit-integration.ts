/**
 * 🔐 DIDIT INTEGRATION - VERIFICACIÓN DE IDENTIDAD MÉDICA
 * 
 * Integración completa con Didit para verificación de identidad de doctores
 * Cumple con estándares médicos y de compliance
 */

import { z } from 'zod';

// ===========================================
// TIPOS Y ESQUEMAS DE VALIDACIÓN
// ===========================================

export const DiditVerificationSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  doctorId: z.string().uuid(),
  verificationType: z.enum(['id_verification', 'face_match', 'liveness', 'aml_screening']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'rejected']),
  results: z.object({
    idVerification: z.object({
      status: z.enum(['verified', 'failed', 'pending']),
      confidence: z.number().min(0).max(100),
      documentType: z.string(),
      documentNumber: z.string(),
      extractedData: z.record(z.any())
    }).optional(),
    faceMatch: z.object({
      status: z.enum(['match', 'no_match', 'pending']),
      confidence: z.number().min(0).max(100),
      similarity: z.number().min(0).max(100)
    }).optional(),
    liveness: z.object({
      status: z.enum(['live', 'spoof', 'pending']),
      confidence: z.number().min(0).max(100),
      spoofType: z.string().optional()
    }).optional(),
    amlScreening: z.object({
      status: z.enum(['clear', 'hit', 'pending']),
      riskLevel: z.enum(['low', 'medium', 'high']),
      matches: z.array(z.object({
        type: z.string(),
        description: z.string(),
        riskScore: z.number()
      }))
    }).optional()
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime()
});

export type DiditVerification = z.infer<typeof DiditVerificationSchema>;

export interface DiditConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
  timeout: number;
}

export interface DoctorVerificationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
  documentImage?: File;
  selfieImage?: File;
}

// ===========================================
// CLASE PRINCIPAL DE INTEGRACIÓN DIDIT
// ===========================================

export class DiditIntegration {
  private config: DiditConfig;
  private baseHeaders: Record<string, string>;

  constructor(config: DiditConfig) {
    this.config = config;
    this.baseHeaders = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Platform-Medicos/1.0'
    };
  }

  /**
   * Crear sesión de verificación para doctor
   */
  async createVerificationSession(doctorData: DoctorVerificationData): Promise<{
    sessionId: string;
    verificationUrl: string;
    expiresAt: string;
  }> {
    try {
      const sessionData = {
        workflow: {
          steps: [
            {
              type: 'id_verification',
              config: {
                document_types: [doctorData.documentType],
                country: 'MX', // México por defecto
                require_liveness: true,
                require_face_match: true
              }
            },
            {
              type: 'aml_screening',
              config: {
                databases: ['pep', 'sanctions', 'adverse_media'],
                risk_threshold: 'medium'
              }
            }
          ]
        },
        metadata: {
          doctor_id: doctorData.licenseNumber,
          specialty: doctorData.specialty,
          verification_type: 'doctor_registration'
        },
        expires_in: 3600, // 1 hora
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register/doctor/verify`,
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/didit`
      };

      const response = await fetch(`${this.config.baseUrl}/v2/sessions`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify(sessionData),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Didit API Error: ${error.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      return {
        sessionId: result.session_id,
        verificationUrl: result.verification_url,
        expiresAt: result.expires_at
      };

    } catch (error) {
      console.error('Error creating Didit verification session:', error);
      throw new Error(`Failed to create verification session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtener estado de verificación
   */
  async getVerificationStatus(sessionId: string): Promise<DiditVerification> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v2/sessions/${sessionId}`, {
        method: 'GET',
        headers: this.baseHeaders,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Didit API Error: ${error.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return DiditVerificationSchema.parse(result);

    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new Error(`Failed to get verification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Procesar webhook de Didit
   */
  async processWebhook(payload: any, signature: string): Promise<{
    sessionId: string;
    status: string;
    results: any;
  }> {
    try {
      // Verificar firma del webhook
      const isValidSignature = await this.verifyWebhookSignature(payload, signature);
      if (!isValidSignature) {
        throw new Error('Invalid webhook signature');
      }

      const verification = DiditVerificationSchema.parse(payload);
      
      return {
        sessionId: verification.sessionId,
        status: verification.status,
        results: verification.results
      };

    } catch (error) {
      console.error('Error processing Didit webhook:', error);
      throw new Error(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verificar firma del webhook
   */
  private async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    // Implementar verificación de firma HMAC
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Validar resultados de verificación para doctores
   */
  validateDoctorVerification(verification: DiditVerification): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar ID Verification
    if (verification.results.idVerification) {
      const idResult = verification.results.idVerification;
      
      if (idResult.status !== 'verified') {
        errors.push('Documento de identidad no verificado');
      }
      
      if (idResult.confidence < 80) {
        warnings.push('Confianza baja en verificación de documento');
      }
    }

    // Verificar Face Match
    if (verification.results.faceMatch) {
      const faceResult = verification.results.faceMatch;
      
      if (faceResult.status !== 'match') {
        errors.push('No coincide la foto del documento con la selfie');
      }
      
      if (faceResult.similarity < 85) {
        warnings.push('Similitud facial baja');
      }
    }

    // Verificar Liveness
    if (verification.results.liveness) {
      const livenessResult = verification.results.liveness;
      
      if (livenessResult.status !== 'live') {
        errors.push('No se detectó persona real en la selfie');
      }
      
      if (livenessResult.confidence < 90) {
        warnings.push('Confianza baja en detección de vida');
      }
    }

    // Verificar AML Screening
    if (verification.results.amlScreening) {
      const amlResult = verification.results.amlScreening;
      
      if (amlResult.status === 'hit') {
        if (amlResult.riskLevel === 'high') {
          errors.push('Alto riesgo en screening AML');
        } else {
          warnings.push('Riesgo medio en screening AML');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ===========================================
// INSTANCIA SINGLETON
// ===========================================

let diditInstance: DiditIntegration | null = null;

export function getDiditInstance(): DiditIntegration {
  if (!diditInstance) {
    const config: DiditConfig = {
      apiKey: process.env.DIDIT_API_KEY!,
      baseUrl: process.env.DIDIT_BASE_URL || 'https://api.didit.me',
      webhookSecret: process.env.DIDIT_WEBHOOK_SECRET!,
      timeout: 30000 // 30 segundos
    };

    if (!config.apiKey) {
      throw new Error('DIDIT_API_KEY is required');
    }

    diditInstance = new DiditIntegration(config);
  }

  return diditInstance;
}

// ===========================================
// UTILIDADES DE LOGGING MÉDICO
// ===========================================

export function logDiditEvent(event: string, data: any) {
  console.log(`[DIDIT] ${event}:`, {
    timestamp: new Date().toISOString(),
    event,
    data: {
      ...data,
      // No logear datos sensibles
      documentNumber: data.documentNumber ? '***' : undefined,
      email: data.email ? data.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined
    }
  });

  // En producción, enviar a servicio de auditoría
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implementar envío a servicio de auditoría médica
  }
}