-- Migración para tablas de webhook de Didit - Platform Médicos Elite
-- 
-- Esta migración crea las tablas necesarias para manejar webhooks de Didit
-- siguiendo las mejores prácticas de seguridad médica y compliance HIPAA

-- Tabla para sesiones de verificación
CREATE TABLE IF NOT EXISTS verification_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    workflow_id VARCHAR(255),
    vendor_data VARCHAR(255),
    metadata JSONB,
    decision JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para resultados de verificación
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    id_verification_status VARCHAR(50),
    document_type VARCHAR(100),
    document_number VARCHAR(100), -- Masked for security
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(10),
    warnings JSONB,
    reviews JSONB,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para verificaciones de médicos
CREATE TABLE IF NOT EXISTS doctor_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id VARCHAR(255) UNIQUE NOT NULL,
    verification_id VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    document_verified BOOLEAN DEFAULT FALSE,
    identity_verified BOOLEAN DEFAULT FALSE,
    liveness_verified BOOLEAN DEFAULT FALSE,
    aml_cleared BOOLEAN DEFAULT FALSE,
    verification_score INTEGER DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para reviews de verificación
CREATE TABLE IF NOT EXISTS verification_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    reviewer VARCHAR(255) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para logs de webhook (auditoría)
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255),
    webhook_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payload JSONB,
    headers JSONB,
    client_ip VARCHAR(45),
    user_agent TEXT,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_verification_sessions_session_id ON verification_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_user_id ON verification_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_status ON verification_sessions(status);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_created_at ON verification_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_verification_results_session_id ON verification_results(session_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_status ON verification_results(verification_status);
CREATE INDEX IF NOT EXISTS idx_verification_results_processed_at ON verification_results(processed_at);

CREATE INDEX IF NOT EXISTS idx_doctor_verifications_doctor_id ON doctor_verifications(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_status ON doctor_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_verified_at ON doctor_verifications(verified_at);

CREATE INDEX IF NOT EXISTS idx_verification_reviews_session_id ON verification_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_verification_reviews_reviewer ON verification_reviews(reviewer);
CREATE INDEX IF NOT EXISTS idx_verification_reviews_created_at ON verification_reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_session_id ON webhook_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Políticas RLS (Row Level Security) para seguridad médica
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para verification_sessions: Solo el usuario propietario puede ver sus sesiones
CREATE POLICY "Users can view own verification sessions" ON verification_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

-- Política para verification_results: Solo el usuario propietario puede ver sus resultados
CREATE POLICY "Users can view own verification results" ON verification_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM verification_sessions 
            WHERE verification_sessions.session_id = verification_results.session_id 
            AND verification_sessions.user_id = auth.uid()::text
        )
    );

-- Política para doctor_verifications: Solo el médico propietario puede ver su verificación
CREATE POLICY "Doctors can view own verification" ON doctor_verifications
    FOR SELECT USING (auth.uid()::text = doctor_id);

-- Política para verification_reviews: Solo administradores pueden ver reviews
CREATE POLICY "Admins can view verification reviews" ON verification_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Política para webhook_logs: Solo administradores pueden ver logs
CREATE POLICY "Admins can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_verification_sessions_updated_at 
    BEFORE UPDATE ON verification_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_results_updated_at 
    BEFORE UPDATE ON verification_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_verifications_updated_at 
    BEFORE UPDATE ON doctor_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar sesiones expiradas (mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM verification_sessions 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de limpieza
    INSERT INTO webhook_logs (webhook_type, status, payload, created_at)
    VALUES ('cleanup', 'completed', json_build_object('deleted_count', deleted_count), NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de verificación
CREATE OR REPLACE FUNCTION get_verification_stats()
RETURNS TABLE (
    total_sessions BIGINT,
    pending_sessions BIGINT,
    approved_sessions BIGINT,
    declined_sessions BIGINT,
    expired_sessions BIGINT,
    average_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_sessions,
        COUNT(*) FILTER (WHERE status = 'Approved') as approved_sessions,
        COUNT(*) FILTER (WHERE status = 'Declined') as declined_sessions,
        COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_sessions,
        AVG(COALESCE((decision->>'verification_score')::NUMERIC, 0)) as average_score
    FROM verification_sessions;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE verification_sessions IS 'Sesiones de verificación de Didit con datos completos';
COMMENT ON TABLE verification_results IS 'Resultados procesados de verificación de identidad';
COMMENT ON TABLE doctor_verifications IS 'Estado de verificación de médicos en el sistema';
COMMENT ON TABLE verification_reviews IS 'Reviews manuales de verificaciones';
COMMENT ON TABLE webhook_logs IS 'Logs de auditoría para webhooks de Didit';

COMMENT ON COLUMN verification_sessions.session_id IS 'ID único de sesión de Didit';
COMMENT ON COLUMN verification_sessions.user_id IS 'ID del usuario en nuestro sistema';
COMMENT ON COLUMN verification_sessions.status IS 'Estado actual de la verificación';
COMMENT ON COLUMN verification_sessions.decision IS 'Datos completos de decisión de Didit';

COMMENT ON COLUMN verification_results.document_number IS 'Número de documento enmascarado para seguridad';
COMMENT ON COLUMN verification_results.warnings IS 'Advertencias de verificación en formato JSON';
COMMENT ON COLUMN verification_results.reviews IS 'Reviews de verificación en formato JSON';

COMMENT ON COLUMN doctor_verifications.verification_score IS 'Score de verificación de 0 a 100';
COMMENT ON COLUMN doctor_verifications.document_verified IS 'Documento verificado exitosamente';
COMMENT ON COLUMN doctor_verifications.identity_verified IS 'Identidad verificada exitosamente';
COMMENT ON COLUMN doctor_verifications.liveness_verified IS 'Verificación de vida exitosa';
COMMENT ON COLUMN doctor_verifications.aml_cleared IS 'Screening AML limpio';

-- Insertar datos de ejemplo para testing (solo en desarrollo)
DO $$
BEGIN
    IF current_setting('app.environment', true) = 'development' THEN
        -- Datos de ejemplo para testing
        INSERT INTO verification_sessions (session_id, user_id, status, workflow_id, vendor_data, metadata)
        VALUES 
            ('test-session-1', 'test-user-1', 'Approved', 'medical-workflow', 'doctor-123', '{"user_type": "doctor", "specialty": "cardiology"}'),
            ('test-session-2', 'test-user-2', 'Pending', 'medical-workflow', 'doctor-456', '{"user_type": "doctor", "specialty": "neurology"}')
        ON CONFLICT (session_id) DO NOTHING;
        
        INSERT INTO verification_results (session_id, verification_status, id_verification_status, document_type, first_name, last_name)
        VALUES 
            ('test-session-1', 'approved', 'Approved', 'Identity Card', 'Juan', 'Pérez'),
            ('test-session-2', 'pending', 'In Review', 'Identity Card', 'María', 'González')
        ON CONFLICT (session_id) DO NOTHING;
    END IF;
END $$;
