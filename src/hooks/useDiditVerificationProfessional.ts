/**
 * 🔐 HOOK PROFESIONAL PARA VERIFICACIÓN DIDIT
 * 
 * Hook avanzado para manejo de verificación de identidad médica
 * con Didit, específicamente diseñado para médicos venezolanos
 * 
 * @version 2.1.0
 * @author Red-Salud Platform Team
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import type { VenezuelanDoctorData, DiditDecision } from '@/lib/didit-integration';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

// Evita importar funciones del servidor en el bundle del cliente
type VerificationSummary = {
  isFullyVerified: boolean;
  verificationScore: number;
  completedChecks: string[];
  failedChecks: string[];
  warnings: string[];
};

interface SuspiciousActivity {
  type: 'multiple_attempts' | 'rapid_attempts' | 'failed_attempts' | 'suspicious_behavior';
  timestamp: Date;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high';
}

interface VerificationState {
  // Estados principales
  status: 'idle' | 'initiating' | 'session_created' | 'user_verifying' | 'processing' | 'completed' | 'failed' | 'expired';
  
  // Datos de sesión
  sessionId: string | null;
  sessionNumber: number | null;
  verificationUrl: string | null;
  
  // Resultados
  decision: DiditDecision | null;
  verificationSummary: VerificationSummary | null;
  
  // Control de errores
  error: string | null;
  lastError: Error | null;
  retryCount: number;
  
  // Actividad sospechosa
  suspiciousActivities: SuspiciousActivity[];
  
  // Progreso y timing
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedTimeRemaining: number | null;
  
  // Configuración
  autoRetry: boolean;
  maxRetries: number;
}

interface UseDiditVerificationOptions {
  // Callbacks
  onVerificationComplete?: (data: { 
    sessionId: string; 
    decision: DiditDecision; 
    summary: VerificationSummary 
  }) => void;
  onVerificationError?: (error: string, details?: unknown) => void;
  onStatusChange?: (status: VerificationState['status'], data?: any) => void;
  
  // Configuración
  autoRetry?: boolean;
  maxRetries?: number;
  customWorkflowId?: string;
  customCallbackUrl?: string;
  
  // Polling para resultados
  enablePolling?: boolean;
  pollingInterval?: number;
  maxPollingTime?: number;
}

interface UseDiditVerificationReturn {
  // Estado
  state: VerificationState;
  
  // Estados derivados para UI
  isIdle: boolean;
  isInitiating: boolean;
  isSessionCreated: boolean;
  isUserVerifying: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isExpired: boolean;
  canProceed: boolean;
  canRetry: boolean;
  
  // Acciones principales
  initiateVerification: (doctorData: VenezuelanDoctorData) => Promise<void>;
  openVerificationWindow: () => void;
  retryVerification: () => Promise<void>;
  cancelVerification: () => void;
  
  // Acciones de control
  checkResults: () => Promise<void>;
  resetVerification: () => void;
  
  // Utilidades
  getStatusMessage: () => string;
  getProgressMessage: () => string;
  getTimeElapsed: () => string;
  getEstimatedTimeRemaining: () => string;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useDiditVerificationProfessional(
  options: UseDiditVerificationOptions = {}
): UseDiditVerificationReturn {
  
  // Configuración por defecto
  const config = useMemo(() => ({
    autoRetry: options.autoRetry ?? true,
    maxRetries: options.maxRetries ?? 3,
    enablePolling: options.enablePolling ?? true,
    pollingInterval: options.pollingInterval ?? 5000, // 5 segundos
    maxPollingTime: options.maxPollingTime ?? 300000, // 5 minutos
    customCallbackUrl: options.customCallbackUrl,
    onVerificationComplete: options.onVerificationComplete,
    onVerificationError: options.onVerificationError,
    onStatusChange: options.onStatusChange,
  }), [
    options.autoRetry,
    options.maxRetries,
    options.enablePolling,
    options.pollingInterval,
    options.maxPollingTime,
    options.customCallbackUrl,
    options.onVerificationComplete,
    options.onVerificationError,
    options.onStatusChange,
  ]);

  // Estado principal
  const [state, setState] = useState<VerificationState>(() => {
    // Intentar cargar estado guardado
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('didit_verification_state');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Solo restaurar si la sesión no ha expirado (30 minutos)
          const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
          if (parsedState.startedAt && new Date(parsedState.startedAt).getTime() > thirtyMinutesAgo) {
            return {
              ...parsedState,
              startedAt: parsedState.startedAt ? new Date(parsedState.startedAt) : null,
              completedAt: parsedState.completedAt ? new Date(parsedState.completedAt) : null,
              lastError: null, // No restaurar errores
              suspiciousActivities: parsedState.suspiciousActivities || []
            };
          } else {
            // Limpiar estado expirado
            localStorage.removeItem('didit_verification_state');
          }
        }
      } catch (error) {
        console.warn('Error cargando estado guardado de verificación:', error);
        // Limpiar estado corrupto
        localStorage.removeItem('didit_verification_state');
      }
    }
    
    // Estado por defecto
    return {
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
      autoRetry: config.autoRetry,
      maxRetries: config.maxRetries
    };
  });

  // Referencias para cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const verificationWindowRef = useRef<Window | null>(null);
  const doctorDataRef = useRef<VenezuelanDoctorData | null>(null);

  // Estados derivados
  const isIdle = state.status === 'idle';
  const isInitiating = state.status === 'initiating';
  const isSessionCreated = state.status === 'session_created';
  const isUserVerifying = state.status === 'user_verifying';
  const isProcessing = state.status === 'processing';
  const isCompleted = state.status === 'completed';
  const isFailed = state.status === 'failed';
  const isExpired = state.status === 'expired';
  const canProceed = isCompleted && state.verificationSummary?.isFullyVerified;
  const canRetry = (isFailed || isExpired) && state.retryCount < state.maxRetries;

  // Actualiza el estado de forma segura
  const updateState = useCallback((updates: Partial<VerificationState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Guardar estado en localStorage (excepto errores y objetos complejos)
      if (typeof window !== 'undefined') {
        try {
          const stateToSave = {
            ...newState,
            // Convertir fechas a strings para JSON
            startedAt: newState.startedAt?.toISOString() || null,
            completedAt: newState.completedAt?.toISOString() || null,
            // No guardar objetos complejos
            lastError: null,
            decision: null,
            verificationSummary: null
          };
          localStorage.setItem('didit_verification_state', JSON.stringify(stateToSave));
        } catch (error) {
          console.warn('Error guardando estado de verificación:', error);
        }
      }
      
      // Notificar cambio de estado si hay callback
      if (updates.status && updates.status !== prev.status) {
        config.onStatusChange?.(updates.status, updates);
      }
      
      return newState;
    });
  }, [config.onStatusChange]);

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Registra eventos de seguridad para auditoría
   */
  const logSecurityEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    const securityEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      data,
      severity: 'info' as const,
      source: 'didit_verification'
    };
    
    console.log('[SECURITY] Didit Verification:', securityEvent);
    
    // En producción, enviar a servicio de auditoría
    if (process.env.NODE_ENV === 'production') {
      // Implementar envío a servicio de auditoría
    }
  }, []);

  /**
   * Registra actividad sospechosa
   */
  const logSuspiciousActivity = useCallback((activity: Omit<SuspiciousActivity, 'timestamp'>) => {
    const suspiciousActivity: SuspiciousActivity = {
      ...activity,
      timestamp: new Date()
    };
    
    updateState({
      suspiciousActivities: [...state.suspiciousActivities, suspiciousActivity]
    } as Partial<VerificationState>);
    
    // Registrar en logs de seguridad
    logSecurityEvent('suspicious_activity_detected', {
      type: activity.type,
      severity: activity.severity,
      details: activity.details
    });
    
    // Si la actividad es de alta severidad, notificar
    if (activity.severity === 'high') {
      toast({
        title: 'Actividad sospechosa detectada',
        description: 'Se ha detectado actividad inusual en el proceso de verificación. Nuestro equipo de seguridad ha sido notificado.',
        variant: 'destructive'
      });
    }
  }, [state.suspiciousActivities, logSecurityEvent, updateState]);

  /**
   * Convierte mensajes de error técnicos en mensajes user-friendly
   */
  const getFriendlyErrorMessage = useCallback((errorMessage: string): string => {
    const errorMap: Record<string, string> = {
      'Failed to fetch': 'No se pudo conectar con el servicio de verificación. Verifica tu conexión a internet.',
      'NetworkError': 'Error de red. Verifica tu conexión a internet.',
      'Timeout': 'La solicitud ha excedido el tiempo límite. Inténtalo nuevamente.',
      'Invalid API key': 'Error de autenticación. Contacta al soporte técnico.',
      'Workflow not found': 'Error de configuración. Contacta al soporte técnico.',
      'User denied popup': 'Ventana de verificación bloqueada. Habilita los popups e inténtalo nuevamente.',
      'Popup blocked': 'Ventana de verificación bloqueada. Habilita los popups e inténtalo nuevamente.',
      'Session expired': 'La sesión de verificación ha expirado',
      'Verification declined': 'La verificación fue rechazada. Verifica que los datos sean correctos y vuelve a intentarlo.',
      'Verification in review': 'La verificación requiere revisión manual. Te notificaremos cuando esté lista.',
      'Rate limit exceeded': 'Demasiadas solicitudes. Espera unos minutos e inténtalo nuevamente.',
      'default': 'Ocurrió un error durante la verificación. Inténtalo nuevamente o contacta al soporte.'
    };

    // Buscar mensaje específico
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // Si es un error de Didit específico
    if (errorMessage.includes('Didit')) {
      return `Error de verificación: ${errorMessage}`;
    }

    // Mensaje por defecto
    return errorMap.default;
  }, []);

  // Definida más arriba para evitar problemas de orden de declaración.

  /**
   * Maneja errores de forma consistente
   */
  const handleError = useCallback((error: Error | string, details?: unknown) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    
    console.error('❌ Error en verificación Didit:', errorMessage, details);
    
    // Registrar error en logs de seguridad
    logSecurityEvent('verification_error', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      details: details || {}
    });
    
    updateState({
      status: 'failed',
      error: errorMessage,
      lastError: errorObj,
      progress: 0
    });

    // Mostrar toast de error con mensaje más específico
    const userFriendlyMessage = getFriendlyErrorMessage(errorMessage);
    
    toast({
      title: 'Error en Verificación',
      description: userFriendlyMessage,
      variant: 'destructive'
    });

    // Callback de error
    config.onVerificationError?.(errorMessage, details);
  }, [updateState, config.onVerificationError, getFriendlyErrorMessage, logSecurityEvent]);

  /**
   * Limpia recursos (intervals, ventanas, etc.)
   */
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (verificationWindowRef.current && !verificationWindowRef.current.closed) {
      verificationWindowRef.current.close();
      verificationWindowRef.current = null;
    }
  }, []);

  // ============================================================================
  // FUNCIONES PRINCIPALES
  // ============================================================================

  /**
   * Inicia el proceso de verificación
   */
  const initiateVerification = useCallback(async (doctorData: VenezuelanDoctorData) => {
    try {
      // Limpiar estado anterior
      cleanup();
      doctorDataRef.current = doctorData;
      
      updateState({
        status: 'initiating',
        error: null,
        lastError: null,
        progress: 10,
        startedAt: new Date(),
        completedAt: null,
        retryCount: 0
      });

      console.log('🔐 Iniciando verificación Didit para médico:', {
        name: `${doctorData.firstName} ${doctorData.lastName}`,
        license: doctorData.licenseNumber,
        specialty: doctorData.specialty
      });

      // Crear sesión desde el servidor
      const defaultCallback = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/didit/callback` : undefined;
      const res = await fetch('/api/didit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doctorData, callbackUrl: config.customCallbackUrl || defaultCallback }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `No se pudo crear la sesión (${res.status})`);
      }
      const session = await res.json();

      console.log('✅ Sesión Didit creada (server):', session);

      updateState({
        status: 'session_created',
        sessionId: session.session_id,
        sessionNumber: session.session_number,
        verificationUrl: session.verification_url,
        progress: 30,
      });

      // Mostrar toast de éxito
      toast({
        title: 'Sesión de Verificación Creada',
        description: 'Tu sesión de verificación está lista. Haz clic en "Abrir Verificación" para continuar.'
      });

    } catch (error) {
      handleError(error as Error, { doctorData: doctorData.licenseNumber });
    }
  }, [updateState, handleError, cleanup, config.customCallbackUrl]);

  /**
   * Abre la ventana de verificación
   */
  const openVerificationWindow = useCallback(() => {
    if (!state.verificationUrl) {
      handleError('No hay URL de verificación disponible');
      return;
    }

    try {
      // Cerrar ventana anterior si existe
      if (verificationWindowRef.current && !verificationWindowRef.current.closed) {
        verificationWindowRef.current.close();
      }

      // Abrir nueva ventana
      const newWindow = window.open(
        state.verificationUrl,
        'didit-verification',
        'width=900,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no'
      );

      if (!newWindow) {
        throw new Error('No se pudo abrir la ventana de verificación. Verifica que los popups estén habilitados.');
      }

      verificationWindowRef.current = newWindow;

      updateState({
        status: 'user_verifying',
        progress: 50
      });

      // Monitorear la ventana
      const checkWindow = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkWindow);
          console.log('🔔 Ventana de verificación cerrada por el usuario');
          
          updateState({
            status: 'processing',
            progress: 75
          });

          // Iniciar polling para resultados si está habilitado
          if (config.enablePolling && state.sessionId) {
            startPollingForResults();
          }
        }
      }, 1000);

      // Mostrar toast informativo
      toast({
        title: 'Verificación en Proceso',
        description: 'Completa la verificación en la ventana que se abrió. No cierres esta página.'
      });

    } catch (error) {
      handleError(error as Error);
    }
  }, [state.verificationUrl, state.sessionId, updateState, handleError, config.enablePolling]);

  /**
   * Inicia el polling para obtener resultados
   */
  const startPollingForResults = useCallback(() => {
    if (!state.sessionId || pollingIntervalRef.current) return;

    console.log('🔄 Iniciando polling para resultados...');
    
    const startTime = Date.now();
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/didit/verification-status?session_id=${state.sessionId}`);
        if (!res.ok) {
          throw new Error(`status_check_failed_${res.status}`);
        }
        const payload = await res.json();
        const decision: DiditDecision = payload.decision;
        const summary = payload.summary;
        console.log('📊 Resultado de polling:', payload.status);
        
        // Si tenemos resultados finales
        if (['Approved', 'Declined', 'In Review'].includes(decision.status)) {
          cleanup();
          
          updateState({
            status: 'completed',
            decision,
            verificationSummary: summary,
            progress: 100,
            completedAt: new Date()
          });

          // Callback de éxito
          config.onVerificationComplete?.({
            sessionId: state.sessionId!,
            decision,
            summary
          });

          // Toast de resultado
          if (decision.status === 'Approved' && summary.isFullyVerified) {
            toast({
              title: '✅ Verificación Exitosa',
              description: `Tu identidad ha sido verificada correctamente (${summary.verificationScore}% de confianza).`
            });
          } else {
            toast({
              title: '⚠️ Verificación Incompleta',
              description: 'La verificación requiere revisión manual. Te notificaremos cuando esté lista.',
              variant: 'destructive'
            });
          }
        }
        
        // Timeout del polling
        if (Date.now() - startTime > config.maxPollingTime!) {
          cleanup();
          handleError('Tiempo de espera agotado para obtener resultados');
        }
        
      } catch (error) {
        console.warn('⚠️ Error en polling, continuando...', error);
      }
    }, config.pollingInterval);
  }, [state.sessionId, updateState, handleError, cleanup, config]);

  /**
   * Verifica resultados manualmente
   */
  const checkResults = useCallback(async () => {
    if (!state.sessionId) {
      handleError('No hay sesión activa para verificar');
      return;
    }

    try {
      updateState({ status: 'processing', progress: 80 });
      const res = await fetch(`/api/didit/verification-status?session_id=${state.sessionId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `No se pudo obtener estado (${res.status})`);
      }
      const payload = await res.json();
      const decision: DiditDecision = payload.decision;
      const summary = payload.summary;
      
      updateState({
        status: 'completed',
        decision,
        verificationSummary: summary,
        progress: 100,
        completedAt: new Date()
      });

      // Callback de éxito
      config.onVerificationComplete?.({
        sessionId: state.sessionId,
        decision,
        summary
      });

    } catch (error) {
      handleError(error as Error);
    }
  }, [state.sessionId, updateState, handleError, config.onVerificationComplete]);

  /**
   * Reintenta la verificación
   */
  const retryVerification = useCallback(async () => {
    if (!canRetry || !doctorDataRef.current) {
      handleError('No se puede reintentar la verificación');
      return;
    }

    updateState({
      retryCount: state.retryCount + 1,
      error: null,
      lastError: null
    });

    await initiateVerification(doctorDataRef.current);
  }, [canRetry, state.retryCount, updateState, handleError, initiateVerification]);

  /**
   * Cancela la verificación
   */
  const cancelVerification = useCallback(() => {
    cleanup();
    updateState({
      status: 'idle',
      sessionId: null,
      sessionNumber: null,
      verificationUrl: null,
      decision: null,
      verificationSummary: null,
      error: null,
      progress: 0,
      startedAt: null,
      completedAt: null
    });

    toast({
      title: 'Verificación Cancelada',
      description: 'El proceso de verificación ha sido cancelado.'
    });
  }, [cleanup, updateState]);

  /**
   * Resetea completamente la verificación
   */
  const resetVerification = useCallback(() => {
    cleanup();
    doctorDataRef.current = null;
    
    // Limpiar estado guardado
    if (typeof window !== 'undefined') {
      localStorage.removeItem('didit_verification_state');
    }
    
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
      autoRetry: config.autoRetry,
      maxRetries: config.maxRetries
    });
  }, [cleanup, config.autoRetry, config.maxRetries]);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  /**
   * Obtiene mensaje de estado amigable
   */
  const getStatusMessage = useCallback((): string => {
    const messages = {
      idle: 'Listo para iniciar verificación',
      initiating: 'Creando sesión de verificación...',
      session_created: 'Sesión creada. Haz clic para abrir verificación.',
      user_verifying: 'Completa la verificación en la ventana abierta',
      processing: 'Procesando resultados de verificación...',
      completed: state.verificationSummary?.isFullyVerified 
        ? 'Verificación completada exitosamente' 
        : 'Verificación completada con observaciones',
      failed: state.error || 'Error en la verificación',
      expired: 'La sesión de verificación ha expirado'
    };

    return messages[state.status];
  }, [state.status, state.error, state.verificationSummary]);

  /**
   * Obtiene mensaje de progreso detallado
   */
  const getProgressMessage = useCallback((): string => {
    if (state.progress === 0) return 'No iniciado';
    if (state.progress < 30) return 'Iniciando verificación...';
    if (state.progress < 50) return 'Sesión creada, esperando usuario...';
    if (state.progress < 75) return 'Usuario verificando identidad...';
    if (state.progress < 100) return 'Procesando resultados...';
    return 'Verificación completada';
  }, [state.progress]);

  /**
   * Calcula tiempo transcurrido
   */
  const getTimeElapsed = useCallback((): string => {
    if (!state.startedAt) return '0s';
    
    const elapsed = Date.now() - state.startedAt.getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }, [state.startedAt]);

  /**
   * Estima tiempo restante
   */
  const getEstimatedTimeRemaining = useCallback((): string => {
    if (state.progress === 0) return 'Estimando...';
    if (state.progress >= 100) return 'Completado';
    
    // Estimación simple basada en progreso
    const avgTimePerStep = 30; // 30 segundos por paso
    const remainingSteps = Math.ceil((100 - state.progress) / 25);
    const estimatedSeconds = remainingSteps * avgTimePerStep;
    
    if (estimatedSeconds > 60) {
      return `~${Math.ceil(estimatedSeconds / 60)}m`;
    }
    return `~${estimatedSeconds}s`;
  }, [state.progress]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Auto-retry en caso de fallo
  useEffect(() => {
    if (isFailed && state.autoRetry && canRetry && doctorDataRef.current) {
      const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 10000); // Exponential backoff
      
      console.log(`🔄 Auto-retry en ${retryDelay}ms (intento ${state.retryCount + 1}/${state.maxRetries})`);
      
      // Registrar actividad sospechosa si hay muchos reintentos
      if (state.retryCount >= 2) {
        logSuspiciousActivity({
          type: 'multiple_attempts',
          details: { retryCount: state.retryCount, maxRetries: state.maxRetries },
          severity: state.retryCount >= 3 ? 'high' : 'medium'
        });
      }
      
      const timeoutId = setTimeout(() => {
        retryVerification();
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [isFailed, state.autoRetry, canRetry, state.retryCount, state.maxRetries, retryVerification, logSuspiciousActivity]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  return {
    // Estado
    state,
    
    // Estados derivados
    isIdle,
    isInitiating,
    isSessionCreated,
    isUserVerifying,
    isProcessing,
    isCompleted,
    isFailed,
    isExpired,
    canProceed,
    canRetry,
    
    // Acciones principales
    initiateVerification,
    openVerificationWindow,
    retryVerification,
    cancelVerification,
    
    // Acciones de control
    checkResults,
    resetVerification,
    
    // Utilidades
    getStatusMessage,
    getProgressMessage,
    getTimeElapsed,
    getEstimatedTimeRemaining
  };
}

export default useDiditVerificationProfessional;