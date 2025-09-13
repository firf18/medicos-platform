'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      if (session.user.email) {
        setEmail(session.user.email)
      }
      
      // Si el correo ya está verificado, redirigir al dashboard
      if (session.user.email_confirmed_at) {
        setIsVerified(true)
        // Redirigir después de 2 segundos
        const timer = setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        return () => clearTimeout(timer)
      }

      // Configurar un listener para cambios en la autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'USER_UPDATED' && session?.user.email_confirmed_at) {
            setIsVerified(true)
            // Redirigir después de 2 segundos
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        }
      )

      setIsLoading(false)
      
      return () => {
        subscription?.unsubscribe()
      }
    }

    checkVerification()
  }, [router])

  const handleResendEmail = async () => {
    if (!email) return
    
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
      
      alert('¡Correo de verificación reenviado con éxito!')
    } catch (error) {
      console.error('Error al reenviar el correo:', error)
      alert('Ocurrió un error al reenviar el correo. Por favor, inténtalo de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Verificando tu sesión...</p>
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900">¡Correo verificado con éxito!</h2>
          <p className="mt-2 text-sm text-gray-500">Redirigiendo a tu panel de control...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifica tu correo electrónico
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado un correo de verificación a <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Revisa tu bandeja de entrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hemos enviado un correo electrónico con un enlace para verificar tu cuenta.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Reenviar correo de verificación
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}