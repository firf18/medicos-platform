/**
 * Document Availability Check API Endpoint
 * @fileoverview API endpoint for checking document availability with real Supabase validation
 * @compliance HIPAA-compliant document validation with rate limiting and audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentValidationService } from '@/lib/security/validation/document-validation.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizeDocumentNumber } from '@/lib/security/sanitization/input-sanitizer';
import { RateLimiter } from '@/lib/security/rate-limiting/rate-limiter';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(request, {
      maxRequests: 5, // Lower limit for document checks
      windowMs: 60000, // 1 minute
      keyGenerator: (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', 'Document check rate limit exceeded', {
        endpoint: '/api/auth/check-document',
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
        endpoint: '/api/auth/check-document',
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
    const { documentNumber, documentType } = body;

    // Validate input
    if (!documentNumber || typeof documentNumber !== 'string') {
      return NextResponse.json(
        { error: 'Número de documento es requerido' },
        { status: 400 }
      );
    }

    if (!documentType || typeof documentType !== 'string') {
      return NextResponse.json(
        { error: 'Tipo de documento es requerido' },
        { status: 400 }
      );
    }

    // Sanitize document number
    const sanitizedDocument = sanitizeDocumentNumber(documentNumber);
    if (!sanitizedDocument) {
      return NextResponse.json(
        { error: 'Formato de documento inválido' },
        { status: 400 }
      );
    }

    // Log the check attempt
    logSecurityEvent('document_availability_check_started', 'Document availability check started', {
      documentNumber: sanitizedDocument.substring(0, 5) + '***',
      documentType,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'info');

    // Validate document format
    const formatValidation = DocumentValidationService.validateDocumentFormat(sanitizedDocument, documentType);
    if (!formatValidation.isValid) {
      logSecurityEvent('document_validation_error', 'Document validation failed', {
        documentNumber: sanitizedDocument.substring(0, 5) + '***',
        documentType,
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
    const availabilityCheck = await DocumentValidationService.checkDocumentAvailability(sanitizedDocument, documentType);

    // Get document type info
    const documentTypeInfo = DocumentValidationService.getDocumentTypeInfo(documentType);

    // Log the result
    logSecurityEvent('document_availability_check_completed', 'Document availability check completed', {
      documentNumber: availabilityCheck.formatted.substring(0, 5) + '***',
      documentType,
      isAvailable: availabilityCheck.isAvailable,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString()
    }, 'info');

    // Return response
    return NextResponse.json({
      isValid: true,
      isAvailable: availabilityCheck.isAvailable,
      formatted: availabilityCheck.formatted,
      checkedAt: availabilityCheck.checkedAt,
      source: availabilityCheck.source,
      documentInfo: formatValidation.documentInfo,
      documentTypeInfo,
      error: availabilityCheck.isAvailable ? undefined : 'Este documento ya está registrado'
    });

  } catch (error) {
    // Log error
    logSecurityEvent('document_availability_check_failed', 'Document availability check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'error');

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
