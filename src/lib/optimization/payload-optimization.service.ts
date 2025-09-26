/**
 * Payload Optimization Service
 * @fileoverview Service for optimizing payload sizes and reducing data transfer
 * @compliance HIPAA-compliant payload optimization with data minimization
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Payload optimization configuration
 */
interface PayloadOptimizationConfig {
  maxSize: number; // Maximum payload size in bytes
  enableFieldFiltering: boolean;
  enableDataMinimization: boolean;
  enablePagination: boolean;
  enableFieldSelection: boolean;
  enableDataTransformation: boolean;
  context?: string;
}

/**
 * Payload optimization statistics
 */
interface PayloadOptimizationStats {
  context: string;
  totalRequests: number;
  totalOriginalSize: number;
  totalOptimizedSize: number;
  averageReduction: number;
  optimizationTechniques: Record<string, number>;
  lastOptimization: string;
}

/**
 * Payload Optimization Service
 */
export class PayloadOptimizationService {
  private static stats = new Map<string, PayloadOptimizationStats>();
  private static optimizationConfigs: Record<string, PayloadOptimizationConfig> = {
    api: {
      maxSize: 1024 * 1024, // 1MB
      enableFieldFiltering: true,
      enableDataMinimization: true,
      enablePagination: true,
      enableFieldSelection: true,
      enableDataTransformation: true,
      context: 'api'
    },
    medical: {
      maxSize: 512 * 1024, // 512KB
      enableFieldFiltering: true,
      enableDataMinimization: true,
      enablePagination: true,
      enableFieldSelection: true,
      enableDataTransformation: true,
      context: 'medical'
    },
    dashboard: {
      maxSize: 2 * 1024 * 1024, // 2MB
      enableFieldFiltering: true,
      enableDataMinimization: false,
      enablePagination: true,
      enableFieldSelection: true,
      enableDataTransformation: true,
      context: 'dashboard'
    }
  };

  /**
   * Optimize payload data
   */
  static async optimizePayload(
    data: any,
    config: PayloadOptimizationConfig,
    options: {
      fields?: string[];
      page?: number;
      limit?: number;
      transform?: boolean;
    } = {}
  ): Promise<{
    optimized: boolean;
    data: any;
    originalSize: number;
    optimizedSize: number;
    reductionRatio: number;
    techniques: string[];
  }> {
    const startTime = Date.now();
    const originalSize = this.getPayloadSize(data);
    const techniques: string[] = [];
    let optimizedData = data;

    try {
      // Apply field filtering
      if (config.enableFieldFiltering && options.fields) {
        optimizedData = this.filterFields(optimizedData, options.fields);
        techniques.push('field_filtering');
      }

      // Apply data minimization
      if (config.enableDataMinimization) {
        optimizedData = this.minimizeData(optimizedData);
        techniques.push('data_minimization');
      }

      // Apply pagination
      if (config.enablePagination && options.page && options.limit) {
        optimizedData = this.applyPagination(optimizedData, options.page, options.limit);
        techniques.push('pagination');
      }

      // Apply field selection
      if (config.enableFieldSelection && options.fields) {
        optimizedData = this.selectFields(optimizedData, options.fields);
        techniques.push('field_selection');
      }

      // Apply data transformation
      if (config.enableDataTransformation && options.transform) {
        optimizedData = this.transformData(optimizedData);
        techniques.push('data_transformation');
      }

      // Check if payload is within size limits
      const optimizedSize = this.getPayloadSize(optimizedData);
      if (optimizedSize > config.maxSize) {
        // Apply additional compression techniques
        optimizedData = this.compressPayload(optimizedData);
        techniques.push('payload_compression');
      }

      const finalSize = this.getPayloadSize(optimizedData);
      const reductionRatio = originalSize / finalSize;
      const optimizationTime = Date.now() - startTime;

      // Update stats
      this.updateStats(config.context, originalSize, finalSize, techniques, optimizationTime);

      // Log optimization
      this.logOptimization(
        config.context,
        originalSize,
        finalSize,
        reductionRatio,
        techniques,
        optimizationTime
      );

      return {
        optimized: techniques.length > 0,
        data: optimizedData,
        originalSize,
        optimizedSize: finalSize,
        reductionRatio,
        techniques
      };

    } catch (error) {
      this.logOptimizationError(config.context, error);
      
      return {
        optimized: false,
        data,
        originalSize,
        optimizedSize: originalSize,
        reductionRatio: 1,
        techniques: []
      };
    }
  }

  /**
   * Optimize API response payload
   */
  static async optimizeApiPayload(
    data: any,
    options: {
      fields?: string[];
      page?: number;
      limit?: number;
      transform?: boolean;
    } = {}
  ): Promise<any> {
    const config = this.optimizationConfigs.api;
    const result = await this.optimizePayload(data, config, options);
    
    return {
      data: result.data,
      meta: {
        optimized: result.optimized,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        reductionRatio: result.reductionRatio,
        techniques: result.techniques
      }
    };
  }

  /**
   * Optimize medical data payload
   */
  static async optimizeMedicalPayload(
    data: any,
    options: {
      fields?: string[];
      page?: number;
      limit?: number;
      transform?: boolean;
    } = {}
  ): Promise<any> {
    const config = this.optimizationConfigs.medical;
    const result = await this.optimizePayload(data, config, options);
    
    return {
      data: result.data,
      meta: {
        optimized: result.optimized,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        reductionRatio: result.reductionRatio,
        techniques: result.techniques
      }
    };
  }

  /**
   * Optimize dashboard payload
   */
  static async optimizeDashboardPayload(
    data: any,
    options: {
      fields?: string[];
      page?: number;
      limit?: number;
      transform?: boolean;
    } = {}
  ): Promise<any> {
    const config = this.optimizationConfigs.dashboard;
    const result = await this.optimizePayload(data, config, options);
    
    return {
      data: result.data,
      meta: {
        optimized: result.optimized,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        reductionRatio: result.reductionRatio,
        techniques: result.techniques
      }
    };
  }

  /**
   * Create optimized API endpoint wrapper
   */
  static createOptimizedEndpoint<T extends (...args: any[]) => Promise<any>>(
    endpoint: T,
    context: string = 'api'
  ): T {
    return (async (...args: any[]) => {
      const result = await endpoint(...args);
      
      // Extract optimization options from args
      const options = this.extractOptimizationOptions(args);
      
      // Optimize the result
      const config = this.optimizationConfigs[context];
      const optimized = await this.optimizePayload(result, config, options);
      
      return optimized.data;
    }) as T;
  }

  /**
   * Get payload optimization statistics
   */
  static getOptimizationStats(context?: string): PayloadOptimizationStats | Record<string, PayloadOptimizationStats> {
    if (context) {
      return this.stats.get(context) || {
        context,
        totalRequests: 0,
        totalOriginalSize: 0,
        totalOptimizedSize: 0,
        averageReduction: 0,
        optimizationTechniques: {},
        lastOptimization: new Date().toISOString()
      };
    }

    const allStats: Record<string, PayloadOptimizationStats> = {};
    for (const [key, stats] of this.stats.entries()) {
      allStats[key] = stats;
    }
    return allStats;
  }

  /**
   * Clear optimization statistics
   */
  static clearStats(context?: string): void {
    if (context) {
      this.stats.delete(context);
    } else {
      this.stats.clear();
    }
  }

  // Private helper methods

  private static filterFields(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => this.filterFields(item, fields));
    }

    if (typeof data === 'object' && data !== null) {
      const filtered: any = {};
      for (const field of fields) {
        if (data.hasOwnProperty(field)) {
          filtered[field] = data[field];
        }
      }
      return filtered;
    }

    return data;
  }

  private static minimizeData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.minimizeData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const minimized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Remove null/undefined values
        if (value !== null && value !== undefined) {
          // Remove empty strings
          if (typeof value === 'string' && value.trim() === '') {
            continue;
          }
          // Remove empty arrays
          if (Array.isArray(value) && value.length === 0) {
            continue;
          }
          // Remove empty objects
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            continue;
          }
          
          minimized[key] = this.minimizeData(value);
        }
      }
      return minimized;
    }

    return data;
  }

  private static applyPagination(data: any, page: number, limit: number): any {
    if (Array.isArray(data)) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return data.slice(startIndex, endIndex);
    }

    return data;
  }

  private static selectFields(data: any, fields: string[]): any {
    return this.filterFields(data, fields);
  }

  private static transformData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.transformData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const transformed: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Transform field names to shorter versions
        const shortKey = this.getShortFieldName(key);
        transformed[shortKey] = this.transformData(value);
      }
      return transformed;
    }

    return data;
  }

  private static compressPayload(data: any): any {
    // Apply additional compression techniques
    if (Array.isArray(data)) {
      // Remove duplicate items
      const unique = data.filter((item, index, self) => 
        index === self.findIndex(t => JSON.stringify(t) === JSON.stringify(item))
      );
      return unique;
    }

    return data;
  }

  private static getShortFieldName(fieldName: string): string {
    const shortNames: Record<string, string> = {
      'id': 'i',
      'name': 'n',
      'email': 'e',
      'phone': 'p',
      'created_at': 'ca',
      'updated_at': 'ua',
      'first_name': 'fn',
      'last_name': 'ln',
      'license_number': 'ln',
      'specialty_id': 'si',
      'is_available': 'ia',
      'is_verified': 'iv',
      'appointment_date': 'ad',
      'appointment_time': 'at',
      'patient_id': 'pi',
      'doctor_id': 'di',
      'medical_record': 'mr',
      'prescription': 'pr',
      'diagnosis': 'dg',
      'treatment': 'tr'
    };

    return shortNames[fieldName] || fieldName;
  }

  private static extractOptimizationOptions(args: any[]): any {
    // Extract optimization options from function arguments
    const options: any = {};
    
    for (const arg of args) {
      if (typeof arg === 'object' && arg !== null) {
        if (arg.fields) options.fields = arg.fields;
        if (arg.page) options.page = arg.page;
        if (arg.limit) options.limit = arg.limit;
        if (arg.transform) options.transform = arg.transform;
      }
    }
    
    return options;
  }

  private static getPayloadSize(data: any): number {
    return Buffer.byteLength(JSON.stringify(data), 'utf8');
  }

  private static updateStats(
    context: string,
    originalSize: number,
    optimizedSize: number,
    techniques: string[],
    optimizationTime: number
  ): void {
    if (!this.stats.has(context)) {
      this.stats.set(context, {
        context,
        totalRequests: 0,
        totalOriginalSize: 0,
        totalOptimizedSize: 0,
        averageReduction: 0,
        optimizationTechniques: {},
        lastOptimization: new Date().toISOString()
      });
    }

    const stats = this.stats.get(context)!;
    stats.totalRequests++;
    stats.totalOriginalSize += originalSize;
    stats.totalOptimizedSize += optimizedSize;
    stats.averageReduction = stats.totalOriginalSize / stats.totalOptimizedSize;
    stats.lastOptimization = new Date().toISOString();

    // Update technique counts
    for (const technique of techniques) {
      stats.optimizationTechniques[technique] = 
        (stats.optimizationTechniques[technique] || 0) + 1;
    }
  }

  private static logOptimization(
    context: string,
    originalSize: number,
    optimizedSize: number,
    reductionRatio: number,
    techniques: string[],
    optimizationTime: number
  ): void {
    logSecurityEvent(
      'data_access',
      'payload_optimization',
      {
        context,
        originalSize,
        optimizedSize,
        reductionRatio,
        techniques: techniques.join(','),
        optimizationTime,
        efficiency: reductionRatio > 2 ? 'high' : reductionRatio > 1.5 ? 'medium' : 'low'
      },
      'info'
    );
  }

  private static logOptimizationError(context: string, error: any): void {
    logSecurityEvent(
      'data_access',
      'payload_optimization_error',
      {
        context,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'error'
    );
  }
}

/**
 * Pre-configured optimized functions for medical platform
 */
export const MedicalOptimizedFunctions = {
  // API optimized functions
  getDoctors: PayloadOptimizationService.createOptimizedEndpoint(
    async (filters: any, options: any) => {
      // Implementation would fetch doctors
      return { doctors: [], total: 0 };
    },
    'api'
  ),

  getPatients: PayloadOptimizationService.createOptimizedEndpoint(
    async (filters: any, options: any) => {
      // Implementation would fetch patients
      return { patients: [], total: 0 };
    },
    'api'
  ),

  getAppointments: PayloadOptimizationService.createOptimizedEndpoint(
    async (filters: any, options: any) => {
      // Implementation would fetch appointments
      return { appointments: [], total: 0 };
    },
    'api'
  ),

  // Medical data optimized functions
  getMedicalRecords: PayloadOptimizationService.createOptimizedEndpoint(
    async (patientId: string, options: any) => {
      // Implementation would fetch medical records
      return { records: [], total: 0 };
    },
    'medical'
  ),

  getPrescriptions: PayloadOptimizationService.createOptimizedEndpoint(
    async (patientId: string, options: any) => {
      // Implementation would fetch prescriptions
      return { prescriptions: [], total: 0 };
    },
    'medical'
  ),

  // Dashboard optimized functions
  getDashboardData: PayloadOptimizationService.createOptimizedEndpoint(
    async (userId: string, options: any) => {
      // Implementation would fetch dashboard data
      return { dashboard: {} };
    },
    'dashboard'
  ),

  getAnalyticsData: PayloadOptimizationService.createOptimizedEndpoint(
    async (filters: any, options: any) => {
      // Implementation would fetch analytics data
      return { analytics: {} };
    },
    'dashboard'
  )
};
