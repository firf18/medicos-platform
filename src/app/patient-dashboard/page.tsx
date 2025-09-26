'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePatientAuth } from '@/hooks/usePatientAuth'
import { createClient } from '@/lib/supabase/client'

export default function PatientDashboard() {
  const router = useRouter()
  const { signOut, isLoading } = usePatientAuth()
  const [user, setUser] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login/paciente')
          return
        }

        setUser(user)

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'patient') {
          await signOut()
          router.push('/auth/login/paciente')
          return
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchUserData()
  }, [router, signOut])

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu portal médico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">Red-Salud</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'Paciente'}
                </p>
                <p className="text-xs text-gray-500">Portal del Paciente</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a tu Portal Médico!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tu cuenta de paciente ha sido creada exitosamente. Próximamente podrás acceder a todas las funcionalidades.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Funcionalidades Próximas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-600">Agendar citas médicas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-600">Historial médico completo</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-600">Chat con médicos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-600">Resultados de laboratorio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}