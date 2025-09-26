/**
 * Audit Logging Service
 * @fileoverview Enhanced audit logging service for comprehensive security monitoring
 * @compliance HIPAA-compliant audit logging with detailed tracking
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Audit event types
 */
export type AuditEventType = 
  | 'user_authentication'
  | 'user_authorization'
  | 'data_access'
  | 'data_modification'
  | 'data_creation'
  | 'data_deletion'
  | 'data_export'
  | 'data_import'
  | 'system_configuration'
  | 'security_configuration'
  | 'user_management'
  | 'role_management'
  | 'permission_change'
  | 'password_change'
  | 'account_locked'
  | 'account_unlocked'
  | 'session_start'
  | 'session_end'
  | 'login_attempt'
  | 'logout'
  | 'medical_record_access'
  | 'patient_data_view'
  | 'prescription_created'
  | 'prescription_modified'
  | 'lab_result_access'
  | 'diagnosis_created'
  | 'treatment_plan_created'
  | 'appointment_scheduled'
  | 'appointment_modified'
  | 'appointment_cancelled'
  | 'insurance_claim_created'
  | 'payment_processed'
  | 'report_generated'
  | 'backup_created'
  | 'backup_restored'
  | 'system_update'
  | 'configuration_change'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'encryption_key_rotated'
  | 'security_incident'
  | 'compliance_check'
  | 'audit_review'
  | 'data_breach_investigation'
  | 'privacy_request'
  | 'consent_granted'
  | 'consent_revoked'
  | 'data_retention_policy_applied'
  | 'data_anonymization'
  | 'data_pseudonymization'
  | 'cross_border_transfer'
  | 'third_party_access'
  | 'vendor_access'
  | 'maintenance_access'
  | 'emergency_access'
  | 'administrative_access'
  | 'developer_access'
  | 'support_access'
  | 'audit_log_access'
  | 'other';

/**
 * Audit event severity
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit event outcome
 */
export type AuditOutcome = 'success' | 'failure' | 'pending' | 'partial' | 'cancelled' | 'timeout';

/**
 * Audit event interface
 */
export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  outcome: AuditOutcome;
  timestamp: string;
  userId?: string;
  userRole?: string;
  userName?: string;
  patientId?: string;
  patientName?: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  apiEndpoint?: string;
  httpMethod?: string;
  httpStatusCode?: number;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  source: string;
  environment: 'development' | 'staging' | 'production';
  complianceLevel: 'basic' | 'enhanced' | 'critical';
  retentionPeriod: number; // in days
  tags: string[];
  correlationId?: string;
  parentEventId?: string;
  childEventIds?: string[];
  duration?: number; // in milliseconds
  errorCode?: string;
  errorMessage?: string;
  riskScore?: number; // 0-100
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  gdprRelevant?: boolean;
  hipaaRelevant?: boolean;
  piiInvolved?: boolean;
  phiInvolved?: boolean;
  geolocation?: {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Audit query filter
 */
export interface AuditQueryFilter {
  eventTypes?: AuditEventType[];
  severity?: AuditSeverity[];
  outcome?: AuditOutcome[];
  userId?: string;
  patientId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  source?: string;
  environment?: string;
  complianceLevel?: string;
  tags?: string[];
  riskScoreMin?: number;
  riskScoreMax?: number;
  gdprRelevant?: boolean;
  hipaaRelevant?: boolean;
  piiInvolved?: boolean;
  phiInvolved?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Enhanced audit logging service
 */
export class AuditLoggingService {
  private static readonly AUDIT_TABLE = 'audit_logs';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static readonly DEFAULT_RETENTION_DAYS = 2555; // 7 years

  /**
   * Log comprehensive audit event
   */
  static async logAuditEvent(event: Partial<AuditEvent>): Promise<void> {
    try {
      // Generate unique ID
      const eventId = this.generateEventId();

      // Complete audit event with defaults
      const completeEvent: AuditEvent = {
        id: eventId,
        eventType: event.eventType || 'other',
        severity: event.severity || 'info',
        outcome: event.outcome || 'success',
        timestamp: event.timestamp || new Date().toISOString(),
        action: event.action || 'unknown_action',
        description: event.description || 'No description provided',
        source: event.source || 'medical_platform',
        environment: event.environment || (process.env.NODE_ENV as any) || 'production',
        complianceLevel: event.complianceLevel || 'basic',
        retentionPeriod: event.retentionPeriod || this.DEFAULT_RETENTION_DAYS,
        tags: event.tags || [],
        riskScore: event.riskScore || this.calculateRiskScore(event),
        gdprRelevant: event.gdprRelevant || this.isGDPRRelevant(event),
        hipaaRelevant: event.hipaaRelevant || this.isHIPAARelevant(event),
        piiInvolved: event.piiInvolved || this.isPIIInvolved(event),
        phiInvolved: event.phiInvolved || this.isPHIInvolved(event),
        ...event
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT-${completeEvent.severity.toUpperCase()}]`, {
          ...completeEvent,
          formattedMessage: `${completeEvent.eventType}: ${completeEvent.action}`
        });
      }

      // Log to database
      await this.logToDatabase(completeEvent);

      // Send to security event logging
      logSecurityEvent(
        completeEvent.eventType as any,
        completeEvent.action,
        {
          auditEventId: completeEvent.id,
          outcome: completeEvent.outcome,
          riskScore: completeEvent.riskScore,
          ...completeEvent.metadata
        },
        completeEvent.severity as any
      );

      // Send alerts for critical events
      if (completeEvent.severity === 'critical' || completeEvent.riskScore >= 80) {
        await this.sendCriticalAlert(completeEvent);
      }

    } catch (error) {
      console.error('[AUDIT-LOGGING-ERROR]', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventType: event.eventType,
        action: event.action,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log audit event to database
   */
  private static async logToDatabase(event: AuditEvent): Promise<void> {
    let retries = 0;
    
    while (retries < this.MAX_RETRIES) {
      try {
        const supabase = createClient();
        
        const { error } = await supabase
          .from(this.AUDIT_TABLE)
          .insert({
            id: event.id,
            event_type: event.eventType,
            severity: event.severity,
            outcome: event.outcome,
            timestamp: event.timestamp,
            user_id: event.userId,
            user_role: event.userRole,
            user_name: event.userName,
            patient_id: event.patientId,
            patient_name: event.patientName,
            resource_id: event.resourceId,
            resource_type: event.resourceType,
            action: event.action,
            description: event.description,
            ip_address: event.ipAddress,
            user_agent: event.userAgent,
            session_id: event.sessionId,
            request_id: event.requestId,
            api_endpoint: event.apiEndpoint,
            http_method: event.httpMethod,
            http_status_code: event.httpStatusCode,
            before_state: event.beforeState,
            after_state: event.afterState,
            metadata: event.metadata,
            source: event.source,
            environment: event.environment,
            compliance_level: event.complianceLevel,
            retention_period: event.retentionPeriod,
            tags: event.tags,
            correlation_id: event.correlationId,
            parent_event_id: event.parentEventId,
            child_event_ids: event.childEventIds,
            duration: event.duration,
            error_code: event.errorCode,
            error_message: event.errorMessage,
            risk_score: event.riskScore,
            data_classification: event.dataClassification,
            gdpr_relevant: event.gdprRelevant,
            hipaa_relevant: event.hipaaRelevant,
            pii_involved: event.piiInvolved,
            phi_involved: event.phiInvolved,
            geolocation: event.geolocation
          });

        if (error) {
          throw error;
        }

        return; // Success

      } catch (error) {
        retries++;
        
        if (retries >= this.MAX_RETRIES) {
          console.error('[AUDIT-LOGGING-DB-ERROR]', {
            eventId: event.id,
            eventType: event.eventType,
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
   * Generate unique event ID
   */
  private static generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `audit_${timestamp}_${random}`;
  }

  /**
   * Calculate risk score for event
   */
  private static calculateRiskScore(event: Partial<AuditEvent>): number {
    let score = 0;

    // Base score by event type
    const eventTypeScores: Record<string, number> = {
      'data_deletion': 80,
      'data_export': 70,
      'system_configuration': 60,
      'security_configuration': 80,
      'user_management': 50,
      'role_management': 60,
      'permission_change': 70,
      'account_locked': 40,
      'medical_record_access': 30,
      'patient_data_view': 30,
      'prescription_created': 50,
      'lab_result_access': 30,
      'backup_restored': 90,
      'api_key_created': 60,
      'encryption_key_rotated': 70,
      'security_incident': 100,
      'data_breach_investigation': 100,
      'emergency_access': 80,
      'administrative_access': 60
    };

    score += eventTypeScores[event.eventType || 'other'] || 10;

    // Severity multiplier
    const severityMultipliers: Record<string, number> = {
      'info': 1,
      'warning': 1.5,
      'error': 2,
      'critical': 3
    };

    score *= severityMultipliers[event.severity || 'info'];

    // Outcome modifier
    if (event.outcome === 'failure') {
      score += 20;
    } else if (event.outcome === 'timeout') {
      score += 15;
    }

    // PHI/PII involvement
    if (event.phiInvolved) score += 20;
    if (event.piiInvolved) score += 15;

    // Compliance relevance
    if (event.hipaaRelevant) score += 10;
    if (event.gdprRelevant) score += 10;

    // Cap at 100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Check if event is GDPR relevant
   */
  private static isGDPRRelevant(event: Partial<AuditEvent>): boolean {
    const gdprEventTypes: AuditEventType[] = [
      'data_access',
      'data_modification',
      'data_creation',
      'data_deletion',
      'data_export',
      'privacy_request',
      'consent_granted',
      'consent_revoked',
      'data_anonymization',
      'data_pseudonymization',
      'cross_border_transfer'
    ];

    return gdprEventTypes.includes(event.eventType as AuditEventType) || 
           event.piiInvolved === true ||
           (event.tags && event.tags.includes('gdpr'));
  }

  /**
   * Check if event is HIPAA relevant
   */
  private static isHIPAARelevant(event: Partial<AuditEvent>): boolean {
    const hipaaEventTypes: AuditEventType[] = [
      'medical_record_access',
      'patient_data_view',
      'prescription_created',
      'prescription_modified',
      'lab_result_access',
      'diagnosis_created',
      'treatment_plan_created'
    ];

    return hipaaEventTypes.includes(event.eventType as AuditEventType) || 
           event.phiInvolved === true ||
           (event.tags && event.tags.includes('hipaa'));
  }

  /**
   * Check if PII is involved
   */
  private static isPIIInvolved(event: Partial<AuditEvent>): boolean {
    const piiEventTypes: AuditEventType[] = [
      'user_authentication',
      'data_access',
      'data_modification',
      'data_creation',
      'patient_data_view'
    ];

    return piiEventTypes.includes(event.eventType as AuditEventType) ||
           (event.tags && event.tags.includes('pii'));
  }

  /**
   * Check if PHI is involved
   */
  private static isPHIInvolved(event: Partial<AuditEvent>): boolean {
    const phiEventTypes: AuditEventType[] = [
      'medical_record_access',
      'patient_data_view',
      'prescription_created',
      'prescription_modified',
      'lab_result_access',
      'diagnosis_created',
      'treatment_plan_created'
    ];

    return phiEventTypes.includes(event.eventType as AuditEventType) ||
           (event.tags && event.tags.includes('phi'));
  }

  /**
   * Send critical alert
   */
  private static async sendCriticalAlert(event: AuditEvent): Promise<void> {
    try {
      console.error('[AUDIT-ALERT-CRITICAL]', {
        level: 'CRITICAL',
        eventId: event.id,
        eventType: event.eventType,
        action: event.action,
        outcome: event.outcome,
        riskScore: event.riskScore,
        userId: event.userId,
        timestamp: event.timestamp
      });

      // TODO: Implement actual alerting (email, SMS, Slack, etc.)
      
    } catch (error) {
      console.error('[AUDIT-ALERT-ERROR]', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Query audit logs
   */
  static async queryAuditLogs(filter: AuditQueryFilter): Promise<AuditEvent[]> {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from(this.AUDIT_TABLE)
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        query = query.in('event_type', filter.eventTypes);
      }

      if (filter.severity && filter.severity.length > 0) {
        query = query.in('severity', filter.severity);
      }

      if (filter.outcome && filter.outcome.length > 0) {
        query = query.in('outcome', filter.outcome);
      }

      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }

      if (filter.patientId) {
        query = query.eq('patient_id', filter.patientId);
      }

      if (filter.resourceType) {
        query = query.eq('resource_type', filter.resourceType);
      }

      if (filter.startDate) {
        query = query.gte('timestamp', filter.startDate);
      }

      if (filter.endDate) {
        query = query.lte('timestamp', filter.endDate);
      }

      if (filter.ipAddress) {
        query = query.eq('ip_address', filter.ipAddress);
      }

      if (filter.source) {
        query = query.eq('source', filter.source);
      }

      if (filter.environment) {
        query = query.eq('environment', filter.environment);
      }

      if (filter.complianceLevel) {
        query = query.eq('compliance_level', filter.complianceLevel);
      }

      if (filter.riskScoreMin !== undefined) {
        query = query.gte('risk_score', filter.riskScoreMin);
      }

      if (filter.riskScoreMax !== undefined) {
        query = query.lte('risk_score', filter.riskScoreMax);
      }

      if (filter.gdprRelevant !== undefined) {
        query = query.eq('gdpr_relevant', filter.gdprRelevant);
      }

      if (filter.hipaaRelevant !== undefined) {
        query = query.eq('hipaa_relevant', filter.hipaaRelevant);
      }

      if (filter.piiInvolved !== undefined) {
        query = query.eq('pii_involved', filter.piiInvolved);
      }

      if (filter.phiInvolved !== undefined) {
        query = query.eq('phi_involved', filter.phiInvolved);
      }

      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('[AUDIT-QUERY-ERROR]', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filter,
        timestamp: new Date().toISOString()
      });
      
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    eventsByOutcome: Record<string, number>;
    averageRiskScore: number;
    complianceBreaches: number;
    criticalEvents: number;
  }> {
    try {
      const supabase = createClient();
      
      // Get total events count
      const { count: totalEvents } = await supabase
        .from(this.AUDIT_TABLE)
        .select('*', { count: 'exact', head: true });

      // Get events by type
      const { data: typeData } = await supabase
        .from(this.AUDIT_TABLE)
        .select('event_type')
        .not('event_type', 'is', null);

      // Get events by severity
      const { data: severityData } = await supabase
        .from(this.AUDIT_TABLE)
        .select('severity')
        .not('severity', 'is', null);

      // Get events by outcome
      const { data: outcomeData } = await supabase
        .from(this.AUDIT_TABLE)
        .select('outcome')
        .not('outcome', 'is', null);

      // Get risk score statistics
      const { data: riskData } = await supabase
        .from(this.AUDIT_TABLE)
        .select('risk_score')
        .not('risk_score', 'is', null);

      // Get critical events count
      const { count: criticalEvents } = await supabase
        .from(this.AUDIT_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical');

      // Process data
      const eventsByType: Record<string, number> = {};
      typeData?.forEach(item => {
        eventsByType[item.event_type] = (eventsByType[item.event_type] || 0) + 1;
      });

      const eventsBySeverity: Record<string, number> = {};
      severityData?.forEach(item => {
        eventsBySeverity[item.severity] = (eventsBySeverity[item.severity] || 0) + 1;
      });

      const eventsByOutcome: Record<string, number> = {};
      outcomeData?.forEach(item => {
        eventsByOutcome[item.outcome] = (eventsByOutcome[item.outcome] || 0) + 1;
      });

      const averageRiskScore = riskData?.reduce((sum, item) => sum + (item.risk_score || 0), 0) / (riskData?.length || 1);

      return {
        totalEvents: totalEvents || 0,
        eventsByType,
        eventsBySeverity,
        eventsByOutcome,
        averageRiskScore: Math.round(averageRiskScore || 0),
        complianceBreaches: (eventsBySeverity.critical || 0) + (eventsBySeverity.error || 0),
        criticalEvents: criticalEvents || 0
      };

    } catch (error) {
      console.error('[AUDIT-STATISTICS-ERROR]', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        eventsByOutcome: {},
        averageRiskScore: 0,
        complianceBreaches: 0,
        criticalEvents: 0
      };
    }
  }

  /**
   * Get audit logging service status
   */
  static getStatus(): {
    initialized: boolean;
    retentionDays: number;
    maxRetries: number;
    retryDelay: number;
    supportedEventTypes: number;
  } {
    return {
      initialized: true,
      retentionDays: this.DEFAULT_RETENTION_DAYS,
      maxRetries: this.MAX_RETRIES,
      retryDelay: this.RETRY_DELAY,
      supportedEventTypes: 50 // Approximate count of event types
    };
  }
}
