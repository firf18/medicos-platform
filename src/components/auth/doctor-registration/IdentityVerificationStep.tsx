'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  RotateCcw,
  Search
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { useDiditVerification } from '@/hooks/useDiditVerification';

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
  // Usar el hook personalizado para Didit
  const {
    verificationState,
    canProceed,
    initiateVerification,
    openVerificationWindow,
    retryVerification,
    getStatusMessage,
    isIdle,
    isInitiating,
    isPending,
    isProcessing,
    isCompleted,
    isFailed,
    hasError,
    progress
  } = useDiditVerification({
    registrationData: data,
    onVerificationComplete: (verificationData) => {
      // Actualizar datos de registro con resultados de verificación
      updateData({
        identityVerification: {
          verificationId: verificationData.sessionId,
          status: 'verified',
          documentType: 'medical_license',
          documentNumber: data.licenseNumber,
          verifiedAt: new Date().toISOString(),
          verificationResults: {
            faceMatch: verificationData.results?.faceMatch?.status === 'match',
            documentValid: verificationData.results?.idVerification?.status === 'verified',
            livenessCheck: verificationData.results?.liveness?.status === 'live',
            amlScreening: verificationData.results?.amlScreening?.status === 'clear'
          }
        }
      });
      
      onStepComplete('identity_verification');
    },
    onVerificationError: (error) => {
      onStepError('identity_verification', error);
    }
  });

  // Renderizar estado de verificación
  const renderVerificationStatus = () => {
    const statusConfig = {
      idle: {
        icon: Shield,
        color: 'gray',
        title: 'Verificación Pendiente',
        description: 'Inicia la verificación de identidad con Didit.me'
      },
      initiating: {
        icon: Clock,
        color: 'blue',
        title: 'Verificación Iniciada',
        description: 'Preparando proceso de verificación...'
      },
      pending: {
        icon: FileText,
        color: 'yellow',
        title: 'Esperando Documentos',
        description: 'Sube tu identificación oficial y cédula profesional'
      },
      processing: {
        icon: Search,
        color: 'blue',
        title: 'Procesando Verificación',
        description: 'Validando documentos y datos biométricos...'
      },
      completed: {
        icon: CheckCircle,
        color: 'green',
        title: 'Verificación Completada',
        description: 'Tu identidad ha sido verificada exitosamente'
      },
      failed: {
        icon: AlertCircle,
        color: 'red',
        title: 'Verificación Fallida',
        description: verificationState.error || 'Hubo un problema con la verificación. Intenta nuevamente.'
      }
    };

    const config = statusConfig[verificationState.status];
    const IconComponent = config.icon;

    return (
      <Card className={`border-2 ${
        config.color === 'green' ? 'border-green-200 bg-green-50' :
        config.color === 'red' ? 'border-red-200 bg-red-50' :
        config.color === 'blue' ? 'border-blue-200 bg-blue-50' :
        config.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
        'border-gray-200'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              config.color === 'green' ? 'bg-green-100' :
              config.color === 'red' ? 'bg-red-100' :
              config.color === 'blue' ? 'bg-blue-100' :
              config.color === 'yellow' ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                config.color === 'green' ? 'text-green-600' :
                config.color === 'red' ? 'text-red-600' :
                config.color === 'blue' ? 'text-blue-600' :
                config.color === 'yellow' ? 'text-yellow-600' :
                'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              <p className="text-gray-600 text-sm">{config.description}</p>
              
              {isProcessing && (
                <div className="mt-2">
                  <Progress value={progress} className="w-full h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Procesando... {progress}% completado. Esto puede tomar unos minutos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verificación de Identidad
        </h2>
        <p className="text-gray-600">
          Verifica tu identidad usando Didit.me para completar tu registro médico de forma segura.
        </p>
      </div>

      {/* ¿Qué es Didit.me? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Verificación Segura con Didit.me
          </CardTitle>
          <CardDescription>
            Didit.me es una plataforma de verificación de identidad líder que cumple con los más altos 
            estándares de seguridad y cumplimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Camera className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">Verificación Biométrica</h4>
                <p className="text-sm text-gray-600">Selfie con detección de vida real</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium">Validación de Documentos</h4>
                <p className="text-sm text-gray-600">Verificación de cédula profesional</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium">Verificación AML</h4>
                <p className="text-sm text-gray-600">Cumplimiento anti-lavado de dinero</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de verificación */}
      {renderVerificationStatus()}

      {/* Botones de acción */}
      <div className="flex flex-col space-y-4">
        {isIdle && (
          <Button 
            onClick={initiateVerification} 
            disabled={isInitiating || !data.licenseNumber}
            className="w-full"
            size="lg"
          >
            {isInitiating ? (
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
        )}

        {verificationState.verificationUrl && !isCompleted && !isFailed && (
          <Button 
            onClick={openVerificationWindow}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Proceso de Verificación
          </Button>
        )}

        {isFailed && (
          <Button 
            onClick={retryVerification} 
            disabled={isInitiating}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reintentar Verificación
          </Button>
        )}
      </div>

      {/* Resultados de verificación */}
      {verificationState.results && isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Verificación Exitosa</CardTitle>
            <CardDescription className="text-green-700">
              Todos los checks de verificación han sido completados satisfactoriamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {verificationState.results.idVerification && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    ID Verificado ({verificationState.results.idVerification.confidence}%)
                  </Badge>
                )}
                {verificationState.results.faceMatch && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Face Match ({verificationState.results.faceMatch.similarity}%)
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {verificationState.results.liveness && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Liveness ({verificationState.results.liveness.confidence}%)
                  </Badge>
                )}
                {verificationState.results.amlScreening && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    AML Clear
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de seguridad */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Seguridad garantizada:</span> Toda la información se procesa 
          con encriptación de extremo a extremo. Didit.me cumple con GDPR, ISO 27001 y nunca ha 
          experimentado una brecha de seguridad.
        </AlertDescription>
      </Alert>
    </div>
  );
}
