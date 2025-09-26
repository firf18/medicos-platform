import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/patient-dashboard'
  const role = requestUrl.searchParams.get('role') || 'patient'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
      }

      if (data.user) {
        // Verificar si el usuario ya tiene un perfil
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          // Crear perfil básico para usuarios de Google
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email || '',
                first_name: data.user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                role: role,
              },
            ])

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }

          // Si es un paciente, crear registro en la tabla patients
          if (role === 'patient') {
            const { error: patientError } = await supabase
              .from('patients')
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email || '',
                  first_name: data.user.user_metadata?.full_name?.split(' ')[0] || '',
                  last_name: data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                  full_name: data.user.user_metadata?.full_name || '',
                },
              ])

            if (patientError) {
              console.error('Patient record creation error:', patientError)
            }
          }

          // Si es una farmacia, no crear registro automático (se hará en el proceso de registro específico)
          // Las farmacias requieren un proceso de verificación más riguroso
        }
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=callback_processing_failed', request.url))
    }
  }

  // Redirigir según el rol
  let redirectUrl = next
  if (role === 'patient') {
    redirectUrl = '/patient-dashboard'
  } else if (role === 'pharmacy') {
    redirectUrl = '/auth/register/pharmacy'
  }
  
  return NextResponse.redirect(new URL(redirectUrl, request.url))
}