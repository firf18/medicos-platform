'use client'

import { useAuthContext } from '@/providers/auth'

// Hook tipado para autenticación
export const useAuth = () => {
  const context = useAuthContext()
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}