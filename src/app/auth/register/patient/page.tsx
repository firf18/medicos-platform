'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, Shield, Clock, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModernPatientRegistrationForm } from '@/components/auth/patient/ModernPatientRegistrationForm'

export default function PatientRegistrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/register" 
                className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">Red-Salud</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-100 rounded-full">
                <Heart className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Únete a Red-Salud como Paciente
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accede a tu historial médico completo, agenda citas con especialistas 
              y mantente conectado con tu equipo médico de confianza.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Historial Médico Seguro</h3>
              <p className="text-sm text-gray-600">
                Todos tus registros médicos en un lugar seguro y accesible
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex justify-center mb-4">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Citas Online</h3>
              <p className="text-sm text-gray-600">
                Agenda citas con especialistas desde la comodidad de tu hogar
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
              <div className="flex justify-center mb-4">
                <Stethoscope className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Equipo Médico</h3>
              <p className="text-sm text-gray-600">
                Conecta con tu médico de cabecera y especialistas
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear tu cuenta de paciente</h2>
              <p className="text-gray-600">
                Registro rápido y seguro para acceder a tu portal médico
              </p>
            </div>
            
            <ModernPatientRegistrationForm />
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-green-500" />
                100% Seguro
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1 text-emerald-500" />
                Verificado
              </div>
              <div className="flex items-center">
                <Stethoscope className="h-4 w-4 mr-1 text-blue-500" />
                Confiable
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
