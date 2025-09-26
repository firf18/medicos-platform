/**
 * Security Headers Validation Service
 * @fileoverview Service responsible for validating and enforcing security headers
 * @compliance HIPAA-compliant security headers validation with audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Security header configuration
 */
export interface SecurityHeaderConfig {
  name: string;
  value: string;
  required: boolean;
  description: string;
  complianceLevel: 'basic' | 'enhanced' | 'critical';
}

/**
 * Security headers validation result
 */
export interface SecurityHeadersValidationResult {
  valid: boolean;
  missingHeaders: string[];
  invalidHeaders: string[];
  warnings: string[];
  score: number; // 0-100
  recommendations: string[];
}

/**
 * Security headers validation service
 */
export class SecurityHeadersValidationService {
  private static readonly SECURITY_HEADERS: SecurityHeaderConfig[] = [
    {
      name: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      required: true,
      description: 'Prevents XSS attacks by controlling resource loading',
      complianceLevel: 'critical'
    },
    {
      name: 'X-Frame-Options',
      value: 'DENY',
      required: true,
      description: 'Prevents clickjacking attacks',
      complianceLevel: 'critical'
    },
    {
      name: 'X-Content-Type-Options',
      value: 'nosniff',
      required: true,
      description: 'Prevents MIME type sniffing attacks',
      complianceLevel: 'critical'
    },
    {
      name: 'X-XSS-Protection',
      value: '1; mode=block',
      required: true,
      description: 'Enables XSS filtering in browsers',
      complianceLevel: 'critical'
    },
    {
      name: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
      required: true,
      description: 'Controls referrer information leakage',
      complianceLevel: 'enhanced'
    },
    {
      name: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      required: true,
      description: 'Controls browser feature access',
      complianceLevel: 'enhanced'
    },
    {
      name: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
      required: false, // Only for HTTPS
      description: 'Enforces HTTPS connections',
      complianceLevel: 'critical'
    },
    {
      name: 'X-Permitted-Cross-Domain-Policies',
      value: 'none',
      required: false,
      description: 'Controls cross-domain policy files',
      complianceLevel: 'basic'
    },
    {
      name: 'Cross-Origin-Embedder-Policy',
      value: 'require-corp',
      required: false,
      description: 'Controls cross-origin embedding',
      complianceLevel: 'enhanced'
    },
    {
      name: 'Cross-Origin-Opener-Policy',
      value: 'same-origin',
      required: false,
      description: 'Controls cross-origin window access',
      complianceLevel: 'enhanced'
    },
    {
      name: 'Cross-Origin-Resource-Policy',
      value: 'same-origin',
      required: false,
      description: 'Controls cross-origin resource access',
      complianceLevel: 'enhanced'
    }
  ];

  /**
   * Validate security headers in request
   */
  static validateRequestHeaders(request: NextRequest): SecurityHeadersValidationResult {
    try {
      const headers = request.headers;
      const missingHeaders: string[] = [];
      const invalidHeaders: string[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      let score = 100;

      // Check each security header
      for (const headerConfig of this.SECURITY_HEADERS) {
        const headerValue = headers.get(headerConfig.name);

        if (!headerValue) {
          if (headerConfig.required) {
            missingHeaders.push(headerConfig.name);
            score -= 10; // Deduct 10 points for missing required headers
          } else {
            warnings.push(`Missing optional header: ${headerConfig.name}`);
            score -= 5; // Deduct 5 points for missing optional headers
          }
        } else {
          // Validate header value
          const isValid = this.validateHeaderValue(headerConfig.name, headerValue);
          if (!isValid) {
            invalidHeaders.push(headerConfig.name);
            score -= 15; // Deduct 15 points for invalid headers
          }
        }
      }

      // Generate recommendations
      if (missingHeaders.length > 0) {
        recommendations.push('Add missing required security headers');
      }
      if (invalidHeaders.length > 0) {
        recommendations.push('Fix invalid security header values');
      }
      if (warnings.length > 0) {
        recommendations.push('Consider adding optional security headers');
      }

      // Check for HTTPS
      if (request.nextUrl.protocol !== 'https:') {
        warnings.push('Request is not using HTTPS');
        recommendations.push('Use HTTPS for all requests');
        score -= 20; // Deduct 20 points for non-HTTPS
      }

      // Ensure score doesn't go below 0
      score = Math.max(0, score);

      const result: SecurityHeadersValidationResult = {
        valid: missingHeaders.length === 0 && invalidHeaders.length === 0,
        missingHeaders,
        invalidHeaders,
        warnings,
        score,
        recommendations
      };

      // Log validation result
      logSecurityEvent('security_headers_validation', {
        valid: result.valid,
        score: result.score,
        missingHeaders: result.missingHeaders.length,
        invalidHeaders: result.invalidHeaders.length,
        warnings: result.warnings.length,
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      logSecurityEvent('security_headers_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return {
        valid: false,
        missingHeaders: [],
        invalidHeaders: [],
        warnings: ['Error validating security headers'],
        score: 0,
        recommendations: ['Fix security headers validation error']
      };
    }
  }

  /**
   * Validate specific header value
   */
  private static validateHeaderValue(headerName: string, headerValue: string): boolean {
    try {
      switch (headerName) {
        case 'Content-Security-Policy':
          return this.validateCSP(headerValue);
        
        case 'X-Frame-Options':
          return ['DENY', 'SAMEORIGIN'].includes(headerValue) || headerValue.startsWith('ALLOW-FROM');
        
        case 'X-Content-Type-Options':
          return headerValue === 'nosniff';
        
        case 'X-XSS-Protection':
          return headerValue === '1; mode=block' || headerValue === '0';
        
        case 'Referrer-Policy':
          return [
            'no-referrer',
            'no-referrer-when-downgrade',
            'origin',
            'origin-when-cross-origin',
            'same-origin',
            'strict-origin',
            'strict-origin-when-cross-origin',
            'unsafe-url'
          ].includes(headerValue);
        
        case 'Permissions-Policy':
          return this.validatePermissionsPolicy(headerValue);
        
        case 'Strict-Transport-Security':
          return this.validateHSTS(headerValue);
        
        case 'X-Permitted-Cross-Domain-Policies':
          return ['none', 'master-only', 'by-content-type', 'by-ftp-filename', 'all'].includes(headerValue);
        
        case 'Cross-Origin-Embedder-Policy':
          return ['unsafe-none', 'require-corp'].includes(headerValue);
        
        case 'Cross-Origin-Opener-Policy':
          return ['unsafe-none', 'same-origin-allow-popups', 'same-origin'].includes(headerValue);
        
        case 'Cross-Origin-Resource-Policy':
          return ['same-site', 'same-origin', 'cross-origin'].includes(headerValue);
        
        default:
          return true; // Unknown headers are considered valid
      }

    } catch (error) {
      return false;
    }
  }

  /**
   * Validate Content Security Policy
   */
  private static validateCSP(csp: string): boolean {
    try {
      // Basic CSP validation
      const directives = csp.split(';').map(d => d.trim());
      const validDirectives = [
        'default-src', 'script-src', 'style-src', 'img-src', 'font-src',
        'connect-src', 'frame-src', 'object-src', 'media-src', 'manifest-src',
        'worker-src', 'child-src', 'frame-ancestors', 'base-uri', 'form-action'
      ];

      for (const directive of directives) {
        if (directive) {
          const [name] = directive.split(' ');
          if (!validDirectives.includes(name)) {
            return false;
          }
        }
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Validate Permissions Policy
   */
  private static validatePermissionsPolicy(policy: string): boolean {
    try {
      // Basic permissions policy validation
      const features = [
        'camera', 'microphone', 'geolocation', 'payment', 'usb', 'magnetometer',
        'gyroscope', 'accelerometer', 'ambient-light-sensor', 'autoplay',
        'battery', 'bluetooth', 'clipboard-read', 'clipboard-write', 'display-capture',
        'document-domain', 'encrypted-media', 'execution-while-not-rendered',
        'execution-while-out-of-viewport', 'fullscreen', 'gamepad', 'midi',
        'notifications', 'oversized-images', 'picture-in-picture', 'publickey-credentials-get',
        'screen-wake-lock', 'sync-xhr', 'unoptimized-images', 'unsized-media',
        'vibrate', 'wake-lock', 'xr-spatial-tracking'
      ];

      const policies = policy.split(',');
      for (const policyItem of policies) {
        const [feature] = policyItem.trim().split('=');
        if (feature && !features.includes(feature)) {
          return false;
        }
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Validate HTTP Strict Transport Security
   */
  private static validateHSTS(hsts: string): boolean {
    try {
      // Basic HSTS validation
      const parts = hsts.split(';').map(p => p.trim());
      const maxAge = parts.find(p => p.startsWith('max-age='));
      
      if (!maxAge) {
        return false;
      }

      const age = parseInt(maxAge.split('=')[1]);
      return age > 0;

    } catch (error) {
      return false;
    }
  }

  /**
   * Generate security headers for response
   */
  static generateSecurityHeaders(request: NextRequest): Record<string, string> {
    const headers: Record<string, string> = {};

    try {
      // Add all security headers
      for (const headerConfig of this.SECURITY_HEADERS) {
        // Skip HSTS for non-HTTPS requests
        if (headerConfig.name === 'Strict-Transport-Security' && request.nextUrl.protocol !== 'https:') {
          continue;
        }

        headers[headerConfig.name] = headerConfig.value;
      }

      // Add custom headers based on request
      if (request.nextUrl.protocol === 'https:') {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
      }

      return headers;

    } catch (error) {
      logSecurityEvent('security_headers_generation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip,
        timestamp: new Date().toISOString()
      });

      return {};
    }
  }

  /**
   * Create security headers middleware
   */
  static createMiddleware() {
    return async (request: NextRequest) => {
      try {
        // Validate request headers
        const validation = this.validateRequestHeaders(request);
        
        if (!validation.valid) {
          logSecurityEvent('security_headers_validation_failed', {
            score: validation.score,
            missingHeaders: validation.missingHeaders,
            invalidHeaders: validation.invalidHeaders,
            ip: request.ip,
            timestamp: new Date().toISOString()
          });
        }

        // Generate response headers
        const securityHeaders = this.generateSecurityHeaders(request);

        // Return response with security headers
        return new NextResponse(null, {
          status: 200,
          headers: securityHeaders
        });

      } catch (error) {
        logSecurityEvent('security_headers_middleware_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          ip: request.ip,
          timestamp: new Date().toISOString()
        });

        return new NextResponse(null, { status: 200 });
      }
    };
  }

  /**
   * Get security headers configuration
   */
  static getSecurityHeadersConfig(): SecurityHeaderConfig[] {
    return this.SECURITY_HEADERS;
  }

  /**
   * Get security headers validation service status
   */
  static getStatus(): {
    initialized: boolean;
    totalHeaders: number;
    requiredHeaders: number;
    optionalHeaders: number;
  } {
    return {
      initialized: true,
      totalHeaders: this.SECURITY_HEADERS.length,
      requiredHeaders: this.SECURITY_HEADERS.filter(h => h.required).length,
      optionalHeaders: this.SECURITY_HEADERS.filter(h => !h.required).length
    };
  }
}
