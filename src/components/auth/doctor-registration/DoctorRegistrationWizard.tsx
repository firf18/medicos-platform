'use client';

import { useState, useEffect } from 'react';
import { useDoctorRegistration } from '@/hooks/useDoctorRegistration';
import { useRegistrationReminders } from '@/hooks/useRegistrationReminders';
import InteractiveTutorial from '@/components/auth/doctor-registration/InteractiveTutorial';
import PersonalInfoStep from '@/components/auth/doctor-registration/PersonalInfoStep';
import ProfessionalInfoStep from '@/components/auth/doctor-registration/ProfessionalInfoStep';
import SpecialtySelectionStep from '@/components/auth/doctor-registration/SpecialtySelectionStep';
import LicenseVerificationStep from '@/components/auth/doctor-registration/LicenseVerificationStep'; // Nuevo paso
import IdentityVerificationStep from '@/components/auth/doctor-registration/IdentityVerificationStep';
import DashboardConfigurationStep from '@/components/auth/doctor-registration/DashboardConfigurationStep';
import FinalReviewStep from '@/components/auth/doctor-registration/FinalReviewStep';
import StepNavigation from '@/components/auth/doctor-registration/StepNavigation';
import RegistrationProgressIndicator from '@/components/auth/doctor-registration/RegistrationProgressIndicator';
import RegistrationNotifications from '@/components/auth/doctor-registration/RegistrationNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorRegistrationData, RegistrationStep, RegistrationProgress } from '@/types/medical/specialties';

export default function DoctorRegistrationWizard() {
  const {
    registrationData,
    progress,
    isSubmitting,
    updateRegistrationData,
    nextStep,
    prevStep,
    handleFinalSubmission
  } = useDoctorRegistration({
    onRegistrationComplete: (data) => {
      console.log('Registro completado exitosamente:', data);
    },
    onRegistrationError: (error) => {
      console.error('Error en el registro:', error);
    }
  });

  // Hook de recordatorios
  const { sendReminder, timeUntilNextReminder, isReminderDue } = useRegistrationReminders({
    registrationData,
    progress,
    isActive: true
  });

  // Efecto para mostrar recordatorios cuando sea necesario
  useEffect(() => {
    if (isReminderDue) {
      sendReminder();
    }
    
    // Mostrar tiempo restante en consola para debugging
    if (timeUntilNextReminder !== null) {
      console.log('Tiempo hasta próximo recordatorio:', timeUntilNextReminder);
    }
  }, [isReminderDue, sendReminder, timeUntilNextReminder]);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [showTutorial, setShowTutorial] = useState(true);

  // Manejar errores del paso actual
  useEffect(() => {
    setLocalErrors(progress.errors || {});
  }, [progress.errors]);

  const handleStepComplete = (step: RegistrationStep) => {
    // Limpiar errores del paso completado
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[step];
      return newErrors;
    });
    nextStep();
  };

  const handleStepError = (step: RegistrationStep, error: string) => {
    setLocalErrors(prev => ({
      ...prev,
      [step]: error
    }));
  };

  const handleContinueFromProgress = (data: DoctorRegistrationData, savedProgress: RegistrationProgress) => {
    // Actualizar los datos y el progreso con los valores guardados
    // Esto requeriría una actualización del hook useDoctorRegistration
    console.log('Continuando desde progreso guardado:', data, savedProgress);
  };

  const handleStepChange = (step: RegistrationStep) => {
    // En una implementación completa, esto requeriría una función más sofisticada
    // para manejar la navegación entre pasos
    console.log('Cambiando a paso:', step);
  };

  const getCurrentStepComponent = () => {
    switch (progress.currentStep) {
      case 'personal_info':
        return (
          <PersonalInfoStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
          />
        );
      case 'professional_info':
        return (
          <ProfessionalInfoStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
            isLoading={isSubmitting}
            onNext={nextStep}
            onPrevious={prevStep}
          />
        );
      case 'license_verification': // Fase 2: Verificación SACS
        return (
          <LicenseVerificationStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
            isLoading={isSubmitting}
          />
        );
      case 'specialty_selection': // Fase 3: Selección de especialidades
        return (
          <SpecialtySelectionStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
            isLoading={isSubmitting}
            onNext={nextStep}
            onPrevious={prevStep}
          />
        );
      case 'identity_verification':
        return (
          <IdentityVerificationStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
            isLoading={isSubmitting}
          />
        );
      case 'dashboard_configuration':
        return (
          <DashboardConfigurationStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
            isLoading={isSubmitting}
          />
        );
      case 'final_review':
        return (
          <FinalReviewStep
            data={registrationData}
            updateData={updateRegistrationData}
            onStepComplete={handleStepComplete}
            onStepError={handleStepError}
            isLoading={isSubmitting}
            onFinalSubmit={handleFinalSubmission}
          />
        );
      default:
        return null;
    }
  };

  // Obtener el estado de verificación si estamos en el paso de verificación
  const verificationStatus = progress.currentStep === 'identity_verification' 
    ? registrationData.identityVerification?.status 
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Médico</h1>
          <p className="mt-2 text-gray-600">
            Completa tu registro en Red-Salud para comenzar a atender pacientes
          </p>
        </div>
        
        <InteractiveTutorial
          currentStep={progress.currentStep}
          isVisible={showTutorial}
          onComplete={() => setShowTutorial(false)}
          onDismiss={() => setShowTutorial(false)}
        />

        <RegistrationProgressIndicator onContinue={handleContinueFromProgress} />
        
        <RegistrationNotifications 
          currentStep={progress.currentStep}
          registrationData={registrationData}
          verificationStatus={verificationStatus}
        />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paso del Registro</CardTitle>
          </CardHeader>
          <CardContent>
            {getCurrentStepComponent()}
          </CardContent>
        </Card>

        <StepNavigation
          currentStep={progress.currentStep}
          completedSteps={progress.completedSteps}
          onStepChange={handleStepChange}
          canProceed={progress.canProceed}
          onNext={nextStep}
          onPrevious={prevStep}
          isSubmitting={isSubmitting}
          registrationData={registrationData}
        />

        {localErrors[progress.currentStep] && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{localErrors[progress.currentStep]}</p>
          </div>
        )}
      </div>
    </div>
  );
}