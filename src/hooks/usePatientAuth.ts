'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PatientData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  bloodType?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export function usePatientAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const signUpWithEmail = async (email: string, password: string, patientData: PatientData) => {
    setIsLoading(true)
    
    try {
      // Crear cuenta en Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            first_name: patientData.firstName,
            last_name: patientData.lastName,
            role: 'patient',
          },
        },
      })

      if (error) throw error

      // Crear perfil de paciente en la base de datos
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              first_name: patientData.firstName,
              last_name: patientData.lastName,
              role: 'patient',
              phone: patientData.phone,
              date_of_birth: patientData.dateOfBirth,
              gender: patientData.gender,
              blood_type: patientData.bloodType,
              emergency_contact: patientData.emergencyContact,
              emergency_phone: patientData.emergencyPhone,
            },
          ])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // No lanzamos error aquí porque el usuario ya fue creado en auth
        }

        // Crear registro específico de paciente
        const { error: patientError } = await supabase
          .from('patients')
          .insert([
            {
              id: data.user.id, // Usar el mismo ID que el usuario
              date_of_birth: patientData.dateOfBirth,
              gender: patientData.gender,
              blood_type: patientData.bloodType,
              emergency_contact_name: patientData.emergencyContact,
              emergency_contact_phone: patientData.emergencyPhone,
            },
          ])

        if (patientError) {
          console.error('Patient record creation error:', patientError)
        }
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Te hemos enviado un email de verificación. Revisa tu bandeja de entrada.',
      })

      router.push('/auth/verify-email')
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: 'Error en el registro',
        description: error.message || 'Ocurrió un error al crear tu cuenta. Inténtalo de nuevo.',
        variant: 'destructive',
      })
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithGoogle = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/patient-dashboard&role=patient`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        toast({
          title: 'Error con Google',
          description: 'No se pudo iniciar el registro con Google.',
          variant: 'destructive',
        })
        return { success: false, error }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Google sign up error:', error)
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al conectar con Google.',
        variant: 'destructive',
      })
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Verificar que el usuario es un paciente
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'patient') {
        await supabase.auth.signOut()
        toast({
          title: 'Acceso denegado',
          description: 'Esta cuenta no es de un paciente. Por favor, usa el portal correcto.',
          variant: 'destructive',
        })
        return { success: false, error: 'Invalid role' }
      }

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      })

      router.push('/patient-dashboard')
      return { success: true }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast({
        title: 'Error al iniciar sesión',
        description: error.message || 'Ocurrió un error al iniciar sesión.',
        variant: 'destructive',
      })
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/patient-dashboard&role=patient`,
        },
      })
      
      if (error) {
        toast({
          title: 'Error con Google',
          description: 'No se pudo iniciar sesión con Google.',
          variant: 'destructive',
        })
        return { success: false, error }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al conectar con Google.',
        variant: 'destructive',
      })
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      })

      router.push('/')
      return { success: true }
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast({
        title: 'Error al cerrar sesión',
        description: 'Ocurrió un error al cerrar la sesión.',
        variant: 'destructive',
      })
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    signUpWithEmail,
    signUpWithGoogle,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  }
}
