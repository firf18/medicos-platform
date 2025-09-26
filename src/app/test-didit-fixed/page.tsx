'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  Globe,
  Eye,
  RefreshCw
} from 'lucide-react';

interface TestState {
  status: 'idle' | 'creating' | 'created' | 'verifying' | 'completed' | 'failed';
  sessionId?: string;
  sessionUrl?: string;
  progress: number;
  error?: string;
  logs: string[];
}

export default function TestDiditFixed() {
  const [testState, setTestState] = useState<TestState>({
    status: 'idle',
    progress: 0,
    logs: []
  });

  const [isPolling, setIsPolling] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`]
    }));
  };

  const updateTestState = (updates: Partial<TestState>) => {
    setTestState(prev => ({ ...prev, ...updates }));
  };

  const createSession = async () => {
    try {
      updateTestState({ status: 'creating', progress: 10, error: undefined });
      addLog('🚀 Creando sesión de verificación...');

      const response = await fetch('/api/didit/doctor-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: 'test-doctor-fixed-123',
          first_name: 'Juan',
          last_name: 'Pérez',
          date_of_birth: '1990-01-01',
          nationality: 'Venezuelan',
          document_number: 'V-12345678',
          email: 'juan@example.com',
          phone: '+584121234567'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const sessionData = await response.json();
      addLog(`✅ Sesión creada: ${sessionData.session_id}`);
      addLog(`🔗 URL de verificación: ${sessionData.session_url}`);

      updateTestState({
        status: 'created',
        sessionId: sessionData.session_id,
        sessionUrl: sessionData.session_url,
        progress: 25
      });

      // Abrir ventana automáticamente
      if (sessionData.session_url) {
        addLog('🪟 Abriendo ventana de verificación...');
        const verificationWindow = window.open(
          sessionData.session_url,
          'didit-verification',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        if (verificationWindow) {
          updateTestState({ status: 'verifying', progress: 30 });
          addLog('✅ Ventana abierta correctamente');
          startPolling(sessionData.session_id);
        } else {
          addLog('❌ No se pudo abrir la ventana (pop-ups bloqueados?)');
        }
      } else {
        addLog('❌ No se recibió URL de verificación');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`❌ Error: ${errorMessage}`);
      updateTestState({ status: 'failed', error: errorMessage });
    }
  };

  const startPolling = (sessionId: string) => {
    setIsPolling(true);
    addLog('🔄 Iniciando polling de estado...');

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/didit/status/${sessionId}`);
        
        if (!response.ok) {
          addLog(`⚠️ Error en polling: HTTP ${response.status}`);
          return;
        }

        const statusData = await response.json();
        addLog(`📊 Estado: ${statusData.status} (Progreso: ${testState.progress}%)`);

        // Actualizar progreso basado en estado
        let newProgress = testState.progress;
        let newStatus = testState.status;

        switch (statusData.status) {
          case 'Not Started':
            newProgress = Math.min(testState.progress + 5, 40);
            break;
          case 'In Progress':
            newProgress = Math.min(testState.progress + 10, 80);
            break;
          case 'In Review':
            newProgress = 85;
            break;
          case 'Approved':
            newProgress = 100;
            newStatus = 'completed';
            addLog('🎉 ¡Verificación completada exitosamente!');
            clearInterval(pollInterval);
            setIsPolling(false);
            break;
          case 'Declined':
            newProgress = 100;
            newStatus = 'failed';
            addLog('❌ Verificación declinada');
            clearInterval(pollInterval);
            setIsPolling(false);
            break;
          case 'Abandoned':
            newProgress = 100;
            newStatus = 'failed';
            addLog('⏰ Verificación abandonada');
            clearInterval(pollInterval);
            setIsPolling(false);
            break;
        }

        updateTestState({ progress: newProgress, status: newStatus });

      } catch (error) {
        addLog(`❌ Error en polling: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }, 3000);

    // Timeout de 5 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      addLog('⏰ Polling detenido por timeout');
    }, 300000);
  };

  const reopenWindow = () => {
    if (testState.sessionUrl) {
      addLog('🔄 Reabriendo ventana de verificación...');
      window.open(testState.sessionUrl, 'didit-verification', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
  };

  const resetTest = () => {
    setTestState({
      status: 'idle',
      progress: 0,
      logs: []
    });
    setIsPolling(false);
  };

  const getStatusIcon = () => {
    switch (testState.status) {
      case 'creating':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'created':
        return <Globe className="h-5 w-5 text-green-500" />;
      case 'verifying':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (testState.status) {
      case 'creating':
        return 'Creando sesión de verificación...';
      case 'created':
        return 'Sesión creada, abriendo ventana...';
      case 'verifying':
        return 'Esperando verificación del usuario...';
      case 'completed':
        return '¡Verificación completada exitosamente!';
      case 'failed':
        return 'Verificación falló o fue abandonada';
      default:
        return 'Listo para probar Didit';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔧 Test de Didit - Versión Corregida
        </h1>
        <p className="text-gray-600">
          Prueba la integración corregida de Didit con URLs válidas y progreso mejorado
        </p>
      </div>

      {/* Estado de la prueba */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Estado de la Prueba
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{getStatusMessage()}</p>
            <Progress value={testState.progress} className="w-full mb-2" />
            <p className="text-sm text-gray-600">{testState.progress}% completado</p>
          </div>

          {testState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testState.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center gap-4">
            {testState.status === 'idle' && (
              <Button onClick={createSession} size="lg">
                <Shield className="h-5 w-5 mr-2" />
                Iniciar Test de Didit
              </Button>
            )}

            {(testState.status === 'created' || testState.status === 'verifying') && testState.sessionUrl && (
              <Button onClick={reopenWindow} size="lg" variant="outline">
                <Eye className="h-5 w-5 mr-2" />
                Reabrir Ventana
              </Button>
            )}

            {(testState.status === 'completed' || testState.status === 'failed') && (
              <Button onClick={resetTest} size="lg" variant="outline">
                <RefreshCw className="h-5 w-5 mr-2" />
                Reiniciar Test
              </Button>
            )}
          </div>

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

      {/* Información de la sesión */}
      {testState.sessionId && (
        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Session ID:</strong> {testState.sessionId}</p>
              <p><strong>Session URL:</strong> {testState.sessionUrl || 'No disponible'}</p>
              <p><strong>Estado:</strong> {testState.status}</p>
              <p><strong>Progreso:</strong> {testState.progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs de la prueba */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de la Prueba</CardTitle>
          <CardDescription>
            Registro detallado de todas las operaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            {testState.logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay logs aún...</p>
            ) : (
              <div className="space-y-1">
                {testState.logs.map((log, index) => (
                  <p key={index} className="text-xs font-mono text-gray-700">
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}