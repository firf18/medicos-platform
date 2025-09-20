/**
 * Verification Actions Component - Red-Salud Platform
 * 
 * Componente especializado para botones de acción de verificación de identidad.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { Button } from '@/components/ui/button';
import { 
  Shield,
  Clock,
  ExternalLink,
  Search,
  RotateCcw,
  Timer
} from 'lucide-react';

import type { VerificationStatus } from './VerificationStatusCard';

interface VerificationActionsProps {
  status: VerificationStatus;
  canRetry: boolean;
  maxRetries: number;
  retryCount: number;
  isLoading: boolean;
  licenseNumber: string;
  onInitiate: () => void;
  onOpenWindow: () => void;
  onCheckResults: () => void;
  onRetry: () => void;
  onReset: () => void;
  onCancel: () => void;
}

export function VerificationActions({
  status,
  canRetry,
  maxRetries,
  retryCount,
  isLoading,
  licenseNumber,
  onInitiate,
  onOpenWindow,
  onCheckResults,
  onRetry,
  onReset,
  onCancel
}: VerificationActionsProps) {

  const renderActionButtons = () => {
    switch (status) {
      case 'idle':
        return (
          <Button 
            onClick={onInitiate} 
            disabled={isLoading || !licenseNumber}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Iniciando Verificación...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Iniciar Verificación de Identidad
              </>
            )}
          </Button>
        );

      case 'session_created':
        return (
          <Button 
            onClick={onOpenWindow}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Proceso de Verificación
          </Button>
        );

      case 'user_verifying':
        return (
          <div className="flex space-x-3">
            <Button 
              onClick={onOpenWindow}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Reabrir Verificación
            </Button>
            <Button 
              onClick={onCheckResults}
              variant="outline"
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              Verificar Resultados
            </Button>
          </div>
        );

      case 'processing':
        return (
          <Button 
            onClick={onCheckResults}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Verificar Estado
          </Button>
        );

      case 'failed':
      case 'expired':
        return (
          <div className="flex space-x-3">
            {canRetry && (
              <Button 
                onClick={onRetry} 
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar ({maxRetries - retryCount} intentos)
              </Button>
            )}
            <Button 
              onClick={onReset}
              variant="outline"
              className="flex-1"
            >
              <Timer className="h-4 w-4 mr-2" />
              Empezar de Nuevo
            </Button>
          </div>
        );

      case 'completed':
        return (
          <div className="flex justify-center">
            <div className="text-center text-green-600">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Verificación completada exitosamente</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {renderActionButtons()}
      
      {/* Botón de cancelar para estados activos */}
      {(status === 'user_verifying' || status === 'processing') && (
        <Button 
          onClick={onCancel}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          Cancelar Verificación
        </Button>
      )}
    </div>
  );
}

// Import CheckCircle for completed state
import { CheckCircle } from 'lucide-react';
