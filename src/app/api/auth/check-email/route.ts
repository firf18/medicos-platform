/**
 * Email Availability Check API Endpoint
 * @fileoverview API endpoint for checking email availability with real Supabase validation
 * @compliance HIPAA-compliant email validation with rate limiting and audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailValidationService } from '@/lib/security/validation/email-validation.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizeEmail } from '@/lib/security/sanitization/input-sanitizer';
import { RateLimiter } from '@/lib/security/rate-limiting/rate-limiter';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(request, {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      keyGenerator: (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', 'Email check rate limit exceeded', {
        endpoint: '/api/auth/check-email',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      }, 'warning');

      return NextResponse.json(
        { 
          error: 'Demasiadas solicitudes. Intente nuevamente en un momento.',
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || ''
          }
        }
      );
    }

    // CSRF protection
    const csrfResult = await CSRFProtection.validateRequest(request);
    if (!csrfResult.valid) {
      logSecurityEvent('csrf_token_invalid', 'CSRF token validation failed', {
        endpoint: '/api/auth/check-email',
        error: csrfResult.error,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        timestamp: new Date().toISOString()
      }, 'warning');

      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Log the check attempt
    logSecurityEvent('email_availability_check_started', 'Email availability check started', {
      email: sanitizedEmail.substring(0, 5) + '***',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'info');

    // Validate email format
    const formatValidation = EmailValidationService.validateEmailFormat(sanitizedEmail);
    if (!formatValidation.isValid) {
      logSecurityEvent('email_validation_error', 'Email validation failed', {
        email: sanitizedEmail.substring(0, 5) + '***',
        error: formatValidation.error,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        timestamp: new Date().toISOString()
      }, 'warning');

      return NextResponse.json({
        isValid: false,
        isAvailable: false,
        error: formatValidation.error,
        suggestions: formatValidation.suggestions
      });
    }

    // Check availability
    const availabilityCheck = await EmailValidationService.checkEmailAvailability(sanitizedEmail);

    // Log the result
    logSecurityEvent('email_availability_check_completed', 'Email availability check completed', {
      email: sanitizedEmail.substring(0, 5) + '***',
      isAvailable: availabilityCheck.isAvailable,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Return response
    return NextResponse.json({
      isValid: true,
      isAvailable: availabilityCheck.isAvailable,
      formatted: sanitizedEmail,
      checkedAt: availabilityCheck.checkedAt,
      source: availabilityCheck.source,
      error: availabilityCheck.isAvailable ? undefined : 'Este email ya está registrado'
    });

  } catch (error) {
    // Log error
    logSecurityEvent('email_availability_check_failed', 'Email availability check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Return error response
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        isValid: false,
        isAvailable: false
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