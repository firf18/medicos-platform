/**
 * Didit Webhook Database Service - Platform Médicos Elite
 * 
 * Servicio para integrar webhooks de Didit con la base de datos
 * siguiendo las mejores prácticas de arquitectura limpia
 * 
 * @compliance HIPAA-compliant data processing with full audit trail
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Solo crear cliente si las variables están configuradas
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  // Endurecer: fallar explícitamente en ausencia de configuración
  console.warn('Supabase no configurado para webhook service');
}

// Tipos para la base de datos
interface VerificationSession {
  id: string;
  session_id: string;
  user_id: string;
  status: string;
  workflow_id?: string;
  vendor_data?: string;
  metadata?: Record<string, any>;
  decision?: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

interface VerificationResult {
  session_id: string;
  verification_status: 'pending' | 'approved' | 'declined' | 'expired';
  id_verification_status?: string;
  document_type?: string;
  document_number?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  warnings?: any[];
  reviews?: any[];
  processed_at: string;
}

interface DoctorVerification {
  doctor_id: string;
  verification_id: string;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  document_verified: boolean;
  identity_verified: boolean;
  liveness_verified: boolean;
  aml_cleared: boolean;
  verification_score: number;
  verified_at?: string;
  expires_at?: string;
}

/**
 * Servicio principal para manejar webhooks de Didit
 */
export class DiditWebhookService {
  
  /**
   * Actualiza o crea una sesión de verificación
   */
  async upsertVerificationSession(sessionData: {
    session_id: string;
    user_id: string;
    status: string;
    workflow_id?: string;
    vendor_data?: string;
    metadata?: Record<string, any>;
    decision?: Record<string, any>;
  }): Promise<VerificationSession> {
    try {
      // Si Supabase no está configurado, fallar para no ocultar errores
      if (!supabase) {
        throw new Error('Supabase no configurado para webhook service');
      }

      const { data, error } = await supabase
        .from('verification_sessions')
        .upsert({
          session_id: sessionData.session_id,
          user_id: sessionData.user_id,
          status: sessionData.status,
          workflow_id: sessionData.workflow_id,
          vendor_data: sessionData.vendor_data,
          metadata: sessionData.metadata,
          decision: sessionData.decision,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        })
        .select()
        .single();

      if (error) {
        logger.error('webhook', 'Error upserting verification session', {
          error: error.message,
          sessionId: sessionData.session_id
        });
        throw error;
      }

      logger.info('webhook', 'Verification session upserted', {
        sessionId: sessionData.session_id,
        status: sessionData.status
      });

      return data;
    } catch (error) {
      logger.error('webhook', 'Failed to upsert verification session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: sessionData.session_id
      });
      throw error;
    }
  }

  /**
   * Procesa resultados de verificación de identidad
   */
  async processIdVerificationResults(
    sessionId: string,
    idVerification: any,
    status: string
  ): Promise<VerificationResult> {
    try {
      if (!supabase) {
        throw new Error('Supabase no configurado para webhook service');
      }

      const {
        status: verificationStatus,
        document_type,
        document_number,
        first_name,
        last_name,
        date_of_birth,
        nationality,
        warnings
      } = idVerification;

      // Determinar estado de verificación
      let verificationStatusDb: 'pending' | 'approved' | 'declined' | 'expired';
      if (status === 'Approved' && verificationStatus === 'Approved') {
        verificationStatusDb = 'approved';
      } else if (status === 'Declined' || verificationStatus === 'Declined') {
        verificationStatusDb = 'declined';
      } else {
        verificationStatusDb = 'pending';
      }

      const verificationResult: VerificationResult = {
        session_id: sessionId,
        verification_status: verificationStatusDb,
        id_verification_status: verificationStatus,
        document_type,
        document_number: document_number?.substring(0, 4) + '****', // Masked for security
        first_name,
        last_name,
        date_of_birth,
        nationality,
        warnings,
        processed_at: new Date().toISOString()
      };

      // Guardar resultados en la base de datos
      const { data, error } = await supabase
        .from('verification_results')
        .upsert({
          session_id: sessionId,
          verification_status: verificationStatusDb,
          id_verification_status: verificationStatus,
          document_type,
          document_number: document_number?.substring(0, 4) + '****',
          first_name,
          last_name,
          date_of_birth,
          nationality,
          warnings,
          processed_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        })
        .select()
        .single();

      if (error) {
        logger.error('webhook', 'Error saving verification results', {
          error: error.message,
          sessionId
        });
        throw error;
      }

      logger.info('webhook', 'ID verification results processed', {
        sessionId,
        verificationStatus: verificationStatusDb,
        documentType: document_type,
        hasWarnings: !!warnings?.length
      });

      // Log de auditoría
      logSecurityEvent('id_verification_results_saved', {
        sessionId,
        verificationStatus: verificationStatusDb,
        documentType: document_type,
        hasWarnings: !!warnings?.length,
        timestamp: new Date().toISOString()
      });

      return verificationResult;
    } catch (error) {
      logger.error('webhook', 'Failed to process ID verification results', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      throw error;
    }
  }

  /**
   * Actualiza el estado de verificación del médico
   */
  async updateDoctorVerificationStatus(
    doctorId: string,
    verificationData: {
      verification_id: string;
      verification_status: 'pending' | 'verified' | 'failed' | 'expired';
      document_verified: boolean;
      identity_verified: boolean;
      liveness_verified: boolean;
      aml_cleared: boolean;
      verification_score: number;
      verified_at?: string;
      expires_at?: string;
    }
  ): Promise<DoctorVerification> {
    try {
      const { data, error } = await supabase
        .from('doctor_verifications')
        .upsert({
          doctor_id: doctorId,
          verification_id: verificationData.verification_id,
          verification_status: verificationData.verification_status,
          document_verified: verificationData.document_verified,
          identity_verified: verificationData.identity_verified,
          liveness_verified: verificationData.liveness_verified,
          aml_cleared: verificationData.aml_cleared,
          verification_score: verificationData.verification_score,
          verified_at: verificationData.verified_at,
          expires_at: verificationData.expires_at,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'doctor_id'
        })
        .select()
        .single();

      if (error) {
        logger.error('webhook', 'Error updating doctor verification', {
          error: error.message,
          doctorId,
          verificationStatus: verificationData.verification_status
        });
        throw error;
      }

      logger.info('webhook', 'Doctor verification status updated', {
        doctorId,
        verificationStatus: verificationData.verification_status,
        verificationScore: verificationData.verification_score
      });

      // Log de auditoría
      logSecurityEvent('doctor_verification_updated', {
        doctorId,
        verificationStatus: verificationData.verification_status,
        verificationScore: verificationData.verification_score,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      logger.error('webhook', 'Failed to update doctor verification status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        doctorId
      });
      throw error;
    }
  }

  /**
   * Obtiene el estado actual de una sesión de verificación
   */
  async getVerificationSession(sessionId: string): Promise<VerificationSession | null> {
    try {
      const { data, error } = await supabase
        .from('verification_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró la sesión
          return null;
        }
        logger.error('webhook', 'Error fetching verification session', {
          error: error.message,
          sessionId
        });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('webhook', 'Failed to fetch verification session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      throw error;
    }
  }

  /**
   * Obtiene resultados de verificación
   */
  async getVerificationResults(sessionId: string): Promise<VerificationResult | null> {
    try {
      const { data, error } = await supabase
        .from('verification_results')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontraron resultados
          return null;
        }
        logger.error('webhook', 'Error fetching verification results', {
          error: error.message,
          sessionId
        });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('webhook', 'Failed to fetch verification results', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      throw error;
    }
  }

  /**
   * Procesa reviews de verificación
   */
  async processVerificationReviews(
    sessionId: string,
    reviews: any[]
  ): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase no configurado para webhook service');
      }

      for (const review of reviews) {
        const { user, new_status, comment, created_at } = review;

        // Guardar review en la base de datos
        const { error } = await supabase
          .from('verification_reviews')
          .insert({
            session_id: sessionId,
            reviewer: user,
            new_status,
            comment,
            created_at,
            processed_at: new Date().toISOString()
          });

        if (error) {
          logger.error('webhook', 'Error saving verification review', {
            error: error.message,
            sessionId,
            reviewer: user
          });
          throw error;
        }

        logger.info('webhook', 'Verification review processed', {
          sessionId,
          reviewer: user,
          newStatus: new_status,
          hasComment: !!comment
        });

        // Log de auditoría
        logSecurityEvent('verification_review_saved', {
          sessionId,
          reviewer: user,
          newStatus: new_status,
          hasComment: !!comment,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('webhook', 'Failed to process verification reviews', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      throw error;
    }
  }

  /**
   * Calcula el score de verificación basado en los resultados
   */
  calculateVerificationScore(decision: any): number {
    let score = 0;
    
    // Verificación de documento (25 puntos)
    if (decision.id_verification?.status === 'Approved') {
      score += 25;
    }
    
    // Verificación de vida (25 puntos)
    if (decision.liveness?.status === 'live') {
      score += 25;
    }
    
    // Reconocimiento facial (25 puntos)
    if (decision.face_match?.status === 'match') {
      score += 25;
    }
    
    // Screening AML (25 puntos)
    if (decision.aml?.status === 'clear') {
      score += 25;
    }
    
    return score;
  }

  /**
   * Determina si la verificación es exitosa
   */
  isVerificationSuccessful(decision: any): boolean {
    const score = this.calculateVerificationScore(decision);
    return score >= 75; // Mínimo 75% para considerar exitosa
  }
}

// Instancia singleton del servicio
export const diditWebhookService = new DiditWebhookService();
