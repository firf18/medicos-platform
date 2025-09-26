/**
 * Didit Verification Status Component
 * @fileoverview Displays the current status of Didit verification process
 * @compliance HIPAA-compliant status display with audit trail
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { VerificationState } from './types/didit-verification.types';

interface DiditVerificationStatusProps {
  verificationState: VerificationState;
  onUpdateState: (updates: Partial<VerificationState>) => void;
}

const DiditVerificationStatus: React.FC<DiditVerificationStatusProps> = ({
  verificationState
}) => {
  // Get status icon
  const getStatusIcon = () => {
    switch (verificationState.status) {
      case 'initiating':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'session_created':
      case 'user_verifying':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'manual_verification':
        return <ExternalLink className="h-5 w-5 text-orange-500" />;
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

  // Get status message
  const getStatusMessage = () => {
    switch (verificationState.status) {
      case 'initiating':
        return 'Creando sesión de verificación...';
      case 'session_created':
        return 'Sesión creada, abriendo ventana de verificación...';
      case 'user_verifying':
        return 'Complete la verificación en la ventana de Didit...';
      case 'manual_verification':
        return 'Los popups están bloqueados. Haz clic en "Continuar Verificación" para abrir en una nueva pestaña...';
      case 'processing':
        return 'Procesando resultados de verificación...';
      case 'completed':
        return '¡Verificación completada exitosamente! Finalizando registro...';
      case 'failed':
        return 'La verificación falló';
      case 'expired':
        return 'Verificación expirada';
      default:
        return 'Complete la verificación de identidad para finalizar su registro';
    }
  };

  // Don't show status card when idle
  if (verificationState.status === 'idle') {
    return null;
  }

  return (
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
          
          {verificationState.pollingCount > 0 && (
            <p className="text-xs text-blue-500 mt-1">
              Monitoreando... (consulta {verificationState.pollingCount})
            </p>
          )}
          
          {verificationState.diditStatus && (
            <p className="text-xs text-gray-500 mt-1">
              Estado Didit: {verificationState.diditStatus}
            </p>
          )}
        </div>

        {verificationState.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{verificationState.error}</p>
            </div>
          </div>
        )}

        {verificationState.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <div className="text-sm text-green-800">
                <strong>¡Felicitaciones!</strong> Tu verificación de identidad ha sido completada exitosamente. 
                Tu registro médico está completo y ahora puedes acceder a la plataforma.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiditVerificationStatus;
