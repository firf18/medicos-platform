'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useRegistrationPersistence } from '@/hooks/useRegistrationPersistence';

export default function ContinueRegistrationPage() {
  const router = useRouter();
  const { hasSavedProgress, loadProgress, clearProgress } = useRegistrationPersistence();

  useEffect(() => {
    // Si no hay progreso guardado, redirigir al registro normal
    if (!hasSavedProgress) {
      router.push('/auth/register/doctor');
    }
  }, [hasSavedProgress, router]);

  const handleContinue = () => {
    // Verificar que haya progreso guardado
    const { progress } = loadProgress();
    
    if (progress) {
      // Redirigir al paso guardado
      router.push('/auth/register/doctor');
    }
  };

  const handleStartOver = () => {
    // Limpiar progreso guardado y comenzar de nuevo
    clearProgress();
    router.push('/auth/register/doctor');
  };

  if (!hasSavedProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Progreso no encontrado
            </CardTitle>
            <CardDescription>
              No se encontró progreso guardado para continuar con el registro.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => router.push('/auth/register/doctor')}
              className="w-full"
            >
              Comenzar registro
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Continuar registro</CardTitle>
          <CardDescription>
            Hemos encontrado un registro en progreso. ¿Deseas continuar donde lo dejaste?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Progreso guardado</AlertTitle>
            <AlertDescription>
              Tu progreso en el registro de médico ha sido guardado automáticamente. 
              Puedes continuar desde donde lo dejaste o comenzar un nuevo registro.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={handleContinue}
            className="w-full"
          >
            Continuar registro
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={handleStartOver}
            className="w-full"
          >
            Comenzar de nuevo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}