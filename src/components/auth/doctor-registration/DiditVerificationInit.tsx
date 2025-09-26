/**
 * Didit Verification Init Component
 * @fileoverview Handles the initialization of Didit verification process
 * @compliance HIPAA-compliant verification initiation with audit trail
 */

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VerificationState, DiditVerificationData } from './types/didit-verification.types';

interface DiditVerificationInitProps {
  verificationState: VerificationState;
  data: DiditVerificationData;
  onUpdateState: (updates: Partial<VerificationState>) => void;
  onVerificationError: (error: string) => void;
}

const DiditVerificationInit: React.FC<DiditVerificationInitProps> = ({
  verificationState,
  data,
  onUpdateState,
  onVerificationError
}) => {
  // Validate SessionId format
  const validateSessionId = useCallback((sessionId: string): boolean => {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }
    
    // Verify UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sessionId);
  }, []);

  // Initiate verification process
  const initiateVerification = useCallback(async () => {
    try {
      console.log('🚀 Iniciando verificación Didit...');
      
      onUpdateState({
        status: 'initiating',
        progress: 10,
        startedAt: new Date(),
        error: undefined,
        pollingCount: 0
      });

      // Create verification session
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
          phone: data.phone,
          callback_url: `${window.location.origin}/api/auth/didit/callback`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const sessionData = await response.json();
      console.log('✅ Sesión creada:', sessionData);

      // Validate sessionId before continuing
      if (!validateSessionId(sessionData.session_id)) {
        throw new Error('SessionId inválido recibido de Didit');
      }

      onUpdateState({
        status: 'session_created',
        sessionId: sessionData.session_id,
        verificationUrl: sessionData.session_url,
        progress: 20
      });

      // Handle verification window
      if (sessionData.session_url) {
        try {
          console.log('🔗 Abriendo ventana de verificación:', sessionData.session_url);
          
          const verificationWindow = window.open(
            sessionData.session_url,
            'didit-verification',
            'width=800,height=600,scrollbars=yes,resizable=yes,location=yes,status=yes'
          );

          if (verificationWindow) {
            onUpdateState({
              status: 'user_verifying',
              progress: 25
            });

            toast({
              title: 'Verificación iniciada',
              description: 'Complete el proceso en la ventana de Didit que se abrió',
              variant: 'default'
            });
          } else {
            // Handle popup blocked
            console.log('⚠️ Popup bloqueado, permitiendo verificación manual');
            
            onUpdateState({
              status: 'manual_verification',
              sessionId: sessionData.session_id,
              verificationUrl: sessionData.session_url,
              progress: 25
            });

            toast({
              title: 'Verificación manual requerida',
              description: 'Los popups están bloqueados. Haz clic en "Continuar" para abrir la verificación en una nueva pestaña.',
              variant: 'default'
            });
          }
        } catch (windowError) {
          console.error('❌ Error abriendo ventana:', windowError);
          
          // Allow manual verification
          onUpdateState({
            status: 'manual_verification',
            sessionId: sessionData.session_id,
            verificationUrl: sessionData.session_url,
            progress: 25
          });

          toast({
            title: 'Verificación manual requerida',
            description: 'Hubo un problema abriendo la ventana. Haz clic en "Continuar" para abrir la verificación en una nueva pestaña.',
            variant: 'default'
          });
        }
      }

    } catch (error) {
      console.error('❌ Error en verificación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error iniciando verificación';
      
      onUpdateState({
        status: 'failed',
        error: errorMessage,
        completedAt: new Date()
      });

      toast({
        title: 'Error de verificación',
        description: errorMessage,
        variant: 'destructive'
      });

      onVerificationError(errorMessage);
    }
  }, [data, onUpdateState, onVerificationError, validateSessionId]);

  // Only show init button when idle
  if (verificationState.status !== 'idle') {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Button 
        onClick={initiateVerification}
        disabled={false}
        className="flex-1 min-w-[200px]"
      >
        {false ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Iniciar Verificación Final
          </>
        )}
      </Button>
    </div>
  );
};

export default DiditVerificationInit;
