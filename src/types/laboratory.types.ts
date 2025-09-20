/**
 * Laboratory Types - Red-Salud Platform
 * 
 * Tipos e interfaces específicas para el dominio de laboratorio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// ============================================================================
// INTERFACES PRINCIPALES DEL LABORATORIO
// ============================================================================

export interface LabStats {
  totalTests: number;
  pendingResults: number;
  completedToday: number;
  urgentTests: number;
  averageProcessingTime: number;
  monthlyRevenue: number;
}

export interface LabTest {
  id: string;
  patient_name: string;
  doctor_name: string;
  test_type: string;
  priority: TestPriority;
  status: TestStatus;
  created_at: string;
  expected_completion: string;
  notes?: string;
  sample_id?: string;
  barcode?: string;
  technician_id?: string;
  equipment_used?: string;
  quality_control?: QualityControlStatus;
}

export interface TestType {
  id: string;
  name: string;
  category: TestCategory;
  processing_time: number; // en horas
  price: number;
  tests_count: number;
  description?: string;
  preparation_instructions?: string;
  reference_values?: ReferenceValues;
  equipment_required?: string[];
  certification_level?: CertificationLevel;
}

export interface TestResult {
  id: string;
  test_id: string;
  results: TestResultValue[];
  interpretation?: string;
  technician_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  quality_flags?: QualityFlag[];
  attachments?: ResultAttachment[];
}

export interface TestResultValue {
  parameter: string;
  value: string | number;
  unit: string;
  reference_range: string;
  status: 'normal' | 'abnormal' | 'critical';
  flag?: string;
}

export interface ReferenceValues {
  [parameter: string]: {
    min?: number;
    max?: number;
    unit: string;
    notes?: string;
  };
}

export interface ResultAttachment {
  id: string;
  filename: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  size: number;
  uploaded_at: string;
}

// ============================================================================
// ENUMS Y TIPOS ESPECÍFICOS
// ============================================================================

export type TestPriority = 'low' | 'medium' | 'high' | 'urgent' | 'stat';

export type TestStatus = 
  | 'received'      // Muestra recibida
  | 'registered'    // Registrada en el sistema
  | 'processing'    // En análisis
  | 'completed'     // Análisis completado
  | 'reviewed'      // Revisado por especialista
  | 'sent'          // Resultado enviado
  | 'rejected'      // Muestra rechazada
  | 'cancelled';    // Análisis cancelado

export type TestCategory = 
  | 'Hematología'
  | 'Bioquímica'
  | 'Microbiología'
  | 'Inmunología'
  | 'Endocrinología'
  | 'Genética'
  | 'Toxicología'
  | 'Anatomía Patológica'
  | 'Citología'
  | 'Histopatología';

export type QualityControlStatus = 
  | 'pending'
  | 'passed'
  | 'failed'
  | 'requires_repeat';

export type CertificationLevel = 
  | 'basic'
  | 'specialized'
  | 'high_complexity'
  | 'research';

export type QualityFlag = 
  | 'hemolyzed'
  | 'lipemic'
  | 'icteric'
  | 'clotted'
  | 'insufficient_sample'
  | 'contaminated';

// ============================================================================
// INTERFACES PARA COMPONENTES DE UI
// ============================================================================

export interface LabFilters {
  statusFilter: string;
  priorityFilter: string;
  categoryFilter: string;
  dateRange: {
    start?: string;
    end?: string;
  };
  searchTerm: string;
}

export interface LabTabConfig {
  id: string;
  label: string;
  icon: any; // LucideIcon
  component?: React.ComponentType<any>;
}

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: any; // LucideIcon
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}

// ============================================================================
// INTERFACES PARA HOOKS Y SERVICIOS
// ============================================================================

export interface UseLabDataReturn {
  stats: LabStats;
  labTests: LabTest[];
  testTypes: TestType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTestStatus: (testId: string, status: TestStatus) => Promise<void>;
  addTestResult: (testId: string, result: Partial<TestResult>) => Promise<void>;
}

export interface LabDataFilters {
  status?: TestStatus[];
  priority?: TestPriority[];
  category?: TestCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  technician?: string;
}

// ============================================================================
// TIPOS PARA ANALYTICS Y REPORTES
// ============================================================================

export interface LabAnalytics {
  daily_volume: {
    date: string;
    tests_received: number;
    tests_completed: number;
    revenue: number;
  }[];
  
  turnaround_times: {
    test_type: string;
    average_hours: number;
    target_hours: number;
    performance: number; // porcentaje
  }[];
  
  popular_tests: {
    test_type: string;
    count: number;
    percentage: number;
  }[];
  
  quality_metrics: {
    total_tests: number;
    rejection_rate: number;
    repeat_rate: number;
    critical_values: number;
  };
}

export interface LabReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generated_at: string;
  period: {
    start: string;
    end: string;
  };
  data: LabAnalytics;
  format: 'pdf' | 'excel' | 'csv';
  url?: string;
}

// ============================================================================
// INTERFACES PARA CONFIGURACIÓN
// ============================================================================

export interface LabConfiguration {
  working_hours: {
    [day: string]: {
      open: string;
      close: string;
      is_working_day: boolean;
    };
  };
  
  turnaround_targets: {
    [category: string]: number; // horas
  };
  
  quality_control: {
    enabled: boolean;
    frequency: string; // daily, weekly
    controls_required: string[];
  };
  
  notifications: {
    critical_results: boolean;
    delays: boolean;
    quality_issues: boolean;
    equipment_maintenance: boolean;
  };
  
  integrations: {
    lis_system?: string;
    equipment_interfaces: string[];
    result_delivery: ('email' | 'sms' | 'portal' | 'fax')[];
  };
}

// ============================================================================
// TIPOS PARA MOCK DATA Y TESTING
// ============================================================================

export interface MockDataConfig {
  testsCount: number;
  daysBack: number;
  includeCriticalValues: boolean;
  includeQualityIssues: boolean;
}

// ============================================================================
// TIPOS EXPORTADOS PARA USO EXTERNO
// ============================================================================

export type LabTestTableRow = LabTest & {
  formattedCreatedAt: string;
  formattedExpectedCompletion: string;
  priorityColor: string;
  statusColor: string;
  statusIcon: any;
  timeRemaining?: string;
  isOverdue?: boolean;
};

export type LabStatsCard = StatCard & {
  onClick?: () => void;
  subtitle?: string;
};

// Tipos de utilidad para componentes
export type PriorityColorMap = Record<TestPriority, string>;
export type StatusColorMap = Record<TestStatus, string>;
export type CategoryIconMap = Record<TestCategory, any>;

// Para paginación y ordenamiento
export interface TableConfig {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface SortConfig {
  key: keyof LabTest;
  direction: 'asc' | 'desc';
}
