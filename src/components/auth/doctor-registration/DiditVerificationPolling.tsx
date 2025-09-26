/**
 * Didit Verification Polling Component
 * @fileoverview Handles the polling mechanism for Didit verification status
 * @compliance HIPAA-compliant polling with circuit breaker pattern
 */

'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { VerificationState, CircuitBreakerState } from './types/didit-verification.types';

interface DiditVerificationPollingProps {
  verificationState: VerificationState;
  onUpdateState: (updates: Partial<VerificationState>) => void;
  onVerificationComplete: () => void;
  onVerificationError: (error: string) => void;
}

// Circuit Breaker implementation
const createCircuitBreaker = (): CircuitBreakerState => ({
  failures: 0,
  lastFailureTime: 0,
  isOpen: false
});

const circuitBreaker = createCircuitBreaker();

const DiditVerificationPolling: React.FC<DiditVerificationPollingProps> = ({
  verificationState,
  onUpdateState,
  onVerificationComplete,
  onVerificationError
}) => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionNotFoundCountRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);

  // Map Didit status to internal status and progress
  const mapDiditStatus = useCallback((status: string) => {
    const statusMap: Record<string, { progress: number; internalStatus: VerificationState['status'] }> = {
      'Not Started': { progress: 30, internalStatus: 'user_verifying' },
      'In Progress': { progress: 50, internalStatus: 'user_verifying' },
      'In Review': { progress: 85, internalStatus: 'processing' },
      'Approved': { progress: 100, internalStatus: 'completed' },
      'Declined': { progress: 100, internalStatus: 'failed' },
      'Abandoned': { progress: 100, internalStatus: 'expired' },
      'Expired': { progress: 100, internalStatus: 'expired' },
      'Pending': { progress: 40, internalStatus: 'user_verifying' },
      'Processing': { progress: 60, internalStatus: 'processing' },
      'Completed': { progress: 100, internalStatus: 'completed' },
      'Failed': { progress: 100, internalStatus: 'failed' }
    };
    
    return statusMap[status] || { progress: 25, internalStatus: 'user_verifying' };
  }, []);

  // Validate SessionId
  const validateSessionId = useCallback((sessionId: string): boolean => {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sessionId);
  }, []);

  // Cleanup intervals
  const cleanupIntervals = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    sessionNotFoundCountRef.current = 0;
    consecutiveErrorsRef.current = 0;
  }, []);

  // Start polling
  const startPolling = useCallback((sessionId: string) => {
    console.log('🔄 Iniciando polling para:', sessionId);
    
    if (!validateSessionId(sessionId)) {
      console.error('❌ SessionId inválido para polling:', sessionId);
      cleanupIntervals();
      onUpdateState({
        status: 'failed',
        error: 'ID de sesión inválido'
      });
      return;
    }
    
    const maxErrors = 3;
    const maxSessionNotFound = 10;
    let currentProgress = 25;

    pollingIntervalRef.current = setInterval(async () => {
      // Circuit breaker check
      if (circuitBreaker.isOpen) {
        const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
        if (timeSinceLastFailure > 30000) { // 30 seconds
          circuitBreaker.isOpen = false;
          circuitBreaker.failures = 0;
          console.log('🔄 Circuit breaker cerrado, reanudando requests');
        } else {
          console.log('🔒 Circuit breaker abierto, pausando polling');
          return;
        }
      }

      try {
        onUpdateState({
          pollingCount: verificationState.pollingCount + 1
        });

        const response = await fetch(`/api/didit/status/${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            sessionNotFoundCountRef.current++;
            console.log(`⚠️ Sesión no encontrada (${sessionNotFoundCountRef.current}/${maxSessionNotFound}):`, sessionId);
            
            if (sessionNotFoundCountRef.current >= maxSessionNotFound) {
              console.log('⚠️ Sesión definitivamente no encontrada, marcando como expirada');
              cleanupIntervals();
              onUpdateState({
                status: 'expired',
                error: 'Sesión de verificación no encontrada después de múltiples intentos'
              });
              return;
            }
            
            return; // Continue polling
          }
          
          // Handle other HTTP errors
          consecutiveErrorsRef.current++;
          circuitBreaker.failures++;
          circuitBreaker.lastFailureTime = Date.now();
          if (circuitBreaker.failures >= 5) {
            circuitBreaker.isOpen = true;
          }
          
          console.error(`❌ Error consultando status (${consecutiveErrorsRef.current}/${maxErrors}):`, response.status);
          
          if (consecutiveErrorsRef.current >= maxErrors) {
            cleanupIntervals();
            onUpdateState({
              status: 'failed',
              error: 'Error de conexión durante la verificación'
            });
            return;
          }
          return;
        }

        // Reset error counters on successful response
        consecutiveErrorsRef.current = 0;
        sessionNotFoundCountRef.current = 0;
        circuitBreaker.failures = 0;
        circuitBreaker.isOpen = false;

        const statusData = await response.json();
        console.log('📊 Status recibido:', statusData);

        // Use robust status mapping
        const { progress: newProgress, internalStatus: newStatus } = mapDiditStatus(statusData.status);
        
        // Check if should complete immediately
        const shouldCompleteImmediately = ['In Review', 'Approved', 'Completed'].includes(statusData.status);
        
        if (shouldCompleteImmediately) {
          console.log(`🔄 Estado "${statusData.status}" detectado, completando registro...`);
          
          cleanupIntervals();
          onUpdateState({
            status: 'completed',
            progress: 100,
            diditStatus: statusData.status
          });
          
          // Complete verification
          setTimeout(() => {
            onVerificationComplete();
          }, 1500);
          
          return;
        }
        
        const shouldComplete = ['Declined', 'Abandoned', 'Expired', 'Failed'].includes(statusData.status);

        // Update progress smoothly
        if (newProgress > currentProgress) {
          currentProgress = newProgress;
        }

        console.log('🔄 Actualizando estado:', {
          sessionId,
          diditStatus: statusData.status,
          internalStatus: newStatus,
          progress: `${currentProgress}%`,
          pollingCount: verificationState.pollingCount + 1
        });

        onUpdateState({
          status: newStatus,
          progress: currentProgress,
          diditStatus: statusData.status,
          verificationResults: statusData
        });

        // Handle completion states
        if (shouldComplete) {
          cleanupIntervals();
          
          if (statusData.status === 'Approved' || statusData.status === 'Completed') {
            onVerificationComplete();
          } else {
            const errorMessage = statusData.status === 'Declined' || statusData.status === 'Failed'
              ? 'Verificación rechazada por Didit' 
              : 'Verificación abandonada o expirada';
            
            onUpdateState({
              error: errorMessage
            });
            
            onVerificationError(errorMessage);
          }
        }

      } catch (error) {
        consecutiveErrorsRef.current++;
        circuitBreaker.failures++;
        circuitBreaker.lastFailureTime = Date.now();
        if (circuitBreaker.failures >= 5) {
          circuitBreaker.isOpen = true;
        }
        
        console.error(`❌ Error en polling (${consecutiveErrorsRef.current}/${maxErrors}):`, error);
        
        if (consecutiveErrorsRef.current >= maxErrors) {
          cleanupIntervals();
          onUpdateState({
            status: 'failed',
            error: 'Error de conexión durante la verificación'
          });
        }
      }
    }, 3000); // Poll every 3 seconds

  }, [verificationState.pollingCount, onUpdateState, onVerificationComplete, onVerificationError, cleanupIntervals, mapDiditStatus, validateSessionId]);

  // Start polling when session is created
  useEffect(() => {
    if (verificationState.status === 'session_created' && verificationState.sessionId) {
      startPolling(verificationState.sessionId);
    }
  }, [verificationState.status, verificationState.sessionId, startPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupIntervals();
    };
  }, [cleanupIntervals]);

  // Only show polling indicator when actively polling
  if (!pollingIntervalRef.current || verificationState.status === 'idle') {
    return null;
  }

  return (
    <div className="text-center">
      <Badge variant="outline" className="text-blue-600">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Verificando progreso... (consulta {verificationState.pollingCount})
        {sessionNotFoundCountRef.current > 0 && (
          <span className="ml-2 text-orange-600">
            - Sesión no encontrada: {sessionNotFoundCountRef.current}/10
          </span>
        )}
      </Badge>
      {circuitBreaker.isOpen && (
        <p className="text-xs text-orange-500 mt-1">
          ⚠️ Circuit breaker activo - Pausando requests temporalmente
        </p>
      )}
    </div>
  );
};

export default DiditVerificationPolling;
