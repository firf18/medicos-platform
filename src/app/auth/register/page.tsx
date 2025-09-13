'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Stethoscope, Heart, Building, FlaskConical, ArrowRight, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const handleUserTypeSelection = (userType: 'doctor' | 'patient' | 'clinic' | 'laboratory') => {
    // Redirect to specialized registration pages for each user type
    router.push(`/auth/register/${userType}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
            <UserPlus className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Únete a Red-Salud
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Selecciona el tipo de cuenta que necesitas
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Opción Médico */}
          <div 
            onClick={() => handleUserTypeSelection('doctor')}
            className="relative group cursor-pointer"
          >
            <div className="relative p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-indigo-500 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                  <Stethoscope className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Soy Médico
                </h3>
                <p className="mt-3 text-gray-600 text-center leading-relaxed text-sm">
                  Regístrate como profesional de la salud para gestionar pacientes, 
                  historiales médicos y brindar atención especializada.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    Gestión de pacientes
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    Historiales médicos
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    Agenda de citas
                  </div>
                </div>

                <div className="mt-6">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
                    Registrarme
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
            <div className="relative p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-emerald-500 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                  <Heart className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Soy Paciente
                </h3>
                <p className="mt-3 text-gray-600 text-center leading-relaxed text-sm">
                  Regístrate como paciente para acceder a tu historial médico, 
                  agendar citas y comunicarte con profesionales de la salud.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    Mi historial médico
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    Agendar citas
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    Comunicación con médicos
                  </div>
                </div>

                <div className="mt-6">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 group-hover:bg-emerald-700 transition-colors">
                    Registrarme
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opción Clínica */}
          <div 
            onClick={() => handleUserTypeSelection('clinic')}
            className="relative group cursor-pointer"
          >
            <div className="relative p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-blue-500 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Soy Clínica
                </h3>
                <p className="mt-3 text-gray-600 text-center leading-relaxed text-sm">
                  Registra tu clínica para gestionar médicos, pacientes y servicios 
                  médicos de manera integral.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Gestión de médicos
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Administración de citas
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Reportes y estadísticas
                  </div>
                </div>

                <div className="mt-6">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 group-hover:bg-blue-700 transition-colors">
                    Registrarme
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opción Laboratorio */}
          <div 
            onClick={() => handleUserTypeSelection('laboratory')}
            className="relative group cursor-pointer"
          >
            <div className="relative p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-purple-500 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <FlaskConical className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Soy Laboratorio
                </h3>
                <p className="mt-3 text-gray-600 text-center leading-relaxed text-sm">
                  Registra tu laboratorio para gestionar resultados de pruebas, 
                  médicos asociados y pacientes.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Gestión de resultados
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Médicos asociados
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Reportes técnicos
                  </div>
                </div>

                <div className="mt-6">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 group-hover:bg-purple-700 transition-colors">
                    Registrarme
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