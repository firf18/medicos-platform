/**
 * Security Configuration
 * @fileoverview Central configuration for all security services
 * @compliance HIPAA-compliant security configuration
 */

import { EncryptionService } from './encryption/encryption.service';
import { KeyManagementService } from './encryption/key-management.service';
import { CSRFProtection } from './csrf/csrf-protection';
import { RateLimiter } from './rate-limiting/rate-limiter';
import { GlobalSecurityMiddleware } from './global-security-middleware';
import { logSecurityEvent } from './logging/security-logger';

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  encryption: {
    masterKey: string;
    algorithm: string;
    keySize: number;
    iterations: number;
  };
  csrf: {
    secret: string;
    tokenLength: number;
    tokenExpiry: number;
    headerName: string;
    cookieName: string;
  };
  rateLimit: {
    defaultMaxRequests: number;
    defaultWindowMs: number;
    skipPaths: string[];
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    complianceMode: 'basic' | 'enhanced' | 'critical';
  };
  middleware: {
    enableCSRF: boolean;
    enableRateLimiting: boolean;
    enableInputSanitization: boolean;
    enableSecurityHeaders: boolean;
    enableAuditLogging: boolean;
  };
}

/**
 * Security service status
 */
export interface SecurityStatus {
  initialized: boolean;
  services: {
    encryption: boolean;
    keyManagement: boolean;
    csrf: boolean;
    rateLimiting: boolean;
    middleware: boolean;
    auditLogging: boolean;
    sanitization: boolean;
    injectionProtection: boolean;
  };
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    soc2: boolean;
  };
  lastInitialized: string;
  version: string;
}

/**
 * Security configuration service
 */
export class SecurityConfigService {
  private static readonly VERSION = '1.0.0';
  private static initialized = false;
  private static config: SecurityConfig;
  private static lastInitialized: string;

  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    encryption: {
      masterKey: process.env.ENCRYPTION_MASTER_KEY || 'default-master-key-change-in-production',
      algorithm: 'AES-256-GCM',
      keySize: 256,
      iterations: 10000
    },
    csrf: {
      secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
      tokenLength: 32,
      tokenExpiry: 60 * 60 * 1000, // 1 hour
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf-token'
    },
    rateLimit: {
      defaultMaxRequests: 100,
      defaultWindowMs: 60000, // 1 minute
      skipPaths: [
        '/api/health',
        '/api/csrf/token',
        '/api/public'
      ]
    },
    audit: {
      enabled: true,
      retentionDays: 2555, // 7 years
      complianceMode: 'critical'
    },
    middleware: {
      enableCSRF: true,
      enableRateLimiting: true,
      enableInputSanitization: true,
      enableSecurityHeaders: true,
      enableAuditLogging: true
    }
  };

  /**
   * Initialize security services
   */
  static async initialize(config?: Partial<SecurityConfig>): Promise<void> {
    try {
      // Merge with default config
      this.config = this.mergeConfig(config);

      // Validate configuration
      this.validateConfig(this.config);

      // Initialize encryption service
      EncryptionService.initialize(
        this.config.encryption.masterKey,
        {
          algorithm: this.config.encryption.algorithm,
          keySize: this.config.encryption.keySize,
          iterations: this.config.encryption.iterations,
          ivSize: 128,
          saltSize: 128
        }
      );

      // Configure CSRF protection
      CSRFProtection.configure({
        secret: this.config.csrf.secret,
        tokenLength: this.config.csrf.tokenLength,
        tokenExpiry: this.config.csrf.tokenExpiry,
        headerName: this.config.csrf.headerName,
        cookieName: this.config.csrf.cookieName
      });

      // Configure global security middleware
      GlobalSecurityMiddleware.configure({
        enableCSRF: this.config.middleware.enableCSRF,
        enableRateLimiting: this.config.middleware.enableRateLimiting,
        enableInputSanitization: this.config.middleware.enableInputSanitization,
        enableSecurityHeaders: this.config.middleware.enableSecurityHeaders,
        enableAuditLogging: this.config.middleware.enableAuditLogging,
        skipPaths: this.config.rateLimit.skipPaths,
        rateLimitConfig: {
          maxRequests: this.config.rateLimit.defaultMaxRequests,
          windowMs: this.config.rateLimit.defaultWindowMs
        }
      });

      // Mark as initialized
      this.initialized = true;
      this.lastInitialized = new Date().toISOString();

      // Log initialization
      logSecurityEvent('security_services_initialized', {
        version: this.VERSION,
        config: {
          encryptionEnabled: true,
          csrfEnabled: this.config.middleware.enableCSRF,
          rateLimitingEnabled: this.config.middleware.enableRateLimiting,
          auditLoggingEnabled: this.config.middleware.enableAuditLogging
        },
        timestamp: this.lastInitialized
      });

      console.log('[SECURITY-INIT] Security services initialized successfully');

    } catch (error) {
      this.initialized = false;
      
      logSecurityEvent('security_services_initialization_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      throw new Error(`Failed to initialize security services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Merge configuration with defaults
   */
  private static mergeConfig(userConfig?: Partial<SecurityConfig>): SecurityConfig {
    if (!userConfig) {
      return this.DEFAULT_CONFIG;
    }

    return {
      encryption: { ...this.DEFAULT_CONFIG.encryption, ...userConfig.encryption },
      csrf: { ...this.DEFAULT_CONFIG.csrf, ...userConfig.csrf },
      rateLimit: { ...this.DEFAULT_CONFIG.rateLimit, ...userConfig.rateLimit },
      audit: { ...this.DEFAULT_CONFIG.audit, ...userConfig.audit },
      middleware: { ...this.DEFAULT_CONFIG.middleware, ...userConfig.middleware }
    };
  }

  /**
   * Validate configuration
   */
  private static validateConfig(config: SecurityConfig): void {
    const errors: string[] = [];

    // Validate encryption config
    if (!config.encryption.masterKey || config.encryption.masterKey.length < 32) {
      errors.push('Encryption master key must be at least 32 characters long');
    }

    if (config.encryption.keySize < 128) {
      errors.push('Encryption key size must be at least 128 bits');
    }

    // Validate CSRF config
    if (!config.csrf.secret || config.csrf.secret.length < 16) {
      errors.push('CSRF secret must be at least 16 characters long');
    }

    if (config.csrf.tokenLength < 16) {
      errors.push('CSRF token length must be at least 16 characters');
    }

    // Validate rate limit config
    if (config.rateLimit.defaultMaxRequests < 1) {
      errors.push('Rate limit max requests must be at least 1');
    }

    if (config.rateLimit.defaultWindowMs < 1000) {
      errors.push('Rate limit window must be at least 1000ms');
    }

    // Validate audit config
    if (config.audit.retentionDays < 1) {
      errors.push('Audit retention days must be at least 1');
    }

    if (errors.length > 0) {
      throw new Error(`Security configuration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get security status
   */
  static getStatus(): SecurityStatus {
    return {
      initialized: this.initialized,
      services: {
        encryption: EncryptionService.getStatus().initialized,
        keyManagement: KeyManagementService.getStatus().initialized,
        csrf: true, // CSRF is always available
        rateLimiting: true, // Rate limiting is always available
        middleware: GlobalSecurityMiddleware.getStatus().initialized,
        auditLogging: true, // Audit logging is always available
        sanitization: true, // Input sanitization is always available
        injectionProtection: true // Injection protection is always available
      },
      compliance: {
        hipaa: this.isHIPAACompliant(),
        gdpr: this.isGDPRCompliant(),
        soc2: this.isSOC2Compliant()
      },
      lastInitialized: this.lastInitialized || 'Never',
      version: this.VERSION
    };
  }

  /**
   * Check HIPAA compliance
   */
  private static isHIPAACompliant(): boolean {
    if (!this.initialized) return false;
    
    return (
      this.config.encryption.keySize >= 256 &&
      this.config.audit.enabled &&
      this.config.audit.retentionDays >= 2190 && // 6 years minimum
      this.config.middleware.enableAuditLogging &&
      this.config.middleware.enableCSRF &&
      this.config.middleware.enableInputSanitization
    );
  }

  /**
   * Check GDPR compliance
   */
  private static isGDPRCompliant(): boolean {
    if (!this.initialized) return false;
    
    return (
      this.config.encryption.keySize >= 256 &&
      this.config.audit.enabled &&
      this.config.middleware.enableAuditLogging &&
      this.config.middleware.enableCSRF
    );
  }

  /**
   * Check SOC 2 compliance
   */
  private static isSOC2Compliant(): boolean {
    if (!this.initialized) return false;
    
    return (
      this.config.encryption.keySize >= 256 &&
      this.config.audit.enabled &&
      this.config.middleware.enableAuditLogging &&
      this.config.middleware.enableCSRF &&
      this.config.middleware.enableRateLimiting &&
      this.config.middleware.enableSecurityHeaders
    );
  }

  /**
   * Get current configuration
   */
  static getConfig(): SecurityConfig | null {
    return this.initialized ? this.config : null;
  }

  /**
   * Check if initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get version
   */
  static getVersion(): string {
    return this.VERSION;
  }

  /**
   * Reinitialize security services
   */
  static async reinitialize(config?: Partial<SecurityConfig>): Promise<void> {
    this.initialized = false;
    await this.initialize(config);
  }

  /**
   * Shutdown security services
   */
  static shutdown(): void {
    try {
      // Cleanup rate limiter
      RateLimiter.destroy();
      
      // Mark as not initialized
      this.initialized = false;
      
      logSecurityEvent('security_services_shutdown', {
        timestamp: new Date().toISOString()
      });

      console.log('[SECURITY-SHUTDOWN] Security services shut down successfully');

    } catch (error) {
      logSecurityEvent('security_services_shutdown_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
