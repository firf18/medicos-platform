/**
 * Rate Limiting Service
 * @fileoverview Service responsible for implementing rate limiting to prevent abuse
 * @compliance HIPAA-compliant rate limiting with audit trail
 */

import { NextRequest } from 'next/server';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate limit store interface
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limit store (for development)
 * In production, this should be replaced with Redis or similar
 */
class MemoryRateLimitStore {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  get(key: string): { count: number; resetTime: number } | null {
    const entry = this.store[key];
    if (!entry) return null;

    // Check if expired
    if (entry.resetTime < Date.now()) {
      delete this.store[key];
      return null;
    }

    return entry;
  }

  set(key: string, count: number, resetTime: number): void {
    this.store[key] = { count, resetTime };
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const entry = this.get(key);

    if (!entry) {
      const resetTime = now + windowMs;
      this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }

    const newCount = entry.count + 1;
    this.set(key, newCount, entry.resetTime);
    return { count: newCount, resetTime: entry.resetTime };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store = {};
  }
}

/**
 * Rate limiting service
 */
export class RateLimiter {
  private static store = new MemoryRateLimitStore();

  /**
   * Check if request is within rate limit
   */
  static async checkLimit(request: NextRequest, config: RateLimitConfig): Promise<RateLimitResult> {
    try {
      const key = config.keyGenerator(request);
      const now = Date.now();
      const windowMs = config.windowMs;

      // Get current entry
      const entry = this.store.get(key);

      if (!entry) {
        // First request in window
        const resetTime = now + windowMs;
        this.store.set(key, 1, resetTime);

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime
        };
      }

      // Check if window has expired
      if (entry.resetTime < now) {
        // Window expired, start new window
        const resetTime = now + windowMs;
        this.store.set(key, 1, resetTime);

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime
        };
      }

      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter
        };
      }

      // Increment counter
      const newEntry = this.store.increment(key, windowMs);

      return {
        allowed: true,
        remaining: config.maxRequests - newEntry.count,
        resetTime: newEntry.resetTime
      };

    } catch (error) {
      logSecurityEvent('rate_limit_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });

      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs
      };
    }
  }

  /**
   * Get rate limit info for a key
   */
  static getLimitInfo(key: string): { count: number; resetTime: number } | null {
    return this.store.get(key);
  }

  /**
   * Reset rate limit for a key
   */
  static resetLimit(key: string): void {
    const entry = this.store.get(key);
    if (entry) {
      delete this.store[key];
    }
  }

  /**
   * Get rate limit headers
   */
  static getHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
    return {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString(),
      ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
    };
  }

  /**
   * Create rate limit middleware for API routes
   */
  static createMiddleware(config: RateLimitConfig) {
    return async (request: NextRequest) => {
      const result = await this.checkLimit(request, config);
      
      if (!result.allowed) {
        logSecurityEvent('rate_limit_exceeded', {
          endpoint: request.nextUrl.pathname,
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        });

        return new Response(
          JSON.stringify({
            error: 'Demasiadas solicitudes. Intente nuevamente en un momento.',
            retryAfter: result.retryAfter
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...this.getHeaders(result, config)
            }
          }
        );
      }

      return null; // Allow request to continue
    };
  }

  /**
   * Cleanup resources
   */
  static destroy(): void {
    this.store.destroy();
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Authentication endpoints
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req: NextRequest) => `auth:${req.ip || 'unknown'}`
  },

  // Email validation
  emailCheck: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req: NextRequest) => `email:${req.ip || 'unknown'}`
  },

  // Phone validation
  phoneCheck: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req: NextRequest) => `phone:${req.ip || 'unknown'}`
  },

  // License validation
  licenseCheck: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req: NextRequest) => `license:${req.ip || 'unknown'}`
  },

  // Document validation
  documentCheck: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req: NextRequest) => `document:${req.ip || 'unknown'}`
  },

  // General API endpoints
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req: NextRequest) => `api:${req.ip || 'unknown'}`
  },

  // File uploads
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req: NextRequest) => `upload:${req.ip || 'unknown'}`
  }
};
