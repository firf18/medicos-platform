import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Middleware simplificado para evitar errores de Supabase en Edge Runtime
  const pathname = request.nextUrl.pathname;
  
  // Handle legacy route redirects
  if (pathname === '/patient-portal' || pathname === '/patient-dashboard') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Redirect generic dashboard to login (autenticación se maneja en cliente)
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
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