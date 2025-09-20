/**
 * Identity Verification Step - Red-Salud Platform (Refactorizado)
 * 
 * Componente principal refactorizado para verificación de identidad médica.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

import { VerificationStatusCard } from './VerificationStatusCard';
import { VerificationResultsCard } from './VerificationResultsCard';
import { VerificationActions } from './VerificationActions';
import { DiditInfoCard } from './DiditInfoCard';

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { useDiditVerificationProfessional } from '@/hooks/useDiditVerificationProfessional';
import type { VenezuelanDoctorData } from '@/lib/didit-integration';

interface IdentityVerificationStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'identity_verification') => void;
  onStepError: (step: 'identity_verification', error: string) => void;
  isLoading: boolean;
}

export default function IdentityVerificationStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}: IdentityVerificationStepProps) {
  
  // Hook profesional para Didit
  const {
    state,
    isIdle,
    isInitiating,
    isSessionCreated,
    isUserVerifying,
    isProcessing,
    isCompleted,
    isFailed,
    isExpired,
    canRetry,
    initiateVerification,
    openVerificationWindow,
    retryVerification,
    cancelVerification,
    checkResults,
    resetVerification,
    getProgressMessage,
    getTimeElapsed,
    getEstimatedTimeRemaining
  } = useDiditVerificationProfessional({
    onVerificationComplete: ({ sessionId, decision, summary }) => {
      // Actualizar datos de registro con resultados de verificación
      updateData({
        identityVerification: {
          verificationId: sessionId,
          status: summary.isFullyVerified ? 'verified' : 'pending',
          documentType: 'medical_license',
          documentNumber: data.licenseNumber,
          verifiedAt: new Date().toISOString(),
          verificationResults: {
            faceMatch: decision.face_match?.status === 'match',
            documentValid: decision.id_verification?.status === 'Approved',
            livenessCheck: decision.liveness?.status === 'live',
            amlScreening: decision.aml?.status === 'clear'
          }
        }
      });
      
      onStepComplete('identity_verification');
    },
    onVerificationError: (error) => {
      onStepError('identity_verification', error);
    },
    onStatusChange: (status, data) => {
      console.log(`🔄 Estado de verificación cambió a: ${status}`, data);
    },
    autoRetry: true,
    maxRetries: 3,
    enablePolling: true,
    pollingInterval: 3000, // 3 segundos
    maxPollingTime: 300000 // 5 minutos
  });

  // Efecto para verificar sesión guardada al cargar
  useEffect(() => {
    if (state.sessionId && (isSessionCreated || isUserVerifying)) {
      console.log('Sesión de verificación encontrada, mostrando opción para reanudar');
    }
  }, [state.sessionId, isSessionCreated, isUserVerifying]);

  // Preparar datos del médico venezolano para Didit
  const prepareDoctorData = (): VenezuelanDoctorData => ({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    licenseNumber: data.licenseNumber,
    specialty: data.specialtyId,
    documentType: 'cedula_identidad',
    documentNumber: data.licenseNumber,
    medicalBoard: 'Colegio de Médicos de Venezuela',
    university: ''
  });

  // Manejadores de eventos
  const handleInitiateVerification = async () => {
    try {
      const doctorData = prepareDoctorData();
      await initiateVerification(doctorData);
    } catch (error) {
      console.error('Error iniciando verificación:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verificación de Identidad Médica
        </h2>
        <p className="text-gray-600">
          Verifica tu identidad profesional usando Didit.me, específicamente configurado para médicos venezolanos.
        </p>
      </div>

      {/* Información sobre Didit.me */}
      <DiditInfoCard />

      {/* Estado de verificación */}
      <VerificationStatusCard
        state={state}
        getProgressMessage={getProgressMessage}
        getTimeElapsed={getTimeElapsed}
        getEstimatedTimeRemaining={getEstimatedTimeRemaining}
      />

      {/* Botones de acción */}
      <VerificationActions
        status={state.status}
        canRetry={canRetry}
        maxRetries={state.maxRetries}
        retryCount={state.retryCount}
        isLoading={isLoading}
        licenseNumber={data.licenseNumber}
        onInitiate={handleInitiateVerification}
        onOpenWindow={openVerificationWindow}
        onCheckResults={checkResults}
        onRetry={retryVerification}
        onReset={resetVerification}
        onCancel={cancelVerification}
      />

      {/* Resultados de verificación */}
      <VerificationResultsCard
        summary={state.verificationSummary}
        isVisible={isCompleted && !!state.verificationSummary}
      />

      {/* Información de seguridad y privacidad */}
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
}
