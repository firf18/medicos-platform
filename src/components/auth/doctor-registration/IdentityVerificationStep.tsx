'use client';

import { useEffect } from 'react';
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
  Search,
  User,
  MapPin,
  Award,
  Eye,
  Zap,
  Globe,
  Timer,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';

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
  
  // Usar el hook profesional para Didit
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

  // Efecto para verificar si hay una sesión guardada al cargar el componente
  useEffect(() => {
    // Si hay una sesión guardada, mostrar opción para reanudar
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
    documentType: 'cedula_identidad', // Asumimos cédula venezolana
    documentNumber: data.licenseNumber, // Usar el número de licencia como documentNumber
    medicalBoard: 'Colegio de Médicos de Venezuela', // Valor por defecto
    university: '' // Valor por defecto
  });

  // Manejar inicio de verificación
  const handleInitiateVerification = async () => {
    try {
      const doctorData = prepareDoctorData();
      await initiateVerification(doctorData);
    } catch (error) {
      console.error('Error iniciando verificación:', error);
    }
  };

  // Renderizar estado de verificación con más detalle
  const renderVerificationStatus = () => {
    const statusConfigs = {
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
        description: state.verificationSummary?.isFullyVerified 
          ? 'Tu identidad ha sido verificada exitosamente'
          : 'Verificación completada con observaciones'
      },
      failed: {
        icon: AlertCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        title: 'Verificación Fallida',
        description: state.error || 'Hubo un problema con la verificación. Puedes intentar nuevamente.'
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
    };

    const config = statusConfigs[state.status];
    const IconComponent = config.icon;

    return (
      <Card className={`border-2 ${config.borderColor} ${config.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full bg-white shadow-sm`}>
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
              <p className="text-gray-600 text-sm mb-3">{config.description}</p>
              
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
                    {!isCompleted && !isFailed && (
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
        </CardContent>
      </Card>
    );
  };

  // Renderizar resultados detallados de verificación
  const renderVerificationResults = () => {
    if (!state.verificationSummary || !isCompleted) return null;

    const { verificationScore, completedChecks, failedChecks, warnings, isFullyVerified } = state.verificationSummary;

    return (
      <Card className={`border-2 ${isFullyVerified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isFullyVerified ? 'text-green-800' : 'text-yellow-800'}`}>
            {isFullyVerified ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            {isFullyVerified ? 'Verificación Exitosa' : 'Verificación Parcial'}
            <Badge className={`ml-auto ${isFullyVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {verificationScore}% de confianza
            </Badge>
          </CardTitle>
          <CardDescription className={isFullyVerified ? 'text-green-700' : 'text-yellow-700'}>
            {isFullyVerified 
              ? 'Todos los checks de verificación han sido completados satisfactoriamente.'
              : 'La verificación se completó pero requiere revisión adicional.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checks completados */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Verificaciones Exitosas ({completedChecks.length})
              </h4>
              <div className="space-y-2">
                {completedChecks.map((check, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {check}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Checks fallidos */}
            {failedChecks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                  Verificaciones Pendientes ({failedChecks.length})
                </h4>
                <div className="space-y-2">
                  {failedChecks.map((check, index) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {check}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-600" />
                Observaciones ({warnings.length})
              </h4>
              <div className="space-y-1">
                {warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-gray-600 flex items-start">
                    <AlertTriangle className="h-3 w-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Verificación Segura con Didit.me
          </CardTitle>
          <CardDescription>
            Didit.me es la plataforma de verificación de identidad líder mundial, utilizada por instituciones 
            médicas y financieras para verificar profesionales de la salud.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <Camera className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Verificación Biométrica</h4>
                <p className="text-sm text-gray-600">Selfie con detección de vida real avanzada</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Validación de Documentos</h4>
                <p className="text-sm text-gray-600">Cédula profesional y de identidad venezolana</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Verificación AML</h4>
                <p className="text-sm text-gray-600">Cumplimiento anti-lavado de dinero</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Estándares Globales</h4>
                <p className="text-sm text-gray-600">GDPR, ISO 27001, SOC 2 Type II</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de verificación */}
      {renderVerificationStatus()}

      {/* Botones de acción */}
      <div className="flex flex-col space-y-3">
        {isIdle && (
          <Button 
            onClick={handleInitiateVerification} 
            disabled={isInitiating || !data.licenseNumber || isLoading}
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

        {isSessionCreated && (
          <Button 
            onClick={openVerificationWindow}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Proceso de Verificación
          </Button>
        )}

        {isUserVerifying && (
          <div className="flex space-x-3">
            <Button 
              onClick={openVerificationWindow}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Reabrir Verificación
            </Button>
            <Button 
              onClick={checkResults}
              variant="outline"
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              Verificar Resultados
            </Button>
          </div>
        )}

        {isProcessing && (
          <Button 
            onClick={checkResults}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Verificar Estado
          </Button>
        )}

        {(isFailed || isExpired) && (
          <div className="flex space-x-3">
            {canRetry && (
              <Button 
                onClick={retryVerification} 
                disabled={isInitiating}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar ({state.maxRetries - state.retryCount} intentos)
              </Button>
            )}
            <Button 
              onClick={resetVerification}
              variant="outline"
              className="flex-1"
            >
              <Timer className="h-4 w-4 mr-2" />
              Empezar de Nuevo
            </Button>
          </div>
        )}

        {(isUserVerifying || isProcessing) && (
          <Button 
            onClick={cancelVerification}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            Cancelar Verificación
          </Button>
        )}
      </div>

      {/* Resultados de verificación */}
      {renderVerificationResults()}

      {/* Información de seguridad y privacidad */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Seguridad y Privacidad:</span> Toda la información se procesa 
          con encriptación de extremo a extremo. Didit.me cumple con GDPR, ISO 27001 y SOC 2 Type II. 
          Tus datos médicos están protegidos bajo las más altas medidas de seguridad internacionales.
        </AlertDescription>
      </Alert>

      {/* Información específica para médicos venezolanos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Verificación para Médicos Venezolanos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-start space-x-2">
              <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Cédula Profesional</p>
                <p>Validamos tu cédula profesional venezolana (MPPS, CMC, etc.)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Cédula de Identidad</p>
                <p>Verificamos tu cédula de identidad venezolana (V- o E-)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Verificación Biométrica</p>
                <p>Comparamos tu rostro con la foto de tu documento</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Proceso Rápido</p>
                <p>Verificación completa en menos de 5 minutos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}