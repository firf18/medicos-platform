/**
 * Tipos de Notificaciones y Comunicaciones
 * 
 * Contiene todos los tipos relacionados con el sistema
 * de notificaciones, alertas y comunicaciones.
 */

import type { Json } from './base-types';

export interface NotificationsTable {
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
    updated_at: string
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
    updated_at?: string
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
    updated_at?: string
  }
}

export interface PatientNotificationsTable {
  Row: {
    id: string
    patient_id: string
    title: string
    message: string
    type: 'appointment' | 'medication' | 'lab_result' | 'general' | 'emergency'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    is_read: boolean
    read_at: string | null
    action_required: boolean
    action_url: string | null
    expires_at: string | null
    metadata: Json | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    patient_id: string
    title: string
    message: string
    type: 'appointment' | 'medication' | 'lab_result' | 'general' | 'emergency'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    is_read?: boolean
    read_at?: string | null
    action_required?: boolean
    action_url?: string | null
    expires_at?: string | null
    metadata?: Json | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    patient_id?: string
    title?: string
    message?: string
    type?: 'appointment' | 'medication' | 'lab_result' | 'general' | 'emergency'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    is_read?: boolean
    read_at?: string | null
    action_required?: boolean
    action_url?: string | null
    expires_at?: string | null
    metadata?: Json | null
    created_at?: string
    updated_at?: string
  }
}

export interface DoctorNotificationsTable {
  Row: {
    id: string
    doctor_id: string
    title: string
    message: string
    type: 'appointment' | 'patient_update' | 'lab_result' | 'system' | 'emergency'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    is_read: boolean
    read_at: string | null
    action_required: boolean
    action_url: string | null
    related_patient_id: string | null
    related_appointment_id: string | null
    expires_at: string | null
    metadata: Json | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    doctor_id: string
    title: string
    message: string
    type: 'appointment' | 'patient_update' | 'lab_result' | 'system' | 'emergency'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    is_read?: boolean
    read_at?: string | null
    action_required?: boolean
    action_url?: string | null
    related_patient_id?: string | null
    related_appointment_id?: string | null
    expires_at?: string | null
    metadata?: Json | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    doctor_id?: string
    title?: string
    message?: string
    type?: 'appointment' | 'patient_update' | 'lab_result' | 'system' | 'emergency'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    is_read?: boolean
    read_at?: string | null
    action_required?: boolean
    action_url?: string | null
    related_patient_id?: string | null
    related_appointment_id?: string | null
    expires_at?: string | null
    metadata?: Json | null
    created_at?: string
    updated_at?: string
  }
}

export interface NotificationTemplatesTable {
  Row: {
    id: string
    name: string
    description: string | null
    type: 'email' | 'sms' | 'push' | 'in_app'
    subject_template: string | null
    body_template: string
    variables: string[] | null
    is_active: boolean
    created_by: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    name: string
    description?: string | null
    type: 'email' | 'sms' | 'push' | 'in_app'
    subject_template?: string | null
    body_template: string
    variables?: string[] | null
    is_active?: boolean
    created_by?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    name?: string
    description?: string | null
    type?: 'email' | 'sms' | 'push' | 'in_app'
    subject_template?: string | null
    body_template?: string
    variables?: string[] | null
    is_active?: boolean
    created_by?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface NotificationPreferencesTable {
  Row: {
    id: string
    user_id: string
    email_enabled: boolean
    sms_enabled: boolean
    push_enabled: boolean
    in_app_enabled: boolean
    appointment_reminders: boolean
    medication_reminders: boolean
    lab_result_notifications: boolean
    emergency_notifications: boolean
    marketing_notifications: boolean
    quiet_hours_start: string | null
    quiet_hours_end: string | null
    timezone: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    email_enabled?: boolean
    sms_enabled?: boolean
    push_enabled?: boolean
    in_app_enabled?: boolean
    appointment_reminders?: boolean
    medication_reminders?: boolean
    lab_result_notifications?: boolean
    emergency_notifications?: boolean
    marketing_notifications?: boolean
    quiet_hours_start?: string | null
    quiet_hours_end?: string | null
    timezone?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    email_enabled?: boolean
    sms_enabled?: boolean
    push_enabled?: boolean
    in_app_enabled?: boolean
    appointment_reminders?: boolean
    medication_reminders?: boolean
    lab_result_notifications?: boolean
    emergency_notifications?: boolean
    marketing_notifications?: boolean
    quiet_hours_start?: string | null
    quiet_hours_end?: string | null
    timezone?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface MedicationRemindersTable {
  Row: {
    id: string
    medication_id: string
    patient_id: string
    reminder_time: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed'
    days_of_week: number[] | null
    is_active: boolean
    last_sent: string | null
    next_reminder: string | null
    snooze_until: string | null
    adherence_tracked: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    medication_id: string
    patient_id: string
    reminder_time: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed'
    days_of_week?: number[] | null
    is_active?: boolean
    last_sent?: string | null
    next_reminder?: string | null
    snooze_until?: string | null
    adherence_tracked?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    medication_id?: string
    patient_id?: string
    reminder_time?: string
    frequency?: 'daily' | 'weekly' | 'monthly' | 'as_needed'
    days_of_week?: number[] | null
    is_active?: boolean
    last_sent?: string | null
    next_reminder?: string | null
    snooze_until?: string | null
    adherence_tracked?: boolean
    created_at?: string
    updated_at?: string
  }
}