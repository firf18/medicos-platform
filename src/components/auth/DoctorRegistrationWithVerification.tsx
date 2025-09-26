'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoctorRegistrationWithVerification } from '@/hooks/useDoctorRegistrationWithVerification';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import EmailVerificationStep from './EmailVerificationStep';
import { DoctorRegistrationForm } from './doctor-registration/DoctorRegistrationForm';

interface DoctorRegistrationWithVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DoctorRegistrationWithVerification({
  onSuccess,
  onCancel
}: DoctorRegistrationWithVerificationProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    currentStep,
    isLoading,
    error,
    registrationData,
    submitRegistration,
    verifyEmail,
    resendVerificationCode,
    resetRegistration,
    canProceedToVerification,
    canCompleteRegistration,
  } = useDoctorRegistrationWithVerification();

  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleFormSubmit = async (data: DoctorRegistrationData) => {
    try {
      await submitRegistration(data);
    } catch (err) {
      console.error('Error in form submission:', err);
    }
  };

  const handleEmailVerification = async (email: string, code: string) => {
    try {
      await verifyEmail(email, code);
    } catch (err) {
      console.error('Error in email verification:', err);
    }
  };

  const handleResendCode = async (email: string) => {
    try {
      await resendVerificationCode(email);
      setCanResend(false);
      setResendCooldown(60);
      
      // Habilitar reenvío después del cooldown
      setTimeout(() => {
        setCanResend(true);
        setResendCooldown(0);
      }, 60000);
    } catch (err) {
      console.error('Error resending code:', err);
    }
  };

  const handleBack = () => {
    if (currentStep === 'verification') {
      resetRegistration();
    } else if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/doctor/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'form':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Registro de Médico</h2>
              <p className="text-muted-foreground mt-2">
                Completa la información para crear tu cuenta de médico
              </p>
            </div>

            <DoctorRegistrationForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              submitButtonText="Crear cuenta y verificar email"
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Verificación de Email</h2>
              <p className="text-muted-foreground mt-2">
                Hemos enviado un código de verificación a tu correo
              </p>
            </div>

            <EmailVerificationStep
              email={registrationData?.email || ''}
              onVerificationSuccess={handleEmailVerification}
              onResendCode={handleResendCode}
              isLoading={isLoading}
              error={error}
              canResend={canResend}
              resendCooldown={resendCooldown}
            />

            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al formulario
              </Button>
            </div>
          </div>
        );

      case 'completing':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">Completando registro</h2>
              <p className="text-muted-foreground mt-2">
                Estamos creando tu cuenta y configurando tu perfil...
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Email verificado</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span>Creando cuenta de usuario</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span>Configurando perfil médico</span>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-green-600">¡Registro completado!</h2>
              <p className="text-muted-foreground mt-2">
                Tu cuenta de médico ha sido creada exitosamente
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Email verificado</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cuenta de usuario creada</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Perfil médico configurado</span>
              </div>
            </div>

            <Button onClick={handleSuccess} className="w-full">
              Ir al Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {currentStep === 'form' && 'Registro de Médico'}
              {currentStep === 'verification' && 'Verificación de Email'}
              {currentStep === 'completing' && 'Completando Registro'}
              {currentStep === 'completed' && 'Registro Completado'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 'form' && 'Crea tu cuenta de médico en Red-Salud'}
              {currentStep === 'verification' && 'Verifica tu correo electrónico para continuar'}
              {currentStep === 'completing' && 'Configurando tu cuenta...'}
              {currentStep === 'completed' && '¡Bienvenido a Red-Salud!'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Indicador de progreso */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'form' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'form' ? 'bg-blue-600' : 'bg-green-600'}`} />
              <span className="text-sm font-medium">Formulario</span>
            </div>
            
            <div className={`w-8 h-0.5 ${currentStep === 'verification' || currentStep === 'completing' || currentStep === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center space-x-2 ${currentStep === 'verification' ? 'text-blue-600' : currentStep === 'completing' || currentStep === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'verification' ? 'bg-blue-600' : currentStep === 'completing' || currentStep === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">Verificación</span>
            </div>
            
            <div className={`w-8 h-0.5 ${currentStep === 'completing' || currentStep === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center space-x-2 ${currentStep === 'completing' ? 'text-blue-600' : currentStep === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'completing' ? 'bg-blue-600' : currentStep === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">Completado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
