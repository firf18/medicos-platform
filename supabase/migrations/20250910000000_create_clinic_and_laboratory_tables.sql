-- Crear tabla para clínicas
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para laboratorios
CREATE TABLE IF NOT EXISTS public.laboratories (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para asociar médicos con clínicas
CREATE TABLE IF NOT EXISTS public.clinic_doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  role VARCHAR(100), -- Ej: 'director', 'médico general', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para servicios de laboratorio
CREATE TABLE IF NOT EXISTS public.laboratory_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para resultados de laboratorio
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.laboratory_services(id) ON DELETE SET NULL,
  test_name VARCHAR(255) NOT NULL,
  result TEXT,
  result_file_url TEXT,
  is_critical BOOLEAN DEFAULT false,
  performed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
  is_read BOOLEAN DEFAULT false,
  related_entity_type VARCHAR(50), -- 'appointment', 'lab_result', 'message', etc.
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_clinics_id ON public.clinics(id);
CREATE INDEX IF NOT EXISTS idx_laboratories_id ON public.laboratories(id);
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_clinic_id ON public.clinic_doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_doctor_id ON public.clinic_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_laboratory_services_lab_id ON public.laboratory_services(laboratory_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_lab_id ON public.lab_results(laboratory_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON public.lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_doctor_id ON public.lab_results(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla clinics
-- Los usuarios pueden ver su propia clínica
CREATE POLICY "Los usuarios pueden ver su propia clínica"
ON public.clinics FOR SELECT
USING (auth.uid() = id);

-- Los administradores pueden ver todas las clínicas
CREATE POLICY "Los administradores pueden ver todas las clínicas"
ON public.clinics FOR SELECT
USING (public.is_admin());

-- Las clínicas pueden actualizar su propia información
CREATE POLICY "Las clínicas pueden actualizar su propia información"
ON public.clinics FOR UPDATE
USING (auth.uid() = id);

-- Las clínicas pueden insertar su propio registro (solo al registrarse)
CREATE POLICY "Las clínicas pueden insertar su propio registro"
ON public.clinics FOR INSERT
WITH CHECK (auth.uid() = id);

-- Políticas para la tabla laboratories
-- Los usuarios pueden ver su propio laboratorio
CREATE POLICY "Los usuarios pueden ver su propio laboratorio"
ON public.laboratories FOR SELECT
USING (auth.uid() = id);

-- Los administradores pueden ver todos los laboratorios
CREATE POLICY "Los administradores pueden ver todos los laboratorios"
ON public.laboratories FOR SELECT
USING (public.is_admin());

-- Los laboratorios pueden actualizar su propia información
CREATE POLICY "Los laboratorios pueden actualizar su propia información"
ON public.laboratories FOR UPDATE
USING (auth.uid() = id);

-- Los laboratorios pueden insertar su propio registro (solo al registrarse)
CREATE POLICY "Los laboratorios pueden insertar su propio registro"
ON public.laboratories FOR INSERT
WITH CHECK (auth.uid() = id);

-- Políticas para la tabla clinic_doctors
-- Los miembros de la clínica pueden ver asociaciones de su clínica
CREATE POLICY "Los miembros de la clínica pueden ver asociaciones de su clínica"
ON public.clinic_doctors FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.clinics 
  WHERE clinics.id = clinic_doctors.clinic_id 
  AND clinics.id = auth.uid()
));

-- Los médicos pueden ver sus asociaciones con clínicas
CREATE POLICY "Los médicos pueden ver sus asociaciones con clínicas"
ON public.clinic_doctors FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.doctors 
  WHERE doctors.id = clinic_doctors.doctor_id 
  AND doctors.id = auth.uid()
));

-- Los administradores pueden ver todas las asociaciones
CREATE POLICY "Los administradores pueden ver todas las asociaciones"
ON public.clinic_doctors FOR SELECT
USING (public.is_admin());

-- Las clínicas pueden insertar asociaciones para su propia clínica
CREATE POLICY "Las clínicas pueden insertar asociaciones para su propia clínica"
ON public.clinic_doctors FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.clinics 
  WHERE clinics.id = clinic_doctors.clinic_id 
  AND clinics.id = auth.uid()
));

-- Las clínicas pueden actualizar asociaciones de su propia clínica
CREATE POLICY "Las clínicas pueden actualizar asociaciones de su propia clínica"
ON public.clinic_doctors FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.clinics 
  WHERE clinics.id = clinic_doctors.clinic_id 
  AND clinics.id = auth.uid()
));

-- Las clínicas pueden eliminar asociaciones de su propia clínica
CREATE POLICY "Las clínicas pueden eliminar asociaciones de su propia clínica"
ON public.clinic_doctors FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.clinics 
  WHERE clinics.id = clinic_doctors.clinic_id 
  AND clinics.id = auth.uid()
));

-- Políticas para la tabla laboratory_services
-- Los laboratorios pueden ver sus servicios
CREATE POLICY "Los laboratorios pueden ver sus servicios"
ON public.laboratory_services FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = laboratory_services.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Los médicos pueden ver servicios de laboratorios con los que colaboran
CREATE POLICY "Los médicos pueden ver servicios de laboratorios"
ON public.laboratory_services FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.lab_results lr
  JOIN public.appointments a ON lr.patient_id = a.patient_id
  WHERE a.doctor_id = auth.uid()
));

-- Los pacientes pueden ver servicios de laboratorios que han utilizado
CREATE POLICY "Los pacientes pueden ver servicios de laboratorios utilizados"
ON public.laboratory_services FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.lab_results 
  WHERE lab_results.service_id = laboratory_services.id 
  AND lab_results.patient_id = auth.uid()
));

-- Los administradores pueden ver todos los servicios
CREATE POLICY "Los administradores pueden ver todos los servicios"
ON public.laboratory_services FOR SELECT
USING (public.is_admin());

-- Los laboratorios pueden insertar sus propios servicios
CREATE POLICY "Los laboratorios pueden insertar sus propios servicios"
ON public.laboratory_services FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = laboratory_services.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Los laboratorios pueden actualizar sus propios servicios
CREATE POLICY "Los laboratorios pueden actualizar sus propios servicios"
ON public.laboratory_services FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = laboratory_services.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Los laboratorios pueden eliminar sus propios servicios
CREATE POLICY "Los laboratorios pueden eliminar sus propios servicios"
ON public.laboratory_services FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = laboratory_services.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Políticas para la tabla lab_results
-- Los laboratorios pueden ver sus resultados
CREATE POLICY "Los laboratorios pueden ver sus resultados"
ON public.lab_results FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = lab_results.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Los pacientes pueden ver sus resultados
CREATE POLICY "Los pacientes pueden ver sus resultados"
ON public.lab_results FOR SELECT
USING (auth.uid() = patient_id);

-- Los médicos pueden ver resultados de sus pacientes
CREATE POLICY "Los médicos pueden ver resultados de sus pacientes"
ON public.lab_results FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.appointments 
  WHERE appointments.patient_id = lab_results.patient_id 
  AND appointments.doctor_id = auth.uid()
));

-- Los administradores pueden ver todos los resultados
CREATE POLICY "Los administradores pueden ver todos los resultados"
ON public.lab_results FOR SELECT
USING (public.is_admin());

-- Los laboratorios pueden insertar resultados
CREATE POLICY "Los laboratorios pueden insertar resultados"
ON public.lab_results FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = lab_results.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Los laboratorios pueden actualizar sus resultados
CREATE POLICY "Los laboratorios pueden actualizar sus resultados"
ON public.lab_results FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.laboratories 
  WHERE laboratories.id = lab_results.laboratory_id 
  AND laboratories.id = auth.uid()
));

-- Políticas para la tabla notifications
-- Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias notificaciones (marcar como leídas)
CREATE POLICY "Los usuarios pueden actualizar sus propias notificaciones"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios pueden insertar notificaciones para sí mismos
CREATE POLICY "Los usuarios pueden insertar notificaciones para sí mismos"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden ver todas las notificaciones
CREATE POLICY "Los administradores pueden ver todas las notificaciones"
ON public.notifications FOR SELECT
USING (public.is_admin());

-- Los administradores pueden insertar notificaciones para cualquier usuario
CREATE POLICY "Los administradores pueden insertar notificaciones para cualquier usuario"
ON public.notifications FOR INSERT
WITH CHECK (public.is_admin());

-- Los administradores pueden actualizar cualquier notificación
CREATE POLICY "Los administradores pueden actualizar cualquier notificación"
ON public.notifications FOR UPDATE
USING (public.is_admin());