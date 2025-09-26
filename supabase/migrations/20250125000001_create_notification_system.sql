-- Migration: Create Notification System for Laboratories
-- Description: Complete notification system for laboratory registration workflow
-- Author: Platform Médicos Team
-- Version: 1.0.0

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'registration_started',
  'registration_completed',
  'registration_approved',
  'registration_rejected',
  'document_uploaded',
  'document_verified',
  'document_rejected',
  'status_change',
  'system_announcement',
  'reminder'
);

-- Create notification priority enum
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Create notification channels enum
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'push',
  'in_app',
  'webhook'
);

-- Create notification status enum
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed',
  'read',
  'cancelled'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient information
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Notification content
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'normal',
  channel notification_channel NOT NULL,
  status notification_status DEFAULT 'pending',
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  name VARCHAR(255) UNIQUE NOT NULL,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  
  -- Template content
  subject_template TEXT,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  
  -- Template variables
  variables JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  
  -- Type preferences
  registration_notifications BOOLEAN DEFAULT true,
  document_notifications BOOLEAN DEFAULT true,
  status_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  reminder_notifications BOOLEAN DEFAULT true,
  
  -- Frequency preferences
  digest_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, daily, weekly
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification logs table for audit
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  
  -- Log details
  event_type VARCHAR(50) NOT NULL, -- sent, delivered, failed, read, etc.
  details JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_email ON public.notifications(email);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON public.notifications(scheduled_at);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notification_templates_type_channel ON public.notification_templates(type, channel);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_notification_logs_notification_id ON public.notification_logs(notification_id);

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_type notification_type,
  p_channel notification_channel,
  p_title VARCHAR,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_priority notification_priority DEFAULT 'normal',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    email,
    phone,
    type,
    channel,
    title,
    message,
    action_url,
    priority,
    metadata
  ) VALUES (
    p_user_id,
    p_email,
    p_phone,
    p_type,
    p_channel,
    p_title,
    p_message,
    p_action_url,
    p_priority,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(p_user_id UUID)
RETURNS TABLE(
  email_enabled BOOLEAN,
  sms_enabled BOOLEAN,
  push_enabled BOOLEAN,
  in_app_enabled BOOLEAN,
  registration_notifications BOOLEAN,
  document_notifications BOOLEAN,
  status_notifications BOOLEAN,
  system_notifications BOOLEAN,
  reminder_notifications BOOLEAN,
  digest_frequency VARCHAR,
  quiet_hours_start TIME,
  quiet_hours_end TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(np.email_enabled, true),
    COALESCE(np.sms_enabled, false),
    COALESCE(np.push_enabled, true),
    COALESCE(np.in_app_enabled, true),
    COALESCE(np.registration_notifications, true),
    COALESCE(np.document_notifications, true),
    COALESCE(np.status_notifications, true),
    COALESCE(np.system_notifications, true),
    COALESCE(np.reminder_notifications, true),
    COALESCE(np.digest_frequency, 'immediate'),
    COALESCE(np.quiet_hours_start, '22:00'::TIME),
    COALESCE(np.quiet_hours_end, '08:00'::TIME)
  FROM public.notification_preferences np
  WHERE np.user_id = p_user_id
  UNION ALL
  SELECT true, false, true, true, true, true, true, true, true, 'immediate', '22:00'::TIME, '08:00'::TIME
  WHERE NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = p_user_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  notification_exists BOOLEAN;
BEGIN
  -- Check if notification exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM public.notifications 
    WHERE id = p_notification_id 
    AND (user_id = p_user_id OR email = (SELECT email FROM auth.users WHERE id = p_user_id))
  ) INTO notification_exists;
  
  IF NOT notification_exists THEN
    RETURN false;
  END IF;
  
  -- Update notification status
  UPDATE public.notifications 
  SET 
    status = 'read',
    read_at = NOW()
  WHERE id = p_notification_id;
  
  -- Log the event
  INSERT INTO public.notification_logs (notification_id, event_type, details)
  VALUES (p_notification_id, 'read', jsonb_build_object('read_at', NOW()));
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_unread_only BOOLEAN DEFAULT false
)
RETURNS TABLE(
  id UUID,
  type notification_type,
  priority notification_priority,
  channel notification_channel,
  status notification_status,
  title VARCHAR,
  message TEXT,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.priority,
    n.channel,
    n.status,
    n.title,
    n.message,
    n.action_url,
    n.metadata,
    n.created_at,
    n.read_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id
  AND (NOT p_unread_only OR n.status != 'read')
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Templates are readable by all authenticated users
CREATE POLICY "Templates are readable by authenticated users" ON public.notification_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage templates
CREATE POLICY "Admins can manage templates" ON public.notification_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, channel, subject_template, title_template, message_template) VALUES
('registration_started_email', 'registration_started', 'email', 
 'Registro de Laboratorio Iniciado - {{laboratory_name}}',
 'Registro de Laboratorio Iniciado',
 'Su registro para el laboratorio "{{laboratory_name}}" ha sido iniciado exitosamente. ID de registro: {{registration_id}}'),

('registration_completed_email', 'registration_completed', 'email',
 'Registro de Laboratorio Completado - {{laboratory_name}}',
 'Registro Completado',
 'Su registro para el laboratorio "{{laboratory_name}}" ha sido completado y está siendo revisado por nuestro equipo.'),

('registration_approved_email', 'registration_approved', 'email',
 'Laboratorio Aprobado - {{laboratory_name}}',
 '¡Laboratorio Aprobado!',
 '¡Felicitaciones! Su laboratorio "{{laboratory_name}}" ha sido aprobado y está ahora activo en nuestra plataforma.'),

('registration_rejected_email', 'registration_rejected', 'email',
 'Registro de Laboratorio Rechazado - {{laboratory_name}}',
 'Registro Rechazado',
 'Su registro para el laboratorio "{{laboratory_name}}" ha sido rechazado. Motivo: {{rejection_reason}}'),

('document_uploaded_email', 'document_uploaded', 'email',
 'Documento Subido - {{laboratory_name}}',
 'Documento Subido',
 'Se ha subido un nuevo documento para el laboratorio "{{laboratory_name}}": {{document_name}}'),

('document_verified_email', 'document_verified', 'email',
 'Documento Verificado - {{laboratory_name}}',
 'Documento Verificado',
 'El documento "{{document_name}}" del laboratorio "{{laboratory_name}}" ha sido verificado exitosamente.'),

('document_rejected_email', 'document_rejected', 'email',
 'Documento Rechazado - {{laboratory_name}}',
 'Documento Rechazado',
 'El documento "{{document_name}}" del laboratorio "{{laboratory_name}}" ha sido rechazado. Motivo: {{rejection_reason}}');

-- Add comments
COMMENT ON TABLE public.notifications IS 'System notifications for laboratory registration workflow';
COMMENT ON TABLE public.notification_templates IS 'Templates for different types of notifications';
COMMENT ON TABLE public.notification_preferences IS 'User preferences for notification channels and types';
COMMENT ON TABLE public.notification_logs IS 'Audit log for notification events';
