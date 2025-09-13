/**
 * Hook personalizado para verificación con Didit - Red-Salud
 * 
 * Maneja la integración completa con Didit.me para verificación
 * de identidad de médicos durante el registro.
 */

import { useState, useCallback, useEffect } from 'react';
import { getDiditInstance, DoctorVerificationData, logDiditEvent } from '@/lib/didit-integration';
import { DoctorRegistrationData } from '@/types/medical/specialties';

export interface UseDiditVerificationProps {
  registrationData: DoctorRegistrationData;
  onVerificationComplete: (verificationData: any) => void;
  onVerificationError: (error: string) => void;
}

export interface VerificationState {
  status: 'idle' | 'initiating' | 'pending' | 'processing' | 'completed' | 'failed';
  sessionId: string | null;
  verificationUrl: string | null;
  results: any | null;
  error: string | null;
  progress: number;
}

export function useDiditVerification({
  registrationData,
  onVerificationComplete,
  onVerificationError
}: UseDiditVerificationProps) {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    sessionId: null,
    verificationUrl: null,
    results: null,
    error: null,
    progress: 0
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Iniciar verificación con Didit
  const initiateVerification = useCallback(async () => {
    if (!registrationData.licenseNumber || !registrationData.email) {
      const error = 'Datos de registro incompletos para iniciar verificación';
      setVerificationState(prev => ({ ...prev, status: 'failed', error }));
      onVerificationError(error);
      return;
    }

    setVerificationState(prev => ({ ...prev, status: 'initiating', error: null }));

    try {
      const didit = getDiditInstance();
      
      // Preparar datos para Didit
      const doctorData: DoctorVerificationData = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        licenseNumber: registrationData.licenseNumber,
        specialty: registrationData.specialtyId,
        documentType: 'national_id', // Por defecto para México
        documentNumber: registrationData.licenseNumber
      };

      logDiditEvent('verification_initiation_started', {
        email: registrationData.email,
        licenseNumber: registrationData.licenseNumber
      });

      // Crear sesión de verificación
      const response = await didit.createVerificationSession(doctorData);
      
      setVerificationState(prev => ({
        ...prev,
        status: 'pending',
        sessionId: response.sessionId,
        verificationUrl: response.verificationUrl,
        progress: 10
      }));

      // Iniciar polling para verificar estado
      startPolling(response.sessionId);

      logDiditEvent('verification_session_created', {
        sessionId: response.sessionId,
        verificationUrl: response.verificationUrl
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setVerificationState(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
        progress: 0
      }));

      logDiditEvent('verification_initiation_failed', {
        error: errorMessage,
        email: registrationData.email
      });

      onVerificationError(errorMessage);
    }
  }, [registrationData, onVerificationComplete, onVerificationError]);

  // Polling para verificar estado de verificación
  const startPolling = useCallback((sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const didit = getDiditInstance();
        const status = await didit.getVerificationStatus(sessionId);
        
        setVerificationState(prev => ({
          ...prev,
          status: status.status as VerificationState['status'],
          results: status.results,
          progress: getProgressFromStatus(status.status)
        }));

        logDiditEvent('verification_status_checked', {
          sessionId,
          status: status.status,
          progress: getProgressFromStatus(status.status)
        });

        // Si la verificación está completa o falló, detener polling
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);

          if (status.status === 'completed') {
            // Validar resultados de verificación
            const validation = didit.validateDoctorVerification(status);
            
            if (validation.isValid) {
              setVerificationState(prev => ({
                ...prev,
                status: 'completed',
                progress: 100
              }));

              logDiditEvent('verification_completed_successfully', {
                sessionId,
                results: status.results
              });

              onVerificationComplete(status);
            } else {
              setVerificationState(prev => ({
                ...prev,
                status: 'failed',
                error: `Verificación fallida: ${validation.errors.join(', ')}`,
                progress: 0
              }));

              logDiditEvent('verification_completed_with_errors', {
                sessionId,
                errors: validation.errors,
                warnings: validation.warnings
              });

              onVerificationError(validation.errors.join(', '));
            }
          } else {
            setVerificationState(prev => ({
              ...prev,
              status: 'failed',
              error: 'La verificación de identidad falló',
              progress: 0
            }));

            logDiditEvent('verification_failed', {
              sessionId
            });

            onVerificationError('La verificación de identidad falló');
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        
        logDiditEvent('verification_status_check_failed', {
          sessionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 5000); // Verificar cada 5 segundos

    setPollingInterval(interval);
  }, [onVerificationComplete, onVerificationError]);

  // Función para obtener progreso basado en el estado
  const getProgressFromStatus = (status: string): number => {
    switch (status) {
      case 'initiated': return 20;
      case 'pending_document': return 40;
      case 'processing': return 70;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 10;
    }
  };

  // Función para abrir verificación en nueva ventana
  const openVerificationWindow = useCallback(() => {
    if (verificationState.verificationUrl) {
      const popup = window.open(
        verificationState.verificationUrl,
        'didit-verification',
        'width=600,height=800,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        const error = 'No se pudo abrir la ventana de verificación. Verifica que los popups estén habilitados.';
        setVerificationState(prev => ({ ...prev, error }));
        onVerificationError(error);
      }
    }
  }, [verificationState.verificationUrl, onVerificationError]);

  // Función para reintentar verificación
  const retryVerification = useCallback(() => {
    // Limpiar estado anterior
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    setVerificationState({
      status: 'idle',
      sessionId: null,
      verificationUrl: null,
      results: null,
      error: null,
      progress: 0
    });

    // Reiniciar verificación
    initiateVerification();
  }, [pollingInterval, initiateVerification]);

  // Función para cancelar verificación
  const cancelVerification = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    setVerificationState(prev => ({
      ...prev,
      status: 'idle',
      sessionId: null,
      verificationUrl: null,
      error: null,
      progress: 0
    }));

    logDiditEvent('verification_cancelled', {
      sessionId: verificationState.sessionId
    });
  }, [pollingInterval, verificationState.sessionId]);

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Función para obtener mensaje de estado
  const getStatusMessage = useCallback(() => {
    switch (verificationState.status) {
      case 'idle':
        return 'Inicia la verificación de identidad';
      case 'initiating':
        return 'Preparando verificación...';
      case 'pending':
        return 'Esperando documentos y selfie';
      case 'processing':
        return 'Procesando verificación...';
      case 'completed':
        return 'Verificación completada exitosamente';
      case 'failed':
        return verificationState.error || 'Verificación fallida';
      default:
        return 'Estado desconocido';
    }
  }, [verificationState.status, verificationState.error]);

  // Función para verificar si puede proceder
  const canProceed = verificationState.status === 'completed';

  return {
    // Estado
    verificationState,
    canProceed,
    
    // Funciones
    initiateVerification,
    openVerificationWindow,
    retryVerification,
    cancelVerification,
    getStatusMessage,
    
    // Utilidades
    isIdle: verificationState.status === 'idle',
    isInitiating: verificationState.status === 'initiating',
    isPending: verificationState.status === 'pending',
    isProcessing: verificationState.status === 'processing',
    isCompleted: verificationState.status === 'completed',
    isFailed: verificationState.status === 'failed',
    hasError: !!verificationState.error,
    progress: verificationState.progress
  };
}