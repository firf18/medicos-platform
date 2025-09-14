import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Handle legacy route redirects
  if (pathname === '/patient-portal' || pathname === '/patient-dashboard') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Redirect generic dashboard to login (autenticación se maneja en cliente)
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Handle doctor registration redirect
  if (pathname === '/auth/register/doctor') {
    // Allow access to doctor registration
    return NextResponse.next();
  }
  
  // Handle patient registration redirect
  if (pathname === '/auth/register/patient') {
    // Allow access to patient registration
    return NextResponse.next();
  }
  
  // Handle auth pages
  if (pathname.startsWith('/auth/')) {
    // Allow access to all auth pages
    return NextResponse.next();
  }
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Allow access to all API routes
    return NextResponse.next();
  }
  
  // Handle public pages
  const publicPages = [
    '/',
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
  
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }
  
  // For all other routes, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
