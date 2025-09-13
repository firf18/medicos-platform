-- Migración para crear las tablas necesarias para el registro de médicos
-- Red-Salud Platform - Medical Doctor Registration

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Tabla de verificaciones de identidad
CREATE TABLE IF NOT EXISTS identity_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(50) NOT NULL,
  verification_method VARCHAR(50) DEFAULT 'didit',
  verification_data JSONB DEFAULT '{}'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar especialidades médicas básicas
INSERT INTO medical_specialties (name, description, dashboard_features, required_validations) VALUES 
('Medicina General', 'Atención médica primaria y preventiva', 
 '[{"id": "patient_management", "name": "Gestión de Pacientes", "priority": "essential"}, {"id": "appointment_scheduling", "name": "Agenda de Citas", "priority": "essential"}, {"id": "medical_records", "name": "Historiales Médicos", "priority": "essential"}]'::jsonb,
 '[{"id": "basic_license", "name": "Cédula Profesional Vigente"}, {"id": "malpractice_insurance", "name": "Seguro de Responsabilidad Civil"}]'::jsonb),

('Cardiología', 'Especialista en enfermedades del corazón y sistema circulatorio',
 '[{"id": "patient_management", "name": "Gestión de Pacientes", "priority": "essential"}, {"id": "cardiac_monitoring", "name": "Monitoreo Cardíaco", "priority": "essential"}, {"id": "ekg_integration", "name": "Integración ECG", "priority": "important"}, {"id": "lab_integration", "name": "Integración Laboratorio", "priority": "important"}]'::jsonb,
 '[{"id": "cardiology_certification", "name": "Certificación en Cardiología"}, {"id": "advanced_life_support", "name": "Soporte Vital Avanzado"}]'::jsonb),

('Dermatología', 'Especialista en enfermedades de la piel',
 '[{"id": "patient_management", "name": "Gestión de Pacientes", "priority": "essential"}, {"id": "image_management", "name": "Gestión de Imágenes", "priority": "essential"}, {"id": "biopsy_tracking", "name": "Seguimiento de Biopsias", "priority": "important"}]'::jsonb,
 '[{"id": "dermatology_certification", "name": "Certificación en Dermatología"}, {"id": "dermoscopy_training", "name": "Entrenamiento en Dermoscopía"}]'::jsonb),

('Pediatría', 'Especialista en medicina infantil',
 '[{"id": "patient_management", "name": "Gestión de Pacientes", "priority": "essential"}, {"id": "vaccination_tracking", "name": "Control de Vacunación", "priority": "essential"}, {"id": "growth_charts", "name": "Gráficas de Crecimiento", "priority": "important"}]'::jsonb,
 '[{"id": "pediatrics_certification", "name": "Certificación en Pediatría"}, {"id": "child_protection", "name": "Protección Infantil"}]'::jsonb),

('Ginecología', 'Especialista en salud femenina',
 '[{"id": "patient_management", "name": "Gestión de Pacientes", "priority": "essential"}, {"id": "pregnancy_tracking", "name": "Seguimiento Embarazo", "priority": "essential"}, {"id": "lab_integration", "name": "Integración Laboratorio", "priority": "important"}]'::jsonb,
 '[{"id": "gynecology_certification", "name": "Certificación en Ginecología"}, {"id": "obstetrics_training", "name": "Entrenamiento Obstétrico"}]'::jsonb)

ON CONFLICT (name) DO NOTHING;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty ON doctor_profiles(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_license ON doctor_profiles(license_number);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verified ON doctor_profiles(is_verified, verification_status);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_verification_id ON identity_verifications(verification_id);

CREATE INDEX IF NOT EXISTS idx_doctor_dashboard_configs_doctor_id ON doctor_dashboard_configs(doctor_id);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps automáticamente
CREATE TRIGGER update_medical_specialties_updated_at BEFORE UPDATE ON medical_specialties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_dashboard_configs_updated_at BEFORE UPDATE ON doctor_dashboard_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_identity_verifications_updated_at BEFORE UPDATE ON identity_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil de médico automáticamente
CREATE OR REPLACE FUNCTION create_doctor_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear perfil si el usuario es de tipo doctor
  IF NEW.raw_user_meta_data->>'userType' = 'doctor' THEN
    -- El perfil se creará desde la aplicación con todos los datos
    -- Este trigger solo asegura la consistencia
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente (opcional)
-- CREATE TRIGGER on_auth_user_created_doctor
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION create_doctor_profile_on_signup();

-- Row Level Security (RLS) Policies

-- Habilitar RLS en todas las tablas
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

-- Políticas para medical_specialties (lectura pública)
CREATE POLICY "Medical specialties are viewable by everyone" ON medical_specialties
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage medical specialties" ON medical_specialties
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Políticas para doctor_profiles
CREATE POLICY "Doctors can view and edit their own profile" ON doctor_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Verified doctors are viewable by authenticated users" ON doctor_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    is_verified = true AND 
    verification_status = 'verified'
  );

CREATE POLICY "Admins can manage all doctor profiles" ON doctor_profiles
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Políticas para doctor_dashboard_configs
CREATE POLICY "Doctors can manage their own dashboard config" ON doctor_dashboard_configs
  FOR ALL USING (
    doctor_id = auth.uid() OR
    auth.role() = 'service_role'
  );

-- Políticas para identity_verifications
CREATE POLICY "Users can view their own identity verifications" ON identity_verifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own identity verifications" ON identity_verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all identity verifications" ON identity_verifications
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE medical_specialties IS 'Catálogo de especialidades médicas disponibles';
COMMENT ON TABLE doctor_profiles IS 'Perfiles específicos de médicos con información profesional';
COMMENT ON TABLE doctor_dashboard_configs IS 'Configuraciones personalizadas del dashboard para cada médico';
COMMENT ON TABLE identity_verifications IS 'Registro de verificaciones de identidad realizadas';
