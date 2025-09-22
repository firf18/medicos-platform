/**
 * 🧪 COMPONENTE DE PRUEBA SIMPLIFICADO PARA DIAGNOSTICAR EL PROBLEMA DEL 15%
 * 
 * Este componente está diseñado para aislar el problema específico del progreso
 * que se queda en 15% y no avanza.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface TestState {
  status: 'idle' | 'creating_session' | 'session_created' | 'polling' | 'completed' | 'error';
  sessionId: string | null;
  progress: number;
  error: string | null;
  pollingCount: number;
  lastUpdate: string | null;
}

export default function DiditTestComponent() {
  const [testState, setTestState] = useState<TestState>({
    status: 'idle',
    sessionId: null,
    progress: 0,
    error: null,
    pollingCount: 0,
    lastUpdate: null
  });

  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Función para crear sesión de prueba
  const createTestSession = async () => {
    console.log('🧪 Iniciando prueba de sesión...');
    
    setTestState(prev => ({
      ...prev,
      status: 'creating_session',
      progress: 5,
      error: null
    }));

    try {
      const testData = {
        doctor_id: 'V-TEST123456',
        first_name: 'Test',
        last_name: 'Doctor',
        date_of_birth: '1990-01-01',
        nationality: 'Venezuelan',
        document_number: 'V-TEST123456',
        email: 'test@test.com',
        phone: '+584241234567'
      };

      console.log('📡 Enviando solicitud a Didit...', testData);

      const response = await fetch('/api/didit/doctor-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      console.log('📡 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const sessionData = await response.json();
      console.log('✅ Datos de sesión recibidos:', sessionData);

      setTestState(prev => ({
        ...prev,
        status: 'session_created',
        sessionId: sessionData.session_id,
        progress: 15,
        lastUpdate: new Date().toISOString()
      }));

      console.log('✅ Sesión creada exitosamente:', sessionData.session_id);

    } catch (error) {
      console.error('❌ Error creando sesión:', error);
      setTestState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
        progress: 0
      }));
    }
  };

  // Función para iniciar polling
  const startPolling = () => {
    if (!testState.sessionId) {
      console.error('❌ No hay sessionId para hacer polling');
      return;
    }

    console.log('🔄 Iniciando polling para sesión:', testState.sessionId);
    
    setIsPolling(true);
    setTestState(prev => ({
      ...prev,
      status: 'polling',
      pollingCount: 0
    }));

    const interval = setInterval(async () => {
      try {
        console.log(`🔄 Polling #${testState.pollingCount + 1} para sesión:`, testState.sessionId);
        
        const response = await fetch(`/api/didit/status/${testState.sessionId}`);
        
        console.log('📡 Respuesta de polling:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error en polling:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const statusData = await response.json();
        console.log('📊 Datos de estado recibidos:', statusData);

        // Lógica de progreso simplificada
        let newProgress = testState.progress;
        let newStatus = testState.status;

        switch (statusData.status) {
          case 'Not Started':
            newProgress = 20;
            newStatus = 'polling';
            break;
          case 'In Progress':
            newProgress = Math.min(testState.progress + 10, 80);
            newStatus = 'polling';
            break;
          case 'In Review':
            newProgress = 85;
            newStatus = 'polling';
            break;
          case 'Approved':
            newProgress = 100;
            newStatus = 'completed';
            break;
          case 'Declined':
            newProgress = 100;
            newStatus = 'error';
            break;
          default:
            newProgress = Math.min(testState.progress + 5, 80);
        }

        setTestState(prev => ({
          ...prev,
          progress: newProgress,
          status: newStatus,
          pollingCount: prev.pollingCount + 1,
          lastUpdate: new Date().toISOString()
        }));

        console.log('✅ Estado actualizado:', {
          progress: newProgress,
          status: newStatus,
          pollingCount: testState.pollingCount + 1
        });

        // Si está completado, detener polling
        if (statusData.status === 'Approved' || statusData.status === 'Declined') {
          console.log('🏁 Verificación completada, deteniendo polling');
          clearInterval(interval);
          setIsPolling(false);
          setPollInterval(null);
        }

      } catch (error) {
        console.error('❌ Error en polling:', error);
        setTestState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error en polling'
        }));
        clearInterval(interval);
        setIsPolling(false);
        setPollInterval(null);
      }
    }, 3000); // Polling cada 3 segundos

    setPollInterval(interval);
  };

  // Función para detener polling
  const stopPolling = () => {
    console.log('⏹️ Deteniendo polling...');
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setIsPolling(false);
    setTestState(prev => ({
      ...prev,
      status: 'session_created'
    }));
  };

  // Función para resetear
  const resetTest = () => {
    console.log('🔄 Reseteando prueba...');
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setIsPolling(false);
    setTestState({
      status: 'idle',
      sessionId: null,
      progress: 0,
      error: null,
      pollingCount: 0,
      lastUpdate: null
    });
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Prueba de Diagnóstico Didit
        </h1>
        <p className="text-gray-600">
          Componente simplificado para diagnosticar el problema del 15%
        </p>
      </div>

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Estado:</label>
              <Badge variant={testState.status === 'error' ? 'destructive' : 'default'}>
                {testState.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Progreso:</label>
              <span className="ml-2 font-mono">{testState.progress}%</span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Session ID:</label>
              <span className="ml-2 font-mono text-xs">
                {testState.sessionId || 'N/A'}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Polling Count:</label>
              <span className="ml-2 font-mono">{testState.pollingCount}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Progreso:</label>
            <Progress value={testState.progress} className="mt-2" />
          </div>

          {testState.lastUpdate && (
            <div>
              <label className="text-sm font-medium text-gray-700">Última actualización:</label>
              <span className="ml-2 text-sm text-gray-600">
                {new Date(testState.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          )}

          {testState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {testState.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={createTestSession}
              disabled={testState.status === 'creating_session'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Crear Sesión
            </Button>

            <Button
              onClick={startPolling}
              disabled={!testState.sessionId || isPolling}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Iniciar Polling
            </Button>

            <Button
              onClick={stopPolling}
              disabled={!isPolling}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Pause className="h-4 w-4 mr-2" />
              Detener Polling
            </Button>

            <Button
              onClick={resetTest}
              variant="outline"
              className="border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              <Square className="h-4 w-4 mr-2" />
              Resetear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs de consola */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Haz clic en "Crear Sesión" para crear una sesión de prueba</p>
            <p>2. Una vez creada, haz clic en "Iniciar Polling" para comenzar el monitoreo</p>
            <p>3. Observa la consola del navegador para ver los logs detallados</p>
            <p>4. El progreso debería avanzar de 15% a 100%</p>
            <p>5. Si se queda en 15%, revisa los logs para identificar el problema</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
