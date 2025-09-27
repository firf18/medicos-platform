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
        </div>
      </div>
    </div>
  )
}
