import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/patient-dashboard', '/patient-portal']
  const authRoutes = ['/auth/login', '/auth/register', '/auth/setup-wizard', '/auth/verify-email']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si es una ruta protegida y no hay usuario, redirigir a login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si hay usuario pero no está verificado, redirigir a verificación
  if (user && !user.email_confirmed_at && !request.nextUrl.pathname.startsWith('/auth/verify-email')) {
    const userType = user.user_metadata?.user_type || 'patient';
    return NextResponse.redirect(
      new URL(`/auth/verify-email?email=${encodeURIComponent(user.email!)}&type=${userType}`, request.url)
    );
  }

  // Si es una ruta de auth y hay usuario verificado, redirigir según el rol
  if (isAuthRoute && user && user.email_confirmed_at && !request.nextUrl.pathname.startsWith('/auth/verify-email')) {
    const userType = user.user_metadata?.user_type;

    if (userType === 'doctor') {
      // Verificar si el doctor completó la configuración
      const { data: doctor } = await supabase
        .from('doctors')
        .select('specialty_id, license_number')
        .eq('id', user.id)
        .single()

      if (!doctor?.specialty_id || doctor.license_number?.startsWith('TEMP-')) {
        if (request.nextUrl.pathname !== '/auth/setup-wizard') {
          return NextResponse.redirect(new URL('/auth/setup-wizard', request.url))
        }
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } else if (userType === 'patient') {
      return NextResponse.redirect(new URL('/patient-dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/callback (auth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)',
  ],
}
