'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FlaskConical, Eye, EyeOff } from 'lucide-react'

export default function LaboratoriosLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Verificar si es laboratorio
      const { data: laboratory, error: laboratoryError } = await (supabase as any)
        .from('laboratories')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (laboratoryError || !laboratory) {
        await supabase.auth.signOut()
        throw new Error('Esta cuenta no es de laboratorio. Usa el login correspondiente a tu tipo de cuenta.')
      }

      // Verificar si completó la configuración
      const { data: laboratoryConfig } = await (supabase as any)
        .from('laboratories')
        .select('name, address, phone')
        .eq('id', data.user.id)
        .single()

      const config = laboratoryConfig as { name?: string; address?: string; phone?: string } | null
      const needsSetup = !config || !config.name || !config.address
      
      if (needsSetup) {
        router.push('/auth/setup-wizard/laboratory')
      } else {
        router.push('/laboratory/dashboard')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <FlaskConical className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Portal Laboratorios
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede al sistema de gestión de tu laboratorio
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Institucional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="laboratorio@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Acceder al Sistema'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link 
                href="/auth/register/laboratory" 
                className="text-orange-600 hover:text-orange-500 text-sm"
              >
                ¿No tienes cuenta? Regístrate como laboratorio
              </Link>
              <div className="text-gray-400">|</div>
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-500 text-sm"
              >
                Volver al selector de login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
