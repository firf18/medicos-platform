import Link from 'next/link'
import { Stethoscope, Heart, Building2, FlaskConical, Pill, ArrowRight, CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

function RegistrationSuccessMessage() {
  return (
    <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center">
        <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-green-800">
            ¡Registro Completado Exitosamente!
          </h3>
          <p className="text-green-700 mt-1">
            Tu cuenta médica ha sido creada y verificada. Ya puedes iniciar sesión con tus credenciales.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Bienvenido a Red-Salud
          </h2>
          <p className="text-lg text-gray-600">
            Selecciona tu tipo de cuenta para continuar
          </p>
        </div>
        
        {/* Mostrar mensaje de éxito si viene del registro completado */}
        {params?.message === 'registration-completed' && (
          <Suspense fallback={<div>Cargando...</div>}>
            <RegistrationSuccessMessage />
          </Suspense>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Login Médicos */}
          <Link href="/auth/login/medicos">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-blue-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Soy Médico
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Accede a tu consulta digital y gestiona pacientes.
                </p>
                
                <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium text-sm">
                  Acceder al Dashboard
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </div>
          </Link>

          {/* Login Pacientes */}
          <Link href="/auth/login/paciente">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-green-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Soy Paciente
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Consulta tu historial médico y agenda citas.
                </p>
                
                <div className="flex items-center justify-center text-green-600 group-hover:text-green-700 font-medium text-sm">
                  Acceder a Mi Portal
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </div>
          </Link>

          {/* Login Clínicas */}
          <Link href="/auth/login/clinicas">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-purple-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-700 transition-colors">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Soy Clínica
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Gestiona tu centro médico y administra recursos.
                </p>
                
                <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-700 font-medium text-sm">
                  Acceder al Panel
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </div>
          </Link>

          {/* Login Laboratorios */}
          <Link href="/auth/login/laboratorios">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-orange-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-700 transition-colors">
                  <FlaskConical className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Soy Laboratorio
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Gestiona análisis y resultados de laboratorio.
                </p>
                
                <div className="flex items-center justify-center text-orange-600 group-hover:text-orange-700 font-medium text-sm">
                  Acceder al Sistema
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </div>
          </Link>

          {/* Login Farmacias */}
          <Link href="/auth/login/farmacias">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-teal-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-700 transition-colors">
                  <Pill className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Soy Farmacia
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Gestiona inventario y dispensación de medicamentos.
                </p>
                
                <div className="flex items-center justify-center text-teal-600 group-hover:text-teal-700 font-medium text-sm">
                  Acceder al Sistema
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link 
              href="/auth/register" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Regístrate gratis aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}