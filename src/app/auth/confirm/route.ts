import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  if (token_hash && type) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data.user) {
      // Redirigir según el rol del usuario
      const role = data.user.user_metadata?.role || 'patient'
      const dashboardUrl = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
      
      redirectTo.pathname = dashboardUrl
      return NextResponse.redirect(redirectTo)
    }
  }

  // Si hay error, redirigir a la página de error
  redirectTo.pathname = '/auth/auth-code-error'
  return NextResponse.redirect(redirectTo)
}