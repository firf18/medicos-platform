-- Professional Dashboard Tables for Patient Portal
-- This migration creates all necessary tables for the advanced patient dashboard

-- Smart Reminders Table
CREATE TABLE IF NOT EXISTS smart_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('medication', 'appointment', 'exercise', 'measurement', 'checkup', 'other')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_time TIMESTAMPTZ NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
    is_active BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    snooze_until TIMESTAMPTZ,
    push_notification BOOLEAN DEFAULT true,
    email_notification BOOLEAN DEFAULT false,
    sms_notification BOOLEAN DEFAULT false,
    advance_notice INTEGER DEFAULT 15, -- minutes
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Team Table
CREATE TABLE IF NOT EXISTS patient_care_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialty TEXT,
    hospital_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(2,1) DEFAULT 0,
    next_appointment TIMESTAMPTZ,
    last_contact TIMESTAMPTZ,
    notes TEXT,
    profile_image TEXT,
    available_for_video BOOLEAN DEFAULT false,
    available_for_chat BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Calls Table
CREATE TABLE IF NOT EXISTS video_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- minutes
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
    call_type TEXT NOT NULL DEFAULT 'video' CHECK (call_type IN ('video', 'audio', 'consultation')),
    notes TEXT,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'ended')),
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'doctor', 'system')),
    sender_name TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'video_call')),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Goals Table
CREATE TABLE IF NOT EXISTS health_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Alerts Table
CREATE TABLE IF NOT EXISTS health_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    alert_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    action_required BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Schedule Table
CREATE TABLE IF NOT EXISTS medication_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    actual_time TIME,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Categories Table
CREATE TABLE IF NOT EXISTS document_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT 'blue',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default document categories
INSERT INTO document_categories (name, description, color, icon) VALUES
    ('Laboratorios', 'Resultados de laboratorio y análisis clínicos', 'green', 'beaker'),
    ('Imágenes Médicas', 'Radiografías, resonancias, tomografías', 'purple', 'photo'),
    ('Recetas', 'Recetas médicas y prescripciones', 'blue', 'document-text'),
    ('Reportes Médicos', 'Informes y reportes de consultas', 'orange', 'clipboard-document-list'),
    ('Seguros', 'Documentos de seguros médicos', 'indigo', 'shield-check'),
    ('Vacunas', 'Certificados de vacunación', 'yellow', 'heart'),
    ('Otros', 'Otros documentos médicos', 'gray', 'folder')
ON CONFLICT (name) DO NOTHING;

-- Patient Emergency Info Table
CREATE TABLE IF NOT EXISTS patient_emergency_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    blood_type TEXT,
    allergies TEXT[],
    current_medications TEXT[],
    medical_conditions TEXT[],
    insurance_info TEXT,
    emergency_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smart_reminders_patient_id ON smart_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_smart_reminders_scheduled_time ON smart_reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_smart_reminders_active ON smart_reminders(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_care_team_patient_id ON patient_care_team(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_team_active ON patient_care_team(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_care_team_primary ON patient_care_team(is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_video_calls_patient_id ON video_calls(patient_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_scheduled_at ON video_calls(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_patient_id ON chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_doctor_id ON chat_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_health_goals_patient_id ON health_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_active ON health_goals(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_health_alerts_patient_id ON health_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_active ON health_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_health_alerts_severity ON health_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_medication_schedule_patient_id ON medication_schedule(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_schedule_date ON medication_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_medication_schedule_medication_id ON medication_schedule(medication_id);

-- RLS Policies
ALTER TABLE smart_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_care_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_emergency_info ENABLE ROW LEVEL SECURITY;

-- Policies for smart_reminders
CREATE POLICY "Users can view own reminders" ON smart_reminders FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own reminders" ON smart_reminders FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own reminders" ON smart_reminders FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete own reminders" ON smart_reminders FOR DELETE USING (auth.uid() = patient_id);

-- Policies for patient_care_team
CREATE POLICY "Users can view own care team" ON patient_care_team FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own care team" ON patient_care_team FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own care team" ON patient_care_team FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete own care team" ON patient_care_team FOR DELETE USING (auth.uid() = patient_id);

-- Policies for video_calls
CREATE POLICY "Users can view own video calls" ON video_calls FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own video calls" ON video_calls FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own video calls" ON video_calls FOR UPDATE USING (auth.uid() = patient_id);

-- Policies for chat_sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = patient_id);

-- Policies for chat_messages
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE chat_sessions.id = chat_messages.session_id 
        AND chat_sessions.patient_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE chat_sessions.id = session_id 
        AND chat_sessions.patient_id = auth.uid()
    )
);

-- Policies for health_goals
CREATE POLICY "Users can view own health goals" ON health_goals FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own health goals" ON health_goals FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own health goals" ON health_goals FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete own health goals" ON health_goals FOR DELETE USING (auth.uid() = patient_id);

-- Policies for health_alerts
CREATE POLICY "Users can view own health alerts" ON health_alerts FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can update own health alerts" ON health_alerts FOR UPDATE USING (auth.uid() = patient_id);

-- Policies for medication_schedule
CREATE POLICY "Users can view own medication schedule" ON medication_schedule FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own medication schedule" ON medication_schedule FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own medication schedule" ON medication_schedule FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete own medication schedule" ON medication_schedule FOR DELETE USING (auth.uid() = patient_id);

-- Policies for document_categories (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view document categories" ON document_categories FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for patient_emergency_info
CREATE POLICY "Users can view own emergency info" ON patient_emergency_info FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert own emergency info" ON patient_emergency_info FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own emergency info" ON patient_emergency_info FOR UPDATE USING (auth.uid() = patient_id);

-- Functions for medication tracking
CREATE OR REPLACE FUNCTION increment_total_doses(medication_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE patient_medications 
    SET total_doses = COALESCE(total_doses, 0) + 1,
        updated_at = NOW()
    WHERE id = medication_id 
    AND patient_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION increment_missed_doses(medication_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE patient_medications 
    SET missed_doses = COALESCE(missed_doses, 0) + 1,
        total_doses = COALESCE(total_doses, 0) + 1,
        updated_at = NOW()
    WHERE id = medication_id 
    AND patient_id = auth.uid();
END;
$$;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_smart_reminders_updated_at BEFORE UPDATE ON smart_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_team_updated_at BEFORE UPDATE ON patient_care_team FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_calls_updated_at BEFORE UPDATE ON video_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON health_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_alerts_updated_at BEFORE UPDATE ON health_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medication_schedule_updated_at BEFORE UPDATE ON medication_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_info_updated_at BEFORE UPDATE ON patient_emergency_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
