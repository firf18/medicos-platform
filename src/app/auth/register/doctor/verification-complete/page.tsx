'use client';

import { useEffect, useState } from 'react';
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

export default function VerificationCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<VerificationResult>({
    sessionId: '',
    status: 'loading'
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setResult({
        sessionId: '',
        status: 'error',
        error: 'No se encontró ID de sesión en la URL'
      });
      return;
    }

    setResult(prev => ({ ...prev, sessionId }));
    
    // Simular progreso mientras obtenemos resultados
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    // Obtener resultados de verificación
    const fetchResults = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Dar tiempo para que Didit procese
        // Consultar al backend para estado y resumen
        const res = await fetch(`/api/didit/verification-status?session_id=${sessionId}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `No se pudo obtener estado (${res.status})`);
        }
        const payload = await res.json();
        const decision = payload.decision;
        const summary: VerificationSummary = payload.summary;
        
        clearInterval(progressInterval);
        setProgress(100);
        
        let status: VerificationResult['status'] = 'failed';
        
        if (decision.status === 'Approved') {
          status = summary.isFullyVerified ? 'success' : 'partial';
        } else if (decision.status === 'In Review') {
          status = 'partial';
        }
        
        setResult({
          sessionId,
          status,
          decision,
          summary
        });

        // Mostrar toast según el resultado
        if (status === 'success') {
          toast({
            title: ' Verificación Exitosa',
            description: `Tu identidad ha sido verificada con ${summary.verificationScore}% de confianza.`
          });
        } else if (status === 'partial') {
          toast({
            title: ' Verificación Parcial',
            description: 'Tu verificación requiere revisión adicional. Te notificaremos cuando esté lista.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: ' Verificación Fallida',
            description: 'No se pudo completar la verificación. Intenta nuevamente.',
            variant: 'destructive'
          });
        }
        
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error obteniendo resultados:', error);
        
        setResult({
          sessionId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });

        toast({
          title: 'Error',
          description: 'No se pudieron obtener los resultados de verificación.',
          variant: 'destructive'
        });
      }
    };

    fetchResults();

    return () => {
      clearInterval(progressInterval);
    };
  }, [searchParams]);

  const renderContent = () => {
    switch (result.status) {
      case 'loading':
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <CardTitle className="text-blue-800">Procesando Verificación</CardTitle>
              <CardDescription className="text-blue-700">
                Estamos obteniendo los resultados de tu verificación de identidad...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-blue-700">
                  <span>Progreso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full h-3" />
                <p className="text-center text-sm text-blue-600">
                  Esto puede tomar unos momentos. No cierres esta página.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">¡Verificación Exitosa!</CardTitle>
              <CardDescription className="text-green-700">
                Tu identidad ha sido verificada correctamente. Ya puedes continuar con tu registro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.summary && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                      <Shield className="h-4 w-4 mr-2" />
                      {result.summary.verificationScore}% de Confianza
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {result.summary.completedChecks.map((check, index) => (
                      <div key={index} className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{check}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={() => router.push('/auth/register/doctor')}
                      className="flex-1"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continuar Registro
                    </Button>
                    <Button 
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Ir al Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'partial':
        return (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-800">Verificación en Revisión</CardTitle>
              <CardDescription className="text-yellow-700">
                Tu verificación se completó pero requiere revisión manual adicional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.summary && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      {result.summary.verificationScore}% Completado
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {result.summary.completedChecks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">Verificaciones Exitosas:</h4>
                        <div className="space-y-1">
                          {result.summary.completedChecks.map((check, index) => (
                            <div key={index} className="flex items-center space-x-2 text-yellow-700">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">{check}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.summary.failedChecks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">Pendientes de Revisión:</h4>
                        <div className="space-y-1">
                          {result.summary.failedChecks.map((check, index) => (
                            <div key={index} className="flex items-center space-x-2 text-yellow-700">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{check}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Te notificaremos por email cuando la revisión esté completa. 
                      Mientras tanto, puedes continuar con tu registro.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => router.push('/auth/register/doctor')}
                      className="flex-1"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continuar Registro
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'failed':
      case 'error':
        return (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-800">
                {result.status === 'failed' ? 'Verificación Fallida' : 'Error en Verificación'}
              </CardTitle>
              <CardDescription className="text-red-700">
                {result.error || 'No se pudo completar la verificación de identidad.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.summary && result.summary.failedChecks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Verificaciones Fallidas:</h4>
                    <div className="space-y-1">
                      {result.summary.failedChecks.map((check, index) => (
                        <div key={index} className="flex items-center space-x-2 text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Puedes intentar la verificación nuevamente o contactar a soporte 
                    si el problema persiste.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => router.push('/auth/register/doctor')}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Intentar Nuevamente
                  </Button>
                  <Button 
                    onClick={() => router.push('/contacto')}
                    variant="outline"
                    className="flex-1"
                  >
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificación de Identidad
          </h1>
          <p className="text-gray-600">
            Procesando los resultados de tu verificación con Didit.me
          </p>
          {result.sessionId && (
            <Badge variant="outline" className="mt-2">
              Sesión: {result.sessionId.slice(0, 8)}...
            </Badge>
          )}
        </div>

        {renderContent()}

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ¿Tienes problemas? {' '}
            <button 
              onClick={() => router.push('/contacto')}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              Contacta a nuestro equipo de soporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}