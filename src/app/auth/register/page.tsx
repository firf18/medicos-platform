'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Stethoscope, Heart, ArrowRight, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const handleUserTypeSelection = (userType: 'doctor' | 'patient') => {
    router.push(`/auth/register/${userType}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <UserPlus className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Únete a MediConsult
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Selecciona el tipo de cuenta que necesitas
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Opción Médico */}
          <div 
            onClick={() => handleUserTypeSelection('doctor')}
            className="relative group cursor-pointer"
          >
            <div className="relative p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-indigo-500 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                  <Stethoscope className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  Soy Médico
                </h3>
                <p className="mt-4 text-gray-600 text-center leading-relaxed">
                  Regístrate como profesional de la salud para gestionar pacientes, 
                  historiales médicos y brindar atención especializada.
                </p>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                    Gestión de pacientes
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                    Historiales médicos
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                    Agenda de citas
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                    Prescripciones digitales
                  </div>
                </div>

                <div className="mt-8">
                  <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
                    Registrarme como Médico
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opción Paciente */}
          <div 
            onClick={() => handleUserTypeSelection('patient')}
            className="relative group cursor-pointer"
          >
            <div className="relative p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-emerald-500 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                  <Heart className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  Soy Paciente
                </h3>
                <p className="mt-4 text-gray-600 text-center leading-relaxed">
                  Regístrate como paciente para acceder a tu historial médico, 
                  agendar citas y comunicarte con profesionales de la salud.
                </p>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    Mi historial médico
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    Agendar citas
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    Comunicación con médicos
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    Seguimiento de tratamientos
                  </div>
                </div>

                <div className="mt-8">
                  <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 group-hover:bg-emerald-700 transition-colors">
                    Registrarme como Paciente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}