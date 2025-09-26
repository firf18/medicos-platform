/**
 * Global Security Middleware
 * @fileoverview Global middleware for implementing security measures across all endpoints
 * @compliance HIPAA-compliant security middleware with audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';
import { RateLimiter } from '@/lib/security/rate-limiting/rate-limiter';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { containsMaliciousContent } from '@/lib/security/sanitization/input-sanitizer';

/**
 * Security middleware configuration
 */
export interface SecurityMiddlewareConfig {
  enableCSRF: boolean;
  enableRateLimiting: boolean;
  enableInputSanitization: boolean;
  enableSecurityHeaders: boolean;
  enableAuditLogging: boolean;
  skipPaths: string[];
  rateLimitConfig: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Global security middleware
 */
export class GlobalSecurityMiddleware {
  private static readonly DEFAULT_CONFIG: SecurityMiddlewareConfig = {
    enableCSRF: true,
    enableRateLimiting: true,
    enableInputSanitization: true,
    enableSecurityHeaders: true,
    enableAuditLogging: true,
    skipPaths: [
      '/api/health',
      '/api/csrf/token',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/auth/refresh-token',
      '/api/public',
      '/api/webhooks'
    ],
    rateLimitConfig: {
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    }
  };

  private static config = this.DEFAULT_CONFIG;

  /**
   * Configure security middleware
   */
  static configure(config: Partial<SecurityMiddlewareConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Main security middleware function
   */
  static async handleRequest(request: NextRequest): Promise<NextResponse | null> {
    try {
      const { pathname } = request.nextUrl;

      // Skip security checks for certain paths
      if (this.shouldSkipPath(pathname)) {
        return null;
      }

      // Log request
      if (this.config.enableAuditLogging) {
        logSecurityEvent('request_received', {
          method: request.method,
          path: pathname,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        });
      }

      // Apply security headers
      if (this.config.enableSecurityHeaders) {
        const securityHeadersResponse = this.addSecurityHeaders(request);
        if (securityHeadersResponse) {
          return securityHeadersResponse;
        }
      }

      // Rate limiting
      if (this.config.enableRateLimiting) {
        const rateLimitResponse = await this.checkRateLimit(request);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // CSRF protection
      if (this.config.enableCSRF) {
        const csrfResponse = await this.checkCSRF(request);
        if (csrfResponse) {
          return csrfResponse;
        }
      }

      // Input sanitization
      if (this.config.enableInputSanitization) {
        const sanitizationResponse = await this.checkInputSanitization(request);
        if (sanitizationResponse) {
          return sanitizationResponse;
        }
      }

      return null; // Allow request to continue

    } catch (error) {
      logSecurityEvent('security_middleware_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname,
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(
        { error: 'Security middleware error' },
        { status: 500 }
      );
    }
  }

  /**
   * Check if path should be skipped
   */
  private static shouldSkipPath(pathname: string): boolean {
    return this.config.skipPaths.some(path => pathname.startsWith(path));
  }

  /**
   * Add security headers
   */
  private static addSecurityHeaders(request: NextRequest): NextResponse | null {
    try {
      const headers = new Headers();

      // Content Security Policy
      headers.set('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https:; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
      );

      // X-Frame-Options
      headers.set('X-Frame-Options', 'DENY');

      // X-Content-Type-Options
      headers.set('X-Content-Type-Options', 'nosniff');

      // X-XSS-Protection
      headers.set('X-XSS-Protection', '1; mode=block');

      // Referrer-Policy
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions-Policy
      headers.set('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
      );

      // Strict-Transport-Security (only for HTTPS)
      if (request.nextUrl.protocol === 'https:') {
        headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      // Return response with headers
      return new NextResponse(null, {
        status: 200,
        headers
      });

    } catch (error) {
      logSecurityEvent('security_headers_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString()
      });

      return null;
    }
  }

  /**
   * Check rate limit
   */
  private static async checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
    try {
      const rateLimitResult = await RateLimiter.checkLimit(request, {
        maxRequests: this.config.rateLimitConfig.maxRequests,
        windowMs: this.config.rateLimitConfig.windowMs,
        keyGenerator: (req) => req.ip || 'unknown'
      });

      if (!rateLimitResult.allowed) {
        logSecurityEvent('rate_limit_exceeded', {
          endpoint: request.nextUrl.pathname,
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
              'X-RateLimit-Limit': this.config.rateLimitConfig.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
            }
          }
        );
      }

      return null;

    } catch (error) {
      logSecurityEvent('rate_limit_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname,
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return null; // Allow request on error
    }
  }

  /**
   * Check CSRF protection
   */
  private static async checkCSRF(request: NextRequest): Promise<NextResponse | null> {
    try {
      // Skip CSRF for GET requests
      if (request.method === 'GET') {
        return null;
      }

      const csrfResult = await CSRFProtection.validateRequest(request);
      
      if (!csrfResult.valid) {
        logSecurityEvent('csrf_token_invalid', {
          endpoint: request.nextUrl.pathname,
          error: csrfResult.error,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        });

        return NextResponse.json(
          { error: 'Token CSRF inválido' },
          { status: 403 }
        );
      }

      return null;

    } catch (error) {
      logSecurityEvent('csrf_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname,
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return null; // Allow request on error
    }
  }

  /**
   * Check input sanitization
   */
  private static async checkInputSanitization(request: NextRequest): Promise<NextResponse | null> {
    try {
      // Only check POST, PUT, PATCH requests
      if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
        return null;
      }

      // Get request body
      const body = await request.text();
      
      if (!body) {
        return null;
      }

      // Check for malicious content
      if (containsMaliciousContent(body)) {
        logSecurityEvent('malicious_content_detected', {
          endpoint: request.nextUrl.pathname,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          bodyLength: body.length,
          timestamp: new Date().toISOString()
        });

        return NextResponse.json(
          { error: 'Contenido malicioso detectado' },
          { status: 400 }
        );
      }

      return null;

    } catch (error) {
      logSecurityEvent('input_sanitization_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname,
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return null; // Allow request on error
    }
  }

  /**
   * Create middleware function for Next.js
   */
  static createMiddleware() {
    return async (request: NextRequest) => {
      return await this.handleRequest(request);
    };
  }

  /**
   * Get security middleware status
   */
  static getStatus(): {
    initialized: boolean;
    config: SecurityMiddlewareConfig;
    enabledFeatures: string[];
  } {
    const enabledFeatures: string[] = [];
    
    if (this.config.enableCSRF) enabledFeatures.push('CSRF Protection');
    if (this.config.enableRateLimiting) enabledFeatures.push('Rate Limiting');
    if (this.config.enableInputSanitization) enabledFeatures.push('Input Sanitization');
    if (this.config.enableSecurityHeaders) enabledFeatures.push('Security Headers');
    if (this.config.enableAuditLogging) enabledFeatures.push('Audit Logging');

    return {
      initialized: true,
      config: this.config,
      enabledFeatures
    };
  }
}
