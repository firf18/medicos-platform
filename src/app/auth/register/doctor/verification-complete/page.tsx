'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  Shield,
  User,
  FileText,
  Eye,
  Search,
  Home
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type VerificationSummary = {
  isFullyVerified: boolean;
  verificationScore: number;
  completedChecks: string[];
  failedChecks: string[];
  warnings: string[];
}

interface VerificationResult {
  sessionId: string;
  status: 'loading' | 'success' | 'partial' | 'failed' | 'error';
  decision?: any;
  summary?: VerificationSummary;
  error?: string;
}

function VerificationCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [result, setResult] = useState<VerificationResult>({
    sessionId: sessionId || '',
    status: 'loading'
  });

  useEffect(() => {
    if (!sessionId) {
      setResult({
        sessionId: '',
        status: 'error',
        error: 'No se proporcionó un ID de sesión válido'
      });
      return;
    }

    // Simular verificación
    const checkVerification = async () => {
      try {
        // Aquí iría la llamada real a la API de Didit
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setResult({
          sessionId,
          status: 'success',
          summary: {
            isFullyVerified: true,
            verificationScore: 95,
            completedChecks: ['ID Verification', 'Liveness Check', 'Face Match'],
            failedChecks: [],
            warnings: []
          }
        });
      } catch (error) {
        setResult({
          sessionId,
          status: 'error',
          error: 'Error al verificar la sesión'
        });
      }
    };

    checkVerification();
  }, [sessionId]);

  const getStatusIcon = () => {
    switch (result.status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-16 w-16 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-blue-600 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (result.status) {
      case 'success':
        return '¡Verificación Completada Exitosamente!';
      case 'partial':
        return 'Verificación Parcialmente Completada';
      case 'failed':
        return 'Verificación Fallida';
      case 'error':
        return 'Error en la Verificación';
      default:
        return 'Verificando...';
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'success':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'failed':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (result.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando...</h2>
          <p className="text-gray-600">Por favor espera mientras procesamos tu verificación</p>
                  </div>
                </div>
        );
  }

        return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            {getStatusIcon()}
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {result.status === 'success' 
              ? 'Tu identidad ha sido verificada correctamente. Puedes continuar con el registro.'
              : result.status === 'partial'
              ? 'Algunos aspectos de tu verificación requieren atención adicional.'
              : 'Hubo un problema con tu verificación. Por favor, intenta nuevamente.'
            }
          </p>
              </div>

        {/* Resultado de Verificación */}
        {result.summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Resumen de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Puntuación de Verificación:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={result.summary.verificationScore} className="w-32" />
                    <span className="text-sm font-medium">{result.summary.verificationScore}%</span>
                  </div>
                  </div>
                  
                {/* Checks Completados */}
                    {result.summary.completedChecks.length > 0 && (
                      <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Verificaciones Completadas:</h4>
                    <div className="flex flex-wrap gap-2">
                          {result.summary.completedChecks.map((check, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {check}
                        </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                {/* Checks Fallidos */}
                    {result.summary.failedChecks.length > 0 && (
                      <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Verificaciones Fallidas:</h4>
                    <div className="flex flex-wrap gap-2">
                          {result.summary.failedChecks.map((check, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {check}
                        </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                {/* Advertencias */}
                {result.summary.warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Advertencias:</h4>
                    <div className="space-y-2">
                      {result.summary.warnings.map((warning, index) => (
                        <Alert key={index}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {result.error && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {result.status === 'success' ? (
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => router.push('/auth/register/doctor/success')}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continuar Registro
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push('/auth/register/doctor')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar Nuevamente
            </Button>
          )}
          
          <Button 
            size="lg" 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>

        {/* Información Adicional */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            ¿Necesitas ayuda con la verificación?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="link" onClick={() => router.push('/contacto')}>
              Contactar Soporte
            </Button>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Button variant="link" onClick={() => router.push('/faq')}>
              Preguntas Frecuentes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando...</h2>
        <p className="text-gray-600">Por favor espera mientras procesamos tu verificación</p>
      </div>
    </div>}>
      <VerificationCompleteContent />
    </Suspense>
  );
}