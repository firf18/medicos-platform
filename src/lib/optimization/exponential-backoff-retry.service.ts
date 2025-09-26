/**
 * Exponential Backoff Retry Service
 * @fileoverview Service for implementing automatic retry with exponential backoff
 * @compliance HIPAA-compliant retry mechanism with intelligent backoff
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  context?: string;
}

/**
 * Retry statistics
 */
interface RetryStats {
  functionName: string;
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  retryAttempts: number;
  averageRetryDelay: number;
  lastError?: string;
}

/**
 * Exponential Backoff Retry Service
 */
export class ExponentialBackoffRetryService {
  private static stats = new Map<string, RetryStats>();
  private static retryQueues = new Map<string, Array<() => Promise<any>>>();
  private static isProcessing = new Map<string, boolean>();

  /**
   * Create retry wrapper for async functions
   */
  static withRetry<T extends (...args: any[]) => Promise<any>>(
    func: T,
    config: RetryConfig = {}
  ): T {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      exponentialBase = 2,
      jitter = true,
      retryCondition = this.defaultRetryCondition,
      onRetry,
      context = 'default'
    } = config;

    const functionName = func.name || 'anonymous';
    const retryKey = `${functionName}_${context}`;
    
    // Initialize stats
    this.initializeStats(retryKey, functionName);

    return (async (...args: Parameters<T>) => {
      let lastError: any;
      let attempt = 0;
      const startTime = Date.now();

      while (attempt <= maxRetries) {
        try {
          const result = await func(...args);
          
          // Update stats on success
          this.updateStatsOnSuccess(retryKey, attempt, Date.now() - startTime);
          
          return result;

        } catch (error) {
          lastError = error;
          attempt++;

          // Update stats
          this.updateStatsOnError(retryKey, attempt, error);

          // Check if we should retry
          if (attempt > maxRetries || !retryCondition(error)) {
            this.logRetryFailure(retryKey, attempt, error, Date.now() - startTime);
            throw error;
          }

          // Calculate delay with exponential backoff
          const delay = this.calculateDelay(attempt, baseDelay, maxDelay, exponentialBase, jitter);
          
          // Log retry attempt
          this.logRetryAttempt(retryKey, attempt, delay, error);

          // Call onRetry callback if provided
          if (onRetry) {
            onRetry(attempt, error);
          }

          // Wait before retry
          await this.delay(delay);
        }
      }

      throw lastError;
    }) as T;
  }

  /**
   * Create retry wrapper for API calls
   */
  static createApiRetry<T extends (...args: any[]) => Promise<any>>(
    func: T,
    endpoint: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): T {
    const configs = {
      high: {
        maxRetries: 5,
        baseDelay: 500,
        maxDelay: 10000,
        exponentialBase: 2,
        jitter: true
      },
      medium: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 15000,
        exponentialBase: 2,
        jitter: true
      },
      low: {
        maxRetries: 2,
        baseDelay: 2000,
        maxDelay: 20000,
        exponentialBase: 2,
        jitter: true
      }
    };

    const config = configs[priority];

    return this.withRetry(func, {
      ...config,
      retryCondition: this.apiRetryCondition,
      context: `api_${endpoint}_${priority}`
    });
  }

  /**
   * Create retry wrapper for database operations
   */
  static createDatabaseRetry<T extends (...args: any[]) => Promise<any>>(
    func: T,
    operation: 'read' | 'write' | 'transaction' = 'read'
  ): T {
    const configs = {
      read: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        exponentialBase: 2,
        jitter: true
      },
      write: {
        maxRetries: 5,
        baseDelay: 500,
        maxDelay: 15000,
        exponentialBase: 2,
        jitter: true
      },
      transaction: {
        maxRetries: 7,
        baseDelay: 2000,
        maxDelay: 30000,
        exponentialBase: 2,
        jitter: true
      }
    };

    const config = configs[operation];

    return this.withRetry(func, {
      ...config,
      retryCondition: this.databaseRetryCondition,
      context: `database_${operation}`
    });
  }

  /**
   * Create retry wrapper for external service calls
   */
  static createExternalServiceRetry<T extends (...args: any[]) => Promise<any>>(
    func: T,
    service: 'sacs' | 'didit' | 'email' | 'sms' = 'sacs'
  ): T {
    const configs = {
      sacs: {
        maxRetries: 5,
        baseDelay: 2000,
        maxDelay: 30000,
        exponentialBase: 2,
        jitter: true
      },
      didit: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 15000,
        exponentialBase: 2,
        jitter: true
      },
      email: {
        maxRetries: 3,
        baseDelay: 5000,
        maxDelay: 60000,
        exponentialBase: 2,
        jitter: true
      },
      sms: {
        maxRetries: 3,
        baseDelay: 3000,
        maxDelay: 45000,
        exponentialBase: 2,
        jitter: true
      }
    };

    const config = configs[service];

    return this.withRetry(func, {
      ...config,
      retryCondition: this.externalServiceRetryCondition,
      context: `external_${service}`
    });
  }

  /**
   * Queue retry for failed operations
   */
  static queueRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {},
    queueName: string = 'default'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const retryOperation = async () => {
        try {
          const result = await this.withRetry(operation, config)();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (!this.retryQueues.has(queueName)) {
        this.retryQueues.set(queueName, []);
      }

      this.retryQueues.get(queueName)!.push(retryOperation);
      this.processRetryQueue(queueName);
    });
  }

  /**
   * Get retry statistics
   */
  static getRetryStats(functionName?: string, context?: string): RetryStats | Record<string, RetryStats> {
    if (functionName && context) {
      const retryKey = `${functionName}_${context}`;
      return this.stats.get(retryKey) || {
        functionName,
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        retryAttempts: 0,
        averageRetryDelay: 0
      };
    }

    const allStats: Record<string, RetryStats> = {};
    for (const [key, stats] of this.stats.entries()) {
      allStats[key] = stats;
    }
    return allStats;
  }

  /**
   * Clear retry statistics
   */
  static clearStats(functionName?: string, context?: string): void {
    if (functionName && context) {
      const retryKey = `${functionName}_${context}`;
      this.stats.delete(retryKey);
    } else {
      this.stats.clear();
    }
  }

  /**
   * Clear retry queues
   */
  static clearRetryQueues(queueName?: string): void {
    if (queueName) {
      this.retryQueues.delete(queueName);
      this.isProcessing.delete(queueName);
    } else {
      this.retryQueues.clear();
      this.isProcessing.clear();
    }
  }

  // Private helper methods

  private static initializeStats(retryKey: string, functionName: string): void {
    if (!this.stats.has(retryKey)) {
      this.stats.set(retryKey, {
        functionName,
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        retryAttempts: 0,
        averageRetryDelay: 0
      });
    }
  }

  private static updateStatsOnSuccess(retryKey: string, attempt: number, totalTime: number): void {
    const stats = this.stats.get(retryKey)!;
    stats.totalAttempts += attempt;
    stats.successfulAttempts++;
    
    if (attempt > 1) {
      stats.retryAttempts += (attempt - 1);
    }
  }

  private static updateStatsOnError(retryKey: string, attempt: number, error: any): void {
    const stats = this.stats.get(retryKey)!;
    stats.totalAttempts += attempt;
    stats.failedAttempts++;
    stats.lastError = error instanceof Error ? error.message : 'Unknown error';
    
    if (attempt > 1) {
      stats.retryAttempts += (attempt - 1);
    }
  }

  private static calculateDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    exponentialBase: number,
    jitter: boolean
  ): number {
    // Calculate exponential delay
    const exponentialDelay = baseDelay * Math.pow(exponentialBase, attempt - 1);
    
    // Apply jitter to avoid thundering herd
    const jitterValue = jitter ? Math.random() * 0.1 : 0;
    const jitteredDelay = exponentialDelay * (1 + jitterValue);
    
    // Cap at max delay
    return Math.min(jitteredDelay, maxDelay);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async processRetryQueue(queueName: string): Promise<void> {
    if (this.isProcessing.get(queueName)) {
      return;
    }

    this.isProcessing.set(queueName, true);
    const queue = this.retryQueues.get(queueName) || [];

    while (queue.length > 0) {
      const operation = queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error(`Retry queue operation failed for ${queueName}:`, error);
        }
      }
    }

    this.isProcessing.set(queueName, false);
  }

  // Retry condition functions

  private static defaultRetryCondition(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true; // Network error
    }
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true; // Connection errors
    }
    
    if (error.status >= 500 && error.status < 600) {
      return true; // Server errors
    }
    
    if (error.status === 429) {
      return true; // Rate limiting
    }
    
    return false;
  }

  private static apiRetryCondition(error: any): boolean {
    // More specific conditions for API calls
    if (this.defaultRetryCondition(error)) {
      return true;
    }
    
    // Retry on specific API errors
    if (error.status === 408) {
      return true; // Request timeout
    }
    
    if (error.status === 503) {
      return true; // Service unavailable
    }
    
    if (error.status === 504) {
      return true; // Gateway timeout
    }
    
    return false;
  }

  private static databaseRetryCondition(error: any): boolean {
    // Database-specific retry conditions
    if (error.code === 'ECONNREFUSED') {
      return true; // Database connection refused
    }
    
    if (error.code === 'ETIMEDOUT') {
      return true; // Database timeout
    }
    
    if (error.message?.includes('connection')) {
      return true; // Connection-related errors
    }
    
    if (error.message?.includes('deadlock')) {
      return true; // Deadlock detection
    }
    
    return false;
  }

  private static externalServiceRetryCondition(error: any): boolean {
    // External service-specific retry conditions
    if (this.defaultRetryCondition(error)) {
      return true;
    }
    
    // Retry on external service specific errors
    if (error.status === 502) {
      return true; // Bad gateway
    }
    
    if (error.status === 503) {
      return true; // Service unavailable
    }
    
    if (error.message?.includes('timeout')) {
      return true; // Timeout errors
    }
    
    return false;
  }

  private static logRetryAttempt(
    retryKey: string,
    attempt: number,
    delay: number,
    error: any
  ): void {
    logSecurityEvent(
      'data_access',
      'retry_attempt',
      {
        retryKey,
        attempt,
        delay,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStatus: error.status || 'unknown'
      },
      'warning'
    );
  }

  private static logRetryFailure(
    retryKey: string,
    attempts: number,
    error: any,
    totalTime: number
  ): void {
    logSecurityEvent(
      'data_access',
      'retry_failure',
      {
        retryKey,
        attempts,
        totalTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStatus: error.status || 'unknown'
      },
      'error'
    );
  }
}

/**
 * Pre-configured retry functions for medical platform
 */
export const MedicalRetryFunctions = {
  // API retry functions
  checkEmailAvailability: ExponentialBackoffRetryService.createApiRetry(
    async (email: string) => {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    'check-email',
    'high'
  ),

  checkLicenseAvailability: ExponentialBackoffRetryService.createApiRetry(
    async (license: string) => {
      const response = await fetch('/api/auth/check-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    'check-license',
    'medium'
  ),

  // Database retry functions
  createDoctorProfile: ExponentialBackoffRetryService.createDatabaseRetry(
    async (doctorData: any) => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    'write'
  ),

  getDoctorProfile: ExponentialBackoffRetryService.createDatabaseRetry(
    async (doctorId: string) => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    'read'
  ),

  // External service retry functions
  validateWithSACS: ExponentialBackoffRetryService.createExternalServiceRetry(
    async (cedula: string) => {
      const { LicenseValidationService } = await import('@/lib/security/validation/license-validation.service');
      return LicenseValidationService.scrapeSACS(cedula);
    },
    'sacs'
  ),

  validateWithDidit: ExponentialBackoffRetryService.createExternalServiceRetry(
    async (sessionId: string) => {
      // Implementation would call Didit API
      const response = await fetch(`/api/external/didit/verify/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Didit verification failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    'didit'
  ),

  sendEmail: ExponentialBackoffRetryService.createExternalServiceRetry(
    async (emailData: any) => {
      const response = await fetch('/api/external/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    'email'
  ),

  sendSMS: ExponentialBackoffRetryService.createExternalServiceRetry(
    async (smsData: any) => {
      const response = await fetch('/api/external/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsData)
      });
      
      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    'sms'
  )
};
