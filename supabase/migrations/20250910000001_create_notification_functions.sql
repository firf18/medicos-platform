-- Función para crear notificaciones para pacientes
CREATE OR REPLACE FUNCTION public.create_patient_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_entity_type,
    p_related_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones para médicos
CREATE OR REPLACE FUNCTION public.create_doctor_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_entity_type,
    p_related_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones para clínicas
CREATE OR REPLACE FUNCTION public.create_clinic_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_entity_type,
    p_related_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones para laboratorios
CREATE OR REPLACE FUNCTION public.create_laboratory_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_entity_type,
    p_related_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones para administradores
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_entity_type,
    p_related_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones masivas para todos los usuarios de un tipo específico
CREATE OR REPLACE FUNCTION public.create_mass_notification(
  p_role TEXT,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type
  )
  SELECT 
    p.id,
    p_title,
    p_message,
    p_type
  FROM public.profiles p
  WHERE p.role = p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones cuando se crea una cita
CREATE OR REPLACE FUNCTION public.create_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificación para el paciente
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    NEW.patient_id,
    'Nueva cita programada',
    'Tienes una nueva cita con ' || 
    (SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = NEW.doctor_id) ||
    ' el ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' a las ' || TO_CHAR(NEW.appointment_date, 'HH24:MI'),
    'info',
    'appointment',
    NEW.id
  );

  -- Notificación para el médico
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    NEW.doctor_id,
    'Nueva cita programada',
    'Tienes una nueva cita con ' || 
    (SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = NEW.patient_id) ||
    ' el ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' a las ' || TO_CHAR(NEW.appointment_date, 'HH24:MI'),
    'info',
    'appointment',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear notificaciones cuando se crea una cita
CREATE OR REPLACE TRIGGER appointment_notification_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_appointment_notification();

-- Función para crear notificaciones cuando se publica un resultado de laboratorio
CREATE OR REPLACE FUNCTION public.create_lab_result_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificación para el paciente
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id
  ) VALUES (
    NEW.patient_id,
    'Resultado de laboratorio disponible',
    'El resultado de tu ' || NEW.test_name || ' está disponible',
    'success',
    'lab_result',
    NEW.id
  );

  -- Notificación para el médico si existe
  IF NEW.doctor_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_entity_type,
      related_entity_id
    ) VALUES (
      NEW.doctor_id,
      'Resultado de laboratorio disponible',
      'El resultado de ' || NEW.test_name || ' para ' || 
      (SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = NEW.patient_id) || 
      ' está disponible',
      'info',
      'lab_result',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear notificaciones cuando se publica un resultado de laboratorio
CREATE OR REPLACE TRIGGER lab_result_notification_trigger
  AFTER INSERT ON public.lab_results
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lab_result_notification();