'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pill, Shield, CheckCircle2, AlertCircle } from 'lucide-react'
import { PharmacyRegistrationForm } from '@/components/auth/pharmacy/PharmacyRegistrationForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PharmacyRegisterPage() {
  const router = useRouter()
  const [showRegistration, setShowRegistration] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const benefits = [
    {
      icon: Shield,
      title: 'Cumplimiento Normativo',
      description: 'Sistema diseñado para cumplir con las regulaciones de COFEPRIS y las autoridades sanitarias mexicanas.'
    },
    {
      icon: CheckCircle2,
      title: 'Gestión Profesional',
      description: 'Herramientas profesionales para gestionar inventario, dispensación y servicios farmacéuticos.'
    },
    {
      icon: AlertCircle,
      title: 'Verificación Rigurosa',
      description: 'Proceso de verificación que garantiza la legitimidad y profesionalismo de tu farmacia.'
    }
  ]

  const requirements = [
    'Licencia sanitaria vigente expedida por COFEPRIS o autoridad local',
    'RFC o CURP (según tipo de negocio)',
    'Documentos legales de constitución del negocio',
    'Responsable farmacéutico con cédula profesional',
    'Dirección física verificable de la farmacia',
    'Seguro de responsabilidad civil (recomendado)'
  ]

  if (showRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowRegistration(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a información
            </Button>
          </div>
          
          <PharmacyRegistrationForm 
            onSuccess={(pharmacyId) => {
              router.push(`/pharmacy-dashboard?welcome=true&id=${pharmacyId}`)
            }}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/auth/register"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a tipos de cuenta
          </Link>
          
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-orange-100 mb-6">
            <Pill className="h-10 w-10 text-orange-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Registro de Farmacia
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Únete a la red de farmacias más confiable de México. Registra tu farmacia y 
            accede a herramientas profesionales para gestionar tu negocio farmacéutico.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Benefits Section */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-orange-700">
                  Beneficios de Red-Salud
                </CardTitle>
                <CardDescription>
                  Descubre por qué las farmacias líderes confían en nuestra plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <benefit.icon className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-orange-700">
                  Proceso de Verificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                      1
                    </div>
                    <span className="text-gray-700">Completar formulario de registro</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                      2
                    </div>
                    <span className="text-gray-700">Subir documentos requeridos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                      3
                    </div>
                    <span className="text-gray-700">Verificación por equipo especializado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                      4
                    </div>
                    <span className="text-gray-700">Activación de cuenta (1-3 días hábiles)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requirements Section */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-orange-700">
                  Requisitos de Registro
                </CardTitle>
                <CardDescription>
                  Documentos y requisitos necesarios para registrar tu farmacia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-orange-800 font-medium mb-1">
                        Importante
                      </p>
                      <p className="text-orange-700 text-sm">
                        Todos los documentos deben estar vigentes y ser legibles. 
                        El proceso de verificación puede tomar de 1 a 3 días hábiles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-orange-700">
                  ¿Listo para comenzar?
                </CardTitle>
                <CardDescription>
                  Inicia el proceso de registro de tu farmacia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  El registro toma aproximadamente 15-20 minutos. Puedes guardar 
                  tu progreso y continuar más tarde si es necesario.
                </p>
                
                <Button
                  onClick={() => setShowRegistration(true)}
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  {isLoading ? 'Cargando...' : 'Iniciar Registro'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Al continuar, aceptas nuestros{' '}
                  <Link href="/terminos" className="text-orange-600 hover:underline">
                    términos y condiciones
                  </Link>{' '}
                  y{' '}
                  <Link href="/privacidad" className="text-orange-600 hover:underline">
                    política de privacidad
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Tienes preguntas sobre el registro?
            </h2>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier duda 
              sobre el proceso de registro o los requisitos necesarios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/faq"
                className="inline-flex items-center justify-center px-6 py-3 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 transition-colors"
              >
                Ver Preguntas Frecuentes
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Contactar Soporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
