-- Migration: Create Didit API v2 verification tables
-- Description: Tables to support independent Didit API v2 verification services
-- Author: Platform Médicos Team
-- Version: 2.0.0

-- Table for individual verification records
CREATE TABLE IF NOT EXISTS didit_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN (
    'id_verification', 
    'face_match', 
    'aml_check', 
    'passive_liveness'
  )),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- ID Verification specific fields
  document_type VARCHAR(50),
  document_country VARCHAR(10),
  extracted_data JSONB,
  confidence_score INTEGER,
  
  -- Face Match specific fields
  id_verification_id VARCHAR(255),
  match_score INTEGER,
  confidence_level VARCHAR(20),
  liveness_score INTEGER,
  face_detected BOOLEAN,
  quality_score INTEGER,
  
  -- AML specific fields
  overall_risk_score INTEGER,
  risk_level VARCHAR(20),
  checks_performed JSONB,
  sanctions_check JSONB,
  pep_check JSONB,
  adverse_media_check JSONB,
  
  -- Passive Liveness specific fields
  detection_mode VARCHAR(20),
  is_live BOOLEAN,
  detection_methods JSONB,
  spoofing_attempts JSONB,
  quality_metrics JSONB,
  
  -- Common fields
  warnings JSONB,
  callback_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for complete verification sessions
CREATE TABLE IF NOT EXISTS didit_verification_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_level VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (verification_level IN (
    'standard', 
    'enhanced', 
    'maximum'
  )),
  status VARCHAR(50) NOT NULL DEFAULT 'initiated',
  verification_steps JSONB NOT NULL DEFAULT '{}',
  overall_progress INTEGER NOT NULL DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_didit_verifications_user_id ON didit_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_didit_verifications_verification_id ON didit_verifications(verification_id);
CREATE INDEX IF NOT EXISTS idx_didit_verifications_type ON didit_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_didit_verifications_status ON didit_verifications(status);
CREATE INDEX IF NOT EXISTS idx_didit_verifications_created_at ON didit_verifications(created_at);

CREATE INDEX IF NOT EXISTS idx_didit_sessions_doctor_id ON didit_verification_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_didit_sessions_session_id ON didit_verification_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_didit_sessions_status ON didit_verification_sessions(status);
CREATE INDEX IF NOT EXISTS idx_didit_sessions_expires_at ON didit_verification_sessions(expires_at);

-- RLS Policies
ALTER TABLE didit_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE didit_verification_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own verifications
CREATE POLICY "Users can view own verifications" ON didit_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only see their own verification sessions
CREATE POLICY "Users can view own verification sessions" ON didit_verification_sessions
  FOR SELECT USING (auth.uid() = doctor_id);

-- Policy: Service role can manage all verifications
CREATE POLICY "Service role can manage verifications" ON didit_verifications
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage verification sessions" ON didit_verification_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_didit_verifications_updated_at 
  BEFORE UPDATE ON didit_verifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_didit_verification_sessions_updated_at 
  BEFORE UPDATE ON didit_verification_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired verification sessions
CREATE OR REPLACE FUNCTION cleanup_expired_verification_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM didit_verification_sessions 
  WHERE expires_at < NOW() AND status IN ('initiated', 'processing');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get verification summary for a doctor
CREATE OR REPLACE FUNCTION get_doctor_verification_summary(p_doctor_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'doctor_id', p_doctor_id,
    'total_verifications', COUNT(*),
    'completed_verifications', COUNT(*) FILTER (WHERE status IN ('approved', 'declined')),
    'pending_verifications', COUNT(*) FILTER (WHERE status = 'pending'),
    'failed_verifications', COUNT(*) FILTER (WHERE status = 'failed'),
    'verification_types', json_agg(DISTINCT verification_type),
    'latest_verification', (
      SELECT json_build_object(
        'verification_id', verification_id,
        'type', verification_type,
        'status', status,
        'created_at', created_at
      )
      FROM didit_verifications
      WHERE user_id = p_doctor_id
      ORDER BY created_at DESC
      LIMIT 1
    ),
    'verification_sessions', (
      SELECT json_agg(
        json_build_object(
          'session_id', session_id,
          'verification_level', verification_level,
          'status', status,
          'overall_progress', overall_progress,
          'expires_at', expires_at,
          'created_at', created_at
        )
      )
      FROM didit_verification_sessions
      WHERE doctor_id = p_doctor_id
      ORDER BY created_at DESC
    )
  ) INTO result
  FROM didit_verifications
  WHERE user_id = p_doctor_id;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON didit_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON didit_verification_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_verification_summary(UUID) TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON didit_verifications TO service_role;
GRANT ALL ON didit_verification_sessions TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_sessions() TO service_role;

-- Comments
COMMENT ON TABLE didit_verifications IS 'Individual Didit API v2 verification records';
COMMENT ON TABLE didit_verification_sessions IS 'Complete verification sessions combining multiple Didit services';
COMMENT ON FUNCTION get_doctor_verification_summary(UUID) IS 'Get comprehensive verification summary for a doctor';
COMMENT ON FUNCTION cleanup_expired_verification_sessions() IS 'Clean up expired verification sessions';
