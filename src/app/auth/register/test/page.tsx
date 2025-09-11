'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/routes'

export default function TestRegisterRedirect() {
  const router = useRouter()

  useEffect(() => {
    // This is a test page to verify redirects work correctly
    // In a real scenario, users would not access this page directly
    router.push(AUTH_ROUTES.REGISTER)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Testing redirect to main registration page...</p>
      </div>
    </div>
  )
}