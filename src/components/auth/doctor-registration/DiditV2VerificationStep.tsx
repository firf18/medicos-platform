/**
 * 🔍 DIDIT V2 VERIFICATION COMPONENT
 * 
 * Componente React para la fase 4 de registro de doctores
 * Usa la API v2 de Didit para verificación independiente
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
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Camera, 
  Shield, 
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos para el componente
interface VerificationStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  score?: number;
  confidence_level?: 'low' | 'medium' | 'high';
  details?: any;
  upload_url?: string;
}

interface DiditV2VerificationProps {
  doctorId: string;
  doctorData: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    document_number: string;
    document_type: 'passport' | 'drivers_license' | 'national_id';
    document_country: string;
  };
  onVerificationComplete: (result: any) => void;
  onVerificationError: (error: string) => void;
  verificationLevel?: 'standard' | 'enhanced' | 'maximum';
  className?: string;
}

const VERIFICATION_STEPS: Omit<VerificationStep, 'status' | 'score' | 'confidence_level' | 'details' | 'upload_url'>[] = [
  {
    id: 'id_verification',
    name: 'Verificación de Identidad',
    description: 'Validación de documento de identidad',
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 'face_match',
    name: 'Coincidencia Facial',
    description: 'Comparación de selfie con documento',
    icon: <Camera className="h-5 w-5" />
  },
  {
    id: 'aml_check',
    name: 'Verificación AML',
    description: 'Verificación contra listas de conformidad',
    icon: <Eye className="h-5 w-5" />
  },
  {
    id: 'passive_liveness',
    name: 'Detección de Vida',
    description: 'Detección de deepfake y liveness',
    icon: <AlertTriangle className="h-5 w-5" />
  }
];

export default function DiditV2Verification({
  doctorId,
  doctorData,
  onVerificationComplete,
  onVerificationError,
  verificationLevel = 'enhanced',
  className = ''
}: DiditV2VerificationProps) {
  const [verificationSessionId, setVerificationSessionId] = useState<string | null>(null);
  const [steps, setSteps] = useState<VerificationStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [overallStatus, setOverallStatus] = useState<'initiated' | 'processing' | 'completed' | 'failed'>('initiated');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{
    document_front?: string;
    document_back?: string;
    selfie?: string;
  }>({});

  // Inicializar pasos de verificación
  useEffect(() => {
    const initialSteps = VERIFICATION_STEPS.map(step => ({
      ...step,
      status: 'pending' as const,
      score: undefined,
      confidence_level: undefined,
      details: undefined,
      upload_url: undefined
    }));
    setSteps(initialSteps);
  }, []);

  // Función para iniciar verificación completa
  const startVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/didit/v2/complete-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          ...doctorData,
          document_front_image: uploadedImages.document_front,
          document_back_image: uploadedImages.document_back,
          selfie_image: uploadedImages.selfie,
          verification_level: verificationLevel,
          callback_url: `${window.location.origin}/api/didit/v2/complete-verification`,
          aml_lists: ['sanctions', 'pep', 'adverse_media']
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error iniciando verificación');
      }

      const data = await response.json();
      setVerificationSessionId(data.verification_session_id);
      setOverallStatus(data.status);
      setOverallProgress(data.overall_progress);

      // Actualizar pasos con URLs de upload
      setSteps(prevSteps => 
        prevSteps.map(step => {
          const stepData = data.verification_steps[step.id];
          if (stepData) {
            return {
              ...step,
              status: 'processing',
              upload_url: stepData.upload_url
            };
          }
          return step;
        })
      );

      toast.success('Verificación iniciada exitosamente');
      
      // Iniciar polling para actualizar estado
      startPolling(data.verification_session_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      onVerificationError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, doctorData, uploadedImages, verificationLevel, onVerificationError]);

  // Función para hacer polling del estado
  const startPolling = useCallback((sessionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/didit/v2/complete-verification?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Error obteniendo estado de verificación');
        }

        const data = await response.json();
        setOverallStatus(data.status);
        setOverallProgress(data.overall_progress);

        // Actualizar pasos
        setSteps(prevSteps => 
          prevSteps.map(step => {
            const stepData = data.verification_steps[step.id];
            if (stepData) {
              return {
                ...step,
                status: stepData.status,
                score: stepData.score,
                confidence_level: stepData.confidence_level,
                details: stepData.details
              };
            }
            return step;
          })
        );

        // Si la verificación está completa, detener polling
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval);
          if (data.status === 'completed') {
            onVerificationComplete(data);
            toast.success('Verificación completada exitosamente');
          } else {
            onVerificationError('Verificación falló');
            toast.error('La verificación falló');
          }
        }

      } catch (error) {
        console.error('Error en polling:', error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll cada 5 segundos

    // Limpiar intervalo después de 10 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 10 * 60 * 1000);
  }, [onVerificationComplete, onVerificationError]);

  // Función para manejar upload de imágenes
  const handleImageUpload = useCallback((type: 'document_front' | 'document_back' | 'selfie', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedImages(prev => ({
        ...prev,
        [type]: base64
      }));
      toast.success(`${type === 'selfie' ? 'Selfie' : 'Documento'} cargado exitosamente`);
    };
    reader.readAsDataURL(file);
  }, []);

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'skipped': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Verificación de Identidad - Didit API v2
          </CardTitle>
          <CardDescription>
            Verificación completa usando servicios independientes de Didit para máxima seguridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progreso general */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso General</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Estado: {overallStatus}</span>
                <span>Nivel: {verificationLevel}</span>
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

      {/* Upload de imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos e Imágenes</CardTitle>
          <CardDescription>
            Carga las imágenes necesarias para la verificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Documento frontal */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Documento Frontal</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('document_front', file);
                }}
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
              />
              {uploadedImages.document_front && (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Cargado
                </Badge>
              )}
            </div>

            {/* Documento trasero */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Documento Trasero</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('document_back', file);
                }}
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
              />
              {uploadedImages.document_back && (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Cargado
                </Badge>
              )}
            </div>

            {/* Selfie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selfie</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('selfie', file);
                }}
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
              />
              {uploadedImages.selfie && (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Cargado
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pasos de verificación */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos de Verificación</CardTitle>
          <CardDescription>
            Estado de cada paso del proceso de verificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {step.icon}
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <Badge className={getStatusColor(step.status)}>
                    {step.status}
                  </Badge>
                  {step.score && (
                    <Badge variant="outline">
                      {step.score}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón de inicio */}
      <div className="flex justify-center">
        <Button
          onClick={startVerification}
          disabled={isLoading || !uploadedImages.document_front || !uploadedImages.selfie}
          className="px-8 py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Iniciando Verificación...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Iniciar Verificación Completa
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
