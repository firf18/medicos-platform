/**
 * Notifications Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de notificaciones médicas.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import type { Json } from './base.types';

export type NotificationsTables = {
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

// Tipos específicos para el dominio de notifications
export type NotificationRow = NotificationsTables['notifications']['Row'];
export type NotificationInsert = NotificationsTables['notifications']['Insert'];
export type NotificationUpdate = NotificationsTables['notifications']['Update'];

// Tipos de notificaciones médicas
export type MedicalNotificationType = 
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancellation'
  | 'appointment_rescheduled'
  | 'lab_results_ready'
  | 'prescription_ready'
  | 'medication_reminder'
  | 'follow_up_required'
  | 'emergency_alert'
  | 'system_maintenance'
  | 'security_alert'
  | 'compliance_reminder'
  | 'vaccination_due'
  | 'test_reminder'
  | 'insurance_update'
  | 'payment_reminder'
  | 'health_tip'
  | 'birthday_greeting'
  | 'anniversary_checkup';

// Prioridades de notificaciones médicas
export type NotificationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'critical'
  | 'emergency';

// Canales de notificación disponibles
export type NotificationChannel = 
  | 'in_app'
  | 'email'
  | 'sms'
  | 'push'
  | 'whatsapp'
  | 'voice_call'
  | 'portal';

// Estados de notificación
export type NotificationStatus = 
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled'
  | 'expired';

// Configuración de preferencias de notificación
export interface NotificationPreferences {
  userId: string;
  globalSettings: {
    enabled: boolean;
    quietHours: {
      start: string; // HH:MM
      end: string; // HH:MM
      timezone: string;
    };
    doNotDisturb: boolean;
    emergencyOverride: boolean;
  };
  channelPreferences: {
    [K in NotificationChannel]: {
      enabled: boolean;
      types: MedicalNotificationType[];
      priority: NotificationPriority[];
      contactInfo?: string; // email, phone, etc.
    };
  };
  typePreferences: {
    [K in MedicalNotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
      advanceTime?: number; // minutos antes del evento
      frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
    };
  };
}

// Notificación extendida con información del destinatario
export interface NotificationWithRecipient extends NotificationRow {
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'patient' | 'doctor' | 'clinic' | 'laboratory';
  };
  sender?: {
    id: string;
    name: string;
    role: string;
    system?: boolean;
  };
  deliveryStatus?: {
    [K in NotificationChannel]?: {
      status: NotificationStatus;
      attemptedAt?: string;
      deliveredAt?: string;
      failureReason?: string;
    };
  };
}

// Plantilla de notificación para reutilización
export interface NotificationTemplate {
  id: string;
  name: string;
  type: MedicalNotificationType;
  category: 'patient_care' | 'administrative' | 'emergency' | 'marketing';
  title: string;
  message: string;
  variables: string[]; // variables que se pueden reemplazar: {{patientName}}, {{appointmentDate}}, etc.
  defaultChannels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  scheduling: {
    canBeScheduled: boolean;
    defaultAdvanceTime?: number;
    maxAdvanceTime?: number;
  };
  compliance: {
    requiresConsent: boolean;
    hipaaCompliant: boolean;
    auditTrail: boolean;
  };
}

// Estadísticas de notificaciones para dashboard
export interface NotificationStats {
  totalSent: number;
  sentThisMonth: number;
  deliveryRate: number;
  readRate: number;
  channelPerformance: {
    [K in NotificationChannel]: {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    };
  };
  typeDistribution: {
    [K in MedicalNotificationType]: number;
  };
  responseTime: {
    average: number; // minutos
    emergency: number;
    urgent: number;
    normal: number;
  };
}

// Campaña de notificaciones masivas
export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string;
  type: MedicalNotificationType;
  template: NotificationTemplate;
  targeting: {
    criteria: {
      role?: string[];
      ageRange?: { min: number; max: number };
      location?: string[];
      specialty?: string[];
      lastVisit?: { after?: string; before?: string };
      conditions?: string[];
    };
    estimatedReach: number;
  };
  scheduling: {
    startDate: string;
    endDate?: string;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    timezone: string;
  };
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  results?: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    unsubscribed: number;
  };
}

// Configuración de notificaciones de emergencia
export interface EmergencyNotificationConfig {
  enabled: boolean;
  escalationRules: Array<{
    level: number;
    waitTime: number; // minutos
    channels: NotificationChannel[];
    recipients: string[]; // user IDs
  }>;
  overrideSettings: {
    ignoreDND: boolean;
    ignoreQuietHours: boolean;
    maxRetries: number;
    retryInterval: number; // minutos
  };
  templates: {
    medicalEmergency: string;
    systemFailure: string;
    securityBreach: string;
    complianceViolation: string;
  };
}
