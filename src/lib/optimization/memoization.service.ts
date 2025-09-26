/**
 * Memoization Optimization Service
 * @fileoverview Service for memoizing expensive validations and computations
 * @compliance HIPAA-compliant memoization with performance optimization
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Memoization configuration
 */
interface MemoizationConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  keyGenerator?: (...args: any[]) => string;
  shouldCache?: (result: any) => boolean;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Memoization statistics
 */
interface MemoizationStats {
  cacheHits: number;
  cacheMisses: number;
  totalCalls: number;
  averageExecutionTime: number;
  cacheSize: number;
  hitRate: number;
}

/**
 * Memoization Optimization Service
 */
export class MemoizationService {
  private static caches = new Map<string, Map<string, CacheEntry<any>>>();
  private static stats = new Map<string, MemoizationStats>();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes
  private static defaultMaxSize = 1000;

  /**
   * Create memoized function for expensive validations
   */
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    config: MemoizationConfig = {}
  ): T {
    const {
      ttl = this.defaultTTL,
      maxSize = this.defaultMaxSize,
      keyGenerator = this.defaultKeyGenerator,
      shouldCache = () => true
    } = config;

    const cacheName = fn.name || 'anonymous';
    const cache = this.getOrCreateCache(cacheName);
    const stats = this.getOrCreateStats(cacheName);

    return ((...args: any[]) => {
      const startTime = Date.now();
      const key = keyGenerator(...args);
      
      // Check cache first
      const cached = cache.get(key);
      if (cached && this.isCacheEntryValid(cached)) {
        cached.accessCount++;
        cached.lastAccessed = Date.now();
        stats.cacheHits++;
        stats.totalCalls++;
        
        // Log cache hit
        this.logCacheHit(cacheName, key, Date.now() - startTime);
        
        return cached.value;
      }

      // Remove expired entry
      if (cached) {
        cache.delete(key);
      }

      // Execute function
      try {
        const result = fn(...args);
        const executionTime = Date.now() - startTime;
        
        // Update execution time stats
        stats.averageExecutionTime = 
          (stats.averageExecutionTime * stats.totalCalls + executionTime) / (stats.totalCalls + 1);
        
        stats.cacheMisses++;
        stats.totalCalls++;
        stats.hitRate = stats.cacheHits / stats.totalCalls;

        // Cache result if it should be cached
        if (shouldCache(result)) {
          this.setCacheEntry(cache, key, result, ttl, maxSize);
          stats.cacheSize = cache.size;
        }

        // Log cache miss
        this.logCacheMiss(cacheName, key, executionTime);

        return result;

      } catch (error) {
        stats.totalCalls++;
        
        // Log error
        this.logCacheError(cacheName, key, error);
        
        throw error;
      }
    }) as T;
  }

  /**
   * Memoize license validation (expensive SACS scraping)
   */
  static memoizedLicenseValidation = this.memoize(
    async (cedula: string) => {
      // This would call the actual license validation service
      const { LicenseValidationService } = await import('@/lib/security/validation/license-validation.service');
      return LicenseValidationService.validateLicense(cedula);
    },
    {
      ttl: 30 * 60 * 1000, // 30 minutes for license validation
      maxSize: 500,
      keyGenerator: (cedula: string) => `license_${cedula}`,
      shouldCache: (result) => result && !result.error
    }
  );

  /**
   * Memoize document validation (expensive format checking)
   */
  static memoizedDocumentValidation = this.memoize(
    async (documentNumber: string, documentType: string) => {
      const { DocumentValidationService } = await import('@/lib/security/validation/document-validation.service');
      return DocumentValidationService.validateDocumentFormat(documentNumber, documentType);
    },
    {
      ttl: 60 * 60 * 1000, // 1 hour for document validation
      maxSize: 1000,
      keyGenerator: (documentNumber: string, documentType: string) => 
        `document_${documentType}_${documentNumber}`,
      shouldCache: (result) => result && result.isValid
    }
  );

  /**
   * Memoize specialty validation (expensive specialty checking)
   */
  static memoizedSpecialtyValidation = this.memoize(
    async (specialtyId: string, subSpecialties: string[]) => {
      const { MedicalSpecialtyValidationService } = await import('@/lib/medical-validations/specialty/medical-specialty-validation.service');
      return MedicalSpecialtyValidationService.validateSubSpecialties(specialtyId, subSpecialties);
    },
    {
      ttl: 24 * 60 * 60 * 1000, // 24 hours for specialty validation
      maxSize: 200,
      keyGenerator: (specialtyId: string, subSpecialties: string[]) => 
        `specialty_${specialtyId}_${subSpecialties.sort().join(',')}`,
      shouldCache: (result) => result && result.isValid
    }
  );

  /**
   * Memoize email validation (expensive format checking)
   */
  static memoizedEmailValidation = this.memoize(
    async (email: string) => {
      const { EmailValidationService } = await import('@/lib/security/validation/email-validation.service');
      return EmailValidationService.validateEmail(email);
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes for email validation
      maxSize: 2000,
      keyGenerator: (email: string) => `email_${email.toLowerCase()}`,
      shouldCache: (result) => result && result.isValid
    }
  );

  /**
   * Memoize phone validation (expensive format checking)
   */
  static memoizedPhoneValidation = this.memoize(
    async (phone: string) => {
      const { PhoneValidationService } = await import('@/lib/security/validation/phone-validation.service');
      return PhoneValidationService.validatePhone(phone);
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes for phone validation
      maxSize: 2000,
      keyGenerator: (phone: string) => `phone_${phone.replace(/\D/g, '')}`,
      shouldCache: (result) => result && result.isValid
    }
  );

  /**
   * Memoize expensive calculations
   */
  static memoizedCalculations = {
    // Calculate doctor availability
    calculateDoctorAvailability: this.memoize(
      async (doctorId: string, date: string) => {
        const { AvailabilityOptimizationService } = await import('@/lib/database/availability-optimization.service');
        return AvailabilityOptimizationService.getDoctorAvailabilityDetails(doctorId, date);
      },
      {
        ttl: 2 * 60 * 1000, // 2 minutes for availability
        maxSize: 1000,
        keyGenerator: (doctorId: string, date: string) => `availability_${doctorId}_${date}`,
        shouldCache: (result) => result && result.isAvailable !== undefined
      }
    ),

    // Calculate appointment statistics
    calculateAppointmentStats: this.memoize(
      async (doctorId: string, startDate: string, endDate: string) => {
        // This would calculate appointment statistics
        return {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          averageDuration: 0
        };
      },
      {
        ttl: 5 * 60 * 1000, // 5 minutes for stats
        maxSize: 500,
        keyGenerator: (doctorId: string, startDate: string, endDate: string) => 
          `stats_${doctorId}_${startDate}_${endDate}`,
        shouldCache: (result) => result && typeof result.totalAppointments === 'number'
      }
    ),

    // Calculate patient health metrics
    calculateHealthMetrics: this.memoize(
      async (patientId: string, metricType: string, days: number) => {
        // This would calculate health metrics
        return {
          average: 0,
          trend: 'stable',
          alerts: []
        };
      },
      {
        ttl: 10 * 60 * 1000, // 10 minutes for health metrics
        maxSize: 1000,
        keyGenerator: (patientId: string, metricType: string, days: number) => 
          `health_${patientId}_${metricType}_${days}`,
        shouldCache: (result) => result && result.average !== undefined
      }
    )
  };

  /**
   * Get memoization statistics for a specific function
   */
  static getStats(cacheName: string): MemoizationStats | null {
    return this.stats.get(cacheName) || null;
  }

  /**
   * Get all memoization statistics
   */
  static getAllStats(): Record<string, MemoizationStats> {
    const allStats: Record<string, MemoizationStats> = {};
    for (const [name, stats] of this.stats.entries()) {
      allStats[name] = stats;
    }
    return allStats;
  }

  /**
   * Clear cache for specific function or all caches
   */
  static clearCache(cacheName?: string): void {
    if (cacheName) {
      this.caches.delete(cacheName);
      this.stats.delete(cacheName);
    } else {
      this.caches.clear();
      this.stats.clear();
    }
  }

  /**
   * Warm up cache with common validations
   */
  static async warmUpCache(): Promise<void> {
    const commonValidations = [
      // Common Venezuelan cedulas for testing
      { type: 'license', value: '17497542' },
      { type: 'license', value: '15229045' },
      { type: 'document', value: '12345678', type: 'cedula_identidad' },
      { type: 'email', value: 'test@example.com' },
      { type: 'phone', value: '+584121234567' }
    ];

    const warmUpPromises = commonValidations.map(async (validation) => {
      try {
        switch (validation.type) {
          case 'license':
            await this.memoizedLicenseValidation(validation.value);
            break;
          case 'document':
            await this.memoizedDocumentValidation(validation.value, validation.type);
            break;
          case 'email':
            await this.memoizedEmailValidation(validation.value);
            break;
          case 'phone':
            await this.memoizedPhoneValidation(validation.value);
            break;
        }
      } catch (error) {
        console.warn(`Failed to warm up cache for ${validation.type}:`, error);
      }
    });

    await Promise.all(warmUpPromises);

    await logSecurityEvent(
      'data_access',
      'memoization_cache_warmed',
      {
        validationsCount: commonValidations.length,
        cacheStats: this.getAllStats()
      },
      'info'
    );
  }

  // Private helper methods

  private static getOrCreateCache(cacheName: string): Map<string, CacheEntry<any>> {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new Map());
    }
    return this.caches.get(cacheName)!;
  }

  private static getOrCreateStats(cacheName: string): MemoizationStats {
    if (!this.stats.has(cacheName)) {
      this.stats.set(cacheName, {
        cacheHits: 0,
        cacheMisses: 0,
        totalCalls: 0,
        averageExecutionTime: 0,
        cacheSize: 0,
        hitRate: 0
      });
    }
    return this.stats.get(cacheName)!;
  }

  private static isCacheEntryValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private static setCacheEntry(
    cache: Map<string, CacheEntry<any>>,
    key: string,
    value: any,
    ttl: number,
    maxSize: number
  ): void {
    // Remove oldest entries if cache is full
    if (cache.size >= maxSize) {
      const oldestKey = Array.from(cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)[0][0];
      cache.delete(oldestKey);
    }

    cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now()
    });
  }

  private static defaultKeyGenerator(...args: any[]): string {
    return args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join('_');
  }

  private static logCacheHit(cacheName: string, key: string, executionTime: number): void {
    logSecurityEvent(
      'data_access',
      'memoization_cache_hit',
      {
        cacheName,
        key: key.substring(0, 20) + '...', // Truncate for privacy
        executionTime
      },
      'info'
    );
  }

  private static logCacheMiss(cacheName: string, key: string, executionTime: number): void {
    logSecurityEvent(
      'data_access',
      'memoization_cache_miss',
      {
        cacheName,
        key: key.substring(0, 20) + '...', // Truncate for privacy
        executionTime
      },
      'info'
    );
  }

  private static logCacheError(cacheName: string, key: string, error: any): void {
    logSecurityEvent(
      'data_access',
      'memoization_cache_error',
      {
        cacheName,
        key: key.substring(0, 20) + '...', // Truncate for privacy
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'error'
    );
  }
}
