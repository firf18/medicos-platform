-- Migración completa para Dashboard de Medicina General
-- Red-Salud Platform - Medical Dashboard System
-- Fecha: 2024-01-15

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Tabla de especialidades médicas (actualizada)
CREATE TABLE IF NOT EXISTS medical_specialties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  dashboard_features JSONB DEFAULT '[]'::jsonb,
  required_validations JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles de médicos (actualizada)
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  license_number VARCHAR(20) UNIQUE NOT NULL,
  license_state VARCHAR(50) NOT NULL,
  license_expiry DATE NOT NULL,
  specialty_id UUID REFERENCES medical_specialties(id),
  sub_specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_of_experience INTEGER DEFAULT 0,
  current_hospital VARCHAR(200),
  clinic_affiliations TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  consultation_fee DECIMAL(10,2),
  availability JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuraciones del dashboard de médicos
CREATE TABLE IF NOT EXISTS doctor_dashboard_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  selected_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  working_hours JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  theme_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pacientes (si no existe)
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  insurance_info JSONB DEFAULT '{}'::jsonb,
  medical_history JSONB DEFAULT '{}'::jsonb,
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  current_medications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas médicas (si no existe)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  appointment_type VARCHAR(50) DEFAULT 'consultation',
  notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescription JSONB DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de expedientes médicos
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  record_type VARCHAR(50) DEFAULT 'consultation',
  chief_complaint TEXT,
  history_present_illness TEXT,
  physical_examination JSONB DEFAULT '{}'::jsonb,
  vital_signs JSONB DEFAULT '{}'::jsonb,
  assessment TEXT,
  plan TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de medicamentos de pacientes
CREATE TABLE IF NOT EXISTS patient_medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  prescribed_by UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE NOT NULL,
  medication_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100),
  instructions TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  side_effects TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resultados de laboratorio
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE NOT NULL,
  lab_name VARCHAR(200) NOT NULL,
  test_name VARCHAR(200) NOT NULL,
  test_date DATE NOT NULL,
  results JSONB DEFAULT '{}'::jsonb,
  normal_ranges JSONB DEFAULT '{}'::jsonb,
  interpretation TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================================

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Índices para medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_priority ON medical_records(priority);

-- Índices para patient_medications
CREATE INDEX IF NOT EXISTS idx_patient_medications_patient_id ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_prescribed_by ON patient_medications(prescribed_by);
CREATE INDEX IF NOT EXISTS idx_patient_medications_is_active ON patient_medications(is_active);

-- Índices para lab_results
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_doctor_id ON lab_results(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_date ON lab_results(test_date);
CREATE INDEX IF NOT EXISTS idx_lab_results_is_abnormal ON lab_results(is_abnormal);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para medical_specialties (lectura pública)
CREATE POLICY "Allow public read access to medical_specialties" ON medical_specialties
  FOR SELECT USING (is_active = true);

-- Políticas para doctor_profiles
CREATE POLICY "Doctors can view their own profile" ON doctor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para doctor_dashboard_configs
CREATE POLICY "Doctors can manage their dashboard config" ON doctor_dashboard_configs
  FOR ALL USING (auth.uid() = doctor_id);

-- Políticas para patients
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para appointments
CREATE POLICY "Doctors can view their appointments" ON appointments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their appointments" ON appointments
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM patients WHERE id = patient_id));

CREATE POLICY "Doctors can manage their appointments" ON appointments
  FOR ALL USING (auth.uid() = doctor_id);

-- Políticas para medical_records
CREATE POLICY "Doctors can view their medical records" ON medical_records
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their medical records" ON medical_records
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM patients WHERE id = patient_id));

CREATE POLICY "Doctors can manage their medical records" ON medical_records
  FOR ALL USING (auth.uid() = doctor_id);

-- Políticas para patient_medications
CREATE POLICY "Doctors can view medications they prescribed" ON patient_medications
  FOR SELECT USING (auth.uid() = prescribed_by);

CREATE POLICY "Patients can view their medications" ON patient_medications
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM patients WHERE id = patient_id));

CREATE POLICY "Doctors can manage medications they prescribed" ON patient_medications
  FOR ALL USING (auth.uid() = prescribed_by);

-- Políticas para lab_results
CREATE POLICY "Doctors can view lab results they ordered" ON lab_results
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their lab results" ON lab_results
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM patients WHERE id = patient_id));

CREATE POLICY "Doctors can manage lab results they ordered" ON lab_results
  FOR ALL USING (auth.uid() = doctor_id);

-- Políticas para notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCIONES DE UTILIDAD
-- ============================================================================

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_doctor_dashboard_stats(doctor_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_patients', (
      SELECT COUNT(DISTINCT patient_id) 
      FROM appointments 
      WHERE doctor_id = doctor_uuid
    ),
    'today_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE doctor_id = doctor_uuid 
        AND DATE(scheduled_at) = CURRENT_DATE
    ),
    'upcoming_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE doctor_id = doctor_uuid 
        AND scheduled_at > NOW() 
        AND scheduled_at <= NOW() + INTERVAL '7 days'
        AND status = 'scheduled'
    ),
    'urgent_alerts', (
      SELECT COUNT(*) 
      FROM medical_records 
      WHERE doctor_id = doctor_uuid 
        AND priority = 'urgent'
        AND created_at > NOW() - INTERVAL '7 days'
    ),
    'average_rating', (
      SELECT COALESCE(AVG(rating), 0) 
      FROM appointments 
      WHERE doctor_id = doctor_uuid 
        AND rating IS NOT NULL
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener actividad reciente
CREATE OR REPLACE FUNCTION get_doctor_recent_activity(doctor_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS JSONB AS $$
DECLARE
  activity JSONB;
BEGIN
  WITH recent_appointments AS (
    SELECT 
      'appointment' as type,
      id,
      'Cita con ' || p.first_name || ' ' || p.last_name as title,
      'Cita ' || status || ' para ' || scheduled_at::date as description,
      created_at as timestamp,
      status
    FROM appointments a
    JOIN patients pt ON a.patient_id = pt.id
    JOIN auth.users u ON pt.user_id = u.id
    JOIN profiles p ON u.id = p.id
    WHERE a.doctor_id = doctor_uuid
    ORDER BY created_at DESC
    LIMIT limit_count
  ),
  recent_prescriptions AS (
    SELECT 
      'prescription' as type,
      id,
      'Receta para ' || p.first_name || ' ' || p.last_name as title,
      'Medicamento: ' || medication_name as description,
      created_at as timestamp,
      'completed' as status
    FROM patient_medications pm
    JOIN patients pt ON pm.patient_id = pt.id
    JOIN auth.users u ON pt.user_id = u.id
    JOIN profiles p ON u.id = p.id
    WHERE pm.prescribed_by = doctor_uuid
    ORDER BY created_at DESC
    LIMIT limit_count
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'type', type,
      'title', title,
      'description', description,
      'timestamp', timestamp,
      'status', status
    ) ORDER BY timestamp DESC
  ) INTO activity
  FROM (
    SELECT * FROM recent_appointments
    UNION ALL
    SELECT * FROM recent_prescriptions
  ) combined
  LIMIT limit_count;
  
  RETURN COALESCE(activity, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar especialidades médicas básicas
INSERT INTO medical_specialties (name, description, dashboard_features, required_validations) VALUES 
('Medicina General', 'Atención médica primaria y preventiva', 
 '[{"id": "patient_management", "name": "Gestión de Pacientes", "priority": "essential"}, {"id": "appointment_scheduling", "name": "Agenda de Citas", "priority": "essential"}, {"id": "medical_records", "name": "Historiales Médicos", "priority": "essential"}, {"id": "vital_signs_monitoring", "name": "Monitoreo de Signos Vitales", "priority": "essential"}, {"id": "prescription_management", "name": "Gestión de Recetas", "priority": "essential"}, {"id": "secure_messaging", "name": "Mensajería Segura", "priority": "essential"}]'::jsonb,
 '[{"id": "basic_license", "name": "Cédula Profesional Vigente"}, {"id": "malpractice_insurance", "name": "Seguro de Responsabilidad Civil"}]'::jsonb),

('Cardiología', 'Especialista en enfermedades del corazón y sistema circulatorio',
 '[{"id": "ecg_monitoring", "name": "Monitoreo ECG", "priority": "essential"}, {"id": "cardiac_catheterization", "name": "Cateterismo Cardíaco", "priority": "advanced"}, {"id": "stress_testing", "name": "Pruebas de Esfuerzo", "priority": "essential"}]'::jsonb,
 '[{"id": "cardiology_board", "name": "Certificación en Cardiología"}, {"id": "basic_license", "name": "Cédula Profesional Vigente"}]'::jsonb),

('Neurología', 'Especialista en enfermedades del sistema nervioso',
 '[{"id": "eeg_monitoring", "name": "Monitoreo EEG", "priority": "essential"}, {"id": "neurological_exam", "name": "Examen Neurológico", "priority": "essential"}, {"id": "brain_imaging", "name": "Imágenes Cerebrales", "priority": "advanced"}]'::jsonb,
 '[{"id": "neurology_board", "name": "Certificación en Neurología"}, {"id": "basic_license", "name": "Cédula Profesional Vigente"}]'::jsonb),

('Pediatría', 'Especialista en medicina infantil',
 '[{"id": "growth_charts", "name": "Curvas de Crecimiento", "priority": "essential"}, {"id": "vaccination_tracker", "name": "Seguimiento de Vacunas", "priority": "essential"}, {"id": "developmental_assessment", "name": "Evaluación del Desarrollo", "priority": "essential"}]'::jsonb,
 '[{"id": "pediatrics_board", "name": "Certificación en Pediatría"}, {"id": "basic_license", "name": "Cédula Profesional Vigente"}]'::jsonb),

('Dermatología', 'Especialista en enfermedades de la piel',
 '[{"id": "skin_imaging", "name": "Imágenes de la Piel", "priority": "essential"}, {"id": "mole_tracking", "name": "Seguimiento de Lunares", "priority": "essential"}, {"id": "biopsy_management", "name": "Gestión de Biopsias", "priority": "advanced"}]'::jsonb,
 '[{"id": "dermatology_board", "name": "Certificación en Dermatología"}, {"id": "basic_license", "name": "Cédula Profesional Vigente"}]'::jsonb)

ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- TRIGGERS PARA AUDITORÍA
-- ============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_medical_specialties_updated_at
  BEFORE UPDATE ON medical_specialties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_dashboard_configs_updated_at
  BEFORE UPDATE ON doctor_dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at
  BEFORE UPDATE ON patient_medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE medical_specialties IS 'Especialidades médicas disponibles en la plataforma';
COMMENT ON TABLE doctor_profiles IS 'Perfiles profesionales de médicos registrados';
COMMENT ON TABLE doctor_dashboard_configs IS 'Configuraciones personalizadas del dashboard por médico';
COMMENT ON TABLE patients IS 'Información de pacientes registrados';
COMMENT ON TABLE appointments IS 'Citas médicas programadas';
COMMENT ON TABLE medical_records IS 'Expedientes médicos de pacientes';
COMMENT ON TABLE patient_medications IS 'Medicamentos prescritos a pacientes';
COMMENT ON TABLE lab_results IS 'Resultados de laboratorio';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios';

COMMENT ON FUNCTION get_doctor_dashboard_stats(UUID) IS 'Obtiene estadísticas del dashboard para un médico específico';
COMMENT ON FUNCTION get_doctor_recent_activity(UUID, INTEGER) IS 'Obtiene actividad reciente de un médico específico';
