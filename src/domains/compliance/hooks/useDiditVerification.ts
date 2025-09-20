/**
 * Didit Verification Hook - Refactored
 * @fileoverview Professional hook for Didit identity verification using modular services
 * @compliance HIPAA-compliant identity verification with audit trail
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import type { VenezuelanDoctorData } from '@/lib/didit-integration';
import {
  VerificationState,
  VerificationSummary,
  SuspiciousActivity,
  UseDiditVerificationOptions,
  UseDiditVerificationReturn,
  VerificationMetrics,
  VERIFICATION_STATUS,
  SUSPICIOUS_ACTIVITY_TYPES,
  DEFAULT_CONFIG
} from '../types/didit-verification.types';
import {
  createVerificationSession,
  checkVerificationStatus,
  cancelVerificationSession,
  getVerificationResult,
  reportSuspiciousActivity,
  validateDoctorData,
  calculateProgress,
  getStatusMessage,
  canRetryVerification,
  calculateEstimatedTime,
  createVerificationError,
  parseVerificationSummary
} from '../services/didit-verification.service';

export const useDiditVerification = (
  options: UseDiditVerificationOptions = {}
): UseDiditVerificationReturn => {
  // Extract options with defaults
  const {
    onVerificationComplete,
    onVerificationError,
    onStatusChange,
    autoRetry = false,
    maxRetries = DEFAULT_CONFIG.MAX_RETRIES,
    enablePolling = true,
    pollingInterval = DEFAULT_CONFIG.POLLING_INTERVAL,
    maxPollingTime = DEFAULT_CONFIG.MAX_POLLING_TIME,
    customWorkflowId,
    customCallbackUrl
  } = options;

  // Main verification state
  const [state, setState] = useState<VerificationState>({
    status: 'idle',
    sessionId: null,
    sessionNumber: null,
    verificationUrl: null,
    decision: null,
    verificationSummary: null,
    error: null,
    lastError: null,
    retryCount: 0,
    suspiciousActivities: [],
    progress: 0,
    startedAt: null,
    completedAt: null,
    estimatedTimeRemaining: null,
    autoRetry,
    maxRetries
  });

  // Refs for cleanup and polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<Date | null>(null);
  const suspiciousActivityCountRef = useRef<number>(0);

  // Derived states for UI
  const derivedStates = useMemo(() => ({
    isIdle: state.status === 'idle',
    isInitiating: state.status === 'initiating',
    isSessionCreated: state.status === 'session_created',
    isUserVerifying: state.status === 'user_verifying',
    isProcessing: state.status === 'processing',
    isCompleted: state.status === 'completed',
    isFailed: state.status === 'failed',
    isExpired: state.status === 'expired',
    hasError: !!state.error
  }), [state.status, state.error]);

  /**
   * Update state with status change notification
   */
  const updateState = useCallback((updates: Partial<VerificationState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Notify status change if status changed
      if (updates.status && updates.status !== prev.status) {
        onStatusChange?.(updates.status, updates);
      }

      return newState;
    });
  }, [onStatusChange]);

  /**
   * Start polling for verification status
   */
  const startPolling = useCallback((sessionId: string) => {
    if (!enablePolling) return;

    pollingStartTimeRef.current = new Date();
    
    const poll = async () => {
      try {
        // Check if we've exceeded max polling time
        if (pollingStartTimeRef.current && 
            Date.now() - pollingStartTimeRef.current.getTime() > maxPollingTime) {
          stopPolling();
          updateState({
            status: 'expired',
            error: 'Tiempo de verificación agotado',
            completedAt: new Date()
          });
          return;
        }

        const statusResult = await checkVerificationStatus(sessionId);
        
        // Update progress
        const progress = calculateProgress(
          statusResult.status,
          statusResult.summary?.completedChecks
        );

        updateState({
          progress,
          estimatedTimeRemaining: calculateEstimatedTime(
            statusResult.status,
            state.startedAt
          )
        });

        // Handle status changes
        if (statusResult.status === 'completed' && statusResult.decision) {
          stopPolling();
          
          const summary = statusResult.summary || parseVerificationSummary(statusResult.decision);
          
          updateState({
            status: 'completed',
            decision: statusResult.decision,
            verificationSummary: summary,
            progress: 100,
            completedAt: new Date(),
            estimatedTimeRemaining: null
          });

          onVerificationComplete?.({
            sessionId,
            decision: statusResult.decision,
            summary
          });

          toast({
            title: 'Verificación completada',
            description: summary.isFullyVerified 
              ? 'Identidad verificada exitosamente'
              : 'Verificación completada con advertencias',
            variant: summary.isFullyVerified ? 'default' : 'destructive'
          });

        } else if (statusResult.status === 'failed') {
          stopPolling();
          
          const errorMessage = 'La verificación de identidad falló';
          
          updateState({
            status: 'failed',
            error: errorMessage,
            progress: 100,
            completedAt: new Date(),
            estimatedTimeRemaining: null
          });

          onVerificationError?.(errorMessage, statusResult);

          // Auto-retry if enabled
          if (autoRetry && canRetryVerification('failed', state.retryCount, maxRetries)) {
            setTimeout(() => {
              retryVerification();
            }, 3000);
          }

        } else if (statusResult.status === 'user_verifying') {
          updateState({ status: 'user_verifying' });
        }

      } catch (error) {
        console.error('[DIDIT_HOOK] Polling error:', error);
        
        // Don't stop polling for network errors, just log them
        if (error instanceof Error && !error.message.includes('network')) {
          stopPolling();
          updateState({
            status: 'failed',
            error: 'Error durante la verificación',
            lastError: error as Error,
            completedAt: new Date()
          });
        }
      }
    };

    // Start polling
    pollingIntervalRef.current = setInterval(poll, pollingInterval);
    
    // Initial poll
    poll();
  }, [
    enablePolling,
    maxPollingTime,
    pollingInterval,
    state.startedAt,
    state.retryCount,
    maxRetries,
    autoRetry,
    updateState,
    onVerificationComplete,
    onVerificationError
  ]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingStartTimeRef.current = null;
  }, []);

  /**
   * Start verification process
   */
  const startVerification = useCallback(async (doctorData: VenezuelanDoctorData) => {
    try {
      // Validate doctor data
      const validation = validateDoctorData(doctorData);
      if (!validation.isValid) {
        const errorMessage = `Datos inválidos: ${validation.errors.join(', ')}`;
        updateState({
          status: 'failed',
          error: errorMessage
        });
        onVerificationError?.(errorMessage, validation.errors);
        return;
      }

      // Reset state and start
      updateState({
        status: 'initiating',
        error: null,
        lastError: null,
        progress: 10,
        startedAt: new Date(),
        completedAt: null,
        estimatedTimeRemaining: calculateEstimatedTime('initiating', new Date())
      });

      toast({
        title: 'Iniciando verificación',
        description: 'Creando sesión de verificación de identidad...',
        variant: 'default'
      });

      // Create verification session
      const sessionResult = await createVerificationSession(doctorData, {
        workflowId: customWorkflowId,
        callbackUrl: customCallbackUrl
      });

      updateState({
        status: 'session_created',
        sessionId: sessionResult.sessionId,
        sessionNumber: sessionResult.sessionNumber,
        verificationUrl: sessionResult.verificationUrl,
        progress: 20
      });

      // Open verification URL
      if (sessionResult.verificationUrl) {
        window.open(sessionResult.verificationUrl, '_blank', 'width=800,height=600');
        
        updateState({
          status: 'user_verifying',
          progress: 30
        });

        toast({
          title: 'Verificación iniciada',
          description: 'Complete el proceso en la ventana de Didit que se abrió',
          variant: 'default'
        });

        // Start polling for results
        startPolling(sessionResult.sessionId);
      }

    } catch (error) {
      console.error('[DIDIT_HOOK] Start verification error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error iniciando verificación';
      
      updateState({
        status: 'failed',
        error: errorMessage,
        lastError: error as Error,
        completedAt: new Date()
      });

      onVerificationError?.(errorMessage, error);

      toast({
        title: 'Error de verificación',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [
    updateState,
    onVerificationError,
    customWorkflowId,
    customCallbackUrl,
    startPolling
  ]);

  /**
   * Retry verification
   */
  const retryVerification = useCallback(async () => {
    if (!canRetryVerification(state.status, state.retryCount, maxRetries)) {
      toast({
        title: 'No se puede reintentar',
        description: 'Se alcanzó el límite máximo de reintentos',
        variant: 'destructive'
      });
      return;
    }

    updateState({
      retryCount: state.retryCount + 1,
      error: null,
      lastError: null
    });

    // Note: We need the original doctor data to retry
    // This should be stored or passed again
    toast({
      title: 'Reintentando verificación',
      description: `Intento ${state.retryCount + 1} de ${maxRetries}`,
      variant: 'default'
    });
  }, [state.status, state.retryCount, maxRetries, updateState]);

  /**
   * Cancel verification
   */
  const cancelVerification = useCallback(async () => {
    try {
      stopPolling();

      if (state.sessionId) {
        await cancelVerificationSession(state.sessionId);
      }

      updateState({
        status: 'idle',
        sessionId: null,
        sessionNumber: null,
        verificationUrl: null,
        decision: null,
        verificationSummary: null,
        error: null,
        progress: 0,
        completedAt: new Date()
      });

      toast({
        title: 'Verificación cancelada',
        description: 'El proceso de verificación ha sido cancelado',
        variant: 'default'
      });

    } catch (error) {
      console.error('[DIDIT_HOOK] Cancel verification error:', error);
    }
  }, [state.sessionId, stopPolling, updateState]);

  /**
   * Reset verification state
   */
  const resetVerification = useCallback(() => {
    stopPolling();
    
    setState({
      status: 'idle',
      sessionId: null,
      sessionNumber: null,
      verificationUrl: null,
      decision: null,
      verificationSummary: null,
      error: null,
      lastError: null,
      retryCount: 0,
      suspiciousActivities: [],
      progress: 0,
      startedAt: null,
      completedAt: null,
      estimatedTimeRemaining: null,
      autoRetry,
      maxRetries
    });
  }, [stopPolling, autoRetry, maxRetries]);

  /**
   * Check current status
   */
  const checkStatus = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      const statusResult = await checkVerificationStatus(state.sessionId);
      // Status will be updated through polling
    } catch (error) {
      console.error('[DIDIT_HOOK] Check status error:', error);
    }
  }, [state.sessionId]);

  /**
   * Report suspicious activity
   */
  const reportSuspiciousActivityCallback = useCallback((
    activity: Omit<SuspiciousActivity, 'timestamp'>
  ) => {
    const newActivity: SuspiciousActivity = {
      ...activity,
      timestamp: new Date()
    };

    updateState({
      suspiciousActivities: [...state.suspiciousActivities, newActivity]
    });

    suspiciousActivityCountRef.current++;

    // Report to server if session exists
    if (state.sessionId) {
      reportSuspiciousActivity(state.sessionId, activity).catch(console.error);
    }

    // Check if threshold exceeded
    if (suspiciousActivityCountRef.current >= DEFAULT_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD) {
      updateState({
        status: 'failed',
        error: 'Actividad sospechosa detectada',
        completedAt: new Date()
      });

      onVerificationError?.('Actividad sospechosa detectada', { 
        activityCount: suspiciousActivityCountRef.current 
      });
    }
  }, [state.suspiciousActivities, state.sessionId, updateState, onVerificationError]);

  /**
   * Get verification metrics
   */
  const getVerificationMetrics = useCallback((): VerificationMetrics => {
    const totalTime = state.startedAt && state.completedAt 
      ? state.completedAt.getTime() - state.startedAt.getTime()
      : null;

    return {
      sessionId: state.sessionId,
      totalTime,
      retryCount: state.retryCount,
      suspiciousActivityCount: state.suspiciousActivities.length,
      verificationScore: state.verificationSummary?.verificationScore || null,
      completedChecksCount: state.verificationSummary?.completedChecks.length || 0,
      failedChecksCount: state.verificationSummary?.failedChecks.length || 0,
      status: state.status
    };
  }, [state]);

  /**
   * Utility functions
   */
  const getStatusMessageCallback = useCallback(() => {
    return getStatusMessage(state.status, state.error);
  }, [state.status, state.error]);

  const getProgressPercentage = useCallback(() => {
    return state.progress;
  }, [state.progress]);

  const getTimeElapsed = useCallback((): number | null => {
    if (!state.startedAt) return null;
    const endTime = state.completedAt || new Date();
    return endTime.getTime() - state.startedAt.getTime();
  }, [state.startedAt, state.completedAt]);

  const canRetryCallback = useCallback(() => {
    return canRetryVerification(state.status, state.retryCount, maxRetries);
  }, [state.status, state.retryCount, maxRetries]);

  const getSuspiciousActivities = useCallback(() => {
    return state.suspiciousActivities;
  }, [state.suspiciousActivities]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // State
    state,
    
    // Derived states
    ...derivedStates,
    
    // Actions
    startVerification,
    retryVerification,
    cancelVerification,
    resetVerification,
    checkStatus,
    
    // Utilities
    getStatusMessage: getStatusMessageCallback,
    getProgressPercentage,
    getTimeElapsed,
    canRetry: canRetryCallback,
    
    // Security
    reportSuspiciousActivity: reportSuspiciousActivityCallback,
    getSuspiciousActivities,
    
    // Analytics
    getVerificationMetrics
  };
};
