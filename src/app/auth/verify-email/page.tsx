'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    // Simular envío de email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsResending(false);
    setResendSuccess(true);
    setCountdown(60); // 60 segundos de espera
    
    // Ocultar mensaje de éxito después de 5 segundos
    setTimeout(() => setResendSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verifica tu Email
          </h1>
          <p className="text-lg text-gray-600">
            Hemos enviado un enlace de verificación a tu correo electrónico
          </p>
        </div>

        {/* Card principal */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Revisa tu Correo
            </CardTitle>
            <CardDescription>
              Busca un email de Red-Salud en tu bandeja de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instrucciones */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Revisa tu bandeja de entrada</p>
                  <p className="text-xs text-gray-500">
                    Busca un email de <strong>noreply@red-salud.org</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Haz clic en el enlace de verificación</p>
                  <p className="text-xs text-gray-500">
                    El enlace te llevará de vuelta a Red-Salud
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">¡Listo! Tu cuenta estará activa</p>
                  <p className="text-xs text-gray-500">
                    Podrás acceder a tu dashboard médico
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de reenvío */}
            <div className="text-center">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Reenviar en {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reenviar Email
                  </>
                )}
              </Button>
            </div>

            {/* Mensaje de éxito del reenvío */}
            {resendSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">¿No recibiste el email?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">📧 Revisa tu carpeta de spam</h4>
                <p className="text-sm text-yellow-700">
                  A veces los emails de verificación llegan a la carpeta de spam o correo no deseado.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">⏰ Espera unos minutos</h4>
                <p className="text-sm text-blue-700">
                  Los emails pueden tardar hasta 5 minutos en llegar. Si pasan más de 10 minutos, 
                  intenta reenviar el email.
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-1">✉️ Verifica la dirección</h4>
                <p className="text-sm text-gray-700">
                  Asegúrate de que el email esté escrito correctamente. Si hay un error, 
                  contacta a soporte para corregirlo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </Link>
          </Button>
          
          <Button asChild className="w-full sm:w-auto">
            <Link href="/contacto">
              Contactar Soporte
            </Link>
          </Button>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            ¿Necesitas ayuda inmediata?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a href="mailto:soporte@red-salud.org" className="text-sm text-blue-600 hover:text-blue-800">
              soporte@red-salud.org
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="tel:+525512345678" className="text-sm text-blue-600 hover:text-blue-800">
              +52 55 1234 5678
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}