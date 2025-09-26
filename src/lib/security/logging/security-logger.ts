/**
 * Security Logging Service
 * @fileoverview Service responsible for logging security events and audit trails
 * @compliance HIPAA-compliant security logging with audit trail
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Security event types
 */
export type SecurityEventType = 
  | 'authentication_attempt'
  | 'authentication_success'
  | 'authentication_failure'
  | 'authorization_denied'
  | 'data_access'
  | 'data_modification'
  | 'data_export'
  | 'admin_action'
  | 'compliance_violation'
  | 'suspicious_activity'
  | 'system_error'
  | 'password_change'
  | 'account_locked'
  | 'session_expired'
  | 'medical_record_accessed'
  | 'patient_data_viewed'
  | 'prescription_created'
  | 'lab_result_accessed'
  | 'email_validation_error'
  | 'email_availability_check_started'
  | 'email_availability_check_completed'
  | 'email_availability_check_error'
  | 'email_availability_check_failed'
  | 'phone_validation_error'
  | 'phone_availability_check_started'
  | 'phone_availability_check_completed'
  | 'phone_availability_check_error'
  | 'phone_availability_check_failed'
  | 'license_validation_error'
  | 'license_availability_check_started'
  | 'license_availability_check_completed'
  | 'license_availability_check_error'
  | 'license_availability_check_failed'
  | 'document_validation_error'
  | 'document_availability_check_started'
  | 'document_availability_check_completed'
  | 'document_availability_check_error'
  | 'document_availability_check_failed'
  | 'frontend_error_reported'
  | 'frontend_error_endpoint_failed'
  | 'input_sanitization_applied'
  | 'input_sanitization_error'
  | 'malicious_content_detected'
  | 'json_sanitization_error'
  | 'encryption_error'
  | 'decryption_error'
  | 'rate_limit_exceeded'
  | 'csrf_token_invalid'
  | 'csrf_token_missing';

/**
 * Security severity levels
 */
export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Security event interface
 */
export interface SecurityEvent {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  userRole?: string;
  patientId?: string;
  resourceId?: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  source: string;
  sessionId?: string;
  complianceLevel?: 'basic' | 'enhanced' | 'critical';
}

/**
 * Security logging service
 */
export class SecurityLoggingService {
  private static readonly LOG_TABLE = 'security_logs';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Log security event to database and console
   */
  static async logSecurityEvent(
    eventType: SecurityEventType,
    action: string,
    data: Record<string, unknown> = {},
    severity: SecuritySeverity = 'info'
  ): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        eventType,
        action,
        severity,
        timestamp: new Date().toISOString(),
        source: 'medical_platform',
        metadata: data,
        ...data // Allow overriding specific fields
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SECURITY-${severity.toUpperCase()}]`, {
          ...securityEvent,
          formattedMessage: `${eventType}: ${action}`
        });
      }

      // Log to database in production
      if (process.env.NODE_ENV === 'production') {
        await this.logToDatabase(securityEvent);
      }

      // Send alerts for critical events
      if (severity === 'critical') {
        await this.sendCriticalAlert(securityEvent);
      }

    } catch (error) {
      // Fallback logging to prevent security logging failures from breaking the app
      console.error('[SECURITY-LOGGING-ERROR]', {
        eventType,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log security event to Supabase database
   */
  private static async logToDatabase(event: SecurityEvent): Promise<void> {
    let retries = 0;
    
    while (retries < this.MAX_RETRIES) {
      try {
        const supabase = createClient();
        
        const { error } = await supabase
          .from(this.LOG_TABLE)
          .insert({
            event_type: event.eventType,
            severity: event.severity,
            user_id: event.userId,
            user_role: event.userRole,
            patient_id: event.patientId,
            resource_id: event.resourceId,
            action: event.action,
            timestamp: event.timestamp,
            ip_address: event.ipAddress,
            user_agent: event.userAgent,
            metadata: event.metadata,
            source: event.source,
            session_id: event.sessionId,
            compliance_level: event.complianceLevel
          } as any);

        if (error) {
          throw error;
        }

        return; // Success

      } catch (error) {
        retries++;
        
        if (retries >= this.MAX_RETRIES) {
          console.error('[SECURITY-LOGGING-DB-ERROR]', {
            event: event.eventType,
            action: event.action,
            error: error instanceof Error ? error.message : 'Unknown error',
            retries,
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * retries));
      }
    }
  }

  /**
   * Send critical security alert
   */
  private static async sendCriticalAlert(event: SecurityEvent): Promise<void> {
    try {
      // In production, this would send alerts to security team
      // For now, we'll just log it
      console.error('[SECURITY-ALERT-CRITICAL]', {
        level: 'CRITICAL',
        event: event.eventType,
        action: event.action,
        timestamp: event.timestamp,
        userId: event.userId,
        metadata: event.metadata
      });

      // TODO: Implement actual alerting (email, SMS, Slack, etc.)
      
    } catch (error) {
      console.error('[SECURITY-ALERT-ERROR]', {
        event: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log authentication attempt
   */
  static async logAuthenticationAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logSecurityEvent(
      success ? 'authentication_success' : 'authentication_failure',
      `Authentication ${success ? 'successful' : 'failed'} for ${email}`,
      {
        email: email.substring(0, 5) + '***',
        success,
        ipAddress,
        userAgent
      },
      success ? 'info' : 'warning'
    );
  }

  /**
   * Log data access
   */
  static async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logSecurityEvent(
      'data_access',
      `${action} access to ${resourceType}`,
      {
        userId,
        resourceType,
        resourceId,
        action,
        ipAddress
      },
      'info'
    );
  }

  /**
   * Log data modification
   */
  static async logDataModification(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    changes?: Record<string, unknown>,
    ipAddress?: string
  ): Promise<void> {
    await this.logSecurityEvent(
      'data_modification',
      `${action} modification to ${resourceType}`,
      {
        userId,
        resourceType,
        resourceId,
        action,
        changes,
        ipAddress
      },
      'info'
    );
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(
    userId: string,
    activity: string,
    details: Record<string, unknown>,
    ipAddress?: string
  ): Promise<void> {
    await this.logSecurityEvent(
      'suspicious_activity',
      `Suspicious activity detected: ${activity}`,
      {
        userId,
        activity,
        details,
        ipAddress
      },
      'warning'
    );
  }

  /**
   * Log compliance violation
   */
  static async logComplianceViolation(
    userId: string,
    violation: string,
    details: Record<string, unknown>,
    severity: SecuritySeverity = 'error'
  ): Promise<void> {
    await this.logSecurityEvent(
      'compliance_violation',
      `Compliance violation: ${violation}`,
      {
        userId,
        violation,
        details
      },
      severity
    );
  }

  /**
   * Log system error
   */
  static async logSystemError(
    error: Error,
    context: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logSecurityEvent(
      'system_error',
      `System error in ${context}`,
      {
        error: error.message,
        stack: error.stack,
        context,
        userId,
        ...metadata
      },
      'error'
    );
  }

  /**
   * Get security logs for a user
   */
  static async getUserSecurityLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<SecurityEvent[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from(this.LOG_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return (data || []).map(row => ({
        eventType: row.event_type as SecurityEventType,
        severity: row.severity as SecuritySeverity,
        userId: row.user_id,
        userRole: row.user_role,
        patientId: row.patient_id,
        resourceId: row.resource_id,
        action: row.action,
        timestamp: row.timestamp || new Date().toISOString(),
        ipAddress: row.ip_address as string,
        userAgent: row.user_agent,
        metadata: row.metadata as Record<string, unknown>,
        source: row.source,
        sessionId: row.session_id,
        complianceLevel: row.compliance_level as 'basic' | 'enhanced' | 'critical'
      }));

    } catch (error) {
      console.error('[SECURITY-LOGS-RETRIEVAL-ERROR]', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return [];
    }
  }

  /**
   * Get security logs by event type
   */
  static async getSecurityLogsByType(
    eventType: SecurityEventType,
    limit: number = 100,
    offset: number = 0
  ): Promise<SecurityEvent[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from(this.LOG_TABLE)
        .select('*')
        .eq('event_type', eventType)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return (data || []).map(row => ({
        eventType: row.event_type as SecurityEventType,
        severity: row.severity as SecuritySeverity,
        userId: row.user_id,
        userRole: row.user_role,
        patientId: row.patient_id,
        resourceId: row.resource_id,
        action: row.action,
        timestamp: row.timestamp || new Date().toISOString(),
        ipAddress: row.ip_address as string,
        userAgent: row.user_agent,
        metadata: row.metadata as Record<string, unknown>,
        source: row.source,
        sessionId: row.session_id,
        complianceLevel: row.compliance_level as 'basic' | 'enhanced' | 'critical'
      }));

    } catch (error) {
      console.error('[SECURITY-LOGS-BY-TYPE-ERROR]', {
        eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return [];
    }
  }
}

// Export convenience function
export const logSecurityEvent = SecurityLoggingService.logSecurityEvent;
