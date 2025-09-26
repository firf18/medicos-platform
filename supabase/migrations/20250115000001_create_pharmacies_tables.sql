-- Pharmacy Registration System Migration
-- Creates comprehensive tables for pharmacy management in Red-Salud Platform
-- Compliant with Mexican pharmacy regulations (COFEPRIS)

-- Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    pharmacy_name TEXT NOT NULL,
    commercial_name TEXT,
    rfc TEXT UNIQUE, -- Registro Federal de Contribuyentes
    curp TEXT, -- Clave Única de Registro de Población (for individual owners)
    
    -- Contact Information
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    secondary_phone TEXT,
    website TEXT,
    
    -- Address Information
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'México',
    
    -- Legal Information
    license_number TEXT UNIQUE NOT NULL, -- Número de Licencia Sanitaria
    license_type TEXT NOT NULL CHECK (license_type IN ('farmacia', 'farmacia_hospitalaria', 'farmacia_veterinaria', 'botica')),
    license_issuer TEXT NOT NULL, -- COFEPRIS or local health authority
    license_expiry_date DATE NOT NULL,
    
    -- Business Information
    business_type TEXT NOT NULL CHECK (business_type IN ('individual', 'corporation', 'partnership', 'cooperative')),
    tax_regime TEXT NOT NULL, -- Régimen fiscal
    business_hours JSONB NOT NULL DEFAULT '{}',
    
    -- Services Offered
    services JSONB DEFAULT '[]', -- Array of services like "prescription_dispensing", "vaccination", "health_consultation"
    specialties JSONB DEFAULT '[]', -- Specialized services
    
    -- Compliance and Verification
    cofepris_registration TEXT, -- Registro COFEPRIS
    sanitary_permit TEXT, -- Permiso sanitario
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'under_review')),
    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Staff Table
CREATE TABLE IF NOT EXISTS pharmacy_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Staff Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Professional Information
    role TEXT NOT NULL CHECK (role IN ('pharmacist', 'pharmacy_technician', 'manager', 'cashier', 'intern')),
    license_number TEXT, -- Cédula profesional
    license_type TEXT CHECK (license_type IN ('quimico_farmaceutico', 'farmaceutico_clinico', 'tecnico_farmaceutico')),
    
    -- Employment Details
    hire_date DATE NOT NULL,
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave')),
    salary_range TEXT,
    working_hours JSONB DEFAULT '{}',
    
    -- Permissions
    can_dispense_prescriptions BOOLEAN DEFAULT false,
    can_manage_inventory BOOLEAN DEFAULT false,
    can_access_reports BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Inventory Table
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    
    -- Product Information
    product_name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    dosage_form TEXT NOT NULL, -- tablet, capsule, syrup, etc.
    strength TEXT NOT NULL, -- 500mg, 10ml, etc.
    unit TEXT NOT NULL, -- mg, ml, units, etc.
    
    -- Regulatory Information
    registration_number TEXT, -- Número de registro sanitario
    batch_number TEXT,
    expiration_date DATE NOT NULL,
    
    -- Inventory Details
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    maximum_stock INTEGER,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    
    -- Classification
    drug_category TEXT NOT NULL, -- prescription, otc, controlled_substance
    controlled_substance_schedule TEXT, -- Schedule I-V for controlled substances
    requires_prescription BOOLEAN DEFAULT true,
    
    -- Supplier Information
    supplier_name TEXT,
    supplier_contact TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Services Table
CREATE TABLE IF NOT EXISTS pharmacy_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    
    service_name TEXT NOT NULL,
    service_description TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('dispensing', 'consultation', 'vaccination', 'health_screening', 'delivery', 'other')),
    
    -- Service Details
    duration_minutes INTEGER,
    price DECIMAL(10,2),
    requires_appointment BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    
    -- Requirements
    required_qualifications TEXT[], -- Array of required staff qualifications
    required_equipment TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Documents Table
CREATE TABLE IF NOT EXISTS pharmacy_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('license', 'permit', 'insurance', 'certificate', 'contract', 'other')),
    document_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Document Details
    issue_date DATE,
    expiry_date DATE,
    issuer TEXT,
    document_number TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Reviews Table
CREATE TABLE IF NOT EXISTS pharmacy_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Review Categories
    service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
    staff_knowledge INTEGER CHECK (staff_knowledge >= 1 AND staff_knowledge <= 5),
    cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
    wait_time INTEGER CHECK (wait_time >= 1 AND wait_time <= 5),
    
    -- Moderation
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_user_id ON pharmacies(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_license_number ON pharmacies(license_number);
CREATE INDEX IF NOT EXISTS idx_pharmacies_verification_status ON pharmacies(verification_status);
CREATE INDEX IF NOT EXISTS idx_pharmacies_city_state ON pharmacies(city, state);
CREATE INDEX IF NOT EXISTS idx_pharmacies_is_active ON pharmacies(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_pharmacy_id ON pharmacy_staff(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_user_id ON pharmacy_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_role ON pharmacy_staff(role);
CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_employment_status ON pharmacy_staff(employment_status);

CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_pharmacy_id ON pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_product_name ON pharmacy_inventory(product_name);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_drug_category ON pharmacy_inventory(drug_category);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_expiration_date ON pharmacy_inventory(expiration_date);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_current_stock ON pharmacy_inventory(current_stock);

CREATE INDEX IF NOT EXISTS idx_pharmacy_services_pharmacy_id ON pharmacy_services(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_services_service_type ON pharmacy_services(service_type);
CREATE INDEX IF NOT EXISTS idx_pharmacy_services_is_available ON pharmacy_services(is_available) WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_pharmacy_documents_pharmacy_id ON pharmacy_documents(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_documents_document_type ON pharmacy_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_pharmacy_documents_is_verified ON pharmacy_documents(is_verified);

CREATE INDEX IF NOT EXISTS idx_pharmacy_reviews_pharmacy_id ON pharmacy_reviews(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_reviews_patient_id ON pharmacy_reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_reviews_rating ON pharmacy_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_pharmacy_reviews_is_public ON pharmacy_reviews(is_public) WHERE is_public = true;

-- Enable Row Level Security
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacies
CREATE POLICY "Users can view own pharmacy" ON pharmacies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pharmacy" ON pharmacies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pharmacy" ON pharmacies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view verified pharmacies" ON pharmacies FOR SELECT USING (is_verified = true AND is_active = true);

-- RLS Policies for pharmacy_staff
CREATE POLICY "Pharmacy owners can manage staff" ON pharmacy_staff FOR ALL USING (
    EXISTS (
        SELECT 1 FROM pharmacies 
        WHERE pharmacies.id = pharmacy_staff.pharmacy_id 
        AND pharmacies.user_id = auth.uid()
    )
);
CREATE POLICY "Staff can view own records" ON pharmacy_staff FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for pharmacy_inventory
CREATE POLICY "Pharmacy owners can manage inventory" ON pharmacy_inventory FOR ALL USING (
    EXISTS (
        SELECT 1 FROM pharmacies 
        WHERE pharmacies.id = pharmacy_inventory.pharmacy_id 
        AND pharmacies.user_id = auth.uid()
    )
);

-- RLS Policies for pharmacy_services
CREATE POLICY "Pharmacy owners can manage services" ON pharmacy_services FOR ALL USING (
    EXISTS (
        SELECT 1 FROM pharmacies 
        WHERE pharmacies.id = pharmacy_services.pharmacy_id 
        AND pharmacies.user_id = auth.uid()
    )
);
CREATE POLICY "Public can view pharmacy services" ON pharmacy_services FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pharmacies 
        WHERE pharmacies.id = pharmacy_services.pharmacy_id 
        AND pharmacies.is_verified = true 
        AND pharmacies.is_active = true
    )
);

-- RLS Policies for pharmacy_documents
CREATE POLICY "Pharmacy owners can manage documents" ON pharmacy_documents FOR ALL USING (
    EXISTS (
        SELECT 1 FROM pharmacies 
        WHERE pharmacies.id = pharmacy_documents.pharmacy_id 
        AND pharmacies.user_id = auth.uid()
    )
);

-- RLS Policies for pharmacy_reviews
CREATE POLICY "Patients can create reviews" ON pharmacy_reviews FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can view own reviews" ON pharmacy_reviews FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Public can view public reviews" ON pharmacy_reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Pharmacy owners can view their reviews" ON pharmacy_reviews FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pharmacies 
        WHERE pharmacies.id = pharmacy_reviews.pharmacy_id 
        AND pharmacies.user_id = auth.uid()
    )
);

-- Functions for pharmacy management
CREATE OR REPLACE FUNCTION update_pharmacy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_pharmacies_updated_at
    BEFORE UPDATE ON pharmacies
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_updated_at();

CREATE TRIGGER update_pharmacy_staff_updated_at
    BEFORE UPDATE ON pharmacy_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_updated_at();

CREATE TRIGGER update_pharmacy_inventory_updated_at
    BEFORE UPDATE ON pharmacy_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_updated_at();

CREATE TRIGGER update_pharmacy_services_updated_at
    BEFORE UPDATE ON pharmacy_services
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_updated_at();

CREATE TRIGGER update_pharmacy_documents_updated_at
    BEFORE UPDATE ON pharmacy_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_updated_at();

CREATE TRIGGER update_pharmacy_reviews_updated_at
    BEFORE UPDATE ON pharmacy_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_updated_at();

-- Function to automatically create pharmacy profile when user registers
CREATE OR REPLACE FUNCTION handle_new_pharmacy_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles table with pharmacy role
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'pharmacy',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create pharmacy profile on user registration
CREATE TRIGGER on_auth_user_created_pharmacy
    AFTER INSERT ON auth.users
    FOR EACH ROW
    WHEN (NEW.raw_user_meta_data->>'user_type' = 'pharmacy')
    EXECUTE FUNCTION handle_new_pharmacy_user();

-- Insert default pharmacy services
INSERT INTO pharmacy_services (pharmacy_id, service_name, service_description, service_type, price, requires_appointment)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder UUID
    service_name,
    service_description,
    service_type,
    price,
    requires_appointment
FROM (VALUES
    ('Dispensación de Recetas', 'Servicio de dispensación de medicamentos con receta médica', 'dispensing', 0.00, false),
    ('Consulta Farmacéutica', 'Asesoramiento farmacéutico sobre medicamentos y tratamientos', 'consultation', 0.00, false),
    ('Vacunación', 'Servicio de aplicación de vacunas', 'vaccination', 150.00, true),
    ('Medición de Presión Arterial', 'Servicio de medición de presión arterial', 'health_screening', 50.00, false),
    ('Medición de Glucosa', 'Servicio de medición de glucosa en sangre', 'health_screening', 80.00, false),
    ('Entrega a Domicilio', 'Servicio de entrega de medicamentos a domicilio', 'delivery', 100.00, true)
) AS default_services(service_name, service_description, service_type, price, requires_appointment)
ON CONFLICT DO NOTHING;
