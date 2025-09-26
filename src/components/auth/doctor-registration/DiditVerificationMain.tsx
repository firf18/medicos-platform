/**
 * Didit Verification Main Component - Refactored
 * @fileoverview Main component that orchestrates Didit verification process
 * @compliance HIPAA-compliant identity verification with audit trail
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Globe,
  Camera,
  FileText,
  Smartphone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Sub-components
import DiditVerificationInit from './DiditVerificationInit';
import DiditVerificationPolling from './DiditVerificationPolling';
import DiditVerificationStatus from './DiditVerificationStatus';
import DiditVerificationActions from './DiditVerificationActions';

// Types
import { VerificationState } from './types/didit-verification.types';

interface DiditVerificationMainProps {
  data: any;
  updateData: (data: any) => void;
  onStepComplete: (step: 'identity_verification') => void;
  onStepError: (step: 'identity_verification', error: string) => void;
  isLoading: boolean;
}

export const DiditVerificationMain: React.FC<DiditVerificationMainProps> = ({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}) => {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    progress: 0,
    pollingCount: 0
  });

  // Update verification state
  const updateVerificationState = useCallback((updates: Partial<VerificationState>) => {
    setVerificationState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Handle verification completion
  const handleVerificationComplete = useCallback(async () => {
    try {
      // Update data with verification results
      updateData({
        identityVerification: {
          isVerified: true,
          verificationId: verificationState.sessionId,
          verificationDate: new Date().toISOString(),
          provider: 'didit',
          verificationResults: verificationState.verificationResults,
          status: 'verified'
        }
      });

      toast({
        title: '¡Verificación completada!',
        description: 'Tu identidad ha sido verificada exitosamente.',
        variant: 'default'
      });

      // Complete the step
      onStepComplete('identity_verification');
    } catch (error) {
      console.error('Error completing verification:', error);
      onStepError('identity_verification', 'Error completando la verificación');
    }
  }, [verificationState, updateData, onStepComplete, onStepError]);

  // Handle verification error
  const handleVerificationError = useCallback((error: string) => {
    updateVerificationState({
      status: 'failed',
      error
    });
    
    toast({
      title: 'Error de verificación',
      description: error,
      variant: 'destructive'
    });
    
    onStepError('identity_verification', error);
  }, [updateVerificationState, onStepError]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verificación de Identidad Médica
        </h2>
        <p className="text-gray-600 text-lg">
          Último paso: Verifica tu identidad profesional usando Didit.me
        </p>
      </div>

      {/* Information about Didit */}
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

      {/* Verification Status */}
      <DiditVerificationStatus 
        verificationState={verificationState}
        onUpdateState={updateVerificationState}
      />

      {/* Verification Actions */}
      <DiditVerificationActions
        verificationState={verificationState}
        data={data}
        isLoading={isLoading}
        onUpdateState={updateVerificationState}
        onVerificationComplete={handleVerificationComplete}
        onVerificationError={handleVerificationError}
      />

      {/* Verification Init */}
      <DiditVerificationInit
        verificationState={verificationState}
        data={data}
        onUpdateState={updateVerificationState}
        onVerificationError={handleVerificationError}
      />

      {/* Verification Polling */}
      <DiditVerificationPolling
        verificationState={verificationState}
        onUpdateState={updateVerificationState}
        onVerificationComplete={handleVerificationComplete}
        onVerificationError={handleVerificationError}
      />

      {/* Security Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Seguridad y Privacidad:</span> Toda la información se procesa 
          con encriptación de extremo a extremo. Didit.me cumple con GDPR, ISO 27001 y SOC 2 Type II. 
          Tus datos médicos están protegidos bajo las más altas medidas de seguridad internacionales.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DiditVerificationMain;
