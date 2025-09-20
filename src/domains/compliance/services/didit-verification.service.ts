/**
 * Didit Verification Service
 * @fileoverview Service for managing Didit identity verification sessions
 * @compliance HIPAA-compliant identity verification with audit trail
 */

import type { VenezuelanDoctorData, DiditDecision } from '@/lib/didit-integration';
import { 
  VerificationSummary, 
  VerificationResult,
  VerificationError,
  VerificationErrorType,
  SessionConfig,
  DEFAULT_CONFIG
} from '../types/didit-verification.types';

/**
 * Create a new Didit verification session
 */
export const createVerificationSession = async (
  doctorData: VenezuelanDoctorData,
  config?: Partial<SessionConfig>
): Promise<{ sessionId: string; sessionNumber: number; verificationUrl: string }> => {
  try {
    const sessionConfig = {
      workflowId: config?.workflowId || process.env.NEXT_PUBLIC_DIDIT_WORKFLOW_ID || 'default',
      callbackUrl: config?.callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback`,
      expirationTime: config?.expirationTime || DEFAULT_CONFIG.SESSION_TIMEOUT,
      allowedRetries: config?.allowedRetries || DEFAULT_CONFIG.MAX_RETRIES,
      securityLevel: config?.securityLevel || 'high'
    };

    const response = await fetch('/api/didit/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorData,
        config: sessionConfig
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      sessionId: result.sessionId,
      sessionNumber: result.sessionNumber,
      verificationUrl: result.verificationUrl
    };

  } catch (error) {
    console.error('[DIDIT_SERVICE] Failed to create verification session:', error);
    throw createVerificationError(
      'server_error',
      error instanceof Error ? error.message : 'Failed to create verification session'
    );
  }
};

/**
 * Check verification session status
 */
export const checkVerificationStatus = async (
  sessionId: string
): Promise<{ status: string; decision?: DiditDecision; summary?: VerificationSummary }> => {
  try {
    const response = await fetch(`/api/didit/verification-status?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('[DIDIT_SERVICE] Failed to check verification status:', error);
    throw createVerificationError(
      'network_error',
      error instanceof Error ? error.message : 'Failed to check verification status'
    );
  }
};

/**
 * Cancel verification session
 */
export const cancelVerificationSession = async (sessionId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/didit/session/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    console.error('[DIDIT_SERVICE] Failed to cancel verification session:', error);
    throw createVerificationError(
      'server_error',
      error instanceof Error ? error.message : 'Failed to cancel verification session'
    );
  }
};

/**
 * Get verification result details
 */
export const getVerificationResult = async (sessionId: string): Promise<VerificationResult> => {
  try {
    const response = await fetch(`/api/didit/result/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('[DIDIT_SERVICE] Failed to get verification result:', error);
    throw createVerificationError(
      'server_error',
      error instanceof Error ? error.message : 'Failed to get verification result'
    );
  }
};

/**
 * Report suspicious activity
 */
export const reportSuspiciousActivity = async (
  sessionId: string,
  activity: {
    type: string;
    details: Record<string, unknown>;
    severity: 'low' | 'medium' | 'high';
  }
): Promise<void> => {
  try {
    const response = await fetch('/api/didit/security/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        activity: {
          ...activity,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      }),
    });

    if (!response.ok) {
      console.warn('[DIDIT_SERVICE] Failed to report suspicious activity:', response.status);
    }

  } catch (error) {
    console.warn('[DIDIT_SERVICE] Failed to report suspicious activity:', error);
    // Don't throw error for security reporting failures
  }
};

/**
 * Validate doctor data before verification
 */
export const validateDoctorData = (doctorData: VenezuelanDoctorData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (!doctorData.firstName?.trim()) {
    errors.push('Nombre es requerido');
  }

  if (!doctorData.lastName?.trim()) {
    errors.push('Apellido es requerido');
  }

  if (!doctorData.documentNumber?.trim()) {
    errors.push('Número de documento es requerido');
  }

  if (!doctorData.licenseNumber?.trim()) {
    errors.push('Número de matrícula médica es requerido');
  }

  // Document number format validation
  if (doctorData.documentNumber && !/^[VE]-?\d{7,8}$/i.test(doctorData.documentNumber)) {
    errors.push('Formato de documento inválido');
  }

  // License number format validation
  if (doctorData.licenseNumber && !/^\d{4,8}$/.test(doctorData.licenseNumber)) {
    errors.push('Formato de matrícula médica inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate verification progress
 */
export const calculateProgress = (
  status: string,
  completedChecks: string[] = [],
  totalChecks: string[] = ['identity', 'document', 'license', 'biometric', 'liveness']
): number => {
  switch (status) {
    case 'idle':
      return 0;
    case 'initiating':
      return 10;
    case 'session_created':
      return 20;
    case 'user_verifying':
      return 30 + Math.min(50, (completedChecks.length / totalChecks.length) * 50);
    case 'processing':
      return 85;
    case 'completed':
    case 'failed':
    case 'expired':
      return 100;
    default:
      return 0;
  }
};

/**
 * Get status message for UI display
 */
export const getStatusMessage = (status: string, error?: string | null): string => {
  if (error) {
    return `Error: ${error}`;
  }

  const messages: Record<string, string> = {
    idle: 'Listo para iniciar verificación',
    initiating: 'Iniciando proceso de verificación...',
    session_created: 'Sesión creada. Preparando verificación...',
    user_verifying: 'Verificación en progreso. Complete los pasos en Didit.',
    processing: 'Procesando resultados de verificación...',
    completed: 'Verificación completada exitosamente',
    failed: 'Verificación fallida',
    expired: 'Sesión de verificación expirada'
  };

  return messages[status] || `Estado desconocido: ${status}`;
};

/**
 * Check if verification can be retried
 */
export const canRetryVerification = (
  status: string,
  retryCount: number,
  maxRetries: number = DEFAULT_CONFIG.MAX_RETRIES
): boolean => {
  const retryableStatuses = ['failed', 'expired'];
  return retryableStatuses.includes(status) && retryCount < maxRetries;
};

/**
 * Calculate estimated time remaining
 */
export const calculateEstimatedTime = (
  status: string,
  startTime: Date | null,
  averageCompletionTime: number = 180000 // 3 minutes default
): number | null => {
  if (!startTime || status === 'completed' || status === 'failed' || status === 'expired') {
    return null;
  }

  const elapsed = Date.now() - startTime.getTime();
  const remaining = averageCompletionTime - elapsed;

  return Math.max(0, remaining);
};

/**
 * Create verification error
 */
export const createVerificationError = (
  type: VerificationErrorType,
  message: string,
  details?: Record<string, unknown>
): VerificationError => {
  return {
    type,
    message,
    details,
    timestamp: new Date(),
    recoverable: ['network_error', 'server_error', 'rate_limit_exceeded'].includes(type),
    retryAfter: type === 'rate_limit_exceeded' ? 60000 : undefined // 1 minute
  };
};

/**
 * Parse verification summary
 */
export const parseVerificationSummary = (decision: DiditDecision): VerificationSummary => {
  const completedChecks: string[] = [];
  const failedChecks: string[] = [];
  const warnings: string[] = [];

  // Parse decision data to extract verification details
  if (decision.verification_result) {
    Object.entries(decision.verification_result).forEach(([check, result]) => {
      if (result === 'passed' || result === true) {
        completedChecks.push(check);
      } else if (result === 'failed' || result === false) {
        failedChecks.push(check);
      } else if (result === 'warning') {
        warnings.push(check);
      }
    });
  }

  const verificationScore = Math.max(0, Math.min(100, 
    (completedChecks.length / (completedChecks.length + failedChecks.length + warnings.length)) * 100
  ));

  return {
    isFullyVerified: decision.decision === 'approved' && failedChecks.length === 0,
    verificationScore,
    completedChecks,
    failedChecks,
    warnings
  };
};
