import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  let supabase;
  let session = null;
  
  try {
    supabase = createMiddlewareClient({ req: request, res });
    
    // Intentar obtener la sesión con manejo de errores robusto
    const { data: { session: currentSession }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Middleware: Error obteniendo sesión:', error);
      
      // Si hay error de sesión, continuar sin sesión
      if (error.message?.includes('AuthSessionMissingError') || 
          error.message?.includes('Auth session missing') ||
          error.message?.includes('Failed to parse')) {
        console.log('⚠️ Middleware: Detectado error de sesión, continuando sin autenticación');
        session = null;
      } else {
        // Para otros errores, también continuar sin sesión
        session = null;
      }
    } else {
      session = currentSession;
    }
    
  } catch (error: any) {
    console.error('❌ Middleware: Error crítico:', error);
    
    // En caso de error crítico, continuar sin sesión
    session = null;
    
    // Si es AuthSessionMissingError, agregar header para que el cliente lo maneje
    if (error.name === 'AuthSessionMissingError' || 
        error.message?.includes('AuthSessionMissingError')) {
      const response = NextResponse.next();
      response.headers.set('X-Auth-Error', 'AuthSessionMissingError');
      return response;
    }
  }
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/register/doctor',
    '/auth/register/patient',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/confirm',
    '/auth/auth-code-error',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/api',
    '/nosotros',
    '/servicios',
    '/precios',
    '/medicos',
    '/contacto',
    '/demo',
    '/faq',
    '/terminos',
    '/privacidad',
    '/aviso-legal'
  ];
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/patient/dashboard',
    '/doctor/dashboard',
    '/appointments',
    '/profile',
    '/settings',
  ];

  // Handle legacy route redirects
  const pathname = request.nextUrl.pathname;
  
  // If user is signed in and tries to access auth pages, redirect to appropriate dashboard
  if (session) {
    // Redirect from auth pages to dashboard
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register') || pathname === '/login' || pathname === '/register') {
      const role = session.user?.user_metadata?.role || 'patient';
      const redirectTo = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    // Handle legacy route redirects for authenticated users
    if (pathname === '/patient-portal' || pathname === '/patient-dashboard') {
      return NextResponse.redirect(new URL('/patient/dashboard', request.url));
    }
  } else {
    // Handle legacy route redirects for non-authenticated users
    if (pathname === '/patient-portal' || pathname === '/patient-dashboard') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // If user is not signed in and the current path is not public, redirect to login
    if (!publicRoutes.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }
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
    
    // Redirect generic dashboard based on role
    if (pathname === '/dashboard') {
      const redirectTo = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
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