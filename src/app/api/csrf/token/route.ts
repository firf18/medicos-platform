/**
 * CSRF Token Generation API Endpoint
 * @fileoverview API endpoint for generating CSRF tokens
 * @compliance HIPAA-compliant CSRF token generation with audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

export async function GET(request: NextRequest) {
  try {
    // Log token generation request
    logSecurityEvent('csrf_token_missing', 'CSRF token generation requested', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'info');

    // Generate token
    const { token, cookie } = CSRFProtection.getTokenForClient();

    // Log successful generation
    logSecurityEvent('csrf_token_missing', 'CSRF token generated successfully', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString()
    }, 'info');

    // Return token with cookie
    return NextResponse.json(
      { token },
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    // Log error
    logSecurityEvent('csrf_token_invalid', 'CSRF token generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'error');

    // Return error response
    return NextResponse.json(
      { error: 'Error generando token CSRF' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Método no permitido. Use GET.' },
    { status: 405 }
  );
}
