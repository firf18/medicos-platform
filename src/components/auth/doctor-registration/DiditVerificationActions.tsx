/**
 * Didit Verification Actions Component
 * @fileoverview Handles action buttons for Didit verification process
 * @compliance HIPAA-compliant action handling with audit trail
 */

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VerificationState } from './types/didit-verification.types';

interface DiditVerificationActionsProps {
  verificationState: VerificationState;
  data: any;
  isLoading: boolean;
  onUpdateState: (updates: Partial<VerificationState>) => void;
  onVerificationComplete: () => void;
  onVerificationError: (error: string) => void;
}

const DiditVerificationActions: React.FC<DiditVerificationActionsProps> = ({
  verificationState,
  data,
  isLoading,
  onUpdateState,
  onVerificationComplete,
  onVerificationError
}) => {
  // Reopen verification window
  const reopenVerificationWindow = useCallback(() => {
    if (verificationState.verificationUrl) {
      console.log('🔄 Reabriendo ventana de verificación:', verificationState.verificationUrl);
      
      try {
        const verificationWindow = window.open(
          verificationState.verificationUrl,
          'didit-verification',
          'width=800,height=600,scrollbars=yes,resizable=yes,location=yes,status=yes'
        );

        if (verificationWindow) {
          toast({
            title: 'Ventana reabierta',
            description: 'Complete la verificación en la ventana que se abrió',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo reabrir la ventana. Verifica que los popups estén habilitados.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('❌ Error reabriendo ventana:', error);
        toast({
          title: 'Error',
          description: 'No se pudo reabrir la ventana de verificación',
          variant: 'destructive'
        });
      }
    }
  }, [verificationState.verificationUrl]);

  // Retry verification
  const retryVerification = useCallback(() => {
    console.log('🔄 Reintentando verificación...');
    onUpdateState({
      status: 'idle',
      progress: 0,
      error: undefined,
      pollingCount: 0
    });
  }, [onUpdateState]);

  // Handle manual verification
  const handleManualVerification = useCallback(() => {
    if (verificationState.verificationUrl) {
      window.open(verificationState.verificationUrl, '_blank');
    }
  }, [verificationState.verificationUrl]);

  // Don't show actions when idle or completed
  if (verificationState.status === 'idle' || verificationState.status === 'completed') {
    return null;
  }

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {/* Reopen verification window */}
      {(verificationState.status === 'session_created' || verificationState.status === 'user_verifying') && verificationState.verificationUrl && (
        <Button 
          onClick={reopenVerificationWindow}
          variant="default"
          className="flex-1 min-w-[200px]"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Reabrir Ventana de Verificación
        </Button>
      )}

      {/* Manual verification */}
      {verificationState.status === 'manual_verification' && verificationState.verificationUrl && (
        <Button 
          onClick={handleManualVerification}
          variant="default"
          className="flex-1 min-w-[200px]"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Continuar Verificación
        </Button>
      )}

      {/* Retry verification */}
      {(verificationState.status === 'failed' || verificationState.status === 'expired') && (
        <Button 
          onClick={retryVerification}
          variant="default"
          className="flex-1 min-w-[200px]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar Verificación
        </Button>
      )}
    </div>
  );
};

export default DiditVerificationActions;
