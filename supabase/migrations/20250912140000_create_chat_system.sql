-- ===================================================
-- MIGRACIÓN: Sistema de Chat entre Médicos y Pacientes
-- ===================================================

-- 1. CREAR TABLA DE CONVERSACIONES
-- ===================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadatos adicionales
  metadata JSONB DEFAULT '{}',
  
  -- Índices únicos
  UNIQUE(doctor_id, patient_id)
);

-- 2. CREAR TABLA DE MENSAJES
-- ===================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- Puede ser doctor o paciente
  sender_type TEXT NOT NULL CHECK (sender_type IN ('doctor', 'patient')),
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  
  -- Estados del mensaje
  is_read BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadatos para archivos/imágenes
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  
  -- Índices para performance
  INDEX idx_chat_messages_conversation_created (conversation_id, created_at DESC),
  INDEX idx_chat_messages_sender (sender_id, sender_type),
  INDEX idx_chat_messages_unread (conversation_id, is_read, created_at)
);

-- 3. CREAR TABLA DE PARTICIPANTES EN CONVERSACIONES
-- ===================================================
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  
  -- Estados del participante
  is_active BOOLEAN DEFAULT TRUE,
  is_muted BOOLEAN DEFAULT FALSE,
  is_typing BOOLEAN DEFAULT FALSE,
  
  -- Timestamps de actividad
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Configuraciones personales
  notification_settings JSONB DEFAULT '{"enabled": true, "sound": true, "desktop": true}',
  
  UNIQUE(conversation_id, user_id, user_type)
);

-- 4. CREAR TABLA DE NOTIFICACIONES DE CHAT
-- ===================================================
CREATE TABLE IF NOT EXISTS chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient')),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  
  -- Estado de la notificación
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  
  -- Tipo de notificación
  notification_type TEXT NOT NULL DEFAULT 'new_message' CHECK (
    notification_type IN ('new_message', 'mention', 'urgent', 'system')
  ),
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_chat_notifications_user (user_id, user_type, is_read),
  INDEX idx_chat_notifications_conversation (conversation_id, created_at DESC)
);

-- 5. CREAR ÍNDICES ADICIONALES PARA PERFORMANCE
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_chat_conversations_doctor ON chat_conversations(doctor_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_patient ON chat_conversations(patient_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status, last_message_at DESC);

-- 6. HABILITAR RLS EN TODAS LAS TABLAS
-- ===================================================
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS RLS PARA CHAT_CONVERSATIONS
-- ===================================================
CREATE POLICY "Doctors can view their own conversations"
ON chat_conversations FOR SELECT
TO authenticated
USING (
  doctor_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())
);

CREATE POLICY "Patients can view their own conversations"
ON chat_conversations FOR SELECT
TO authenticated
USING (
  patient_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM patients WHERE id = auth.uid())
);

CREATE POLICY "Doctors can create conversations with their patients"
ON chat_conversations FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid()) AND
  EXISTS (SELECT 1 FROM patients WHERE id = patient_id)
);

CREATE POLICY "Participants can update conversation metadata"
ON chat_conversations FOR UPDATE
TO authenticated
USING (
  (doctor_id = auth.uid() AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())) OR
  (patient_id = auth.uid() AND EXISTS (SELECT 1 FROM patients WHERE id = auth.uid()))
)
WITH CHECK (
  (doctor_id = auth.uid() AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())) OR
  (patient_id = auth.uid() AND EXISTS (SELECT 1 FROM patients WHERE id = auth.uid()))
);

-- 8. CREAR POLÍTICAS RLS PARA CHAT_MESSAGES
-- ===================================================
CREATE POLICY "Conversation participants can view messages"
ON chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id AND (
      (c.doctor_id = auth.uid() AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())) OR
      (c.patient_id = auth.uid() AND EXISTS (SELECT 1 FROM patients WHERE id = auth.uid()))
    )
  )
);

CREATE POLICY "Conversation participants can send messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id AND (
      (c.doctor_id = auth.uid() AND sender_type = 'doctor' AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())) OR
      (c.patient_id = auth.uid() AND sender_type = 'patient' AND EXISTS (SELECT 1 FROM patients WHERE id = auth.uid()))
    )
  )
);

CREATE POLICY "Users can update their own messages"
ON chat_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- 9. CREAR POLÍTICAS RLS PARA CHAT_PARTICIPANTS
-- ===================================================
CREATE POLICY "Users can view their own participation"
ON chat_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND (
    (user_type = 'doctor' AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())) OR
    (user_type = 'patient' AND EXISTS (SELECT 1 FROM patients WHERE id = auth.uid()))
  )
);

CREATE POLICY "Users can update their own participation settings"
ON chat_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. CREAR POLÍTICAS RLS PARA CHAT_NOTIFICATIONS
-- ===================================================
CREATE POLICY "Users can view their own notifications"
ON chat_notifications FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND (
    (user_type = 'doctor' AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())) OR
    (user_type = 'patient' AND EXISTS (SELECT 1 FROM patients WHERE id = auth.uid()))
  )
);

CREATE POLICY "Users can update their own notifications"
ON chat_notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Solo el sistema puede crear notificaciones
CREATE POLICY "System can create notifications"
ON chat_notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- 11. CREAR TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ===================================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar last_message_at en la conversación
  UPDATE chat_conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  -- Crear notificación para el otro participante
  INSERT INTO chat_notifications (
    user_id, 
    user_type, 
    conversation_id, 
    message_id, 
    notification_type
  )
  SELECT 
    CASE 
      WHEN NEW.sender_type = 'doctor' THEN c.patient_id
      ELSE c.doctor_id
    END as user_id,
    CASE 
      WHEN NEW.sender_type = 'doctor' THEN 'patient'
      ELSE 'doctor'
    END as user_type,
    NEW.conversation_id,
    NEW.id,
    'new_message'
  FROM chat_conversations c
  WHERE c.id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- 12. CREAR FUNCIONES ÚTILES PARA EL CHAT
-- ===================================================

-- Función para obtener conversaciones con información del último mensaje
CREATE OR REPLACE FUNCTION get_user_conversations(
  user_id UUID,
  user_type TEXT
)
RETURNS TABLE(
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_type TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  conversation_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    CASE 
      WHEN user_type = 'doctor' THEN c.patient_id
      ELSE c.doctor_id
    END as other_user_id,
    CASE 
      WHEN user_type = 'doctor' THEN 
        COALESCE(pp.first_name || ' ' || pp.last_name, pp.email)
      ELSE 
        COALESCE('Dr. ' || pd.first_name || ' ' || pd.last_name, pd.email)
    END as other_user_name,
    CASE 
      WHEN user_type = 'doctor' THEN 'patient'
      ELSE 'doctor'
    END as other_user_type,
    COALESCE(lm.message_text, '') as last_message,
    c.last_message_at,
    COALESCE(unread.count, 0) as unread_count,
    c.status as conversation_status
  FROM chat_conversations c
  LEFT JOIN profiles pp ON pp.id = c.patient_id
  LEFT JOIN profiles pd ON pd.id = c.doctor_id
  LEFT JOIN LATERAL (
    SELECT message_text
    FROM chat_messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM chat_messages
    WHERE conversation_id = c.id
    AND sender_id != get_user_conversations.user_id
    AND is_read = false
  ) unread ON true
  WHERE (
    (get_user_conversations.user_type = 'doctor' AND c.doctor_id = get_user_conversations.user_id) OR
    (get_user_conversations.user_type = 'patient' AND c.patient_id = get_user_conversations.user_id)
  )
  ORDER BY c.last_message_at DESC;
END;
$$;

-- Función para marcar mensajes como leídos
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  conversation_id UUID,
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Marcar mensajes como leídos
  UPDATE chat_messages
  SET is_read = true, read_at = NOW()
  WHERE chat_messages.conversation_id = mark_messages_as_read.conversation_id
  AND sender_id != mark_messages_as_read.user_id
  AND is_read = false;
  
  -- Marcar notificaciones como leídas
  UPDATE chat_notifications
  SET is_read = true, read_at = NOW()
  WHERE chat_notifications.conversation_id = mark_messages_as_read.conversation_id
  AND chat_notifications.user_id = mark_messages_as_read.user_id
  AND is_read = false;
END;
$$;

-- 13. COMENTARIOS Y DOCUMENTACIÓN
-- ===================================================
COMMENT ON TABLE chat_conversations IS 'Conversaciones entre médicos y pacientes';
COMMENT ON TABLE chat_messages IS 'Mensajes individuales en las conversaciones';
COMMENT ON TABLE chat_participants IS 'Información de participantes en conversaciones';
COMMENT ON TABLE chat_notifications IS 'Notificaciones de chat para usuarios';

COMMENT ON FUNCTION get_user_conversations(UUID, TEXT) IS 'Obtiene conversaciones de un usuario con información del último mensaje y conteo de no leídos';
COMMENT ON FUNCTION mark_messages_as_read(UUID, UUID) IS 'Marca mensajes como leídos en una conversación específica';

-- ===================================================
-- FIN DE MIGRACIÓN DEL SISTEMA DE CHAT
-- ===================================================
