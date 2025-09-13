'use client'

import React from 'react'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
  user: (User & { specialtyId?: string }) | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  role: string | null
  specialtyId: string | null
  isAdmin: boolean
  isDoctor: boolean
  isPatient: boolean
  isClinic: boolean
  isLaboratory: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: Error | null; data: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  refreshAuth: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mantener referencia única del cliente Supabase
let supabaseClientInstance: ReturnType<typeof createClient> | null = null

const getSupabaseClient = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient()
  }
  return supabaseClientInstance
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  // Get the user's role from their metadata
  const getRole = useCallback((user: User | null) => {
    if (!user) return null
    return user.user_metadata?.role || 'patient'
  }, [])

  // Get the user's specialty from their metadata (for doctors)
  const getSpecialtyId = useCallback((user: User | null) => {
    if (!user || user.user_metadata?.role !== 'doctor') return null
    return user.user_metadata?.specialtyId || null
  }, [])

  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Error refreshing auth:', error)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Mejor manejo de errores con mensajes más descriptivos
        console.error('Error signing in:', error.message)
        return { error: new Error(error.message) }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Unexpected error during sign in:', error)
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          },
        },
      })
      
      if (error) {
        // Mejor manejo de errores con mensajes más descriptivos
        console.error('Error signing up:', error.message)
        return { error: new Error(error.message), data: null }
      }
      
      return { error: null, data }
    } catch (error) {
      console.error('Unexpected error during sign up:', error)
      return { error: error as Error, data: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      
      if (error) {
        // Mejor manejo de errores con mensajes más descriptivos
        console.error('Error resetting password:', error.message)
        return { error: new Error(error.message) }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Unexpected error during password reset:', error)
      return { error: error as Error }
    }
  }

  // Nueva función para actualizar el perfil del usuario
  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user found')
      }

      const { error } = await supabase.auth.updateUser({
        data: userData
      })

      if (error) {
        console.error('Error updating profile:', error.message)
        return { error: new Error(error.message) }
      }

      // Actualizar el estado del usuario localmente
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      setUser(updatedUser)

      return { error: null }
    } catch (error) {
      console.error('Unexpected error during profile update:', error)
      return { error: error as Error }
    }
  }

  const role = getRole(user)
  const specialtyId = getSpecialtyId(user)
  
  // Propiedades de rol específicas
  const isAdmin = role === 'admin'
  const isDoctor = role === 'doctor'
  const isPatient = role === 'patient'
  const isClinic = role === 'clinic'
  const isLaboratory = role === 'laboratory'

  // Extend user object with specialtyId for easier access
  const extendedUser = user ? { ...user, specialtyId } : null

  const value = {
    user: extendedUser,
    session,
    isLoading,
    isAuthenticated: !!user,
    role,
    specialtyId,
    isAdmin,
    isDoctor,
    isPatient,
    isClinic,
    isLaboratory,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshAuth,
    updateProfile // Agregamos la nueva función al contexto
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Alias para mantener compatibilidad con el contexto anterior
export { useAuth as useAuthContext }