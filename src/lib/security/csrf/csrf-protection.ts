/**
 * CSRF Protection Service
 * @fileoverview Service responsible for implementing CSRF protection
 * @compliance HIPAA-compliant CSRF protection with audit trail
 */

import { NextRequest } from 'next/server';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import crypto from 'crypto';

/**
 * CSRF token configuration
 */
export interface CSRFConfig {
  secret: string;
  tokenLength: number;
  tokenExpiry: number; // in milliseconds
  headerName: string;
  cookieName: string;
}

/**
 * CSRF token data
 */
interface CSRFTokenData {
  token: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * CSRF validation result
 */
export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  token?: string;
}

/**
 * CSRF protection service
 */
export class CSRFProtection {
  private static readonly DEFAULT_CONFIG: CSRFConfig = {
    secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    tokenLength: 32,
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    headerName: 'X-CSRF-Token',
    cookieName: 'csrf-token'
  };

  private static config = this.DEFAULT_CONFIG;

  /**
   * Configure CSRF protection
   */
  static configure(config: Partial<CSRFConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    try {
      const randomBytes = crypto.randomBytes(this.config.tokenLength);
      const timestamp = Date.now().toString();
      const data = `${randomBytes.toString('hex')}:${timestamp}`;
      
      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(data);
      const signature = hmac.digest('hex');
      
      const token = Buffer.from(`${data}:${signature}`).toString('base64');
      
      return token;

    } catch (error) {
      logSecurityEvent('csrf_token_generation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to generate CSRF token');
    }
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string): CSRFValidationResult {
    try {
      if (!token || typeof token !== 'string') {
        return {
          valid: false,
          error: 'Token is required'
        };
      }

      // Decode token
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const parts = decoded.split(':');
      
      if (parts.length !== 3) {
        return {
          valid: false,
          error: 'Invalid token format'
        };
      }

      const [randomBytes, timestamp, signature] = parts;
      const data = `${randomBytes}:${timestamp}`;
      
      // Verify signature
      const hmac = crypto.createHmac('sha256', this.config.secret);
      hmac.update(data);
      const expectedSignature = hmac.digest('hex');
      
      if (signature !== expectedSignature) {
        return {
          valid: false,
          error: 'Invalid token signature'
        };
      }

      // Check expiry
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      
      if (now - tokenTime > this.config.tokenExpiry) {
        return {
          valid: false,
          error: 'Token has expired'
        };
      }

      return {
        valid: true,
        token
      };

    } catch (error) {
      logSecurityEvent('csrf_token_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        valid: false,
        error: 'Token validation failed'
      };
    }
  }

  /**
   * Validate CSRF token from request
   */
  static async validateRequest(request: NextRequest): Promise<CSRFValidationResult> {
    try {
      // Get token from header
      const headerToken = request.headers.get(this.config.headerName);
      
      // Get token from cookie
      const cookieToken = request.cookies.get(this.config.cookieName)?.value;
      
      // Use header token if available, otherwise use cookie token
      const token = headerToken || cookieToken;
      
      if (!token) {
        return {
          valid: false,
          error: 'CSRF token is missing'
        };
      }

      const validation = this.validateToken(token);
      
      if (!validation.valid) {
        logSecurityEvent('csrf_token_invalid', {
          error: validation.error,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        });
      }

      return validation;

    } catch (error) {
      logSecurityEvent('csrf_request_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip,
        timestamp: new Date().toISOString()
      });
      
      return {
        valid: false,
        error: 'Request validation failed'
      };
    }
  }

  /**
   * Create CSRF token cookie
   */
  static createTokenCookie(token: string): string {
    const expires = new Date(Date.now() + this.config.tokenExpiry);
    
    return `${this.config.cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}; Path=/`;
  }

  /**
   * Get CSRF token for client
   */
  static getTokenForClient(): { token: string; cookie: string } {
    const token = this.generateToken();
    const cookie = this.createTokenCookie(token);
    
    return { token, cookie };
  }

  /**
   * Middleware for CSRF protection
   */
  static createMiddleware() {
    return async (request: NextRequest) => {
      // Skip CSRF validation for GET requests
      if (request.method === 'GET') {
        return null;
      }

      const validation = await this.validateRequest(request);
      
      if (!validation.valid) {
        logSecurityEvent('csrf_middleware_blocked', {
          error: validation.error,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        });

        return new Response(
          JSON.stringify({
            error: 'CSRF token validation failed',
            details: validation.error
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return null; // Allow request to continue
    };
  }

  /**
   * Generate CSRF token endpoint handler
   */
  static async handleTokenGeneration(): Promise<Response> {
    try {
      const { token, cookie } = this.getTokenForClient();
      
      return new Response(
        JSON.stringify({ token }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie
          }
        }
      );

    } catch (error) {
      logSecurityEvent('csrf_token_endpoint_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ error: 'Failed to generate CSRF token' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  /**
   * Verify CSRF token endpoint handler
   */
  static async handleTokenVerification(request: NextRequest): Promise<Response> {
    try {
      const validation = await this.validateRequest(request);
      
      return new Response(
        JSON.stringify({
          valid: validation.valid,
          error: validation.error
        }),
        {
          status: validation.valid ? 200 : 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

    } catch (error) {
      logSecurityEvent('csrf_verification_endpoint_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ error: 'Failed to verify CSRF token' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
}
