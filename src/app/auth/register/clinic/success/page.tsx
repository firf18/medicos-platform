'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, Mail, Phone, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ClinicRegistrationSuccessPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Registro Completado!
          </h1>
          <p className="text-lg text-gray-600">
            Tu clínica ha sido registrada exitosamente en nuestra plataforma
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-center">¿Qué sigue ahora?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Verificación de Email</h3>
                  <p className="text-blue-800 text-sm">
                    Revisa tu correo electrónico para verificar tu cuenta. El email puede tardar unos minutos en llegar.
                  </p>
                </div>
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>

              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-600 text-white rounded-full text-sm font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Revisión de Documentos</h3>
                  <p className="text-yellow-800 text-sm">
                    Nuestro equipo revisará los datos de tu clínica. Este proceso puede tomar entre 1-3 días hábiles.
                  </p>
                </div>
                <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Activación de Cuenta</h3>
                  <p className="text-green-800 text-sm">
                    Una vez aprobado, recibirás credenciales de acceso y podrás comenzar a usar la plataforma.
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
            </div>

            {/* Important Notes */}
            <Alert>
              <Phone className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Mantén tu teléfono disponible. Nuestro equipo de verificación 
                podría contactarte para confirmar algunos datos de tu clínica.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Mientras tanto, puedes:</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Preparar los documentos legales de tu clínica
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Revisar nuestras guías de mejores prácticas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Contactar a tu equipo médico sobre la nueva plataforma
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">¿Tienes preguntas?</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:soporte@platform-medicos.com" className="underline hover:no-underline">
                    soporte@platform-medicos.com
                  </a>
                </p>
                <p>
                  <strong>WhatsApp:</strong>{' '}
                  <a href="https://wa.me/584120000000" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                    +58 412-000-0000
                  </a>
                </p>
                <p className="text-xs mt-2">
                  Horario de atención: Lunes a Viernes de 8:00 AM a 6:00 PM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
          
          <Button asChild size="lg">
            <Link href="/auth/login/clinicas">
              Ir al Login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Si no recibes el email de confirmación en 30 minutos, revisa tu carpeta de spam o{' '}
            <a href="mailto:soporte@platform-medicos.com" className="text-blue-600 hover:underline">
              contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
