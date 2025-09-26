'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { UserPlus, Stethoscope, Heart, Building, FlaskConical, Pill, ArrowRight, ArrowLeft, Sparkles, Shield, Clock, Users } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleUserTypeSelection = (userType: 'doctor' | 'patient' | 'clinic' | 'laboratory' | 'pharmacy') => {
    // Redirect to specialized registration pages for each user type
    if (userType === 'patient') {
      router.push('/auth/register/patient')
    } else {
      router.push(`/auth/register/${userType}`)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-white/10"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full space-y-12">
          {/* Enhanced Header */}
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative inline-block">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <UserPlus className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <h1 className="mt-8 text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Únete a Red-Salud
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Selecciona el tipo de cuenta que mejor se adapte a tu perfil profesional
            </p>
            
            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Registro Rápido</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>+10,000 Usuarios</span>
              </div>
            </div>
          </div>

          {/* Enhanced Cards Grid */}
          <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Opción Médico */}
            <div 
              onClick={() => handleUserTypeSelection('doctor')}
              className="relative group cursor-pointer"
            >
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 group-hover:border-indigo-300/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-105 h-full">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative text-center">
                  <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-500 shadow-lg">
                    <Stethoscope className="h-10 w-10 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">
                    Soy Médico
                  </h3>
                  
                  <p className="mt-4 text-gray-600 text-center leading-relaxed">
                    Regístrate como profesional de la salud para gestionar pacientes, 
                    historiales médicos y brindar atención especializada.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-indigo-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full mr-3"></div>
                      Gestión de pacientes
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-indigo-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full mr-3"></div>
                      Historiales médicos
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-indigo-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full mr-3"></div>
                      Agenda de citas
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 group-hover:from-indigo-700 group-hover:to-indigo-800 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      Registrarme
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 group-hover:border-emerald-300/50 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-105 h-full">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative text-center">
                  <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-500 shadow-lg">
                    <Heart className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                    Soy Paciente
                  </h3>
                  
                  <p className="mt-4 text-gray-600 text-center leading-relaxed">
                    Regístrate como paciente para acceder a tu historial médico, 
                    agendar citas y comunicarte con profesionales de la salud.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mr-3"></div>
                      Mi historial médico
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mr-3"></div>
                      Agendar citas
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mr-3"></div>
                      Comunicación con médicos
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 group-hover:from-emerald-700 group-hover:to-emerald-800 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      Registrarme
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 group-hover:border-blue-300/50 group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-105 h-full">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative text-center">
                  <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-500 shadow-lg">
                    <Building className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    Soy Clínica
                  </h3>
                  
                  <p className="mt-4 text-gray-600 text-center leading-relaxed">
                    Registra tu clínica para gestionar médicos, pacientes y servicios 
                    médicos de manera integral.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3"></div>
                      Gestión de médicos
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3"></div>
                      Administración de citas
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3"></div>
                      Reportes y estadísticas
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      Registrarme
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 group-hover:border-purple-300/50 group-hover:shadow-2xl group-hover:shadow-purple-500/10 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-105 h-full">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative text-center">
                  <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-500 shadow-lg">
                    <FlaskConical className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-purple-900 transition-colors">
                    Soy Laboratorio
                  </h3>
                  
                  <p className="mt-4 text-gray-600 text-center leading-relaxed">
                    Registra tu laboratorio para gestionar resultados de pruebas, 
                    médicos asociados y pacientes.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-purple-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-3"></div>
                      Gestión de resultados
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-purple-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-3"></div>
                      Médicos asociados
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-purple-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-3"></div>
                      Reportes técnicos
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 group-hover:from-purple-700 group-hover:to-purple-800 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      Registrarme
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opción Farmacia */}
            <div 
              onClick={() => handleUserTypeSelection('pharmacy')}
              className="relative group cursor-pointer"
            >
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 group-hover:border-orange-300/50 group-hover:shadow-2xl group-hover:shadow-orange-500/10 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-105 h-full">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative text-center">
                  <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-500 shadow-lg">
                    <Pill className="h-10 w-10 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-orange-900 transition-colors">
                    Soy Farmacia
                  </h3>
                  
                  <p className="mt-4 text-gray-600 text-center leading-relaxed">
                    Registra tu farmacia para gestionar inventario, dispensar medicamentos 
                    y ofrecer servicios farmacéuticos.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-orange-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-3"></div>
                      Gestión de inventario
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-orange-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-3"></div>
                      Dispensación de recetas
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-orange-700 transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-3"></div>
                      Servicios farmacéuticos
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-600 to-orange-700 group-hover:from-orange-700 group-hover:to-orange-800 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      Registrarme
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className={`text-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-300 group">
              <ArrowLeft className="mr-3 h-5 w-5 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-gray-700 font-medium group-hover:text-indigo-700 transition-colors">
                ¿Ya tienes cuenta?
              </span>
              <Link 
                href="/auth/login" 
                className="ml-2 text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </div>
            
            {/* Additional trust elements */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3 text-green-500" />
                <span>SSL Encriptado</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>24/7 Soporte</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-purple-500" />
                <span>Comunidad Médica</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}