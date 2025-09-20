/**
 * Tipos de Laboratorios y Servicios
 * 
 * Contiene todos los tipos relacionados con laboratorios,
 * servicios de laboratorio y resultados de pruebas.
 */

export interface LaboratoriesTable {
  Row: {
    address: string | null
    city: string | null
    country: string | null
    created_at: string
    description: string | null
    email: string | null
    id: string
    name: string
    phone: string | null
    state: string | null
    updated_at: string
    website: string | null
  }
  Insert: {
    address?: string | null
    city?: string | null
    country?: string | null
    created_at?: string
    description?: string | null
    email?: string | null
    id: string
    name: string
    phone?: string | null
    state?: string | null
    updated_at?: string
    website?: string | null
  }
  Update: {
    address?: string | null
    city?: string | null
    country?: string | null
    created_at?: string
    description?: string | null
    email?: string | null
    id?: string
    name?: string
    phone?: string | null
    state?: string | null
    updated_at?: string
    website?: string | null
  }
}

export interface LaboratoryServicesTable {
  Row: {
    created_at: string
    description: string | null
    id: string
    is_active: boolean | null
    laboratory_id: string | null
    name: string
    price: number | null
    updated_at: string
    category: string | null
    preparation_instructions: string | null
    sample_type: string | null
    turnaround_time: string | null
  }
  Insert: {
    created_at?: string
    description?: string | null
    id?: string
    is_active?: boolean | null
    laboratory_id?: string | null
    name: string
    price?: number | null
    updated_at?: string
    category?: string | null
    preparation_instructions?: string | null
    sample_type?: string | null
    turnaround_time?: string | null
  }
  Update: {
    created_at?: string
    description?: string | null
    id?: string
    is_active?: boolean | null
    laboratory_id?: string | null
    name?: string
    price?: number | null
    updated_at?: string
    category?: string | null
    preparation_instructions?: string | null
    sample_type?: string | null
    turnaround_time?: string | null
  }
}

export interface LabResultsTable {
  Row: {
    created_at: string
    doctor_id: string | null
    id: string
    is_critical: boolean | null
    laboratory_id: string | null
    patient_id: string | null
    performed_at: string | null
    result: string | null
    result_file_url: string | null
    service_id: string | null
    test_name: string
    updated_at: string
    reference_values: string | null
    units: string | null
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    technician_notes: string | null
    doctor_notes: string | null
  }
  Insert: {
    created_at?: string
    doctor_id?: string | null
    id?: string
    is_critical?: boolean | null
    laboratory_id?: string | null
    patient_id?: string | null
    performed_at?: string | null
    result?: string | null
    result_file_url?: string | null
    service_id?: string | null
    test_name: string
    updated_at?: string
    reference_values?: string | null
    units?: string | null
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    technician_notes?: string | null
    doctor_notes?: string | null
  }
  Update: {
    created_at?: string
    doctor_id?: string | null
    id?: string
    is_critical?: boolean | null
    laboratory_id?: string | null
    patient_id?: string | null
    performed_at?: string | null
    result?: string | null
    result_file_url?: string | null
    service_id?: string | null
    test_name?: string
    updated_at?: string
    reference_values?: string | null
    units?: string | null
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    technician_notes?: string | null
    doctor_notes?: string | null
  }
}

// Tipos adicionales para laboratorios
export interface LabOrdersTable {
  Row: {
    id: string
    patient_id: string
    doctor_id: string
    laboratory_id: string
    service_ids: string[]
    order_date: string
    scheduled_date: string | null
    status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'routine' | 'urgent' | 'stat'
    clinical_notes: string | null
    special_instructions: string | null
    total_cost: number | null
    insurance_coverage: number | null
    patient_responsibility: number | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    patient_id: string
    doctor_id: string
    laboratory_id: string
    service_ids: string[]
    order_date: string
    scheduled_date?: string | null
    status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    priority?: 'routine' | 'urgent' | 'stat'
    clinical_notes?: string | null
    special_instructions?: string | null
    total_cost?: number | null
    insurance_coverage?: number | null
    patient_responsibility?: number | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    patient_id?: string
    doctor_id?: string
    laboratory_id?: string
    service_ids?: string[]
    order_date?: string
    scheduled_date?: string | null
    status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    priority?: 'routine' | 'urgent' | 'stat'
    clinical_notes?: string | null
    special_instructions?: string | null
    total_cost?: number | null
    insurance_coverage?: number | null
    patient_responsibility?: number | null
    created_at?: string
    updated_at?: string
  }
}

export interface LabEquipmentTable {
  Row: {
    id: string
    laboratory_id: string
    name: string
    model: string | null
    manufacturer: string | null
    serial_number: string | null
    installation_date: string | null
    last_maintenance: string | null
    next_maintenance: string | null
    status: 'operational' | 'maintenance' | 'out_of_order'
    capabilities: string[] | null
    location: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    laboratory_id: string
    name: string
    model?: string | null
    manufacturer?: string | null
    serial_number?: string | null
    installation_date?: string | null
    last_maintenance?: string | null
    next_maintenance?: string | null
    status?: 'operational' | 'maintenance' | 'out_of_order'
    capabilities?: string[] | null
    location?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    laboratory_id?: string
    name?: string
    model?: string | null
    manufacturer?: string | null
    serial_number?: string | null
    installation_date?: string | null
    last_maintenance?: string | null
    next_maintenance?: string | null
    status?: 'operational' | 'maintenance' | 'out_of_order'
    capabilities?: string[] | null
    location?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface QualityControlTable {
  Row: {
    id: string
    laboratory_id: string
    test_name: string
    control_type: 'internal' | 'external' | 'proficiency'
    control_date: string
    expected_value: number | null
    actual_value: number | null
    acceptable_range_min: number | null
    acceptable_range_max: number | null
    status: 'passed' | 'failed' | 'warning'
    technician_id: string | null
    notes: string | null
    corrective_action: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    laboratory_id: string
    test_name: string
    control_type: 'internal' | 'external' | 'proficiency'
    control_date: string
    expected_value?: number | null
    actual_value?: number | null
    acceptable_range_min?: number | null
    acceptable_range_max?: number | null
    status: 'passed' | 'failed' | 'warning'
    technician_id?: string | null
    notes?: string | null
    corrective_action?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    laboratory_id?: string
    test_name?: string
    control_type?: 'internal' | 'external' | 'proficiency'
    control_date?: string
    expected_value?: number | null
    actual_value?: number | null
    acceptable_range_min?: number | null
    acceptable_range_max?: number | null
    status?: 'passed' | 'failed' | 'warning'
    technician_id?: string | null
    notes?: string | null
    corrective_action?: string | null
    created_at?: string
    updated_at?: string
  }
}