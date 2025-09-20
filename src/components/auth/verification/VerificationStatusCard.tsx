/**
 * Verification Status Card Component - Red-Salud Platform
 * 
 * Componente especializado para mostrar el estado de verificación de identidad.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  ExternalLink,
  Search,
  User,
  CheckCircle, 
  AlertCircle, 
  Timer,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export type VerificationStatus = 
  | 'idle'
  | 'initiating'
  | 'session_created'
  | 'user_verifying'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

interface VerificationState {
  status: VerificationStatus;
  sessionId?: string;
  sessionNumber?: string;
  progress: number;
  startedAt?: string;
  retryCount: number;
  maxRetries: number;
  error?: string;
  verificationSummary?: {
    isFullyVerified: boolean;
    verificationScore: number;
    completedChecks: string[];
    failedChecks: string[];
    warnings: string[];
  };
}

interface VerificationStatusCardProps {
  state: VerificationState;
  getProgressMessage: () => string;
  getTimeElapsed: () => string;
  getEstimatedTimeRemaining: () => string;
}

const STATUS_CONFIGS = {
  idle: {
    icon: Shield,
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600',
    title: 'Verificación Pendiente',
    description: 'Inicia la verificación de identidad con Didit.me para médicos venezolanos'
  },
  initiating: {
    icon: Clock,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    title: 'Creando Sesión de Verificación',
    description: 'Configurando proceso de verificación específico para médicos...'
  },
  session_created: {
    icon: ExternalLink,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconColor: 'text-indigo-600',
    title: 'Sesión Lista',
    description: 'Tu sesión de verificación está lista. Haz clic para abrir el proceso.'
  },
  user_verifying: {
    icon: User,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    title: 'Verificación en Proceso',
    description: 'Completa la verificación en la ventana abierta. No cierres esta página.'
  },
  processing: {
    icon: Search,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    title: 'Procesando Verificación',
    description: 'Analizando documentos y datos biométricos con IA...'
  },
  completed: {
    icon: CheckCircle,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    title: 'Verificación Completada',
    description: 'Tu identidad ha sido verificada exitosamente'
  },
  failed: {
    icon: AlertCircle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    title: 'Verificación Fallida',
    description: 'Hubo un problema con la verificación. Puedes intentar nuevamente.'
  },
  expired: {
    icon: Timer,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    title: 'Sesión Expirada',
    description: 'La sesión de verificación ha expirado. Inicia una nueva verificación.'
  }
} as const;

export function VerificationStatusCard({ 
  state, 
  getProgressMessage, 
  getTimeElapsed, 
  getEstimatedTimeRemaining 
}: VerificationStatusCardProps) {
  const config = STATUS_CONFIGS[state.status];
  const IconComponent = config.icon;

  // Actualizar descripción si está completado
  const description = state.status === 'completed' && state.verificationSummary
    ? (state.verificationSummary.isFullyVerified 
        ? 'Tu identidad ha sido verificada exitosamente'
        : 'Verificación completada con observaciones')
    : state.status === 'failed' && state.error
    ? state.error
    : config.description;

  return (
    <div className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-full bg-white shadow-sm">
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              {state.sessionNumber && (
                <Badge variant="outline" className="text-xs">
                  Sesión #{state.sessionNumber}
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{description}</p>
            
            {/* Información de progreso */}
            {state.progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{getProgressMessage()}</span>
                  <span>{state.progress}%</span>
                </div>
                <Progress value={state.progress} className="w-full h-2" />
              </div>
            )}

            {/* Información de tiempo */}
            {state.startedAt && (
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Tiempo: {getTimeElapsed()}
                  </span>
                  {state.status !== 'completed' && state.status !== 'failed' && (
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Estimado: {getEstimatedTimeRemaining()}
                    </span>
                  )}
                </div>
                {state.retryCount > 0 && (
                  <span className="text-orange-600">
                    Intento {state.retryCount + 1}/{state.maxRetries}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
