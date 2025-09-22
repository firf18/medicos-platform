/**
 * Didit Identity Verification Step - Platform Médicos Elite
 * 
 * Implementación profesional de verificación de identidad con Didit.me
 * siguiendo las mejores prácticas de NextAuth.js y white-label
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Camera, 
  FileText,
  Smartphone,
  Globe,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import DiditErrorBoundary from './DiditErrorBoundary';
import { useDiditWebhook } from '@/hooks/webhooks/useDiditWebhook';

// Tipos para la verificación
interface DiditVerificationState {
  status: 'idle' | 'initiating' | 'session_created' | 'user_verifying' | 'processing' | 'completed' | 'failed' | 'expired';
  sessionId: string | null;
  verificationUrl: string | null;
  progress: number;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  retryCount: number;
}

interface DiditVerificationResult {
  sessionId: string;
  decision: {
    face_match?: { status: string; confidence: number };
    id_verification?: { status: string; confidence: number };
    liveness?: { status: string; confidence: number };
    aml?: { status: string; confidence: number };
  };
  summary: {
    isFullyVerified: boolean;
    verificationScore: number;
    completedChecks: string[];
    failedChecks: string[];
  };
}

interface DiditVerificationStepProps {
  data: any; // Datos del registro médico
  updateData: (data: any) => void;
  onStepComplete: (step: 'identity_verification') => void;
  onStepError: (step: 'identity_verification', error: string) => void;
  isLoading: boolean;
}

export default function DiditVerificationStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}: DiditVerificationStepProps) {
  
  // Estado de verificación
  const [verificationState, setVerificationState] = useState<DiditVerificationState>({
    status: 'idle',
    sessionId: null,
    verificationUrl: null,
    progress: 0,
    error: null,
    startedAt: null,
    completedAt: null,
    retryCount: 0
  });

  const [verificationResult, setVerificationResult] = useState<DiditVerificationResult | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Hook de webhook para manejar actualizaciones en tiempo real
  const { 
    webhookState, 
    startListening, 
    stopListening, 
    isListening: isWebhookListening,
    isCompleted: isWebhookCompleted,
    hasError: hasWebhookError
  } = useDiditWebhook({
    onStatusUpdate: (data) => {
      // Actualizar estado local cuando hay actualizaciones del webhook
      updateVerificationState({
        status: data.verificationStatus === 'approved' ? 'completed' : 
                data.verificationStatus === 'declined' ? 'failed' : 'processing',
        progress: data.verificationScore
      });
    },
    onComplete: (data) => {
      // Procesar completado del webhook
      const result: DiditVerificationResult = {
        sessionId: data.sessionId,
        decision: {
          face_match: { status: data.identityVerified ? 'match' : 'no_match', confidence: data.verificationScore },
          id_verification: { status: data.documentVerified ? 'Approved' : 'Declined', confidence: data.verificationScore },
          liveness: { status: data.livenessVerified ? 'live' : 'not_live', confidence: data.verificationScore },
          aml: { status: data.amlCleared ? 'clear' : 'flagged', confidence: data.verificationScore }
        },
        summary: {
          isFullyVerified: data.verificationStatus === 'approved',
          verificationScore: data.verificationScore,
          completedChecks: getCompletedChecksFromData(data),
          failedChecks: getFailedChecksFromData(data)
        }
      };

      setVerificationResult(result);
      updateVerificationState({
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      });

      // Actualizar datos del registro
      updateData({
        identityVerification: {
          verificationId: data.sessionId,
          status: data.verificationStatus === 'approved' ? 'verified' : 'pending',
          documentType: 'medical_license',
          documentNumber: data.documentNumber || data.sessionId,
          verifiedAt: data.processedAt,
          verificationResults: {
            faceMatch: data.identityVerified,
            documentValid: data.documentVerified,
            livenessCheck: data.livenessVerified,
            amlScreening: data.amlCleared
          }
        }
      });

      onStepComplete('identity_verification');
    },
    onError: (error) => {
      updateVerificationState({
        status: 'failed',
        error: error,
        completedAt: new Date()
      });
      onStepError('identity_verification', error);
    }
  });

  // Estados derivados
  const isIdle = verificationState.status === 'idle';
  const isInitiating = verificationState.status === 'initiating';
  const isSessionCreated = verificationState.status === 'session_created';
  const isUserVerifying = verificationState.status === 'user_verifying';
  const isProcessing = verificationState.status === 'processing';
  const isCompleted = verificationState.status === 'completed';
  const isFailed = verificationState.status === 'failed';
  const isExpired = verificationState.status === 'expired';
  const canRetry = verificationState.retryCount < 3 && (isFailed || isExpired);

  // Función para actualizar el estado
  const updateVerificationState = (updates: Partial<DiditVerificationState>) => {
    setVerificationState(prev => ({ ...prev, ...updates }));
  };

  // Función para iniciar verificación
  const initiateVerification = async () => {
    try {
      updateVerificationState({
        status: 'initiating',
        progress: 10,
        error: null,
        startedAt: new Date()
      });

      toast({
        title: 'Iniciando verificación',
        description: 'Creando sesión de verificación con Didit.me...',
        variant: 'default'
      });

      // Crear sesión de verificación usando el endpoint específico para doctores
      const response = await fetch('/api/didit/doctor-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: data.documentNumber, // Usar cédula como ID único
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth || '1990-01-01', // Valor por defecto si no está disponible
          nationality: 'Venezuelan',
          document_number: data.documentNumber,
          email: data.email,
          phone: data.phone
        }),
      });

      if (!response.ok) {
        let errorData: { error?: string; message?: string; details?: string } = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.warn('No se pudo parsear respuesta de error:', parseError);
          errorData = { error: 'Error de comunicación con el servidor' };
        }
        
        // Determinar mensaje de error específico
        let errorMessage = errorData.error || errorData.message || `Error HTTP ${response.status}`;
        
        // Mensajes específicos basados en el código de estado
        if (response.status === 401) {
          errorMessage = 'Credenciales de Didit inválidas. Verifica la configuración de la API.';
        } else if (response.status === 400) {
          errorMessage = 'Datos de verificación inválidos. Revisa la información proporcionada.';
        } else if (response.status === 429) {
          errorMessage = 'Límite de solicitudes excedido. Intenta nuevamente en unos minutos.';
        } else if (response.status >= 500) {
          errorMessage = 'Error temporal del servidor. Intenta nuevamente en unos momentos.';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint de Didit no encontrado. Verifica la configuración de la URL.';
        }
        
        // Agregar detalles si están disponibles
        if (errorData.details) {
          errorMessage += ` Detalles: ${errorData.details}`;
        }
        
        // Log del error para debugging
        console.error('Error en API de Didit:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: '/api/didit/doctor-verification'
        });
        
        throw new Error(errorMessage);
      }

      const sessionData = await response.json();

      updateVerificationState({
        status: 'session_created',
        sessionId: sessionData.session_id,
        verificationUrl: sessionData.session_url,
        progress: 15 // Reducir progreso inicial para permitir más incrementos
      });

      // Abrir ventana de verificación real de Didit
      if (sessionData.session_url) {
        const verificationWindow = window.open(
          sessionData.session_url,
          'didit-verification',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        if (verificationWindow) {
          updateVerificationState({
            status: 'user_verifying',
            progress: 25 // Progreso más conservador
          });

          toast({
            title: 'Verificación iniciada',
            description: 'Complete el proceso en la ventana de Didit que se abrió',
            variant: 'default'
          });

          // Iniciar webhook listening para resultados en tiempo real
          startListening(sessionData.session_id);
          
          // Iniciar polling como respaldo
          startPolling(sessionData.session_id);
        } else {
          throw new Error('No se pudo abrir la ventana de verificación. Verifique que los pop-ups estén habilitados.');
        }
      }

    } catch (error) {
      console.error('Error iniciando verificación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error iniciando verificación';
      
      updateVerificationState({
        status: 'failed',
        error: errorMessage,
        completedAt: new Date()
      });

      // Solo llamar onStepError si hay un mensaje de error válido y específico
      if (errorMessage && 
          errorMessage !== 'Error iniciando verificación' && 
          errorMessage.length > 0 &&
          !errorMessage.includes('Error desconocido') &&
          errorMessage.trim() !== '' &&
          errorMessage !== 'Error interno del servidor') {
        onStepError('identity_verification', errorMessage);
      }

      toast({
        title: 'Error de verificación',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Función para polling de resultados
  const startPolling = (sessionId: string) => {
    setIsPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/didit/status/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const statusData = await response.json();

        // Lógica mejorada de progreso basada en el estado real de Didit
        let progress = verificationState.progress;
        let newStatus = verificationState.status;
        
        // Mapear estados de Didit a estados internos y progreso
        switch (statusData.status) {
          case 'Not Started':
            progress = 10;
            newStatus = 'user_verifying';
            break;
          case 'In Progress':
            // Progreso incremental basado en tiempo transcurrido
            const timeElapsed = Date.now() - (verificationState.startedAt?.getTime() || Date.now());
            const minutesElapsed = Math.floor(timeElapsed / 60000);
            progress = Math.min(20 + (minutesElapsed * 15), 80); // Incrementa 15% por minuto
            newStatus = 'user_verifying';
            break;
          case 'In Review':
            progress = 85;
            newStatus = 'processing';
            break;
          case 'Approved':
            progress = 100;
            newStatus = 'completed';
            break;
          case 'Declined':
            progress = 100;
            newStatus = 'failed';
            break;
          case 'Abandoned':
            progress = 100;
            newStatus = 'expired';
            break;
          default:
            // Progreso incremental por defecto si el estado no cambia
            progress = Math.min(progress + 5, 80);
        }

        // Log de debugging para monitorear el progreso
        console.log('🔄 Didit Polling Update:', {
          sessionId,
          diditStatus: statusData.status,
          internalStatus: newStatus,
          progress: `${progress}%`,
          timestamp: new Date().toISOString()
        });

        updateVerificationState({
          status: newStatus,
          progress
        });

        // Si está completado, obtener resultados
        if (statusData.status === 'Approved' || statusData.status === 'Declined') {
          clearInterval(pollInterval);
          setIsPolling(false);

          const result: DiditVerificationResult = {
            sessionId,
            decision: statusData.decision,
            summary: {
              isFullyVerified: statusData.decision.face_match?.status === 'match' && 
                              statusData.decision.id_verification?.status === 'Approved' &&
                              statusData.decision.liveness?.status === 'live',
              verificationScore: calculateVerificationScore(statusData.decision),
              completedChecks: getCompletedChecks(statusData.decision),
              failedChecks: getFailedChecks(statusData.decision)
            }
          };

          setVerificationResult(result);
          updateVerificationState({
            status: 'completed',
            progress: 100,
            completedAt: new Date()
          });

          // Actualizar datos del registro
          updateData({
            identityVerification: {
              verificationId: sessionId,
              status: result.summary.isFullyVerified ? 'verified' : 'pending',
              documentType: 'medical_license',
              documentNumber: data.documentNumber,
              verifiedAt: new Date().toISOString(),
              verificationResults: {
                faceMatch: result.decision.face_match?.status === 'match',
                documentValid: result.decision.id_verification?.status === 'Approved',
                livenessCheck: result.decision.liveness?.status === 'live',
                amlScreening: result.decision.aml?.status === 'clear'
              }
            }
          });

          onStepComplete('identity_verification');

          toast({
            title: 'Verificación completada',
            description: result.summary.isFullyVerified 
              ? 'Identidad verificada exitosamente'
              : 'Verificación completada con advertencias',
            variant: result.summary.isFullyVerified ? 'default' : 'destructive'
          });

        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval);
          setIsPolling(false);

          updateVerificationState({
            status: 'failed',
            error: 'La verificación de identidad falló',
            completedAt: new Date()
          });

          // Solo llamar onStepError con mensaje específico
          const specificErrorMessage = 'La verificación de identidad falló. Por favor, intente nuevamente.';
          onStepError('identity_verification', specificErrorMessage);
        }

      } catch (error) {
        console.error('Error en polling:', error);
        // No detener el polling por errores de red
      }
    }, 3000); // Polling cada 3 segundos

    // Timeout de seguridad (5 minutos)
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      
      if (verificationState.status === 'user_verifying' || verificationState.status === 'processing') {
        updateVerificationState({
          status: 'expired',
          error: 'Tiempo de verificación agotado',
          completedAt: new Date()
        });
      }
    }, 300000);
  };

  // Función para reintentar verificación
  const retryVerification = () => {
    updateVerificationState({
      retryCount: verificationState.retryCount + 1,
      error: null,
      status: 'idle'
    });
    initiateVerification();
  };

  // Función para cancelar verificación
  const cancelVerification = async () => {
    if (verificationState.sessionId) {
      try {
        await fetch(`/api/didit/cancel/${verificationState.sessionId}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error cancelando verificación:', error);
      }
    }

    updateVerificationState({
      status: 'idle',
      sessionId: null,
      verificationUrl: null,
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null
    });

    setIsPolling(false);
  };

  // Funciones auxiliares
  const calculateVerificationScore = (decision: any): number => {
    let score = 0;
    if (decision.face_match?.status === 'match') score += 25;
    if (decision.id_verification?.status === 'Approved') score += 25;
    if (decision.liveness?.status === 'live') score += 25;
    if (decision.aml?.status === 'clear') score += 25;
    return score;
  };

  // Funciones auxiliares para webhook
  const getCompletedChecksFromData = (data: any): string[] => {
    const checks = [];
    if (data.identityVerified) checks.push('Reconocimiento facial');
    if (data.documentVerified) checks.push('Validación de documento');
    if (data.livenessVerified) checks.push('Verificación de vida');
    if (data.amlCleared) checks.push('Screening AML');
    return checks;
  };

  const getFailedChecksFromData = (data: any): string[] => {
    const checks = [];
    if (!data.identityVerified) checks.push('Reconocimiento facial');
    if (!data.documentVerified) checks.push('Validación de documento');
    if (!data.livenessVerified) checks.push('Verificación de vida');
    if (!data.amlCleared) checks.push('Screening AML');
    return checks;
  };

  const getCompletedChecks = (decision: any): string[] => {
    const checks = [];
    if (decision.face_match?.status === 'match') checks.push('Reconocimiento facial');
    if (decision.id_verification?.status === 'Approved') checks.push('Validación de documento');
    if (decision.liveness?.status === 'live') checks.push('Verificación de vida');
    if (decision.aml?.status === 'clear') checks.push('Screening AML');
    return checks;
  };

  const getFailedChecks = (decision: any): string[] => {
    const checks = [];
    if (decision.face_match?.status !== 'match') checks.push('Reconocimiento facial');
    if (decision.id_verification?.status !== 'Approved') checks.push('Validación de documento');
    if (decision.liveness?.status !== 'live') checks.push('Verificación de vida');
    if (decision.aml?.status !== 'clear') checks.push('Screening AML');
    return checks;
  };

  const getStatusMessage = (): string => {
    switch (verificationState.status) {
      case 'idle': return 'Listo para iniciar la verificación de identidad';
      case 'initiating': return 'Creando sesión de verificación...';
      case 'session_created': return 'Sesión creada, abriendo ventana de verificación...';
      case 'user_verifying': return 'Complete la verificación en la ventana de Didit';
      case 'processing': return 'Procesando resultados de verificación...';
      case 'completed': return 'Verificación completada exitosamente';
      case 'failed': return 'La verificación falló';
      case 'expired': return 'Tiempo de verificación agotado';
      default: return 'Estado desconocido';
    }
  };

  const getStatusIcon = () => {
    switch (verificationState.status) {
      case 'idle': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'initiating': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'session_created': return <Globe className="h-5 w-5 text-green-500" />;
      case 'user_verifying': return <User className="h-5 w-5 text-orange-500" />;
      case 'processing': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'expired': return <Clock className="h-5 w-5 text-orange-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DiditErrorBoundary 
      onRetry={initiateVerification}
      onGoBack={() => onStepError('identity_verification', 'Usuario canceló la verificación')}
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verificación de Identidad Médica
        </h2>
        <p className="text-gray-600 text-lg">
          Verifica tu identidad profesional usando Didit.me, específicamente configurado para médicos venezolanos
        </p>
      </div>

      {/* Información sobre Didit */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Globe className="h-5 w-5" />
            ¿Qué es Didit.me?
          </CardTitle>
          <CardDescription className="text-blue-700">
            Plataforma líder en verificación de identidad biométrica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Reconocimiento Facial</h4>
                <p className="text-sm text-blue-700">IA avanzada para verificar tu identidad</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Validación de Documentos</h4>
                <p className="text-sm text-blue-700">Verificación automática de cédula</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Verificación de Vida</h4>
                <p className="text-sm text-blue-700">Detecta que eres una persona real</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Lock className="h-4 w-4" />
            <span>Cumple con GDPR, ISO 27001 y SOC 2 Type II</span>
          </div>
        </CardContent>
      </Card>

      {/* Estado de verificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Estado de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {getStatusMessage()}
            </p>
            
            {verificationState.progress > 0 && (
              <div className="space-y-2">
                <Progress value={verificationState.progress} className="h-2" />
                <p className="text-sm text-gray-600">
                  {verificationState.progress}% completado
                </p>
              </div>
            )}

            {verificationState.startedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Iniciado: {verificationState.startedAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          {verificationState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {verificationState.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4">
        {isIdle && (
          <Button
            onClick={initiateVerification}
            disabled={isLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Shield className="h-5 w-5 mr-2" />
            Iniciar Verificación con Didit
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}

        {isSessionCreated && process.env.NODE_ENV !== 'development' && (
          <Button
            onClick={() => window.open(verificationState.verificationUrl!, 'didit-verification')}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <Eye className="h-5 w-5 mr-2" />
            Abrir Ventana de Verificación
          </Button>
        )}

        {canRetry && (
          <Button
            onClick={retryVerification}
            size="lg"
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Reintentar Verificación
          </Button>
        )}

        {(isUserVerifying || isProcessing) && (
          <Button
            onClick={cancelVerification}
            size="lg"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancelar Verificación
          </Button>
        )}
      </div>

      {/* Resultados de verificación */}
      {isCompleted && verificationResult && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Resultados de Verificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900 mb-2">
                {verificationResult.summary.verificationScore}%
              </div>
              <p className="text-green-700">
                {verificationResult.summary.isFullyVerified 
                  ? 'Identidad verificada exitosamente' 
                  : 'Verificación completada con advertencias'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-900 mb-2">Verificaciones Exitosas</h4>
                <div className="space-y-1">
                  {verificationResult.summary.completedChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {verificationResult.summary.failedChecks.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-900 mb-2">Verificaciones Fallidas</h4>
                  <div className="space-y-1">
                    {verificationResult.summary.failedChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-700">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de seguridad */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Seguridad y Privacidad:</span> Toda la información se procesa 
          con encriptación de extremo a extremo. Didit.me cumple con GDPR, ISO 27001 y SOC 2 Type II. 
          Tus datos médicos están protegidos bajo las más altas medidas de seguridad internacionales.
        </AlertDescription>
      </Alert>
      </div>
    </DiditErrorBoundary>
  );
}
