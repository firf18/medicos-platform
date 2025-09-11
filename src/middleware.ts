import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/patient',
  '/doctor',
  '/clinic',
  '/laboratory',
  '/admin'
]

// Rutas de autenticación (donde no se permite estar logueado)
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()
  
  const { pathname } = request.nextUrl
  
  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    const role = session.user?.user_metadata?.role || 'patient';
    const redirectTo = role === 'doctor' ? '/doctor/dashboard' : 
                      role === 'clinic' ? '/clinic/dashboard' : 
                      role === 'laboratory' ? '/laboratory/dashboard' : 
                      role === 'admin' ? '/admin/dashboard' : 
                      '/patient/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }
  
  // Redirect unauthenticated users to login
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }
  
  // Role-based access control for protected routes
  if (session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const role = session.user?.user_metadata?.role || 'patient';
    
    // Restrict doctor routes to doctors only
    if (pathname.startsWith('/doctor/') && role !== 'doctor') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
    
    // Restrict patient routes to patients only
    if (pathname.startsWith('/patient/') && role !== 'patient') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
    
    // Restrict clinic routes to clinics only
    if (pathname.startsWith('/clinic/') && role !== 'clinic') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
    
    // Restrict laboratory routes to laboratories only
    if (pathname.startsWith('/laboratory/') && role !== 'laboratory') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
    
    // Restrict admin routes to admins only
    if (pathname.startsWith('/admin/') && role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
    
    // Redirect generic dashboard based on role
    if (pathname === '/dashboard') {
      const redirectTo = role === 'doctor' ? '/doctor/dashboard' : 
                        role === 'clinic' ? '/clinic/dashboard' : 
                        role === 'laboratory' ? '/laboratory/dashboard' : 
                        role === 'admin' ? '/admin/dashboard' : 
                        '/patient/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};