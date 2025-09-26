/**
 * License Availability Check API Endpoint
 * @fileoverview API endpoint for checking medical license availability with real Supabase validation
 * @compliance HIPAA-compliant license validation with rate limiting and audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { LicenseValidationService } from '@/lib/security/validation/license-validation.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizeLicenseNumber } from '@/lib/security/sanitization/input-sanitizer';
import { RateLimiter } from '@/lib/security/rate-limiting/rate-limiter';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(request, {
      maxRequests: 5, // Lower limit for license checks
      windowMs: 60000, // 1 minute
      keyGenerator: (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', 'License check rate limit exceeded', {
        endpoint: '/api/auth/check-license',
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
            'X-RateLimit-Limit': '5',
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
        endpoint: '/api/auth/check-license',
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
    const { licenseNumber } = body;

    // Validate input
    if (!licenseNumber || typeof licenseNumber !== 'string') {
      return NextResponse.json(
        { error: 'Número de licencia es requerido' },
        { status: 400 }
      );
    }

    // Sanitize license number
    const sanitizedLicense = sanitizeLicenseNumber(licenseNumber);
    if (!sanitizedLicense) {
      return NextResponse.json(
        { error: 'Formato de licencia inválido' },
        { status: 400 }
      );
    }

    // Log the check attempt
    logSecurityEvent('license_availability_check_started', 'License availability check started', {
      licenseNumber: sanitizedLicense.substring(0, 5) + '***',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'info');

    // Validate license format
    const formatValidation = LicenseValidationService.validateLicenseFormat(sanitizedLicense);
    if (!formatValidation.isValid) {
      logSecurityEvent('license_validation_error', 'License validation failed', {
        licenseNumber: sanitizedLicense.substring(0, 5) + '***',
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
    const availabilityCheck = await LicenseValidationService.checkLicenseAvailability(sanitizedLicense);

    // Get license type info
    const licenseTypeInfo = LicenseValidationService.getLicenseTypeInfo(sanitizedLicense);

    // Log the result
    logSecurityEvent('license_availability_check_completed', 'License availability check completed', {
      licenseNumber: availabilityCheck.formatted.substring(0, 5) + '***',
      isAvailable: availabilityCheck.isAvailable,
      licenseType: licenseTypeInfo?.type,
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
      licenseInfo: formatValidation.licenseInfo,
      licenseTypeInfo,
      error: availabilityCheck.isAvailable ? undefined : 'Esta licencia médica ya está registrada'
    });

  } catch (error) {
    // Log error
    logSecurityEvent('license_availability_check_failed', 'License availability check failed', {
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
