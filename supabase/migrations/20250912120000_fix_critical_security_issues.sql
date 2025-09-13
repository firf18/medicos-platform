-- ===================================================
-- MIGRACIÓN CRÍTICA: Corrección de Problemas de Seguridad
-- ===================================================

-- 1. HABILITAR RLS EN TABLA SECURITY_CONFIG
-- ===================================================
ALTER TABLE IF EXISTS security_config ENABLE ROW LEVEL SECURITY;

-- Crear política restrictiva para security_config (solo admins)
CREATE POLICY "Only admins can access security config"
ON security_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
    AND profiles.role = 'admin'
  )
);

-- 2. ELIMINAR VISTA DE SEGURIDAD PROBLEMÁTICA
-- ===================================================
DROP VIEW IF EXISTS security_dashboard;

-- 3. CREAR FUNCIONES SEGURAS CON SEARCH_PATH FIJO
-- ===================================================

-- Recrear función is_admin con search_path seguro
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Recrear función is_doctor con search_path seguro
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'doctor'
  );
END;
$$;

-- Recrear función is_patient con search_path seguro
CREATE OR REPLACE FUNCTION is_patient()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'patient'
  );
END;
$$;

-- Recrear función is_clinic con search_path seguro
CREATE OR REPLACE FUNCTION is_clinic()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'clinic'
  );
END;
$$;

-- Recrear función is_laboratory con search_path seguro
CREATE OR REPLACE FUNCTION is_laboratory()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'laboratory'
  );
END;
$$;

-- 4. CORREGIR FUNCIÓN update_updated_at_column
-- ===================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 5. CORREGIR FUNCIÓN handle_new_user
-- ===================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  user_role text;
BEGIN
  -- Obtener el rol del metadata del usuario
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Crear perfil en la tabla profiles
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    user_role
  );
  
  -- Crear registro específico según el rol
  IF user_role = 'doctor' THEN
    INSERT INTO doctors (id, specialty_id, license_number)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'specialty_id')::integer, 1),
      COALESCE(NEW.raw_user_meta_data->>'license_number', '')
    );
  ELSIF user_role = 'patient' THEN
    INSERT INTO patients (id)
    VALUES (NEW.id);
  ELSIF user_role = 'clinic' THEN
    INSERT INTO new_clinics (id, name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Clínica')
    );
  ELSIF user_role = 'laboratory' THEN
    INSERT INTO new_laboratories (id, name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'laboratory_name', 'Laboratorio')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. CORREGIR FUNCIONES DE VALIDACIÓN Y SEGURIDAD
-- ===================================================

-- Función validate_password con search_path seguro
CREATE OR REPLACE FUNCTION validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Validar longitud mínima
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Validar que contenga al menos una letra y un número
  IF NOT (password ~ '[A-Za-z]' AND password ~ '[0-9]') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Función log_security_event con search_path seguro
CREATE OR REPLACE FUNCTION log_security_event(
  event_type text,
  event_description text,
  user_id uuid DEFAULT auth.uid(),
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- En el futuro podríamos agregar una tabla de logs de seguridad
  -- Por ahora solo registramos en los logs de Supabase
  RAISE LOG 'Security Event: % - % - User: % - Metadata: %', 
    event_type, event_description, user_id, metadata;
END;
$$;

-- Función cleanup_old_failed_attempts con search_path seguro
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM failed_login_attempts 
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Función check_login_rate_limit con search_path seguro
CREATE OR REPLACE FUNCTION check_login_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  attempt_count integer;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM failed_login_attempts
  WHERE email = user_email
  AND attempted_at > NOW() - INTERVAL '15 minutes';
  
  RETURN attempt_count < 5; -- Máximo 5 intentos en 15 minutos
END;
$$;

-- Función record_failed_login con search_path seguro
CREATE OR REPLACE FUNCTION record_failed_login(
  user_email text,
  user_ip inet DEFAULT NULL,
  user_agent_info text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO failed_login_attempts (email, ip_address, user_agent)
  VALUES (user_email, user_ip, user_agent_info);
END;
$$;

-- Función clear_failed_attempts con search_path seguro
CREATE OR REPLACE FUNCTION clear_failed_attempts(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM failed_login_attempts WHERE email = user_email;
END;
$$;

-- Función get_security_config con search_path seguro
CREATE OR REPLACE FUNCTION get_security_config(config_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  config_value jsonb;
BEGIN
  -- Solo admins pueden acceder a la configuración de seguridad
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  SELECT value INTO config_value
  FROM security_config
  WHERE key = config_key;
  
  RETURN COALESCE(config_value, '{}'::jsonb);
END;
$$;

-- 7. COMENTARIOS Y DOCUMENTACIÓN
-- ===================================================
COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario actual es administrador (search_path seguro)';
COMMENT ON FUNCTION is_doctor() IS 'Verifica si el usuario actual es doctor (search_path seguro)';
COMMENT ON FUNCTION is_patient() IS 'Verifica si el usuario actual es paciente (search_path seguro)';
COMMENT ON FUNCTION is_clinic() IS 'Verifica si el usuario actual es clínica (search_path seguro)';
COMMENT ON FUNCTION is_laboratory() IS 'Verifica si el usuario actual es laboratorio (search_path seguro)';
COMMENT ON FUNCTION validate_password(text) IS 'Valida la fortaleza de contraseñas (search_path seguro)';
COMMENT ON FUNCTION handle_new_user() IS 'Trigger para crear perfiles automáticamente (search_path seguro)';

-- ===================================================
-- FIN DE MIGRACIÓN CRÍTICA DE SEGURIDAD
-- ===================================================
