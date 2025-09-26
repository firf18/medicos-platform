/**
 * Hook para manejar webhooks de Didit - Platform Médicos Elite
 * 
 * Hook personalizado para integrar webhooks de Didit con el estado de la aplicación
 * siguiendo las mejores prácticas de React y arquitectura limpia
 * 
 * @compliance HIPAA-compliant state management with audit trail
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logging/logger';
import { toast } from '@/hooks/use-toast';
import { registerDiditSession, updateDiditSessionCheck, removeDiditSession, isDiditSessionExpired } from '@/lib/didit/session-cleanup';

// Tipos para el estado del webhook
interface WebhookState {
  sessionId: string | null;
  status: 'idle' | 'listening' | 'processing' | 'completed' | 'error';
  lastUpdate: Date | null;
  verificationData: VerificationData | null;
  error: string | null;
  retryCount: number;
}

interface VerificationData {
  sessionId: string;
  status: string;
  verificationStatus: 'pending' | 'approved' | 'declined' | 'expired';
  documentVerified: boolean;
  identityVerified: boolean;
  livenessVerified: boolean;
  amlCleared: boolean;
  verificationScore: number;
  warnings?: any[];
  reviews?: any[];
  processedAt: string;
}

interface UseDiditWebhookOptions {
  sessionId?: string;
  onStatusUpdate?: (data: VerificationData) => void;
  onError?: (error: string) => void;
  onComplete?: (data: VerificationData) => void;
  pollingInterval?: number; // ms
  maxRetries?: number;
  enablePolling?: boolean;
}

interface UseDiditWebhookReturn {
  webhookState: WebhookState;
  startListening: (sessionId: string) => void;
  stopListening: () => void;
  refreshStatus: () => Promise<void>;
  resetState: () => void;
  isListening: boolean;
  hasError: boolean;
  isCompleted: boolean;
}

/**
 * Hook principal para manejar webhooks de Didit
 */
export function useDiditWebhook(options: UseDiditWebhookOptions = {}): UseDiditWebhookReturn {
  const {
    sessionId: initialSessionId,
    onStatusUpdate,
    onError,
    onComplete,
    pollingInterval = 3000, // 3 segundos
    maxRetries = 5,
    enablePolling = true
  } = options;

  // Estado del webhook
  const [webhookState, setWebhookState] = useState<WebhookState>({
    sessionId: initialSessionId || null,
    status: 'idle',
    lastUpdate: null,
    verificationData: null,
    error: null,
    retryCount: 0
  });

  // Referencias para cleanup
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  /**
   * Actualiza el estado del webhook
   */
  const updateWebhookState = useCallback((updates: Partial<WebhookState>) => {
    setWebhookState(prev => ({
      ...prev,
      ...updates,
      lastUpdate: new Date()
    }));
  }, []);

  /**
   * Función interna para detener el polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    // Remover sesión del tracking si existe
    if (webhookState.sessionId) {
      removeDiditSession(webhookState.sessionId);
    }

    isListeningRef.current = false;
    updateWebhookState({ status: 'idle' });

    logger.info('webhook', 'Stopped listening to webhook', {
      sessionId: webhookState.sessionId
    });
  }, [webhookState.sessionId, updateWebhookState]);

  /**
   * Obtiene el estado actual de la verificación desde la API
   */
  const fetchVerificationStatus = useCallback(async (sessionId: string): Promise<VerificationData | null> => {
    try {
      const response = await fetch(`/api/didit/status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformar datos de la API al formato del hook
      const verificationData: VerificationData = {
        sessionId: data.sessionId,
        status: data.status,
        verificationStatus: mapStatusToVerificationStatus(data.status),
        documentVerified: data.decision?.id_verification?.status === 'Approved',
        identityVerified: data.decision?.face_match?.status === 'match',
        livenessVerified: data.decision?.liveness?.status === 'live',
        amlCleared: data.decision?.aml?.status === 'clear',
        verificationScore: calculateVerificationScore(data.decision),
        warnings: data.decision?.id_verification?.warnings || [],
        reviews: data.decision?.reviews || [],
        processedAt: data.lastUpdated || new Date().toISOString()
      };

      return verificationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      logger.error('webhook', 'Error fetching verification status', {
        error: errorMessage,
        sessionId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, []);

  /**
   * Mapea el estado de Didit al estado de verificación interno
   */
  const mapStatusToVerificationStatus = useCallback((status: string): 'pending' | 'approved' | 'declined' | 'expired' => {
    switch (status) {
      case 'Approved':
        return 'approved';
      case 'Declined':
        return 'declined';
      case 'Abandoned':
        return 'expired';
      default:
        return 'pending';
    }
  }, []);

  /**
   * Calcula el score de verificación basado en los resultados
   */
  const calculateVerificationScore = useCallback((decision: any): number => {
    let score = 0;
    
    if (decision?.id_verification?.status === 'Approved') score += 25;
    if (decision?.liveness?.status === 'live') score += 25;
    if (decision?.face_match?.status === 'match') score += 25;
    if (decision?.aml?.status === 'clear') score += 25;
    
    return score;
  }, []);

  /**
   * Procesa una actualización de estado
   */
  const processStatusUpdate = useCallback(async (sessionId: string) => {
    try {
      updateWebhookState({ status: 'processing' });

      const verificationData = await fetchVerificationStatus(sessionId);
      
      if (!verificationData) {
        throw new Error('No se encontraron datos de verificación');
      }

      updateWebhookState({
        verificationData,
        error: null,
        retryCount: 0
      });

      // Llamar callback de actualización
      if (onStatusUpdate) {
        onStatusUpdate(verificationData);
      }

      // Si está completado, llamar callback de completado
      if (verificationData.verificationStatus === 'approved' || 
          verificationData.verificationStatus === 'declined') {
        updateWebhookState({ status: 'completed' });
        
        if (onComplete) {
          onComplete(verificationData);
        }

        // Mostrar toast de completado
        toast({
          title: verificationData.verificationStatus === 'approved' 
            ? 'Verificación completada exitosamente' 
            : 'Verificación declinada',
          description: verificationData.verificationStatus === 'approved'
            ? 'Tu identidad ha sido verificada correctamente'
            : 'La verificación no pudo ser completada',
          variant: verificationData.verificationStatus === 'approved' ? 'default' : 'destructive'
        });

        // Detener polling si está completado
        stopPolling();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Manejo específico para sesiones expiradas o no encontradas (404)
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        logger.warn('webhook', 'Sesión expirada o no encontrada, deteniendo polling', {
          sessionId,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });

        updateWebhookState({ 
          status: 'error',
          error: 'Sesión de verificación no encontrada. Puede haber expirado o no existir.',
          retryCount: maxRetries // Marcar como máximo para evitar más reintentos
        });

        // Detener polling inmediatamente para sesiones expiradas
        stopPolling();

        // Mostrar mensaje específico para sesiones expiradas
        toast({
          title: 'Sesión expirada',
          description: 'La sesión de verificación ha expirado. Por favor, inicie una nueva verificación.',
          variant: 'destructive'
        });

        // Llamar callback de error
        if (onError) {
          onError('Sesión de verificación no encontrada. Puede haber expirado o no existir.');
        }

        return; // Salir temprano para sesiones expiradas
      }
      
      updateWebhookState({
        error: errorMessage,
        retryCount: webhookState.retryCount + 1
      });

      logger.error('webhook', 'Error processing status update', {
        error: errorMessage,
        sessionId,
        retryCount: webhookState.retryCount + 1,
        timestamp: new Date().toISOString()
      });

      // Llamar callback de error
      if (onError) {
        onError(errorMessage);
      }

      // Si excede el máximo de reintentos, detener polling
      if (webhookState.retryCount >= maxRetries) {
        updateWebhookState({ status: 'error' });
        stopPolling();
        
        toast({
          title: 'Error de verificación',
          description: 'Se excedió el número máximo de reintentos. Por favor, contacte al soporte.',
          variant: 'destructive'
        });
      }
    }
  }, [webhookState.retryCount, maxRetries, onStatusUpdate, onComplete, onError, updateWebhookState, fetchVerificationStatus]);

  /**
   * Inicia el polling para una sesión específica
   */
  const startListening = useCallback((sessionId: string) => {
    if (isListeningRef.current) {
      logger.warn('webhook', 'Already listening to webhook', { sessionId });
      return;
    }

    // Verificar si la sesión ya está expirada antes de iniciar
    if (isDiditSessionExpired(sessionId)) {
      logger.warn('webhook', 'Sesión expirada antes de iniciar polling', { sessionId });
      updateWebhookState({
        sessionId,
        status: 'error',
        error: 'Sesión de verificación expirada',
        retryCount: maxRetries
      });
      return;
    }

    // Registrar sesión para tracking
    registerDiditSession(sessionId);

    updateWebhookState({
      sessionId,
      status: 'listening',
      error: null,
      retryCount: 0
    });

    isListeningRef.current = true;

    // Procesar inmediatamente
    processStatusUpdate(sessionId);

    // Configurar polling si está habilitado
    if (enablePolling) {
      pollingRef.current = setInterval(() => {
        if (isListeningRef.current && webhookState.status !== 'completed' && webhookState.status !== 'error') {
          // Verificar si la sesión ha expirado antes de hacer polling
          if (isDiditSessionExpired(sessionId)) {
            logger.warn('webhook', 'Sesión expirada durante polling, deteniendo', { sessionId });
            stopPolling();
            return;
          }
          
          // Actualizar último check
          updateDiditSessionCheck(sessionId);
          processStatusUpdate(sessionId);
        }
      }, pollingInterval);
    }

    logger.info('webhook', 'Started listening to webhook', {
      sessionId,
      pollingInterval,
      enablePolling
    });
  }, [enablePolling, pollingInterval, processStatusUpdate, updateWebhookState, webhookState.status, maxRetries, stopPolling]);

  /**
   * Detiene el polling
   */
  const stopListening = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  /**
   * Refresca el estado manualmente
   */
  const refreshStatus = useCallback(async () => {
    if (!webhookState.sessionId) {
      throw new Error('No hay sesión activa para refrescar');
    }

    await processStatusUpdate(webhookState.sessionId);
  }, [webhookState.sessionId, processStatusUpdate]);

  /**
   * Resetea el estado del webhook
   */
  const resetState = useCallback(() => {
    stopListening();
    updateWebhookState({
      sessionId: null,
      status: 'idle',
      lastUpdate: null,
      verificationData: null,
      error: null,
      retryCount: 0
    });
  }, [stopListening, updateWebhookState]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Iniciar automáticamente si se proporciona sessionId inicial
  useEffect(() => {
    if (initialSessionId && webhookState.status === 'idle') {
      startListening(initialSessionId);
    }
  }, [initialSessionId, startListening, webhookState.status]);

  // Estados derivados
  const isListening = webhookState.status === 'listening' || webhookState.status === 'processing';
  const hasError = webhookState.status === 'error' || !!webhookState.error;
  const isCompleted = webhookState.status === 'completed';

  return {
    webhookState,
    startListening,
    stopListening,
    refreshStatus,
    resetState,
    isListening,
    hasError,
    isCompleted
  };
}

/**
 * Hook simplificado para casos de uso básicos
 */
export function useDiditWebhookSimple(sessionId?: string) {
  const [status, setStatus] = useState<string>('idle');
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { webhookState, startListening, stopListening } = useDiditWebhook({
    sessionId,
    onStatusUpdate: (data) => {
      setVerificationData(data);
      setStatus(data.verificationStatus);
    },
    onError: (err) => {
      setError(err);
      setStatus('error');
    },
    onComplete: (data) => {
      setVerificationData(data);
      setStatus(data.verificationStatus);
    }
  });

  return {
    status,
    verificationData,
    error,
    startListening,
    stopListening,
    isListening: webhookState.status === 'listening',
    isCompleted: webhookState.status === 'completed'
  };
}

export default useDiditWebhook;
