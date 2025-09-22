/**
 * 🎯 DIDIT VERIFICATION COMPONENT - PRODUCTION READY
 * 
 * Componente React para la fase 4 de registro de doctores
 * Integración directa con Didit API usando el workflow_id real
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Camera, 
  Shield, 
  Eye,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Configuración de Didit
const DIDIT_CONFIG = {
  apiKey: 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o',
  workflowId: '3176221b-c77c-4fea-b2b3-da185ef18122',
  baseUrl: 'https://verification.didit.me/v2'
};

// Tipos para el componente
interface DoctorData {
  doctor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_number: string;
  email?: string;
  phone?: string;
}

interface VerificationSession {
  session_id: string;
  session_url: string;
  session_token: string;
  status: string;
  workflow_id: string;
  features: string[];
  created_at: string;
}

interface VerificationStatus {
  session_id: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned';
  features: string[];
  id_verification?: any;
  face_match?: any;
  liveness?: any;
  aml?: any;
  reviews?: any[];
}

interface DiditVerificationProps {
  doctorData: DoctorData;
  onVerificationComplete: (result: VerificationStatus) => void;
  onVerificationError: (error: string) => void;
  className?: string;
}

export default function DiditVerificationComponent({
  doctorData,
  onVerificationComplete,
  onVerificationError,
  className = ''
}: DiditVerificationProps) {
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Crear sesión de verificación
  const createVerificationSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        workflow_id: DIDIT_CONFIG.workflowId,
        vendor_data: doctorData.doctor_id,
        callback: `${window.location.origin}/api/didit/webhook`,
        expected_details: {
          first_name: doctorData.first_name,
          last_name: doctorData.last_name,
          date_of_birth: doctorData.date_of_birth,
          document_number: doctorData.document_number
        },
        ...(doctorData.email && { contact_details: { email: doctorData.email } }),
        ...(doctorData.phone && { contact_details: { phone: doctorData.phone } })
      };

      const response = await fetch(`${DIDIT_CONFIG.baseUrl}/session/`, {
        method: 'POST',
        headers: {
          'x-api-key': DIDIT_CONFIG.apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'User-Agent': 'Platform-Medicos-Component/2.0.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const sessionData = await response.json();
      setSession(sessionData);
      
      toast.success('Sesión de verificación creada exitosamente');
      
      // Iniciar polling para verificar estado
      startStatusPolling(sessionData.session_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      onVerificationError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [doctorData, onVerificationError]);

  // Obtener estado de verificación
  const getVerificationStatus = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${DIDIT_CONFIG.baseUrl}/session/${sessionId}/decision/`, {
        method: 'GET',
        headers: {
          'x-api-key': DIDIT_CONFIG.apiKey,
          'accept': 'application/json',
          'User-Agent': 'Platform-Medicos-Component/2.0.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const statusData = await response.json();
      setStatus(statusData);

      // Si la verificación está completa, detener polling y notificar
      if (statusData.status === 'Approved' || statusData.status === 'Declined') {
        setIsPolling(false);
        onVerificationComplete(statusData);
        
        if (statusData.status === 'Approved') {
          toast.success('¡Verificación completada exitosamente!');
        } else {
          toast.error('La verificación fue rechazada');
        }
      }

      return statusData;

    } catch (error) {
      console.error('Error obteniendo estado:', error);
      return null;
    }
  }, [onVerificationComplete]);

  // Iniciar polling del estado
  const startStatusPolling = useCallback((sessionId: string) => {
    setIsPolling(true);
    
    const pollInterval = setInterval(async () => {
      const statusData = await getVerificationStatus(sessionId);
      
      if (!statusData || statusData.status === 'Approved' || statusData.status === 'Declined') {
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 5000); // Poll cada 5 segundos

    // Limpiar intervalo después de 10 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
    }, 10 * 60 * 1000);
  }, [getVerificationStatus]);

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Declined': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'In Review': return 'bg-yellow-100 text-yellow-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Declined': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'In Progress': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'In Review': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Calcular progreso
  const calculateProgress = () => {
    if (!status || !status.features) return 0;
    
    const features = status.features;
    const completedFeatures = [];
    
    if (status.id_verification?.status === 'Approved') completedFeatures.push('ID_VERIFICATION');
    if (status.face_match?.status === 'Approved') completedFeatures.push('FACE_MATCH');
    if (status.liveness?.status === 'Approved') completedFeatures.push('LIVENESS');
    if (status.aml?.status === 'Approved') completedFeatures.push('AML');
    
    return features.length > 0 ? Math.round((completedFeatures.length / features.length) * 100) : 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Verificación de Identidad - Didit
          </CardTitle>
          <CardDescription>
            Verificación completa usando Didit con workflow_id: {DIDIT_CONFIG.workflowId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Información del doctor */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500">Nombre:</Label>
                <p className="font-medium">{doctorData.first_name} {doctorData.last_name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Documento:</Label>
                <p className="font-medium">{doctorData.document_number}</p>
              </div>
              <div>
                <Label className="text-gray-500">Nacionalidad:</Label>
                <p className="font-medium">{doctorData.nationality}</p>
              </div>
              <div>
                <Label className="text-gray-500">Fecha de Nacimiento:</Label>
                <p className="font-medium">{doctorData.date_of_birth}</p>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sesión de verificación */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Sesión de Verificación Creada
            </CardTitle>
            <CardDescription>
              Sesión ID: {session.session_id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado:</span>
                <Badge className={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Características:</span>
                <div className="flex flex-wrap gap-1">
                  {session.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(session.session_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Verificación
                </Button>
                
                <Button
                  onClick={() => getVerificationStatus(session.session_id)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar Estado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de verificación */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(status.status)}
              Estado de Verificación
            </CardTitle>
            <CardDescription>
              Progreso: {calculateProgress()}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={calculateProgress()} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {status.id_verification && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Verificación de ID</span>
                    </div>
                    <Badge className={getStatusColor(status.id_verification.status)}>
                      {status.id_verification.status}
                    </Badge>
                  </div>
                )}

                {status.face_match && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span className="text-sm font-medium">Coincidencia Facial</span>
                    </div>
                    <Badge className={getStatusColor(status.face_match.status)}>
                      {status.face_match.status}
                    </Badge>
                  </div>
                )}

                {status.liveness && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">Detección de Vida</span>
                    </div>
                    <Badge className={getStatusColor(status.liveness.status)}>
                      {status.liveness.status}
                    </Badge>
                  </div>
                )}

                {status.aml && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Verificación AML</span>
                    </div>
                    <Badge className={getStatusColor(status.aml.status)}>
                      {status.aml.status}
                    </Badge>
                  </div>
                )}
              </div>

              {isPolling && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Monitoreando cambios en tiempo real...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de inicio */}
      {!session && (
        <div className="flex justify-center">
          <Button
            onClick={createVerificationSession}
            disabled={isLoading}
            className="px-8 py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando Sesión...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Iniciar Verificación de Identidad
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
