/**
 * Request Batching Service
 * @fileoverview Service for implementing intelligent request batching to reduce network overhead
 * @compliance HIPAA-compliant request batching with performance optimization
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Batch configuration
 */
interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  priority: 'high' | 'medium' | 'low';
  endpoint: string;
  context?: string;
}

/**
 * Batched request
 */
interface BatchedRequest<T = any> {
  id: string;
  request: T;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  priority: number;
}

/**
 * Batch statistics
 */
interface BatchStats {
  endpoint: string;
  totalBatches: number;
  totalRequests: number;
  averageBatchSize: number;
  averageWaitTime: number;
  successRate: number;
  lastBatchTime: string;
}

/**
 * Request Batching Service
 */
export class RequestBatchingService {
  private static batches = new Map<string, BatchedRequest[]>();
  private static timers = new Map<string, NodeJS.Timeout>();
  private static stats = new Map<string, BatchStats>();
  private static requestIdCounter = 0;

  /**
   * Create batched request function
   */
  static createBatchedRequest<T, R>(
    config: BatchConfig,
    batchProcessor: (requests: T[]) => Promise<R[]>
  ): (request: T) => Promise<R> {
    const {
      maxBatchSize = 10,
      maxWaitTime = 100,
      priority = 'medium',
      endpoint,
      context = 'default'
    } = config;

    const batchKey = `${endpoint}_${context}`;
    
    // Initialize stats
    this.initializeStats(batchKey, endpoint);

    return (request: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        const requestId = `req_${++this.requestIdCounter}`;
        const priorityValue = this.getPriorityValue(priority);
        
        const batchedRequest: BatchedRequest<T> = {
          id: requestId,
          request,
          resolve,
          reject,
          timestamp: Date.now(),
          priority: priorityValue
        };

        // Add to batch
        if (!this.batches.has(batchKey)) {
          this.batches.set(batchKey, []);
        }
        
        this.batches.get(batchKey)!.push(batchedRequest);

        // Check if batch should be processed
        const currentBatch = this.batches.get(batchKey)!;
        
        if (currentBatch.length >= maxBatchSize) {
          // Process immediately if batch is full
          this.processBatch(batchKey, batchProcessor);
        } else if (currentBatch.length === 1) {
          // Start timer for first request
          this.startBatchTimer(batchKey, maxWaitTime, batchProcessor);
        }
      });
    };
  }

  /**
   * Create batched API request
   */
  static createBatchedApiRequest<T, R>(
    endpoint: string,
    config: Partial<BatchConfig> = {}
  ): (request: T) => Promise<R> {
    const defaultConfig: BatchConfig = {
      maxBatchSize: 10,
      maxWaitTime: 100,
      priority: 'medium',
      endpoint,
      ...config
    };

    return this.createBatchedRequest(
      defaultConfig,
      async (requests: T[]) => {
        const response = await fetch(`/api/batch/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Batch-Size': requests.length.toString()
          },
          body: JSON.stringify({ requests })
        });

        if (!response.ok) {
          throw new Error(`Batch API request failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result.results || result;
      }
    );
  }

  /**
   * Create batched database request
   */
  static createBatchedDatabaseRequest<T, R>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'upsert',
    config: Partial<BatchConfig> = {}
  ): (request: T) => Promise<R> {
    const defaultConfig: BatchConfig = {
      maxBatchSize: 20,
      maxWaitTime: 50,
      priority: 'high',
      endpoint: `db_${table}_${operation}`,
      ...config
    };

    return this.createBatchedRequest(
      defaultConfig,
      async (requests: T[]) => {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        let result;
        
        switch (operation) {
          case 'select':
            result = await supabase
              .from(table)
              .select('*')
              .in('id', requests.map((r: any) => r.id));
            break;
            
          case 'insert':
            result = await supabase
              .from(table)
              .insert(requests);
            break;
            
          case 'update':
            // Batch updates would need special handling
            result = await Promise.all(
              requests.map((req: any) => 
                supabase
                  .from(table)
                  .update(req.data)
                  .eq('id', req.id)
              )
            );
            break;
            
          case 'upsert':
            result = await supabase
              .from(table)
              .upsert(requests);
            break;
        }

        if (result.error) {
          throw result.error;
        }

        return result.data || result;
      }
    );
  }

  /**
   * Create batched validation request
   */
  static createBatchedValidationRequest<T, R>(
    validationType: 'email' | 'phone' | 'license' | 'document',
    config: Partial<BatchConfig> = {}
  ): (request: T) => Promise<R> {
    const defaultConfig: BatchConfig = {
      maxBatchSize: 15,
      maxWaitTime: 200,
      priority: 'medium',
      endpoint: `validation_${validationType}`,
      ...config
    };

    return this.createBatchedRequest(
      defaultConfig,
      async (requests: T[]) => {
        // Import appropriate validation service
        let validationService;
        
        switch (validationType) {
          case 'email':
            validationService = await import('@/lib/security/validation/email-validation.service');
            break;
          case 'phone':
            validationService = await import('@/lib/security/validation/phone-validation.service');
            break;
          case 'license':
            validationService = await import('@/lib/security/validation/license-validation.service');
            break;
          case 'document':
            validationService = await import('@/lib/security/validation/document-validation.service');
            break;
        }

        // Process validations in batch
        const results = await Promise.all(
          requests.map(async (request: any) => {
            try {
              // This would call the appropriate validation method
              return await validationService.validate(request);
            } catch (error) {
              return { error: error instanceof Error ? error.message : 'Unknown error' };
            }
          })
        );

        return results;
      }
    );
  }

  /**
   * Process batch immediately
   */
  static processBatchNow(batchKey: string): void {
    const batch = this.batches.get(batchKey);
    if (batch && batch.length > 0) {
      // Clear timer
      if (this.timers.has(batchKey)) {
        clearTimeout(this.timers.get(batchKey)!);
        this.timers.delete(batchKey);
      }
      
      // Process batch
      this.processBatch(batchKey, async () => []);
    }
  }

  /**
   * Get batch statistics
   */
  static getBatchStats(endpoint?: string): BatchStats | Record<string, BatchStats> {
    if (endpoint) {
      return this.stats.get(endpoint) || {
        endpoint,
        totalBatches: 0,
        totalRequests: 0,
        averageBatchSize: 0,
        averageWaitTime: 0,
        successRate: 0,
        lastBatchTime: new Date().toISOString()
      };
    }

    const allStats: Record<string, BatchStats> = {};
    for (const [key, stats] of this.stats.entries()) {
      allStats[key] = stats;
    }
    return allStats;
  }

  /**
   * Clear batch statistics
   */
  static clearStats(endpoint?: string): void {
    if (endpoint) {
      this.stats.delete(endpoint);
    } else {
      this.stats.clear();
    }
  }

  /**
   * Clear all batches
   */
  static clearAllBatches(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    
    // Clear all batches
    this.batches.clear();
  }

  // Private helper methods

  private static initializeStats(batchKey: string, endpoint: string): void {
    if (!this.stats.has(batchKey)) {
      this.stats.set(batchKey, {
        endpoint,
        totalBatches: 0,
        totalRequests: 0,
        averageBatchSize: 0,
        averageWaitTime: 0,
        successRate: 0,
        lastBatchTime: new Date().toISOString()
      });
    }
  }

  private static startBatchTimer(
    batchKey: string,
    maxWaitTime: number,
    batchProcessor: (requests: any[]) => Promise<any[]>
  ): void {
    const timer = setTimeout(() => {
      this.processBatch(batchKey, batchProcessor);
    }, maxWaitTime);
    
    this.timers.set(batchKey, timer);
  }

  private static async processBatch(
    batchKey: string,
    batchProcessor: (requests: any[]) => Promise<any[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    // Clear timer
    if (this.timers.has(batchKey)) {
      clearTimeout(this.timers.get(batchKey)!);
      this.timers.delete(batchKey);
    }

    // Clear batch
    this.batches.set(batchKey, []);

    // Sort by priority
    batch.sort((a, b) => b.priority - a.priority);

    const startTime = Date.now();
    const requests = batch.map(b => b.request);

    try {
      // Process batch
      const results = await batchProcessor(requests);
      
      // Resolve all requests
      batch.forEach((batchedRequest, index) => {
        const result = results[index];
        batchedRequest.resolve(result);
      });

      // Update stats
      this.updateStatsOnSuccess(batchKey, batch.length, Date.now() - startTime);

      // Log successful batch
      this.logBatchSuccess(batchKey, batch.length, Date.now() - startTime);

    } catch (error) {
      // Reject all requests
      batch.forEach(batchedRequest => {
        batchedRequest.reject(error);
      });

      // Update stats
      this.updateStatsOnError(batchKey, batch.length, Date.now() - startTime);

      // Log batch error
      this.logBatchError(batchKey, batch.length, error);
    }
  }

  private static getPriorityValue(priority: string): number {
    const priorities = {
      high: 3,
      medium: 2,
      low: 1
    };
    return priorities[priority as keyof typeof priorities] || 2;
  }

  private static updateStatsOnSuccess(batchKey: string, batchSize: number, processingTime: number): void {
    const stats = this.stats.get(batchKey)!;
    stats.totalBatches++;
    stats.totalRequests += batchSize;
    stats.averageBatchSize = 
      (stats.averageBatchSize * (stats.totalBatches - 1) + batchSize) / stats.totalBatches;
    stats.averageWaitTime = 
      (stats.averageWaitTime * (stats.totalBatches - 1) + processingTime) / stats.totalBatches;
    stats.successRate = 
      (stats.successRate * (stats.totalBatches - 1) + 1) / stats.totalBatches;
    stats.lastBatchTime = new Date().toISOString();
  }

  private static updateStatsOnError(batchKey: string, batchSize: number, processingTime: number): void {
    const stats = this.stats.get(batchKey)!;
    stats.totalBatches++;
    stats.totalRequests += batchSize;
    stats.averageBatchSize = 
      (stats.averageBatchSize * (stats.totalBatches - 1) + batchSize) / stats.totalBatches;
    stats.averageWaitTime = 
      (stats.averageWaitTime * (stats.totalBatches - 1) + processingTime) / stats.totalBatches;
    stats.successRate = 
      (stats.successRate * (stats.totalBatches - 1) + 0) / stats.totalBatches;
    stats.lastBatchTime = new Date().toISOString();
  }

  private static logBatchSuccess(batchKey: string, batchSize: number, processingTime: number): void {
    logSecurityEvent(
      'data_access',
      'batch_processing_success',
      {
        batchKey,
        batchSize,
        processingTime,
        efficiency: batchSize / processingTime // requests per ms
      },
      'info'
    );
  }

  private static logBatchError(batchKey: string, batchSize: number, error: any): void {
    logSecurityEvent(
      'data_access',
      'batch_processing_error',
      {
        batchKey,
        batchSize,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'error'
    );
  }
}

/**
 * Pre-configured batched functions for medical platform
 */
export const MedicalBatchedFunctions = {
  // API batched functions
  checkEmailAvailability: RequestBatchingService.createBatchedApiRequest(
    'check-email',
    { maxBatchSize: 15, maxWaitTime: 150, priority: 'high' }
  ),

  checkPhoneAvailability: RequestBatchingService.createBatchedApiRequest(
    'check-phone',
    { maxBatchSize: 15, maxWaitTime: 150, priority: 'high' }
  ),

  checkLicenseAvailability: RequestBatchingService.createBatchedApiRequest(
    'check-license',
    { maxBatchSize: 10, maxWaitTime: 200, priority: 'medium' }
  ),

  checkDocumentAvailability: RequestBatchingService.createBatchedApiRequest(
    'check-document',
    { maxBatchSize: 10, maxWaitTime: 200, priority: 'medium' }
  ),

  // Database batched functions
  getDoctorProfiles: RequestBatchingService.createBatchedDatabaseRequest(
    'doctors',
    'select',
    { maxBatchSize: 25, maxWaitTime: 50, priority: 'high' }
  ),

  getPatientProfiles: RequestBatchingService.createBatchedDatabaseRequest(
    'patients',
    'select',
    { maxBatchSize: 25, maxWaitTime: 50, priority: 'high' }
  ),

  getAppointments: RequestBatchingService.createBatchedDatabaseRequest(
    'appointments',
    'select',
    { maxBatchSize: 20, maxWaitTime: 100, priority: 'medium' }
  ),

  getMedicalRecords: RequestBatchingService.createBatchedDatabaseRequest(
    'medical_records',
    'select',
    { maxBatchSize: 15, maxWaitTime: 100, priority: 'medium' }
  ),

  // Validation batched functions
  validateEmails: RequestBatchingService.createBatchedValidationRequest(
    'email',
    { maxBatchSize: 20, maxWaitTime: 100, priority: 'medium' }
  ),

  validatePhones: RequestBatchingService.createBatchedValidationRequest(
    'phone',
    { maxBatchSize: 20, maxWaitTime: 100, priority: 'medium' }
  ),

  validateLicenses: RequestBatchingService.createBatchedValidationRequest(
    'license',
    { maxBatchSize: 10, maxWaitTime: 300, priority: 'low' }
  ),

  validateDocuments: RequestBatchingService.createBatchedValidationRequest(
    'document',
    { maxBatchSize: 10, maxWaitTime: 300, priority: 'low' }
  )
};
