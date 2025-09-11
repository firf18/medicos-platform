'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de Verificación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            El código de verificación ha expirado o no es válido.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">Posibles causas:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>El código ha expirado (válido por 1 hora)</li>
              <li>El código ya fue utilizado</li>
              <li>El enlace fue escaneado por tu proveedor de email</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Intenta registrarte nuevamente o contacta al soporte si el problema persiste.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Intentar Nuevamente
            </Link>
            
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ir al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}