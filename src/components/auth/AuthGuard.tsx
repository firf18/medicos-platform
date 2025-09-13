'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/providers/auth'

type AuthGuardProps = {
  children: React.ReactNode
  requiredRole?: 'patient' | 'doctor' | 'admin'
  redirectTo?: string
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { user, session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Si no hay sesión, redirigir al login
    if (!session) {
      router.push(redirectTo)
      return
    }

    // Si se requiere un rol específico y el usuario no lo tiene, redirigir
    if (requiredRole && user?.user_metadata.role !== requiredRole) {
      router.push('/unauthorized')
    }
  }, [session, user, isLoading, requiredRole, router, redirectTo])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading || !session || (requiredRole && user?.user_metadata.role !== requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
