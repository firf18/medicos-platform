/**
 * Pharmacy Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de farmacias.
 * Cumple con las regulaciones mexicanas COFEPRIS y principios de seguridad HIPAA.
 */

// Estados mexicanos válidos para farmacias
export type MexicanState = 
  | 'Aguascalientes'
  | 'Baja California'
  | 'Baja California Sur'
  | 'Campeche'
  | 'Chiapas'
  | 'Chihuahua'
  | 'Coahuila'
  | 'Colima'
  | 'Ciudad de México'
  | 'Durango'
  | 'Estado de México'
  | 'Guanajuato'
  | 'Guerrero'
  | 'Hidalgo'
  | 'Jalisco'
  | 'Michoacán'
  | 'Morelos'
  | 'Nayarit'
  | 'Nuevo León'
  | 'Oaxaca'
  | 'Puebla'
  | 'Querétaro'
  | 'Quintana Roo'
  | 'San Luis Potosí'
  | 'Sinaloa'
  | 'Sonora'
  | 'Tabasco'
  | 'Tamaulipas'
  | 'Tlaxcala'
  | 'Veracruz'
  | 'Yucatán'
  | 'Zacatecas';

// Tipos de licencias de farmacia según COFEPRIS
export type PharmacyLicenseType = 
  | 'farmacia'
  | 'farmacia_hospitalaria'
  | 'farmacia_veterinaria'
  | 'botica';

// Tipos de negocio farmacéutico
export type PharmacyBusinessType = 
  | 'individual'
  | 'corporation'
  | 'partnership'
  | 'cooperative';

// Estado de verificación de farmacia
export type PharmacyVerificationStatus = 
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'under_review';

// Planes de suscripción
export type PharmacySubscriptionPlan = 
  | 'basic'
  | 'premium'
  | 'enterprise';

// Roles del personal de farmacia
export type PharmacyStaffRole = 
  | 'pharmacist'
  | 'pharmacy_technician'
  | 'manager'
  | 'cashier'
  | 'intern';

// Tipos de licencias del personal
export type StaffLicenseType = 
  | 'quimico_farmaceutico'
  | 'farmaceutico_clinico'
  | 'tecnico_farmaceutico';

// Estado de empleo del personal
export type StaffEmploymentStatus = 
  | 'active'
  | 'inactive'
  | 'terminated'
  | 'on_leave';

// Categorías de medicamentos
export type DrugCategory = 
  | 'prescription'
  | 'otc'
  | 'controlled_substance';

// Tipos de servicios farmacéuticos
export type PharmacyServiceType = 
  | 'dispensing'
  | 'consultation'
  | 'vaccination'
  | 'health_screening'
  | 'delivery'
  | 'other';

// Tipos de documentos farmacéuticos
export type PharmacyDocumentType = 
  | 'license'
  | 'permit'
  | 'insurance'
  | 'certificate'
  | 'contract'
  | 'other';

// Horarios de trabajo
export interface WorkingHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

// Tabla de farmacias
export interface PharmacyRow {
  id: string;
  user_id: string;
  
  // Información básica
  pharmacy_name: string;
  commercial_name?: string;
  rfc?: string;
  curp?: string;
  
  // Información de contacto
  email: string;
  phone: string;
  secondary_phone?: string;
  website?: string;
  
  // Información de dirección
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Información legal
  license_number: string;
  license_type: PharmacyLicenseType;
  license_issuer: string;
  license_expiry_date: string;
  
  // Información comercial
  business_type: PharmacyBusinessType;
  tax_regime: string;
  business_hours: WorkingHours;
  
  // Servicios ofrecidos
  services: string[];
  specialties: string[];
  
  // Cumplimiento y verificación
  cofepris_registration?: string;
  sanitary_permit?: string;
  verification_status: PharmacyVerificationStatus;
  verification_notes?: string;
  verified_at?: string;
  verified_by?: string;
  
  // Estado y metadatos
  is_active: boolean;
  is_verified: boolean;
  subscription_plan: PharmacySubscriptionPlan;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PharmacyInsert {
  user_id: string;
  
  // Información básica
  pharmacy_name: string;
  commercial_name?: string;
  rfc?: string;
  curp?: string;
  
  // Información de contacto
  email: string;
  phone: string;
  secondary_phone?: string;
  website?: string;
  
  // Información de dirección
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  
  // Información legal
  license_number: string;
  license_type: PharmacyLicenseType;
  license_issuer: string;
  license_expiry_date: string;
  
  // Información comercial
  business_type: PharmacyBusinessType;
  tax_regime: string;
  business_hours: WorkingHours;
  
  // Servicios ofrecidos
  services?: string[];
  specialties?: string[];
  
  // Cumplimiento y verificación
  cofepris_registration?: string;
  sanitary_permit?: string;
  verification_status?: PharmacyVerificationStatus;
  verification_notes?: string;
  
  // Estado y metadatos
  is_active?: boolean;
  is_verified?: boolean;
  subscription_plan?: PharmacySubscriptionPlan;
}

export interface PharmacyUpdate {
  // Información básica
  pharmacy_name?: string;
  commercial_name?: string;
  rfc?: string;
  curp?: string;
  
  // Información de contacto
  email?: string;
  phone?: string;
  secondary_phone?: string;
  website?: string;
  
  // Información de dirección
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Información legal
  license_number?: string;
  license_type?: PharmacyLicenseType;
  license_issuer?: string;
  license_expiry_date?: string;
  
  // Información comercial
  business_type?: PharmacyBusinessType;
  tax_regime?: string;
  business_hours?: WorkingHours;
  
  // Servicios ofrecidos
  services?: string[];
  specialties?: string[];
  
  // Cumplimiento y verificación
  cofepris_registration?: string;
  sanitary_permit?: string;
  verification_status?: PharmacyVerificationStatus;
  verification_notes?: string;
  verified_at?: string;
  verified_by?: string;
  
  // Estado y metadatos
  is_active?: boolean;
  is_verified?: boolean;
  subscription_plan?: PharmacySubscriptionPlan;
  
  updated_at?: string;
}

// Personal de farmacia
export interface PharmacyStaffRow {
  id: string;
  pharmacy_id: string;
  user_id?: string;
  
  // Información del personal
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  
  // Información profesional
  role: PharmacyStaffRole;
  license_number?: string;
  license_type?: StaffLicenseType;
  
  // Detalles de empleo
  hire_date: string;
  employment_status: StaffEmploymentStatus;
  salary_range?: string;
  working_hours: WorkingHours;
  
  // Permisos
  can_dispense_prescriptions: boolean;
  can_manage_inventory: boolean;
  can_access_reports: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface PharmacyStaffInsert {
  pharmacy_id: string;
  user_id?: string;
  
  // Información del personal
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  
  // Información profesional
  role: PharmacyStaffRole;
  license_number?: string;
  license_type?: StaffLicenseType;
  
  // Detalles de empleo
  hire_date: string;
  employment_status?: StaffEmploymentStatus;
  salary_range?: string;
  working_hours?: WorkingHours;
  
  // Permisos
  can_dispense_prescriptions?: boolean;
  can_manage_inventory?: boolean;
  can_access_reports?: boolean;
}

export interface PharmacyStaffUpdate {
  // Información del personal
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  
  // Información profesional
  role?: PharmacyStaffRole;
  license_number?: string;
  license_type?: StaffLicenseType;
  
  // Detalles de empleo
  hire_date?: string;
  employment_status?: StaffEmploymentStatus;
  salary_range?: string;
  working_hours?: WorkingHours;
  
  // Permisos
  can_dispense_prescriptions?: boolean;
  can_manage_inventory?: boolean;
  can_access_reports?: boolean;
  
  updated_at?: string;
}

// Inventario de farmacia
export interface PharmacyInventoryRow {
  id: string;
  pharmacy_id: string;
  
  // Información del producto
  product_name: string;
  generic_name?: string;
  brand_name?: string;
  dosage_form: string;
  strength: string;
  unit: string;
  
  // Información regulatoria
  registration_number?: string;
  batch_number?: string;
  expiration_date: string;
  
  // Detalles del inventario
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_cost?: number;
  selling_price?: number;
  
  // Clasificación
  drug_category: DrugCategory;
  controlled_substance_schedule?: string;
  requires_prescription: boolean;
  
  // Información del proveedor
  supplier_name?: string;
  supplier_contact?: string;
  
  created_at: string;
  updated_at: string;
}

// Servicios de farmacia
export interface PharmacyServiceRow {
  id: string;
  pharmacy_id: string;
  
  service_name: string;
  service_description?: string;
  service_type: PharmacyServiceType;
  
  // Detalles del servicio
  duration_minutes?: number;
  price?: number;
  requires_appointment: boolean;
  is_available: boolean;
  
  // Requisitos
  required_qualifications: string[];
  required_equipment: string[];
  
  created_at: string;
  updated_at: string;
}

// Documentos de farmacia
export interface PharmacyDocumentRow {
  id: string;
  pharmacy_id: string;
  
  document_name: string;
  document_type: PharmacyDocumentType;
  document_url: string;
  file_size?: number;
  mime_type?: string;
  
  // Detalles del documento
  issue_date?: string;
  expiry_date?: string;
  issuer?: string;
  document_number?: string;
  
  // Verificación
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  
  created_at: string;
  updated_at: string;
}

// Reseñas de farmacia
export interface PharmacyReviewRow {
  id: string;
  pharmacy_id: string;
  patient_id: string;
  
  rating: number;
  review_text?: string;
  
  // Categorías de reseña
  service_quality?: number;
  staff_knowledge?: number;
  cleanliness?: number;
  wait_time?: number;
  
  // Moderación
  is_verified: boolean;
  is_public: boolean;
  moderated_at?: string;
  moderated_by?: string;
  
  created_at: string;
  updated_at: string;
}

// Farmacia extendida con información de relaciones
export interface PharmacyWithDetails extends PharmacyRow {
  staff?: PharmacyStaffRow[];
  services?: PharmacyServiceRow[];
  documents?: PharmacyDocumentRow[];
  reviews?: PharmacyReviewRow[];
  totalStaff: number;
  activeStaff: number;
  averageRating: number;
  totalReviews: number;
}

// Estadísticas de farmacia para dashboards
export interface PharmacyStats {
  totalStaff: number;
  activeStaff: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  averageRating: number;
  totalReviews: number;
  servicesOffered: number;
  verificationStatus: PharmacyVerificationStatus;
}

// Datos de registro de farmacia
export interface PharmacyRegistrationData {
  // Paso 1: Información básica
  pharmacyName: string;
  commercialName?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  website?: string;
  
  // Paso 2: Información legal
  rfc?: string;
  curp?: string;
  licenseNumber: string;
  licenseType: PharmacyLicenseType;
  licenseIssuer: string;
  licenseExpiryDate: string;
  cofeprisRegistration?: string;
  sanitaryPermit?: string;
  
  // Paso 3: Información comercial
  businessType: PharmacyBusinessType;
  taxRegime: string;
  
  // Paso 4: Ubicación
  address: string;
  city: string;
  state: MexicanState;
  postalCode: string;
  
  // Paso 5: Horarios y servicios
  businessHours: WorkingHours;
  services: string[];
  specialties: string[];
  
  // Paso 6: Documentos
  documents: Array<{
    name: string;
    type: PharmacyDocumentType;
    file: File;
  }>;
  
  // Paso 7: Términos y condiciones
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  acceptDataProcessing: boolean;
}

// Formulario de registro por pasos
export interface PharmacyRegistrationFormData {
  currentStep: number;
  totalSteps: number;
  data: Partial<PharmacyRegistrationData>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos para tablas de base de datos
export type PharmacyTables = {
  pharmacies: {
    Row: PharmacyRow;
    Insert: PharmacyInsert;
    Update: PharmacyUpdate;
  };
  pharmacy_staff: {
    Row: PharmacyStaffRow;
    Insert: PharmacyStaffInsert;
    Update: PharmacyStaffUpdate;
  };
  pharmacy_inventory: {
    Row: PharmacyInventoryRow;
    Insert: Omit<PharmacyInventoryRow, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<PharmacyInventoryRow, 'id' | 'created_at' | 'updated_at'>>;
  };
  pharmacy_services: {
    Row: PharmacyServiceRow;
    Insert: Omit<PharmacyServiceRow, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<PharmacyServiceRow, 'id' | 'created_at' | 'updated_at'>>;
  };
  pharmacy_documents: {
    Row: PharmacyDocumentRow;
    Insert: Omit<PharmacyDocumentRow, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<PharmacyDocumentRow, 'id' | 'created_at' | 'updated_at'>>;
  };
  pharmacy_reviews: {
    Row: PharmacyReviewRow;
    Insert: Omit<PharmacyReviewRow, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<PharmacyReviewRow, 'id' | 'created_at' | 'updated_at'>>;
  };
};

export default PharmacyTables;
