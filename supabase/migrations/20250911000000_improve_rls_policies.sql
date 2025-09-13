-- Mejoras en las políticas RLS para mayor seguridad y eficiencia

-- Eliminar funciones redundantes y crear funciones optimizadas
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_doctor() CASCADE;
DROP FUNCTION IF EXISTS public.is_patient() CASCADE;
DROP FUNCTION IF EXISTS public.is_clinic() CASCADE;
DROP FUNCTION IF EXISTS public.is_laboratory() CASCADE;

-- Función optimizada para verificar roles de usuario
CREATE OR REPLACE FUNCTION public.check_user_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar múltiples roles permitidos
CREATE OR REPLACE FUNCTION public.check_user_roles(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario tiene acceso a datos de un paciente
CREATE OR REPLACE FUNCTION public.has_patient_access(patient_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    -- El propio paciente
    auth.uid() = patient_uuid OR
    -- Administradores
    public.check_user_role('admin') OR
    -- Médicos que tienen citas con el paciente
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.patient_id = patient_uuid 
      AND appointments.doctor_id = auth.uid()
    ) OR
    -- Cuidadores autorizados con acceso activo
    EXISTS (
      SELECT 1 FROM public.patient_caregivers pc
      WHERE pc.patient_id = patient_uuid
      AND pc.caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND pc.is_active = true
      AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario tiene acceso a datos de un médico
CREATE OR REPLACE FUNCTION public.has_doctor_access(doctor_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    -- El propio médico
    auth.uid() = doctor_uuid OR
    -- Administradores
    public.check_user_role('admin') OR
    -- Médicos de la misma clínica
    EXISTS (
      SELECT 1 FROM public.clinic_doctors cd1
      JOIN public.clinic_doctors cd2 ON cd1.clinic_id = cd2.clinic_id
      WHERE cd1.doctor_id = doctor_uuid AND cd2.doctor_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas mejoradas para la tabla patients
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Los pacientes pueden ver solo su propia información" ON public.patients;
DROP POLICY IF EXISTS "Los doctores pueden ver información de sus pacientes" ON public.patients;
DROP POLICY IF EXISTS "Los administradores pueden ver toda la información de los pacientes" ON public.patients;

-- Nueva política unificada
CREATE POLICY "Usuarios autorizados pueden acceder a información de pacientes"
ON public.patients FOR ALL
USING (public.has_patient_access(id));

-- Políticas mejoradas para la tabla medical_records
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Los pacientes pueden ver sus propios registros médicos" ON public.medical_records;
DROP POLICY IF EXISTS "Los doctores pueden ver los registros de sus pacientes" ON public.medical_records;
DROP POLICY IF EXISTS "Los administradores pueden ver todos los registros médicos" ON public.medical_records;

-- Nueva política unificada
CREATE POLICY "Usuarios autorizados pueden acceder a registros médicos"
ON public.medical_records FOR ALL
USING (
  -- Acceso al registro directamente
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = medical_records.patient_id
    AND public.has_patient_access(p.id)
  ) OR
  -- Acceso a través de la cita asociada
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.patients p ON p.id = a.patient_id
    WHERE a.id = medical_records.appointment_id
    AND public.has_patient_access(p.id)
  )
);

-- Políticas mejoradas para la tabla lab_results
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Los laboratorios pueden ver sus resultados" ON public.lab_results;
DROP POLICY IF EXISTS "Los pacientes pueden ver sus resultados" ON public.lab_results;
DROP POLICY IF EXISTS "Los médicos pueden ver resultados de sus pacientes" ON public.lab_results;
DROP POLICY IF EXISTS "Los administradores pueden ver todos los resultados" ON public.lab_results;

-- Nueva política unificada
CREATE POLICY "Usuarios autorizados pueden acceder a resultados de laboratorio"
ON public.lab_results FOR ALL
USING (
  -- El laboratorio que generó el resultado
  EXISTS (
    SELECT 1 FROM public.laboratories l
    WHERE l.id = lab_results.laboratory_id
    AND l.id = auth.uid()
  ) OR
  -- Usuarios con acceso al paciente
  public.has_patient_access(lab_results.patient_id)
);

-- Políticas mejoradas para la tabla appointments
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Los pacientes pueden ver sus propias citas" ON public.appointments;
DROP POLICY IF EXISTS "Los doctores pueden ver sus citas" ON public.appointments;
DROP POLICY IF EXISTS "Los administradores pueden ver todas las citas" ON public.appointments;
DROP POLICY IF EXISTS "Los pacientes pueden crear citas" ON public.appointments;

-- Nueva política unificada para SELECT
CREATE POLICY "Usuarios autorizados pueden ver citas"
ON public.appointments FOR SELECT
USING (
  patient_id = auth.uid() OR
  doctor_id = auth.uid() OR
  public.check_user_role('admin') OR
  -- Personal de clínica con acceso al médico
  EXISTS (
    SELECT 1 FROM public.clinic_doctors cd
    JOIN public.doctors d ON d.id = cd.doctor_id
    WHERE d.id = appointments.doctor_id
    AND cd.clinic_id IN (
      SELECT clinic_id FROM public.clinic_doctors WHERE doctor_id = auth.uid()
    )
    AND public.check_user_role('clinic')
  )
);

-- Política para INSERT
CREATE POLICY "Pacientes y administradores pueden crear citas"
ON public.appointments FOR INSERT
WITH CHECK (
  (patient_id = auth.uid() AND public.check_user_role('patient')) OR
  public.check_user_role('admin')
);

-- Política para UPDATE
CREATE POLICY "Participantes pueden actualizar citas"
ON public.appointments FOR UPDATE
USING (
  patient_id = auth.uid() OR
  doctor_id = auth.uid() OR
  public.check_user_role('admin')
);

-- Políticas mejoradas para la tabla notifications
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias notificaciones" ON public.notifications;
DROP POLICY IF EXISTS "Los administradores pueden ver todas las notificaciones" ON public.notifications;

-- Política para SELECT
CREATE POLICY "Usuarios pueden ver sus notificaciones"
ON public.notifications FOR SELECT
USING (
  user_id = auth.uid() OR
  public.check_user_role('admin')
);

-- Política para INSERT
CREATE POLICY "Usuarios pueden crear notificaciones para sí mismos o administradores para cualquier usuario"
ON public.notifications FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  public.check_user_role('admin')
);

-- Política para UPDATE
CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
ON public.notifications FOR UPDATE
USING (
  user_id = auth.uid() OR
  public.check_user_role('admin')
);

-- Políticas mejoradas para datos sensibles del paciente
-- Política para emergency_medical_info
DROP POLICY IF EXISTS "Patients can manage their emergency medical info" ON public.emergency_medical_info;
DROP POLICY IF EXISTS "Doctors can view emergency medical info of their patients" ON public.emergency_medical_info;

CREATE POLICY "Usuarios autorizados pueden acceder a información médica de emergencia"
ON public.emergency_medical_info FOR ALL
USING (public.has_patient_access(patient_id));

-- Política para patient_medications
DROP POLICY IF EXISTS "Patients can view their medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Patients can update medication adherence and side effects" ON public.patient_medications;
DROP POLICY IF EXISTS "Doctors can manage medications for their patients" ON public.patient_medications;

CREATE POLICY "Usuarios autorizados pueden gestionar medicamentos"
ON public.patient_medications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_medications.patient_id
    AND public.has_patient_access(p.id)
  )
);

-- Política para health_metrics
DROP POLICY IF EXISTS "Patients can manage their health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Doctors can view health metrics of their patients" ON public.health_metrics;

CREATE POLICY "Usuarios autorizados pueden acceder a métricas de salud"
ON public.health_metrics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = health_metrics.patient_id
    AND public.has_patient_access(p.id)
  )
);

-- Política para medical_documents
DROP POLICY IF EXISTS "Patients can view their medical documents" ON public.medical_documents;
DROP POLICY IF EXISTS "Doctors can manage medical documents for their patients" ON public.medical_documents;

CREATE POLICY "Usuarios autorizados pueden acceder a documentos médicos"
ON public.medical_documents FOR ALL
USING (
  -- Acceso directo del paciente
  patient_id = auth.uid() OR
  -- Acceso del médico tratante
  doctor_id = auth.uid() OR
  -- Acceso de administradores
  public.check_user_role('admin') OR
  -- Acceso de cuidadores si el documento está compartido
  (
    shared_with_caregivers = true AND
    EXISTS (
      SELECT 1 FROM public.patient_caregivers pc
      WHERE pc.patient_id = medical_documents.patient_id
      AND pc.caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND pc.is_active = true
      AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
    )
  )
);

-- Índices adicionales para mejorar el rendimiento de las políticas
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_patient ON public.appointments(doctor_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_active ON public.patient_caregivers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_clinic_doctor ON public.clinic_doctors(clinic_id, doctor_id);

-- Comentarios para documentación
COMMENT ON FUNCTION public.check_user_role(TEXT) IS 'Verifica si el usuario actual tiene un rol específico';
COMMENT ON FUNCTION public.check_user_roles(TEXT[]) IS 'Verifica si el usuario actual tiene alguno de los roles especificados';
COMMENT ON FUNCTION public.has_patient_access(UUID) IS 'Verifica si el usuario actual tiene acceso a los datos de un paciente específico';
COMMENT ON FUNCTION public.has_doctor_access(UUID) IS 'Verifica si el usuario actual tiene acceso a los datos de un médico específico';