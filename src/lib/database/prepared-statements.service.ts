/**
 * Prepared Statements Service
 * @fileoverview Service for managing prepared statements and optimized database queries
 * @compliance HIPAA-compliant database optimization with prepared statements
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Prepared statement configurations
 */
interface PreparedStatementConfig {
  name: string;
  query: string;
  params: string[];
  cacheKey?: string;
  ttl?: number; // Time to live in seconds
}

/**
 * Query result with metadata
 */
interface QueryResult<T = any> {
  data: T[];
  count?: number;
  executionTime: number;
  fromCache: boolean;
  cacheKey?: string;
}

/**
 * Prepared Statements Service
 */
export class PreparedStatementsService {
  private static client = createClient();
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  /**
   * Prepared statements configurations
   */
  private static readonly PREPARED_STATEMENTS: PreparedStatementConfig[] = [
    {
      name: 'get_doctor_by_specialty',
      query: `
        SELECT d.*, p.first_name, p.last_name, p.email, p.phone, p.avatar_url
        FROM doctors d
        JOIN profiles p ON d.id = p.id
        WHERE d.specialty_id = $1 AND d.is_available = true AND d.is_verified = true
        ORDER BY d.rating DESC, d.experience_years DESC
      `,
      params: ['specialty_id'],
      cacheKey: 'doctor_specialty',
      ttl: 300 // 5 minutes
    },
    {
      name: 'get_appointments_by_doctor_date',
      query: `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name
        FROM appointments a
        JOIN patients pt ON a.patient_id = pt.id
        JOIN profiles p ON pt.id = p.id
        WHERE a.doctor_id = $1 AND DATE(a.appointment_date) = $2
        ORDER BY a.appointment_date ASC
      `,
      params: ['doctor_id', 'appointment_date'],
      cacheKey: 'appointments_doctor_date',
      ttl: 60 // 1 minute
    },
    {
      name: 'get_patient_medical_history',
      query: `
        SELECT mr.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name,
               d.specialty_id, ms.name as specialty_name
        FROM medical_records mr
        JOIN doctors d ON mr.doctor_id = d.id
        JOIN profiles dp ON d.id = dp.id
        LEFT JOIN medical_specialties ms ON d.specialty_id = ms.id
        WHERE mr.patient_id = $1
        ORDER BY mr.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      params: ['patient_id', 'limit', 'offset'],
      cacheKey: 'patient_history',
      ttl: 120 // 2 minutes
    },
    {
      name: 'get_available_doctors_by_specialty',
      query: `
        SELECT d.id, d.specialty_id, d.rating, d.experience_years, d.consultation_fee,
               p.first_name, p.last_name, p.avatar_url,
               ms.name as specialty_name, ms.description as specialty_description
        FROM doctors d
        JOIN profiles p ON d.id = p.id
        JOIN medical_specialties ms ON d.specialty_id = ms.id
        WHERE d.specialty_id = $1 
          AND d.is_available = true 
          AND d.is_verified = true
          AND ms.is_active = true
        ORDER BY d.rating DESC, d.experience_years DESC
        LIMIT $2 OFFSET $3
      `,
      params: ['specialty_id', 'limit', 'offset'],
      cacheKey: 'available_doctors',
      ttl: 180 // 3 minutes
    },
    {
      name: 'get_chat_messages_by_conversation',
      query: `
        SELECT cm.*, p.first_name, p.last_name, p.avatar_url
        FROM chat_messages cm
        JOIN profiles p ON cm.sender_id = p.id
        WHERE cm.conversation_id = $1 AND cm.is_deleted = false
        ORDER BY cm.created_at ASC
        LIMIT $2 OFFSET $3
      `,
      params: ['conversation_id', 'limit', 'offset'],
      cacheKey: 'chat_messages',
      ttl: 30 // 30 seconds
    },
    {
      name: 'get_patient_health_metrics',
      query: `
        SELECT hm.*, hm.metric_type, hm.value, hm.unit, hm.recorded_at
        FROM health_metrics hm
        WHERE hm.patient_id = $1 AND hm.recorded_at >= $2
        ORDER BY hm.recorded_at DESC
        LIMIT $3
      `,
      params: ['patient_id', 'start_date', 'limit'],
      cacheKey: 'health_metrics',
      ttl: 60 // 1 minute
    },
    {
      name: 'get_doctor_registration_status',
      query: `
        SELECT dr.*, iv.status as verification_status, iv.completed_at
        FROM doctor_registrations dr
        LEFT JOIN identity_verifications iv ON dr.id = iv.registration_id
        WHERE dr.email = $1 OR dr.license_number = $2
        ORDER BY dr.created_at DESC
        LIMIT 1
      `,
      params: ['email', 'license_number'],
      cacheKey: 'doctor_registration',
      ttl: 300 // 5 minutes
    },
    {
      name: 'get_appointments_by_status',
      query: `
        SELECT a.*, 
               dp.first_name as doctor_first_name, dp.last_name as doctor_last_name,
               pp.first_name as patient_first_name, pp.last_name as patient_last_name,
               ms.name as specialty_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN profiles dp ON d.id = dp.id
        JOIN patients pt ON a.patient_id = pt.id
        JOIN profiles pp ON pt.id = pp.id
        LEFT JOIN medical_specialties ms ON d.specialty_id = ms.id
        WHERE a.status = $1 AND a.appointment_date >= $2
        ORDER BY a.appointment_date ASC
        LIMIT $3 OFFSET $4
      `,
      params: ['status', 'start_date', 'limit', 'offset'],
      cacheKey: 'appointments_status',
      ttl: 60 // 1 minute
    }
  ];

  /**
   * Execute a prepared statement with caching
   */
  static async executePreparedStatement<T = any>(
    statementName: string,
    params: any[],
    options: {
      useCache?: boolean;
      cacheKey?: string;
      ttl?: number;
    } = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    try {
      const config = this.PREPARED_STATEMENTS.find(s => s.name === statementName);
      if (!config) {
        throw new Error(`Prepared statement '${statementName}' not found`);
      }

      // Generate cache key
      const cacheKey = options.cacheKey || this.generateCacheKey(statementName, params);
      
      // Check cache first
      if (options.useCache !== false && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        if (Date.now() - cached.timestamp < cached.ttl * 1000) {
          return {
            data: cached.data,
            executionTime: Date.now() - startTime,
            fromCache: true,
            cacheKey
          };
        } else {
          this.cache.delete(cacheKey);
        }
      }

      // Execute query
      const { data, error, count } = await this.client
        .rpc('execute_prepared_statement', {
          statement_name: statementName,
          params: params
        });

      if (error) {
        throw new Error(`Prepared statement execution failed: ${error.message}`);
      }

      const executionTime = Date.now() - startTime;

      // Cache result if enabled
      if (options.useCache !== false) {
        const ttl = options.ttl || config.ttl || 300;
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        });
      }

      // Log performance metrics
      await logSecurityEvent(
        'data_access',
        'prepared_statement_executed',
        {
          statementName,
          executionTime,
          fromCache: false,
          cacheKey: options.useCache !== false ? cacheKey : undefined
        },
        'info'
      );

      return {
        data: data || [],
        count: count || undefined,
        executionTime,
        fromCache: false,
        cacheKey: options.useCache !== false ? cacheKey : undefined
      };

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'prepared_statement_error',
        {
          statementName,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Get doctors by specialty with caching
   */
  static async getDoctorsBySpecialty(
    specialtyId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_doctor_by_specialty',
      [specialtyId],
      { cacheKey: `doctors_specialty_${specialtyId}_${limit}_${offset}` }
    );
  }

  /**
   * Get appointments by doctor and date with caching
   */
  static async getAppointmentsByDoctorDate(
    doctorId: string,
    date: string,
    useCache: boolean = true
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_appointments_by_doctor_date',
      [doctorId, date],
      { useCache, cacheKey: `appointments_${doctorId}_${date}` }
    );
  }

  /**
   * Get patient medical history with pagination
   */
  static async getPatientMedicalHistory(
    patientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_patient_medical_history',
      [patientId, limit, offset],
      { cacheKey: `patient_history_${patientId}_${limit}_${offset}` }
    );
  }

  /**
   * Get available doctors by specialty with pagination
   */
  static async getAvailableDoctorsBySpecialty(
    specialtyId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_available_doctors_by_specialty',
      [specialtyId, limit, offset],
      { cacheKey: `available_doctors_${specialtyId}_${limit}_${offset}` }
    );
  }

  /**
   * Get chat messages by conversation with pagination
   */
  static async getChatMessagesByConversation(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_chat_messages_by_conversation',
      [conversationId, limit, offset],
      { cacheKey: `chat_messages_${conversationId}_${limit}_${offset}` }
    );
  }

  /**
   * Get patient health metrics
   */
  static async getPatientHealthMetrics(
    patientId: string,
    startDate: string,
    limit: number = 100
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_patient_health_metrics',
      [patientId, startDate, limit],
      { cacheKey: `health_metrics_${patientId}_${startDate}` }
    );
  }

  /**
   * Get doctor registration status
   */
  static async getDoctorRegistrationStatus(
    email: string,
    licenseNumber: string
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_doctor_registration_status',
      [email, licenseNumber],
      { cacheKey: `doctor_registration_${email}_${licenseNumber}` }
    );
  }

  /**
   * Get appointments by status with pagination
   */
  static async getAppointmentsByStatus(
    status: string,
    startDate: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<QueryResult> {
    return this.executePreparedStatement(
      'get_appointments_by_status',
      [status, startDate, limit, offset],
      { cacheKey: `appointments_${status}_${startDate}_${limit}_${offset}` }
    );
  }

  /**
   * Clear cache for specific key or all cache
   */
  static clearCache(cacheKey?: string): void {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    entries: Array<{ key: string; ttl: number; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      ttl: value.ttl,
      age: Date.now() - value.timestamp
    }));

    return {
      totalEntries: this.cache.size,
      totalSize: JSON.stringify(Array.from(this.cache.values())).length,
      entries
    };
  }

  /**
   * Generate cache key from statement name and parameters
   */
  private static generateCacheKey(statementName: string, params: any[]): string {
    const paramsHash = params.map(p => 
      typeof p === 'object' ? JSON.stringify(p) : String(p)
    ).join('_');
    
    return `${statementName}_${Buffer.from(paramsHash).toString('base64').slice(0, 16)}`;
  }

  /**
   * Initialize prepared statements in database
   */
  static async initializePreparedStatements(): Promise<void> {
    try {
      // This would typically be done through a database migration
      // For now, we'll log that the service is initialized
      await logSecurityEvent(
        'data_access',
        'prepared_statements_initialized',
        {
          statementsCount: this.PREPARED_STATEMENTS.length,
          statements: this.PREPARED_STATEMENTS.map(s => s.name)
        },
        'info'
      );

      console.log(`Prepared Statements Service initialized with ${this.PREPARED_STATEMENTS.length} statements`);
    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'prepared_statements_init_error',
        {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );
      throw error;
    }
  }
}
