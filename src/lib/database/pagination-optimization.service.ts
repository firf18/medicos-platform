/**
 * Pagination Optimization Service
 * @fileoverview Service for optimized pagination with cursor-based and offset-based pagination
 * @compliance HIPAA-compliant pagination with performance optimization
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Pagination result
 */
export interface PaginationResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
  performance: {
    executionTime: number;
    fromCache: boolean;
    cacheKey?: string;
  };
}

/**
 * Cursor-based pagination result
 */
export interface CursorPaginationResult<T = any> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nextCursor?: string;
    previousCursor?: string;
    total?: number;
  };
  performance: {
    executionTime: number;
    fromCache: boolean;
    cacheKey?: string;
  };
}

/**
 * Pagination Optimization Service
 */
export class PaginationOptimizationService {
  private static client = createClient();
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static defaultCacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Optimized pagination for doctors list
   */
  static async getDoctorsPaginated(
    options: PaginationOptions = {}
  ): Promise<PaginationResult> {
    const startTime = Date.now();
    
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc',
        filters = {}
      } = options;

      // Validate pagination parameters
      const validatedLimit = Math.min(Math.max(limit, 1), 100); // Max 100 items per page
      const validatedPage = Math.max(page, 1);
      const offset = (validatedPage - 1) * validatedLimit;

      // Generate cache key
      const cacheKey = this.generateCacheKey('doctors', {
        page: validatedPage,
        limit: validatedLimit,
        sortBy,
        sortOrder,
        filters
      });

      // Check cache
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            executionTime: Date.now() - startTime,
            fromCache: true,
            cacheKey
          }
        };
      }

      // Build query
      let query = this.client
        .from('doctors')
        .select(`
          id,
          specialty_id,
          rating,
          experience_years,
          consultation_fee,
          is_available,
          is_verified,
          profiles!inner(
            first_name,
            last_name,
            email,
            avatar_url
          ),
          medical_specialties!inner(
            name,
            description
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.specialtyId) {
        query = query.eq('specialty_id', filters.specialtyId);
      }
      if (filters.isAvailable !== undefined) {
        query = query.eq('is_available', filters.isAvailable);
      }
      if (filters.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }
      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters.maxFee) {
        query = query.lte('consultation_fee', filters.maxFee);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + validatedLimit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch doctors: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / validatedLimit);

      const result: PaginationResult = {
        data: data || [],
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext: validatedPage < totalPages,
          hasPrevious: validatedPage > 1
        },
        performance: {
          executionTime: Date.now() - startTime,
          fromCache: false,
          cacheKey
        }
      };

      // Cache result
      this.setCachedResult(cacheKey, result);

      // Log performance metrics
      await logSecurityEvent(
        'data_access',
        'doctors_pagination_executed',
        {
          page: validatedPage,
          limit: validatedLimit,
          total,
          executionTime: result.performance.executionTime,
          fromCache: false
        },
        'info'
      );

      return result;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'doctors_pagination_error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Cursor-based pagination for appointments (better for real-time data)
   */
  static async getAppointmentsCursorPaginated(
    doctorId: string,
    options: PaginationOptions = {}
  ): Promise<CursorPaginationResult> {
    const startTime = Date.now();
    
    try {
      const {
        limit = 20,
        cursor,
        sortOrder = 'desc'
      } = options;

      const validatedLimit = Math.min(Math.max(limit, 1), 50); // Max 50 for cursor pagination

      // Build query
      let query = this.client
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          appointment_type,
          duration_minutes,
          is_virtual,
          patients!inner(
            id,
            profiles!inner(
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: sortOrder === 'asc' })
        .limit(validatedLimit + 1); // +1 to check if there are more results

      // Apply cursor if provided
      if (cursor) {
        const cursorDate = new Date(cursor);
        if (sortOrder === 'desc') {
          query = query.lt('appointment_date', cursorDate.toISOString());
        } else {
          query = query.gt('appointment_date', cursorDate.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }

      const hasNext = data && data.length > validatedLimit;
      const appointments = hasNext ? data.slice(0, validatedLimit) : (data || []);

      // Generate cursors
      const nextCursor = hasNext && appointments.length > 0 
        ? appointments[appointments.length - 1].appointment_date 
        : undefined;
      
      const previousCursor = cursor || undefined;

      const result: CursorPaginationResult = {
        data: appointments,
        pagination: {
          limit: validatedLimit,
          hasNext,
          hasPrevious: !!cursor,
          nextCursor,
          previousCursor
        },
        performance: {
          executionTime: Date.now() - startTime,
          fromCache: false
        }
      };

      // Log performance metrics
      await logSecurityEvent(
        'data_access',
        'appointments_cursor_pagination_executed',
        {
          doctorId,
          limit: validatedLimit,
          hasNext,
          executionTime: result.performance.executionTime
        },
        'info'
      );

      return result;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'appointments_cursor_pagination_error',
        {
          doctorId,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Optimized pagination for medical records
   */
  static async getMedicalRecordsPaginated(
    patientId: string,
    options: PaginationOptions = {}
  ): Promise<PaginationResult> {
    const startTime = Date.now();
    
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const validatedLimit = Math.min(Math.max(limit, 1), 50);
      const validatedPage = Math.max(page, 1);
      const offset = (validatedPage - 1) * validatedLimit;

      const cacheKey = this.generateCacheKey('medical_records', {
        patientId,
        page: validatedPage,
        limit: validatedLimit,
        sortBy,
        sortOrder
      });

      // Check cache
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            executionTime: Date.now() - startTime,
            fromCache: true,
            cacheKey
          }
        };
      }

      const { data, error, count } = await this.client
        .from('medical_records')
        .select(`
          id,
          diagnosis,
          treatment,
          notes,
          created_at,
          doctors!inner(
            id,
            profiles!inner(
              first_name,
              last_name,
              avatar_url
            ),
            medical_specialties!inner(
              name
            )
          )
        `, { count: 'exact' })
        .eq('patient_id', patientId)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + validatedLimit - 1);

      if (error) {
        throw new Error(`Failed to fetch medical records: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / validatedLimit);

      const result: PaginationResult = {
        data: data || [],
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext: validatedPage < totalPages,
          hasPrevious: validatedPage > 1
        },
        performance: {
          executionTime: Date.now() - startTime,
          fromCache: false,
          cacheKey
        }
      };

      // Cache result
      this.setCachedResult(cacheKey, result);

      return result;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'medical_records_pagination_error',
        {
          patientId,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Optimized pagination for chat messages
   */
  static async getChatMessagesPaginated(
    conversationId: string,
    options: PaginationOptions = {}
  ): Promise<CursorPaginationResult> {
    const startTime = Date.now();
    
    try {
      const {
        limit = 50,
        cursor,
        sortOrder = 'desc'
      } = options;

      const validatedLimit = Math.min(Math.max(limit, 1), 100);

      let query = this.client
        .from('chat_messages')
        .select(`
          id,
          message_text,
          message_type,
          is_read,
          created_at,
          profiles!inner(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: sortOrder === 'asc' })
        .limit(validatedLimit + 1);

      if (cursor) {
        const cursorDate = new Date(cursor);
        if (sortOrder === 'desc') {
          query = query.lt('created_at', cursorDate.toISOString());
        } else {
          query = query.gt('created_at', cursorDate.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch chat messages: ${error.message}`);
      }

      const hasNext = data && data.length > validatedLimit;
      const messages = hasNext ? data.slice(0, validatedLimit) : (data || []);

      const result: CursorPaginationResult = {
        data: messages,
        pagination: {
          limit: validatedLimit,
          hasNext,
          hasPrevious: !!cursor,
          nextCursor: hasNext && messages.length > 0 
            ? messages[messages.length - 1].created_at 
            : undefined,
          previousCursor: cursor || undefined
        },
        performance: {
          executionTime: Date.now() - startTime,
          fromCache: false
        }
      };

      return result;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'chat_messages_pagination_error',
        {
          conversationId,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Get pagination statistics
   */
  static async getPaginationStats(): Promise<{
    cacheStats: {
      totalEntries: number;
      memoryUsage: number;
      hitRate: number;
    };
    performanceStats: {
      averageExecutionTime: number;
      totalQueries: number;
    };
  }> {
    const cacheStats = {
      totalEntries: this.cache.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length,
      hitRate: 0 // Would be calculated from actual usage metrics
    };

    return {
      cacheStats,
      performanceStats: {
        averageExecutionTime: 0, // Would be calculated from actual usage metrics
        totalQueries: 0
      }
    };
  }

  /**
   * Clear pagination cache
   */
  static clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Helper methods

  private static generateCacheKey(prefix: string, params: Record<string, any>): string {
    const paramsString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join('|');
    
    return `${prefix}_${Buffer.from(paramsString).toString('base64').slice(0, 16)}`;
  }

  private static getCachedResult(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private static setCachedResult(key: string, data: any, ttl: number = this.defaultCacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}
