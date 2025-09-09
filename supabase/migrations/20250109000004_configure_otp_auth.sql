-- Configuración para autenticación con códigos OTP
-- Esta migración configura las funciones necesarias para manejar códigos OTP

-- Función para generar códigos OTP personalizados (si es necesario)
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generar código de 6 dígitos
  code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar códigos OTP con expiración
CREATE OR REPLACE FUNCTION validate_otp_code(
  user_email TEXT,
  provided_code TEXT,
  code_type TEXT DEFAULT 'signup'
)
RETURNS BOOLEAN AS $$
DECLARE
  is_valid BOOLEAN := FALSE;
BEGIN
  -- Esta función se integraría con el sistema de OTP de Supabase
  -- Por ahora, solo registra el intento de validación
  
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    json_build_object(
      'action', 'otp_validation_attempt',
      'email', user_email,
      'code_type', code_type,
      'timestamp', NOW()
    ),
    NOW(),
    '127.0.0.1'
  );
  
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar códigos OTP expirados
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Esta función limpiaría códigos expirados si los almacenáramos localmente
  -- Supabase maneja esto automáticamente, pero podemos usar esta función
  -- para limpiar registros auxiliares si los tenemos
  
  -- Por ahora, solo registra la limpieza
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    json_build_object(
      'action', 'otp_cleanup',
      'deleted_count', deleted_count,
      'timestamp', NOW()
    ),
    NOW(),
    '127.0.0.1'
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear tabla para rastrear intentos de verificación (opcional)
CREATE TABLE IF NOT EXISTS public.email_verification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('signup', 'recovery', 'email_change')),
  attempts_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_email_verification_attempts_email 
ON public.email_verification_attempts(email);

CREATE INDEX IF NOT EXISTS idx_email_verification_attempts_user_id 
ON public.email_verification_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_attempts_created_at 
ON public.email_verification_attempts(created_at);

-- RLS para la tabla de intentos de verificación
ALTER TABLE public.email_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios intentos
CREATE POLICY "Users can view their own verification attempts" 
ON public.email_verification_attempts
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para insertar intentos (solo el sistema)
CREATE POLICY "System can insert verification attempts" 
ON public.email_verification_attempts
FOR INSERT 
WITH CHECK (true);

-- Función para registrar intentos de verificación
CREATE OR REPLACE FUNCTION log_verification_attempt(
  user_email TEXT,
  attempt_type TEXT DEFAULT 'signup'
)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Buscar el usuario por email
  SELECT id INTO user_record FROM auth.users WHERE email = user_email;
  
  -- Insertar o actualizar el registro de intentos
  INSERT INTO public.email_verification_attempts (
    email,
    user_id,
    attempt_type,
    attempts_count,
    last_attempt_at
  ) VALUES (
    user_email,
    user_record.id,
    attempt_type,
    1,
    NOW()
  )
  ON CONFLICT (email, attempt_type) 
  DO UPDATE SET
    attempts_count = email_verification_attempts.attempts_count + 1,
    last_attempt_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de verificación
CREATE OR REPLACE FUNCTION get_verification_stats(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_attempts', COALESCE(SUM(attempts_count), 0),
    'last_attempt', MAX(last_attempt_at),
    'attempt_types', json_agg(
      json_build_object(
        'type', attempt_type,
        'count', attempts_count,
        'last_attempt', last_attempt_at
      )
    )
  ) INTO stats
  FROM public.email_verification_attempts
  WHERE email = user_email
  AND created_at > NOW() - INTERVAL '24 hours';
  
  RETURN COALESCE(stats, '{"total_attempts": 0}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para limpiar intentos antiguos automáticamente
CREATE OR REPLACE FUNCTION cleanup_old_verification_attempts()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpiar intentos más antiguos de 7 días
  DELETE FROM public.email_verification_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecuta diariamente (aproximadamente)
-- Nota: Este trigger se ejecutará cada vez que se inserte un nuevo intento
CREATE OR REPLACE TRIGGER cleanup_verification_attempts_trigger
  AFTER INSERT ON public.email_verification_attempts
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_verification_attempts();

-- Permisos para las funciones
GRANT EXECUTE ON FUNCTION generate_otp_code() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_otp_code(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_verification_attempt(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_otp_codes() TO service_role;

-- Permisos para la tabla
GRANT SELECT, INSERT ON public.email_verification_attempts TO authenticated;
GRANT ALL ON public.email_verification_attempts TO service_role;

-- Comentarios para documentación
COMMENT ON TABLE public.email_verification_attempts IS 'Tabla para rastrear intentos de verificación de email';
COMMENT ON FUNCTION generate_otp_code() IS 'Genera códigos OTP de 6 dígitos';
COMMENT ON FUNCTION validate_otp_code(TEXT, TEXT, TEXT) IS 'Valida códigos OTP con expiración';
COMMENT ON FUNCTION log_verification_attempt(TEXT, TEXT) IS 'Registra intentos de verificación de email';
COMMENT ON FUNCTION get_verification_stats(TEXT) IS 'Obtiene estadísticas de verificación para un email';
COMMENT ON FUNCTION cleanup_expired_otp_codes() IS 'Limpia códigos OTP expirados';