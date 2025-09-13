import { useCallback } from 'react'
import { useAuth } from '@/providers/auth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const useAuthActions = () => {
  const auth = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    [supabase]
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string, userData: any) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            ...userData,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      // Redirigir a la página de verificación de correo
      if (data.user?.identities?.length === 0) {
        throw new Error('El correo electrónico ya está registrado')
      }

      return data
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    router.push('/login')
  }, [supabase, router])

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        throw new Error(error.message)
      }
    },
    [supabase]
  )

  return {
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
  }
}
