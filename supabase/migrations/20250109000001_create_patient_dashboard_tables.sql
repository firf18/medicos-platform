-- Patient Dashboard Complete Schema
-- This migration creates all tables needed for the robust patient dashboard

-- Confidentes/Cuidadores System
CREATE TABLE patient_caregivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    caregiver_email VARCHAR(255) NOT NULL,
    caregiver_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL, -- 'spouse', 'child', 'parent', 'friend', etc.
    access_level VARCHAR(50) NOT NULL DEFAULT 'basic', -- 'full', 'emergency_only', 'appointments_only', 'basic'
    permissions JSONB DEFAULT '{}', -- Specific permissions object
    is_emergency_contact BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE, -- For temporary access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency System
CREATE TABLE emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1, -- 1 = highest priority
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emergency_medical_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10),
    allergies TEXT[],
    chronic_conditions TEXT[],
    current_medications JSONB DEFAULT '[]',
    emergency_notes TEXT,
    organ_donor BOOLEAN DEFAULT false,
    emergency_physician_name VARCHAR(255),
    emergency_physician_phone VARCHAR(20),
    insurance_info JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emergency_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL,
    description TEXT,
    location_data JSONB, -- GPS coordinates, address
    contacts_notified TEXT[],
    emergency_services_called BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Plans System
CREATE TABLE health_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL, -- 'treatment', 'prevention', 'recovery', 'maintenance'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    start_date DATE NOT NULL,
    end_date DATE,
    goals JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE health_plan_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    health_plan_id UUID REFERENCES health_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL, -- 'medication', 'exercise', 'diet', 'appointment', 'measurement'
    frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'as_needed'
    target_value JSONB, -- For measurable tasks
    is_completed BOOLEAN DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Second Opinion System
CREATE TABLE second_opinion_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_doctor_id UUID REFERENCES auth.users(id),
    specialist_id UUID REFERENCES auth.users(id),
    case_title VARCHAR(255) NOT NULL,
    case_description TEXT NOT NULL,
    medical_history_summary TEXT,
    current_diagnosis TEXT,
    current_treatment TEXT,
    specific_questions TEXT,
    urgency_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_review', 'completed', 'cancelled'
    specialist_response TEXT,
    specialist_recommendations TEXT,
    attachments JSONB DEFAULT '[]',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Records and Documents
CREATE TABLE medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id),
    document_type VARCHAR(100) NOT NULL, -- 'lab_result', 'prescription', 'report', 'image', 'certificate'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size INTEGER,
    tags TEXT[],
    is_critical BOOLEAN DEFAULT false,
    shared_with_caregivers BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments System
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    appointment_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
    location VARCHAR(255),
    is_virtual BOOLEAN DEFAULT false,
    virtual_meeting_url TEXT,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications System
CREATE TABLE patient_medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    instructions TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    side_effects_reported TEXT[],
    adherence_score DECIMAL(3,2), -- 0.00 to 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medication_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES patient_medications(id) ON DELETE CASCADE,
    reminder_time TIME NOT NULL,
    days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
    is_active BOOLEAN DEFAULT true,
    last_taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Metrics System
CREATE TABLE health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'weight', 'blood_pressure', 'glucose', 'heart_rate', etc.
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    additional_data JSONB, -- For complex metrics like BP (systolic/diastolic)
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'device', 'doctor'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications System
CREATE TABLE patient_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'appointment', 'medication', 'result', 'emergency', 'general'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    channels VARCHAR(50)[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms', 'push'
    is_read BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Logs for Security
CREATE TABLE patient_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    accessor_id UUID REFERENCES auth.users(id), -- Who accessed the data
    accessor_type VARCHAR(50) NOT NULL, -- 'patient', 'doctor', 'caregiver', 'system'
    action VARCHAR(100) NOT NULL, -- 'view_profile', 'update_medication', 'download_document', etc.
    resource_type VARCHAR(50), -- 'document', 'appointment', 'medication', etc.
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patient_caregivers_patient_id ON patient_caregivers(patient_id);
CREATE INDEX idx_emergency_contacts_patient_id ON emergency_contacts(patient_id);
CREATE INDEX idx_health_plans_patient_id ON health_plans(patient_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_patient_medications_patient_id ON patient_medications(patient_id);
CREATE INDEX idx_health_metrics_patient_id ON health_metrics(patient_id);
CREATE INDEX idx_health_metrics_type_date ON health_metrics(patient_id, metric_type, recorded_at);
CREATE INDEX idx_patient_notifications_patient_id ON patient_notifications(patient_id);
CREATE INDEX idx_patient_notifications_unread ON patient_notifications(patient_id, is_read) WHERE is_read = false;
CREATE INDEX idx_patient_access_logs_patient_id ON patient_access_logs(patient_id);

-- Enable RLS on all tables
ALTER TABLE patient_caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_medical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_opinion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_access_logs ENABLE ROW LEVEL SECURITY;