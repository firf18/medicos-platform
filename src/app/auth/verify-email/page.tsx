'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const type = searchParams.get('type') || 'patient'
  
  const supabase = createClient()

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !token) return

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) {
        console.error('OTP Verification Error:', error)
        
        // Mensajes de error más específicos
        if (error.message.includes('Token has expired')) {
          throw new Error('El código ha expirado. Solicita uno nuevo.')
        } else if (error.message.includes('Invalid token')) {
          throw new Error('El código ingresado no es válido. Verifica los 6 dígitos.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('No se pudo confirmar el email. Intenta con un código nuevo.')
        } else {
          throw new Error(`Error de verificación: ${error.message}`)
        }
      }

      if (data.user) {
        setSuccess(true)
        
        // Redirigir según el tipo de usuario después de un breve delay
        setTimeout(() => {
          const redirectTo = type === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
          router.push(redirectTo)
        }, 2000)
      } else {
        throw new Error('No se pudo verificar el usuario. Intenta nuevamente.')
      }

    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      setError(error.message || 'Error al verificar el código')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error

      // Mostrar mensaje de éxito temporal
      setError('')
      alert('Código reenviado. Revisa tu email.')

    } catch (error: any) {
      setError(error.message || 'Error al reenviar el código')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ¡Email Verificado!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tu cuenta ha sido verificada exitosamente. Serás redirigido en breve...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificar Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa el código de 6 dígitos que enviamos a{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Código de Verificación
            </label>
            <input
              id="token"
              name="token"
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/register"
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver al registro
            </Link>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              Reenviar código
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}