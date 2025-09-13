-- ===================================================
-- MIGRACIÓN: Optimización de Índices de Base de Datos
-- ===================================================

-- 1. AGREGAR ÍNDICES FALTANTES PARA FOREIGN KEYS
-- ===================================================
-- Estos índices mejoran significativamente el rendimiento de JOINs y queries

-- Índice para emergency_incidents.patient_id
CREATE INDEX IF NOT EXISTS idx_emergency_incidents_patient_id 
ON emergency_incidents(patient_id);

-- Índice para health_plans.doctor_id  
CREATE INDEX IF NOT EXISTS idx_health_plans_doctor_id 
ON health_plans(doctor_id);

-- Índice para lab_results.service_id
CREATE INDEX IF NOT EXISTS idx_lab_results_service_id 
ON lab_results(service_id);

-- Índice para medical_documents.doctor_id
CREATE INDEX IF NOT EXISTS idx_medical_documents_doctor_id 
ON medical_documents(doctor_id);

-- Índice para patient_medications.doctor_id
CREATE INDEX IF NOT EXISTS idx_patient_medications_doctor_id 
ON patient_medications(doctor_id);

-- 2. ELIMINAR ÍNDICES DUPLICADOS
-- ===================================================
-- idx_doctors_specialty es idéntico a idx_doctors_specialty_id
DROP INDEX IF EXISTS idx_doctors_specialty;

-- 3. AGREGAR ÍNDICES COMPUESTOS PARA QUERIES COMUNES
-- ===================================================

-- Índice compuesto para appointments por paciente y fecha
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date 
ON appointments(patient_id, appointment_date) 
WHERE status = 'scheduled';

-- Índice para medical_records por paciente y fecha
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_created 
ON medical_records(patient_id, created_at DESC);

-- Índice para patient_notifications no leídas
CREATE INDEX IF NOT EXISTS idx_patient_notifications_unread 
ON patient_notifications(patient_id, created_at DESC) 
WHERE is_read = false;

-- Índice para health_metrics recientes
CREATE INDEX IF NOT EXISTS idx_health_metrics_recent 
ON health_metrics(patient_id, recorded_at DESC);

-- Índice para patient_medications activas
CREATE INDEX IF NOT EXISTS idx_patient_medications_active 
ON patient_medications(patient_id, start_date DESC) 
WHERE is_active = true;

-- 4. OPTIMIZAR ÍNDICES EXISTENTES SI ES NECESARIO
-- ===================================================

-- Recrear índice de profiles_email si no es único
DROP INDEX IF EXISTS idx_profiles_email;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON profiles(email);

-- 5. AGREGAR ÍNDICES PARA BÚSQUEDAS DE TEXTO
-- ===================================================

-- Índice para búsqueda de doctores por nombre
CREATE INDEX IF NOT EXISTS idx_doctors_fullname_search 
ON doctors USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- Índice para búsqueda de pacientes por nombre  
CREATE INDEX IF NOT EXISTS idx_patients_fullname_search 
ON patients USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- Nota: Estos índices GIN requieren la extensión pg_trgm
-- Se crearán solo si la extensión está disponible

-- 6. ÍNDICES PARA PERFORMANCE DE RLS
-- ===================================================

-- Optimizar queries que usan auth.uid() frecuentemente
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id 
ON profiles(id) 
WHERE id IS NOT NULL;

-- Índice para verificación de roles
CREATE INDEX IF NOT EXISTS idx_profiles_role_active 
ON profiles(role, id) 
WHERE role IS NOT NULL;

-- 7. ESTADÍSTICAS Y MANTENIMIENTO
-- ===================================================

-- Actualizar estadísticas de las tablas después de crear índices
ANALYZE profiles;
ANALYZE doctors;
ANALYZE patients;
ANALYZE appointments;
ANALYZE medical_records;
ANALYZE patient_medications;
ANALYZE health_metrics;
ANALYZE patient_notifications;
ANALYZE emergency_incidents;
ANALYZE health_plans;
ANALYZE lab_results;
ANALYZE medical_documents;

-- 8. COMENTARIOS PARA DOCUMENTACIÓN
-- ===================================================

COMMENT ON INDEX idx_emergency_incidents_patient_id IS 'Optimiza queries de incidentes por paciente';
COMMENT ON INDEX idx_health_plans_doctor_id IS 'Optimiza queries de planes por doctor';
COMMENT ON INDEX idx_lab_results_service_id IS 'Optimiza joins con servicios de laboratorio';
COMMENT ON INDEX idx_medical_documents_doctor_id IS 'Optimiza queries de documentos por doctor';
COMMENT ON INDEX idx_patient_medications_doctor_id IS 'Optimiza queries de medicamentos por doctor';

COMMENT ON INDEX idx_appointments_patient_date IS 'Optimiza consultas de citas futuras por paciente';
COMMENT ON INDEX idx_medical_records_patient_created IS 'Optimiza historial médico ordenado por fecha';
COMMENT ON INDEX idx_patient_notifications_unread IS 'Optimiza consultas de notificaciones no leídas';
COMMENT ON INDEX idx_health_metrics_recent IS 'Optimiza consultas de métricas recientes';
COMMENT ON INDEX idx_patient_medications_active IS 'Optimiza consultas de medicamentos activos';

-- ===================================================
-- FIN DE MIGRACIÓN DE OPTIMIZACIÓN DE ÍNDICES
-- ===================================================
