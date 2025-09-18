'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Shield, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function DoctorRegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  // Si hay un error, mostrar página de error
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Verificación Fallida</CardTitle>
              <CardDescription className="text-red-700">
                {message || 'Hubo un problema con la verificación de tu identidad.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-red-600 mb-4">
                  No te preocupes, puedes intentar nuevamente o contactar a nuestro equipo de soporte.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/auth/register/doctor">
                      Intentar Nuevamente
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/contacto">
                      Contactar Soporte
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Página de éxito
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Registro Completado Exitosamente!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bienvenido a Red-Salud. Tu cuenta de médico ha sido creada y verificada correctamente.
          </p>
        </div>

        {/* Tarjetas de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estado de verificación */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Shield className="h-5 w-5 mr-2" />
                Verificación de Identidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Método:</span>
                  <span className="text-sm font-medium">Didit.me</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="text-sm font-medium">{new Date().toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos pasos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximos Pasos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verificación de Email</p>
                    <p className="text-xs text-gray-500">Revisa tu correo para activar tu cuenta</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Configuración del Perfil</p>
                    <p className="text-xs text-gray-500">Completa tu información profesional</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Acceso al Dashboard</p>
                    <p className="text-xs text-gray-500">Comienza a gestionar tus pacientes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información importante */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📧 Verificación de Email</h4>
                <p className="text-sm text-blue-700">
                  Hemos enviado un enlace de verificación a tu correo electrónico. 
                  Haz clic en el enlace para activar completamente tu cuenta.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⏰ Tiempo de Activación</h4>
                <p className="text-sm text-yellow-700">
                  Tu cuenta estará completamente activa en las próximas 24 horas después de 
                  verificar tu email. Mientras tanto, puedes acceder a tu perfil.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🔒 Seguridad</h4>
                <p className="text-sm text-green-700">
                  Tu información está protegida con encriptación de extremo a extremo. 
                  Cumplimos con todos los estándares de seguridad médica.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/doctor/dashboard">
              <ArrowRight className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/auth/login">
              Iniciar Sesión
            </Link>
          </Button>
        </div>

        {/* Información de contacto */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            ¿Necesitas ayuda o tienes preguntas?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/contacto" className="text-sm text-blue-600 hover:text-blue-800">
              Contactar Soporte
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link href="/faq" className="text-sm text-blue-600 hover:text-blue-800">
              Preguntas Frecuentes
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link href="/nosotros" className="text-sm text-blue-600 hover:text-blue-800">
              Conoce Más
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
