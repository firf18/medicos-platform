import Link from 'next/link'
import { Stethoscope, Heart, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Bienvenido a MediConsult
          </h2>
          <p className="text-lg text-gray-600">
            Selecciona tu tipo de cuenta para continuar
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Login Médicos */}
          <Link href="/auth/login/medicos">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Soy Médico
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Accede a tu consulta digital, gestiona pacientes y lleva el control completo de tu práctica médica.
                </p>
                
                <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium">
                  Acceder al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </div>
          </Link>

          {/* Login Pacientes */}
          <Link href="/auth/login/pacientes">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-200 cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-700 transition-colors">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Soy Paciente
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Consulta tu historial médico, agenda citas y mantente conectado con tus médicos de confianza.
                </p>
                
                <div className="flex items-center justify-center text-green-600 group-hover:text-green-700 font-medium">
                  Acceder a Mi Portal
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
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