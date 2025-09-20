/**
 * Notifications domain database types
 * @fileoverview Database types specific to medical notifications and alerts
 * @compliance HIPAA-compliant notification data structures
 */

import { Json } from '@/shared/types/base-database.types';

export interface NotificationTables {
  notifications: {
    Row: {
      channels: string[] | null
      created_at: string
      id: string
      is_read: boolean | null
      message: string
      metadata: Json | null
      notification_type: string
      patient_id: string
      priority: string | null
      scheduled_for: string | null
      sent_at: string | null
      title: string
    }
    Insert: {
      channels?: string[] | null
      created_at?: string
      id?: string
      is_read?: boolean | null
      message: string
      metadata?: Json | null
      notification_type: string
      patient_id: string
      priority?: string | null
      scheduled_for?: string | null
      sent_at?: string | null
      title: string
    }
    Update: {
      channels?: string[] | null
      created_at?: string
      id?: string
      is_read?: boolean | null
      message?: string
      metadata?: Json | null
      notification_type?: string
      patient_id?: string
      priority?: string | null
      scheduled_for?: string | null
      sent_at?: string | null
      title?: string
    }
  }
}

// Specialized types for notifications domain
export type Notification = NotificationTables['notifications']['Row'];
export type NotificationInsert = NotificationTables['notifications']['Insert'];
export type NotificationUpdate = NotificationTables['notifications']['Update'];

// Notification-specific enums and constants
export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  MEDICATION_REMINDER: 'medication_reminder',
  LAB_RESULT_READY: 'lab_result_ready',
  EMERGENCY_ALERT: 'emergency_alert',
  SYSTEM_ALERT: 'system_alert',
  HEALTH_TIP: 'health_tip',
  FOLLOW_UP_REQUIRED: 'follow_up_required',
  PRESCRIPTION_REFILL: 'prescription_refill',
  VITAL_SIGNS_ALERT: 'vital_signs_alert',
  SECOND_OPINION_UPDATE: 'second_opinion_update'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
} as const;

export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES];

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  PHONE: 'phone'
} as const;

export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];

// Extended notification types
export interface NotificationWithRecipient extends Notification {
  recipient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    preferred_channels: NotificationChannel[];
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject_template: string;
  body_template: string;
  default_channels: NotificationChannel[];
  variables: string[];
}

export interface NotificationPreferences {
  user_id: string;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  lab_results: boolean;
  emergency_alerts: boolean;
  health_tips: boolean;
  preferred_channels: NotificationChannel[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface NotificationBatch {
  id: string;
  template_id: string;
  recipients: string[];
  scheduled_for: string;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  created_at: string;
  sent_count: number;
  failed_count: number;
}
