/**
 * CSRF Token Verification API Endpoint
 * @fileoverview API endpoint for verifying CSRF tokens
 * @compliance HIPAA-compliant CSRF token verification with audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { token } = body;

    // Validate input
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Log verification attempt
    logSecurityEvent('csrf_token_invalid', 'CSRF token verification requested', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'info');

    // Verify token
    const validation = CSRFProtection.validateToken(token);

    // Log result
    logSecurityEvent('csrf_token_invalid', 'CSRF token verification completed', {
      valid: validation.valid,
      error: validation.error,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString()
    }, validation.valid ? 'info' : 'warning');

    // Return validation result
    return NextResponse.json({
      valid: validation.valid,
      error: validation.error
    });

  } catch (error) {
    // Log error
    logSecurityEvent('csrf_token_invalid', 'CSRF token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'error');

    // Return error response
    return NextResponse.json(
      { 
        error: 'Error verificando token CSRF',
        valid: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido. Use POST.' },
    { status: 405 }
  );
}
