/**
 * Phone Availability Check API Endpoint
 * @fileoverview API endpoint for checking phone availability with real Supabase validation
 * @compliance HIPAA-compliant phone validation with rate limiting and audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { PhoneValidationService } from '@/lib/security/validation/phone-validation.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizePhone } from '@/lib/security/sanitization/input-sanitizer';
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
      logSecurityEvent('rate_limit_exceeded', 'Phone check rate limit exceeded', {
        endpoint: '/api/auth/check-phone',
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
        endpoint: '/api/auth/check-phone',
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
    const { phone } = body;

    // Validate input
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Número de teléfono es requerido' },
        { status: 400 }
      );
    }

    // Sanitize phone
    const sanitizedPhone = sanitizePhone(phone);
    if (!sanitizedPhone) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    // Log the check attempt
    logSecurityEvent('phone_availability_check_started', 'Phone availability check started', {
      phone: sanitizedPhone.substring(0, 8) + '***',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'info');

    // Validate phone format
    const formatValidation = PhoneValidationService.validatePhoneFormat(sanitizedPhone);
    if (!formatValidation.isValid) {
      logSecurityEvent('phone_validation_error', 'Phone validation failed', {
        phone: sanitizedPhone.substring(0, 8) + '***',
        error: formatValidation.error,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        timestamp: new Date().toISOString()
      }, 'warning');

      return NextResponse.json({
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: formatValidation.error
      });
    }

    // Check availability
    const availabilityCheck = await PhoneValidationService.checkPhoneAvailability(sanitizedPhone);

    // Get carrier info
    const carrierInfo = PhoneValidationService.getCarrierInfo(availabilityCheck.formatted);

    // Log the result
    logSecurityEvent('phone_availability_check_completed', 'Phone availability check completed', {
      phone: availabilityCheck.formatted.substring(0, 8) + '***',
      isAvailable: availabilityCheck.isAvailable,
      carrier: carrierInfo?.name,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Return response
    return NextResponse.json({
      isValid: true,
      isAvailable: availabilityCheck.isAvailable,
      formatted: availabilityCheck.formatted,
      checkedAt: availabilityCheck.checkedAt,
      source: availabilityCheck.source,
      carrierInfo,
      error: availabilityCheck.isAvailable ? undefined : 'Este número de teléfono ya está registrado'
    });

  } catch (error) {
    // Log error
    logSecurityEvent('phone_availability_check_failed', 'Phone availability check failed', {
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
        isAvailable: false,
        formatted: ''
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