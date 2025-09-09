import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/auth/callback',
  ];
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/appointments',
    '/profile',
    '/settings',
  ];
  
  // If user is not signed in and the current path is not public, redirect to login
  if (!session && !publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is signed in and tries to access auth pages, redirect to dashboard
  if (session && publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    // Check user role and redirect accordingly
    const role = session.user?.user_metadata?.role || 'patient';
    const redirectTo = role === 'doctor' ? '/dashboard' : '/appointments';
    return NextResponse.redirect(new URL(redirectTo, request.url));
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
