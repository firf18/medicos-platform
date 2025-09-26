/**
 * SACS Verification API Endpoint
 * @fileoverview API endpoint for verifying medical licenses with SACS scraping
 * @compliance HIPAA-compliant medical license verification with audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { SACSScrapingService } from '@/lib/medical-validations/scraping/sacs-scraping.service';
import { MedicalLicenseValidationService } from '@/lib/medical-validations/license/medical-license-validation.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { RateLimiter } from '@/lib/security/rate-limiting/rate-limiter';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(request, {
      maxRequests: 5, // Lower limit for SACS verification
      windowMs: 60000, // 1 minute
      keyGenerator: (req) => req.ip || 'unknown'
    });

    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', {
        endpoint: '/api/medical/sacs/verify',
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });

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
      logSecurityEvent('csrf_token_invalid', {
        endpoint: '/api/medical/sacs/verify',
        error: csrfResult.error,
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { cedula, licenseNumber, specialty } = body;

    // Validate input
    if (!cedula || typeof cedula !== 'string') {
      return NextResponse.json(
        { error: 'Cédula es requerida' },
        { status: 400 }
      );
    }

    // Log verification attempt
    logSecurityEvent('sacs_verification_requested', {
      cedula: cedula.substring(0, 5) + '***',
      licenseNumber: licenseNumber ? licenseNumber.substring(0, 5) + '***' : 'N/A',
      specialty: specialty || 'N/A',
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Initialize SACS service if needed
    try {
      await SACSScrapingService.initialize();
    } catch (error) {
      logSecurityEvent('sacs_service_initialization_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(
        { error: 'Servicio SACS no disponible' },
        { status: 503 }
      );
    }

    // Perform SACS verification
    const sacsResult = await SACSScrapingService.verifyMedicalLicense(cedula);

    // Perform license validation if license number is provided
    let licenseValidation = null;
    if (licenseNumber) {
      try {
        licenseValidation = await MedicalLicenseValidationService.validateMedicalLicense(
          licenseNumber,
          cedula,
          specialty
        );
      } catch (error) {
        logSecurityEvent('license_validation_error', {
          cedula: cedula.substring(0, 5) + '***',
          licenseNumber: licenseNumber.substring(0, 5) + '***',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Prepare response
    const response = {
      success: sacsResult.success,
      found: sacsResult.found,
      data: sacsResult.data,
      licenseValidation,
      processingTime: sacsResult.processingTime,
      cached: sacsResult.cached,
      source: sacsResult.source,
      timestamp: sacsResult.timestamp,
      error: sacsResult.error
    };

    // Log verification result
    logSecurityEvent('sacs_verification_completed', {
      cedula: cedula.substring(0, 5) + '***',
      success: sacsResult.success,
      found: sacsResult.found,
      processingTime: sacsResult.processingTime,
      cached: sacsResult.cached,
      source: sacsResult.source,
      ip: request.ip,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(response);

  } catch (error) {
    // Log error
    logSecurityEvent('sacs_verification_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Return error response
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        success: false,
        found: false
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
