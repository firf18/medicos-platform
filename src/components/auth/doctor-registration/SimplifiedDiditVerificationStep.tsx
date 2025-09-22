/**
 * 🔧 VERSIÓN SIMPLIFICADA DE DIDIT VERIFICATION STEP
 * 
 * Versión simplificada para identificar el problema del 15%
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  Globe,
  Camera,
  FileText,
  Smartphone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimplifiedDiditVerificationStepProps {
  data: any;
  updateData: (data: any) => void;
  onStepComplete: (step: 'identity_verification') => void;
  onStepError: (step: 'identity_verification', error: string) => void;
  isLoading: boolean;
}

interface VerificationState {
  status: 'idle' | 'session_created' | 'user_verifying' | 'processing' | 'completed' | 'failed' | 'expired';
  sessionId?: string;
  verificationUrl?: string;
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export default function SimplifiedDiditVerificationStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}: SimplifiedDiditVerificationStepProps) {
  
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    progress: 0
  });

  const [isPolling, setIsPolling] = useState(false);

  // Función para actualizar el estado de verificación
  const updateVerificationState = (updates: Partial<VerificationState>) => {
    setVerificationState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Función simplificada para iniciar verificación
  const initiateVerification = async () => {
    try {
      console.log('🚀 Iniciando verificación simplificada...');
      
      updateVerificationState({
        status: 'session_created',
        progress: 15,
        startedAt: new Date()
      });

      // Crear sesión de verificación
      const response = await fetch('/api/didit/doctor-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: data.documentNumber,
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth || '1990-01-01',
          nationality: 'Venezuelan',
          document_number: data.documentNumber,
          email: data.email,
          phone: data.phone
        }),
      });

      console.log('📡 Respuesta recibida:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const sessionData = await response.json();
      console.log('✅ Sesión creada:', sessionData);

      updateVerificationState({
        status: 'session_created',
        sessionId: sessionData.session_id,
        verificationUrl: sessionData.session_url,
        progress: 25
      });

      // Abrir ventana de verificación
      if (sessionData.session_url) {
        const verificationWindow = window.open(
          sessionData.session_url,
          'didit-verification',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        if (verificationWindow) {
          updateVerificationState({
            status: 'user_verifying',
            progress: 30
          });

          toast({
            title: 'Verificación iniciada',
            description: 'Complete el proceso en la ventana de Didit',
            variant: 'default'
          });

          // Iniciar polling simplificado
          startSimplePolling(sessionData.session_id);
        } else {
          throw new Error('No se pudo abrir la ventana de verificación');
        }
      }

    } catch (error) {
      console.error('❌ Error en verificación simplificada:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error iniciando verificación';
      
      updateVerificationState({
        status: 'failed',
        error: errorMessage,
        completedAt: new Date()
      });

      toast({
        title: 'Error de verificación',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Función simplificada de polling
  const startSimplePolling = (sessionId: string) => {
    console.log('🔄 Iniciando polling simplificado para:', sessionId);
    setIsPolling(true);

    const pollInterval = setInterval(async () => {
      try {
        console.log('📊 Consultando status de sesión:', sessionId);
        
        const response = await fetch(`/api/didit/status/${sessionId}`);
        
        if (!response.ok) {
          console.error('❌ Error consultando status:', response.status);
          return;
        }

        const statusData = await response.json();
        console.log('📊 Status recibido:', statusData);

        let progress = verificationState.progress;
        let newStatus = verificationState.status;

        // Lógica simplificada de progreso
        switch (statusData.status) {
          case 'Not Started':
            progress = 30;
            newStatus = 'user_verifying';
            break;
          case 'In Progress':
            progress = Math.min(progress + 10, 80);
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
            progress = Math.min(progress + 5, 80);
        }

        console.log('🔄 Actualizando estado:', {
          sessionId,
          diditStatus: statusData.status,
          internalStatus: newStatus,
          progress: `${progress}%`
        });

        updateVerificationState({
          status: newStatus,
          progress
        });

        // Si está completado, detener polling
        if (statusData.status === 'Approved' || statusData.status === 'Declined') {
          clearInterval(pollInterval);
          setIsPolling(false);
          
          if (statusData.status === 'Approved') {
            updateData({
              identityVerification: {
                isVerified: true,
                verificationId: sessionId,
                verificationDate: new Date().toISOString(),
                provider: 'didit'
              }
            });
            
            onStepComplete('identity_verification');
          }
        }

      } catch (error) {
        console.error('❌ Error en polling:', error);
      }
    }, 3000); // Polling cada 3 segundos

    // Limpiar polling después de 5 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      console.log('⏰ Polling detenido por timeout');
    }, 300000);
  };

  const getStatusIcon = () => {
    switch (verificationState.status) {
      case 'session_created':
      case 'user_verifying':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationState.status) {
      case 'session_created':
        return 'Sesión creada, preparando verificación...';
      case 'user_verifying':
        return 'Esperando que complete la verificación en la ventana de Didit...';
      case 'processing':
        return 'Procesando verificación...';
      case 'completed':
        return 'Verificación completada exitosamente';
      case 'failed':
        return 'Verificación falló';
      case 'expired':
        return 'Verificación expirada';
      default:
        return 'Listo para iniciar verificación';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verificación de Identidad Médica (Simplificada)
        </h2>
        <p className="text-gray-600 text-lg">
          Versión simplificada para diagnosticar el problema del 15%
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
              <Camera className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Reconocimiento Facial</h4>
                <p className="text-sm text-blue-700">IA avanzada para verificar tu identidad</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Validación de Documentos</h4>
                <p className="text-sm text-blue-700">Verificación automática de cédula</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Verificación de Vida</h4>
                <p className="text-sm text-blue-700">Detecta que eres una persona real</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
            Cumple con GDPR, ISO 27001 y SOC 2 Type II
          </div>
        </CardContent>
      </Card>

      {/* Estado de Verificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Estado de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{getStatusMessage()}</p>
            <Progress value={verificationState.progress} className="w-full mb-2" />
            <p className="text-sm text-gray-600">{verificationState.progress}% completado</p>
            {verificationState.startedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Iniciado: {verificationState.startedAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          {verificationState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationState.error}</AlertDescription>
            </Alert>
          )}

          {verificationState.status === 'idle' && (
            <Button 
              onClick={initiateVerification}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Iniciar Verificación con Didit
                </>
              )}
            </Button>
          )}

          {isPolling && (
            <div className="text-center">
              <Badge variant="outline" className="text-blue-600">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Monitoreando progreso...
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Debug */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Información de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Estado: {verificationState.status}</p>
            <p>Progreso: {verificationState.progress}%</p>
            <p>Session ID: {verificationState.sessionId || 'N/A'}</p>
            <p>Polling: {isPolling ? 'Activo' : 'Inactivo'}</p>
            <p>Error: {verificationState.error || 'Ninguno'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
