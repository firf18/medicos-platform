-- Row Level Security Policies for Patient Dashboard

-- Patient Caregivers Policies
CREATE POLICY "Patients can manage their caregivers" ON patient_caregivers
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Caregivers can view patient data they have access to" ON patient_caregivers
    FOR SELECT USING (
        caregiver_email = auth.jwt() ->> 'email' AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Emergency Contacts Policies
CREATE POLICY "Patients can manage their emergency contacts" ON emergency_contacts
    FOR ALL USING (auth.uid() = patient_id);

-- Emergency Medical Info Policies
CREATE POLICY "Patients can manage their emergency medical info" ON emergency_medical_info
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view emergency medical info of their patients" ON emergency_medical_info
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a 
            WHERE a.patient_id = emergency_medical_info.patient_id 
            AND a.doctor_id = auth.uid()
        )
    );

-- Emergency Incidents Policies
CREATE POLICY "Patients can view their emergency incidents" ON emergency_incidents
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "System can create emergency incidents" ON emergency_incidents
    FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

-- Health Plans Policies
CREATE POLICY "Patients can view their health plans" ON health_plans
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage health plans for their patients" ON health_plans
    FOR ALL USING (auth.uid() = doctor_id);

-- Health Plan Tasks Policies
CREATE POLICY "Patients can view and update their health plan tasks" ON health_plan_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM health_plans hp 
            WHERE hp.id = health_plan_tasks.health_plan_id 
            AND hp.patient_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can manage health plan tasks" ON health_plan_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM health_plans hp 
            WHERE hp.id = health_plan_tasks.health_plan_id 
            AND hp.doctor_id = auth.uid()
        )
    );

-- Second Opinion Requests Policies
CREATE POLICY "Patients can manage their second opinion requests" ON second_opinion_requests
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Specialists can view and respond to requests assigned to them" ON second_opinion_requests
    FOR ALL USING (auth.uid() = specialist_id);

CREATE POLICY "Original doctors can view second opinion requests" ON second_opinion_requests
    FOR SELECT USING (auth.uid() = original_doctor_id);

-- Medical Documents Policies
CREATE POLICY "Patients can view their medical documents" ON medical_documents
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage medical documents for their patients" ON medical_documents
    FOR ALL USING (auth.uid() = doctor_id);

-- Appointments Policies
CREATE POLICY "Patients can view and manage their appointments" ON appointments
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view and manage appointments with their patients" ON appointments
    FOR ALL USING (auth.uid() = doctor_id);

-- Patient Medications Policies
CREATE POLICY "Patients can view their medications" ON patient_medications
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update medication adherence and side effects" ON patient_medications
    FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage medications for their patients" ON patient_medications
    FOR ALL USING (auth.uid() = doctor_id);

-- Medication Reminders Policies
CREATE POLICY "Patients can manage medication reminders" ON medication_reminders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patient_medications pm 
            WHERE pm.id = medication_reminders.medication_id 
            AND pm.patient_id = auth.uid()
        )
    );

-- Health Metrics Policies
CREATE POLICY "Patients can manage their health metrics" ON health_metrics
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view health metrics of their patients" ON health_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a 
            WHERE a.patient_id = health_metrics.patient_id 
            AND a.doctor_id = auth.uid()
        )
    );

-- Patient Notifications Policies
CREATE POLICY "Patients can view and manage their notifications" ON patient_notifications
    FOR ALL USING (auth.uid() = patient_id);

-- Patient Access Logs Policies
CREATE POLICY "Patients can view their access logs" ON patient_access_logs
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "System can create access logs" ON patient_access_logs
    FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

-- Functions for caregiver access
CREATE OR REPLACE FUNCTION check_caregiver_access(patient_uuid UUID, required_access_level TEXT DEFAULT 'basic')
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM patient_caregivers pc
        WHERE pc.patient_id = patient_uuid
        AND pc.caregiver_email = auth.jwt() ->> 'email'
        AND pc.is_active = true
        AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
        AND (
            pc.access_level = 'full' OR
            (required_access_level = 'basic' AND pc.access_level IN ('basic', 'appointments_only', 'emergency_only')) OR
            (required_access_level = 'emergency_only' AND pc.access_level IN ('emergency_only', 'full')) OR
            (required_access_level = 'appointments_only' AND pc.access_level IN ('appointments_only', 'full'))
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional policies for caregiver access
CREATE POLICY "Caregivers can view patient appointments" ON appointments
    FOR SELECT USING (check_caregiver_access(patient_id, 'appointments_only'));

CREATE POLICY "Caregivers can view patient emergency info" ON emergency_medical_info
    FOR SELECT USING (check_caregiver_access(patient_id, 'emergency_only'));

CREATE POLICY "Caregivers can view patient medications" ON patient_medications
    FOR SELECT USING (check_caregiver_access(patient_id, 'basic'));

CREATE POLICY "Caregivers can view patient health metrics" ON health_metrics
    FOR SELECT USING (check_caregiver_access(patient_id, 'basic'));

CREATE POLICY "Caregivers can view shared medical documents" ON medical_documents
    FOR SELECT USING (
        shared_with_caregivers = true 
        AND check_caregiver_access(patient_id, 'basic')
    );