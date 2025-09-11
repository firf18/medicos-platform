'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/routes'

export default function PatientRegisterRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the unified registration page with patient type
    router.push(`${AUTH_ROUTES.REGISTER}/specialized?type=patient`)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo al registro unificado...</p>
      </div>
    </div>
  )
}
