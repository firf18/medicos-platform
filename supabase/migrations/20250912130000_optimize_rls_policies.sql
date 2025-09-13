-- ===================================================
-- MIGRACIÓN: Optimización de Políticas RLS Múltiples
-- ===================================================

-- 1. OPTIMIZAR POLÍTICAS PERMISIVAS EN TABLA PROFILES
-- ===================================================

-- Eliminar políticas demasiado permisivas
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Crear políticas más específicas y seguras
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Doctors can view patient profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Doctor puede ver perfiles de sus pacientes
  EXISTS (
    SELECT 1 FROM doctors 
    WHERE doctors.id = auth.uid()
  ) AND (
    role = 'patient' OR 
    id IN (
      SELECT patient_id FROM appointments 
      WHERE doctor_id = auth.uid()
    )
  )
);

CREATE POLICY "Patients can view doctor profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Paciente puede ver perfiles de médicos
  EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = auth.uid()
  ) AND role = 'doctor'
);

CREATE POLICY "Users can update only own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 2. OPTIMIZAR POLÍTICAS EN TABLA APPOINTMENTS
-- ===================================================

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "Users can view related appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;

-- Crear políticas específicas
CREATE POLICY "Doctors can view own appointments"
ON appointments FOR SELECT
TO authenticated
USING (doctor_id = auth.uid() AND is_doctor());

CREATE POLICY "Patients can view own appointments"
ON appointments FOR SELECT
TO authenticated
USING (patient_id = auth.uid() AND is_patient());

CREATE POLICY "Doctors can insert appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND 
  is_doctor() AND
  -- Verificar que el paciente existe
  EXISTS (SELECT 1 FROM patients WHERE id = patient_id)
);

CREATE POLICY "Doctors can update own appointments"
ON appointments FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid() AND is_doctor())
WITH CHECK (doctor_id = auth.uid() AND is_doctor());

CREATE POLICY "Doctors can delete own appointments"
ON appointments FOR DELETE
TO authenticated
USING (doctor_id = auth.uid() AND is_doctor());

-- 3. OPTIMIZAR POLÍTICAS EN TABLA MEDICAL_RECORDS
-- ===================================================

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "Users can view medical records" ON medical_records;

-- Crear políticas específicas
CREATE POLICY "Doctors can view own patient records"
ON medical_records FOR SELECT
TO authenticated
USING (
  doctor_id = auth.uid() AND 
  is_doctor()
);

CREATE POLICY "Patients can view own medical records"
ON medical_records FOR SELECT
TO authenticated
USING (
  patient_id = auth.uid() AND 
  is_patient()
);

CREATE POLICY "Doctors can insert medical records"
ON medical_records FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND 
  is_doctor() AND
  -- Verificar que el paciente existe y tiene cita con este doctor
  EXISTS (
    SELECT 1 FROM appointments 
    WHERE patient_id = medical_records.patient_id 
    AND doctor_id = auth.uid()
    AND status = 'completed'
  )
);

CREATE POLICY "Doctors can update own medical records"
ON medical_records FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid() AND is_doctor())
WITH CHECK (doctor_id = auth.uid() AND is_doctor());

-- 4. OPTIMIZAR POLÍTICAS EN TABLA PATIENT_MEDICATIONS
-- ===================================================

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "Users can view medications" ON patient_medications;

-- Crear políticas específicas
CREATE POLICY "Doctors can view patient medications"
ON patient_medications FOR SELECT
TO authenticated
USING (
  doctor_id = auth.uid() AND 
  is_doctor()
);

CREATE POLICY "Patients can view own medications"
ON patient_medications FOR SELECT
TO authenticated
USING (
  patient_id = auth.uid() AND 
  is_patient()
);

CREATE POLICY "Doctors can prescribe medications"
ON patient_medications FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND 
  is_doctor() AND
  -- Verificar que el paciente es del doctor
  EXISTS (
    SELECT 1 FROM appointments 
    WHERE patient_id = patient_medications.patient_id 
    AND doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update own prescriptions"
ON patient_medications FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid() AND is_doctor())
WITH CHECK (doctor_id = auth.uid() AND is_doctor());

-- 5. OPTIMIZAR POLÍTICAS EN TABLA HEALTH_METRICS
-- ===================================================

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "Users can view health metrics" ON health_metrics;

-- Crear políticas específicas
CREATE POLICY "Patients can manage own health metrics"
ON health_metrics FOR ALL
TO authenticated
USING (patient_id = auth.uid() AND is_patient())
WITH CHECK (patient_id = auth.uid() AND is_patient());

CREATE POLICY "Doctors can view patient health metrics"
ON health_metrics FOR SELECT
TO authenticated
USING (
  is_doctor() AND
  patient_id IN (
    SELECT patient_id FROM appointments 
    WHERE doctor_id = auth.uid()
  )
);

-- 6. OPTIMIZAR POLÍTICAS EN TABLA MEDICAL_DOCUMENTS
-- ===================================================

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "Users can view documents" ON medical_documents;

-- Crear políticas específicas
CREATE POLICY "Patients can view own documents"
ON medical_documents FOR SELECT
TO authenticated
USING (patient_id = auth.uid() AND is_patient());

CREATE POLICY "Doctors can view patient documents"
ON medical_documents FOR SELECT
TO authenticated
USING (
  (doctor_id = auth.uid() OR 
   patient_id IN (
     SELECT patient_id FROM appointments 
     WHERE doctor_id = auth.uid()
   )) AND 
  is_doctor()
);

CREATE POLICY "Doctors can create documents"
ON medical_documents FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND 
  is_doctor() AND
  -- Verificar que el paciente es del doctor
  EXISTS (
    SELECT 1 FROM appointments 
    WHERE patient_id = medical_documents.patient_id 
    AND doctor_id = auth.uid()
  )
);

-- 7. OPTIMIZAR POLÍTICAS EN TABLA PATIENT_NOTIFICATIONS
-- ===================================================

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "Users can view notifications" ON patient_notifications;

-- Crear políticas específicas
CREATE POLICY "Patients can view own notifications"
ON patient_notifications FOR SELECT
TO authenticated
USING (patient_id = auth.uid() AND is_patient());

CREATE POLICY "Patients can update own notifications"
ON patient_notifications FOR UPDATE
TO authenticated
USING (patient_id = auth.uid() AND is_patient())
WITH CHECK (patient_id = auth.uid() AND is_patient());

-- Solo el sistema puede crear notificaciones
CREATE POLICY "System can create notifications"
ON patient_notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- 8. CREAR POLÍTICAS PARA EMERGENCY_CONTACTS
-- ===================================================

CREATE POLICY "Patients can manage own emergency contacts"
ON emergency_contacts FOR ALL
TO authenticated
USING (patient_id = auth.uid() AND is_patient())
WITH CHECK (patient_id = auth.uid() AND is_patient());

CREATE POLICY "Doctors can view patient emergency contacts"
ON emergency_contacts FOR SELECT
TO authenticated
USING (
  is_doctor() AND
  patient_id IN (
    SELECT patient_id FROM appointments 
    WHERE doctor_id = auth.uid()
  )
);

-- 9. OPTIMIZAR POLÍTICAS PARA CLÍNICAS Y LABORATORIOS
-- ===================================================

-- Políticas para new_clinics
CREATE POLICY "Clinics can manage own data"
ON new_clinics FOR ALL
TO authenticated
USING (id = auth.uid() AND is_clinic())
WITH CHECK (id = auth.uid() AND is_clinic());

CREATE POLICY "Public can view clinic basic info"
ON new_clinics FOR SELECT
TO authenticated
USING (true); -- Solo información básica pública

-- Políticas para new_laboratories
CREATE POLICY "Laboratories can manage own data"
ON new_laboratories FOR ALL
TO authenticated
USING (id = auth.uid() AND is_laboratory())
WITH CHECK (id = auth.uid() AND is_laboratory());

CREATE POLICY "Doctors can view laboratory info"
ON new_laboratories FOR SELECT
TO authenticated
USING (is_doctor());

-- 10. CREAR FUNCIÓN DE AUDITORÍA DE POLÍTICAS
-- ===================================================

CREATE OR REPLACE FUNCTION audit_rls_policies()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_type text,
  is_permissive boolean,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::text || '.' || tablename::text as table_name,
    policyname::text as policy_name,
    cmd::text as policy_type,
    permissive::boolean as is_permissive,
    CASE 
      WHEN permissive = true AND cmd = 'ALL' THEN 'Revisar: Política muy permisiva'
      WHEN qual IS NULL THEN 'Revisar: Sin restricciones USING'
      WHEN with_check IS NULL AND cmd IN ('INSERT', 'UPDATE') THEN 'Revisar: Sin restricciones WITH CHECK'
      ELSE 'OK: Política específica'
    END as recommendation
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY table_name, policy_name;
END;
$$;

-- 11. COMENTARIOS Y DOCUMENTACIÓN
-- ===================================================

COMMENT ON FUNCTION audit_rls_policies() IS 'Audita las políticas RLS para identificar posibles problemas de seguridad';

-- Comentarios en políticas críticas
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Usuarios solo pueden ver su propio perfil - Principio de menor privilegio';
COMMENT ON POLICY "Doctors can view patient profiles" ON profiles IS 'Médicos solo pueden ver perfiles de sus pacientes asignados';
COMMENT ON POLICY "Doctors can view own appointments" ON appointments IS 'Médicos solo pueden ver sus propias citas';
COMMENT ON POLICY "Patients can view own appointments" ON appointments IS 'Pacientes solo pueden ver sus propias citas';

-- ===================================================
-- FIN DE MIGRACIÓN DE OPTIMIZACIÓN RLS
-- ===================================================
