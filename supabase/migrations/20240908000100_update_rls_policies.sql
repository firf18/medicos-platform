-- Eliminar políticas existentes si existen
DO $$
BEGIN
    -- Eliminar políticas de profiles
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Los usuarios pueden ver solo su propio perfil" ON public.profiles;
        DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON public.profiles;
        DROP POLICY IF EXISTS "Los usuarios pueden actualizar solo su propio perfil" ON public.profiles;
    END IF;

    -- Eliminar políticas de doctors
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'doctors') THEN
        DROP POLICY IF EXISTS "Los doctores pueden ver su propia información" ON public.doctors;
        DROP POLICY IF EXISTS "Los administradores pueden ver toda la información de los doctores" ON public.doctors;
        DROP POLICY IF EXISTS "Los pacientes pueden ver información de los doctores" ON public.doctors;
    END IF;

    -- Eliminar políticas de patients
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients') THEN
        DROP POLICY IF EXISTS "Los pacientes pueden ver solo su propia información" ON public.patients;
        DROP POLICY IF EXISTS "Los doctores pueden ver información de sus pacientes" ON public.patients;
        DROP POLICY IF EXISTS "Los administradores pueden ver toda la información de los pacientes" ON public.patients;
    END IF;

    -- Eliminar políticas de appointments
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments') THEN
        DROP POLICY IF EXISTS "Los pacientes pueden ver sus propias citas" ON public.appointments;
        DROP POLICY IF EXISTS "Los doctores pueden ver sus citas" ON public.appointments;
        DROP POLICY IF EXISTS "Los administradores pueden ver todas las citas" ON public.appointments;
        DROP POLICY IF EXISTS "Los pacientes pueden crear citas" ON public.appointments;
    END IF;

    -- Eliminar políticas de medical_records
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_records') THEN
        DROP POLICY IF EXISTS "Los pacientes pueden ver sus propios registros médicos" ON public.medical_records;
        DROP POLICY IF EXISTS "Los doctores pueden ver los registros de sus pacientes" ON public.medical_records;
        DROP POLICY IF EXISTS "Los administradores pueden ver todos los registros médicos" ON public.medical_records;
    END IF;

    -- Eliminar políticas de clinics
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinics') THEN
        DROP POLICY IF EXISTS "Cualquier usuario puede ver la información de las clínicas" ON public.clinics;
        DROP POLICY IF EXISTS "Solo los administradores pueden modificar la información de las clínicas" ON public.clinics;
    END IF;

    -- Eliminar funciones si existen
    DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
    DROP FUNCTION IF EXISTS public.is_doctor() CASCADE;
    DROP FUNCTION IF EXISTS public.is_patient() CASCADE;
END $$;

-- Ahora, aplicar las nuevas políticas (el contenido del archivo anterior)
-- ... [Aquí iría el contenido completo del archivo anterior de políticas] ...

-- Función para verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es médico
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'doctor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es un paciente
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'patient'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS en las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla profiles
-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver solo su propio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Los administradores pueden ver todos los perfiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- Los usuarios pueden actualizar solo su propio perfil
CREATE POLICY "Los usuarios pueden actualizar solo su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Políticas para la tabla doctors
-- Los doctores pueden ver su propia información
CREATE POLICY "Los doctores pueden ver su propia información"
ON public.doctors FOR SELECT
USING (auth.uid() = id);

-- Los administradores pueden ver toda la información de los doctores
CREATE POLICY "Los administradores pueden ver toda la información de los doctores"
ON public.doctors FOR ALL
USING (public.is_admin());

-- Los pacientes pueden ver información básica de los doctores
CREATE POLICY "Los pacientes pueden ver información de los doctores"
ON public.doctors FOR SELECT
USING (true);

-- Políticas para la tabla patients
-- Los pacientes pueden ver solo su propia información
CREATE POLICY "Los pacientes pueden ver solo su propia información"
ON public.patients FOR SELECT
USING (auth.uid() = id);

-- Los doctores pueden ver información de sus pacientes
CREATE POLICY "Los doctores pueden ver información de sus pacientes"
ON public.patients FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.appointments 
  WHERE appointments.patient_id = patients.id 
  AND appointments.doctor_id = auth.uid()
));

-- Los administradores pueden ver toda la información de los pacientes
CREATE POLICY "Los administradores pueden ver toda la información de los pacientes"
ON public.patients FOR ALL
USING (public.is_admin());

-- Políticas para la tabla appointments
-- Los pacientes pueden ver sus propias citas
CREATE POLICY "Los pacientes pueden ver sus propias citas"
ON public.appointments FOR SELECT
USING (patient_id = auth.uid());

-- Los doctores pueden ver las citas que tienen asignadas
CREATE POLICY "Los doctores pueden ver sus citas"
ON public.appointments FOR SELECT
USING (doctor_id = auth.uid());

-- Los administradores pueden ver todas las citas
CREATE POLICY "Los administradores pueden ver todas las citas"
ON public.appointments FOR ALL
USING (public.is_admin());

-- Los pacientes pueden crear citas
CREATE POLICY "Los pacientes pueden crear citas"
ON public.appointments FOR INSERT
WITH CHECK (patient_id = auth.uid() AND status = 'scheduled');

-- Políticas para la tabla medical_records
-- Los pacientes pueden ver sus propios registros médicos
CREATE POLICY "Los pacientes pueden ver sus propios registros médicos"
ON public.medical_records FOR SELECT
USING (patient_id = auth.uid());

-- Los doctores pueden ver los registros médicos de sus pacientes
CREATE POLICY "Los doctores pueden ver los registros de sus pacientes"
ON public.medical_records FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.appointments 
  WHERE appointments.id = medical_records.appointment_id 
  AND appointments.doctor_id = auth.uid()
));

-- Los administradores pueden ver todos los registros médicos
CREATE POLICY "Los administradores pueden ver todos los registros médicos"
ON public.medical_records FOR ALL
USING (public.is_admin());

-- Políticas para la tabla clinics
-- Todos los usuarios pueden ver la información de las clínicas
CREATE POLICY "Cualquier usuario puede ver la información de las clínicas"
ON public.clinics FOR SELECT
USING (true);

-- Solo los administradores pueden modificar la información de las clínicas
CREATE POLICY "Solo los administradores pueden modificar la información de las clínicas"
ON public.clinics FOR ALL
USING (public.is_admin());
