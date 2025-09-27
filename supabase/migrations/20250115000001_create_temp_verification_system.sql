-- Migración para sistema de verificación temporal de registro de doctores
-- Red-Salud Platform - Temporary Doctor Registration Verification System
-- Fecha: 2024-01-15

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLAS TEMPORALES PARA VERIFICACIÓN DE REGISTRO
-- ============================================================================

-- Tabla temporal para registros de doctores en proceso
CREATE TABLE IF NOT EXISTS doctor_registration_temp (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'email_verified', 'phone_verified', 'completed', 'expired')),
  registration_data JSONB DEFAULT '{}'::jsonb,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla temporal para códigos de verificación de email
CREATE TABLE IF NOT EXISTS email_verification_codes_temp (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES doctor_registration_temp(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Tabla temporal para códigos de verificación de teléfono
CREATE TABLE IF NOT EXISTS phone_verification_codes_temp (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES doctor_registration_temp(id) ON DELETE CASCADE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- ============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================================

-- Índices para doctor_registration_temp
CREATE INDEX IF NOT EXISTS idx_doctor_registration_temp_email ON doctor_registration_temp(email);
CREATE INDEX IF NOT EXISTS idx_doctor_registration_temp_status ON doctor_registration_temp(status);
CREATE INDEX IF NOT EXISTS idx_doctor_registration_temp_created_at ON doctor_registration_temp(created_at);
CREATE INDEX IF NOT EXISTS idx_doctor_registration_temp_expires_at ON doctor_registration_temp(expires_at);

-- Índices para email_verification_codes_temp
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_temp_registration_id ON email_verification_codes_temp(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_temp_email ON email_verification_codes_temp(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_temp_code ON email_verification_codes_temp(code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_temp_used ON email_verification_codes_temp(used);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_temp_expires_at ON email_verification_codes_temp(expires_at);

-- Índices para phone_verification_codes_temp
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_temp_registration_id ON phone_verification_codes_temp(registration_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_temp_phone ON phone_verification_codes_temp(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_temp_code ON phone_verification_codes_temp(code);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_temp_used ON phone_verification_codes_temp(used);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_temp_expires_at ON phone_verification_codes_temp(expires_at);

-- ============================================================================
-- FUNCIONES DE LIMPIEZA AUTOMÁTICA
-- ============================================================================

-- Función para limpiar registros temporales expirados
CREATE OR REPLACE FUNCTION cleanup_expired_temp_registrations()
RETURNS void AS $$
BEGIN
  -- Limpiar registros temporales expirados
  DELETE FROM doctor_registration_temp 
  WHERE expires_at < NOW() AND status IN ('pending_verification', 'expired');
  
  -- Limpiar códigos de verificación expirados
  DELETE FROM email_verification_codes_temp 
  WHERE expires_at < NOW() OR used = true;
  
  DELETE FROM phone_verification_codes_temp 
  WHERE expires_at < NOW() OR used = true;
  
  -- Marcar registros como expirados si han pasado 24 horas
  UPDATE doctor_registration_temp 
  SET status = 'expired', updated_at = NOW()
  WHERE expires_at < NOW() AND status IN ('pending_verification', 'email_verified', 'phone_verified');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_doctor_registration_temp_updated_at
  BEFORE UPDATE ON doctor_registration_temp
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- Habilitar RLS en las tablas temporales
ALTER TABLE doctor_registration_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verification_codes_temp ENABLE ROW LEVEL SECURITY;

-- Políticas para doctor_registration_temp (solo lectura para usuarios autenticados)
CREATE POLICY "Users can view their own temp registrations" ON doctor_registration_temp
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para email_verification_codes_temp (solo lectura para usuarios autenticados)
CREATE POLICY "Users can view their own email verification codes" ON email_verification_codes_temp
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para phone_verification_codes_temp (solo lectura para usuarios autenticados)
CREATE POLICY "Users can view their own phone verification codes" ON phone_verification_codes_temp
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE doctor_registration_temp IS 'Registros temporales de doctores en proceso de verificación';
COMMENT ON TABLE email_verification_codes_temp IS 'Códigos temporales de verificación de email para registro de doctores';
COMMENT ON TABLE phone_verification_codes_temp IS 'Códigos temporales de verificación de teléfono para registro de doctores';

COMMENT ON FUNCTION cleanup_expired_temp_registrations() IS 'Limpia registros temporales y códigos de verificación expirados';

-- ============================================================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================================================

-- Crear un job programado para limpiar registros expirados (requiere pg_cron)
-- SELECT cron.schedule('cleanup-expired-temp-registrations', '0 * * * *', 'SELECT cleanup_expired_temp_registrations();');
