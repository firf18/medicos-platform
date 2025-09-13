/**
 * Especialidades Médicas - Red-Salud Platform
 * Estructura completa de especialidades médicas con dashboards personalizados
 */

export interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  category: SpecialtyCategory;
  icon: string;
  color: string;
  dashboardFeatures: DashboardFeature[];
  requiredValidations: ValidationRequirement[];
  estimatedPatients: 'low' | 'medium' | 'high';
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export type SpecialtyCategory = 
  | 'medicina_general'
  | 'especialidades_medicas'
  | 'especialidades_quirurgicas'
  | 'medicina_diagnostica'
  | 'medicina_alternativa'
  | 'salud_mental'
  | 'pediatria_especializada';

export interface DashboardFeature {
  id: string;
  name: string;
  description: string;
  component: string;
  priority: 'essential' | 'important' | 'optional';
  category: 'patient_management' | 'diagnostics' | 'treatments' | 'analytics' | 'communication';
}

export interface ValidationRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documentType: 'license' | 'certificate' | 'specialty_board' | 'hospital_affiliation';
}

// Características base que todos los dashboards médicos comparten
export const BASE_DASHBOARD_FEATURES: DashboardFeature[] = [
  {
    id: 'patient_list',
    name: 'Lista de Pacientes',
    description: 'Gestión y visualización de pacientes asignados',
    component: 'PatientListWidget',
    priority: 'essential',
    category: 'patient_management'
  },
  {
    id: 'appointments',
    name: 'Agenda de Citas',
    description: 'Calendario y programación de citas médicas',
    component: 'AppointmentCalendarWidget',
    priority: 'essential',
    category: 'patient_management'
  },
  {
    id: 'medical_records',
    name: 'Expedientes Médicos',
    description: 'Acceso y edición de historiales médicos',
    component: 'MedicalRecordsWidget',
    priority: 'essential',
    category: 'patient_management'
  },
  {
    id: 'notifications',
    name: 'Notificaciones',
    description: 'Alertas médicas, recordatorios y comunicaciones',
    component: 'NotificationsWidget',
    priority: 'essential',
    category: 'communication'
  },
  {
    id: 'analytics_basic',
    name: 'Estadísticas Básicas',
    description: 'Métricas básicas de consultas y pacientes',
    component: 'BasicAnalyticsWidget',
    priority: 'important',
    category: 'analytics'
  }
];

// Validaciones base requeridas para todos los médicos
export const BASE_VALIDATIONS: ValidationRequirement[] = [
  {
    id: 'medical_license',
    name: 'Cédula Profesional',
    description: 'Licencia médica vigente',
    required: true,
    documentType: 'license'
  },
  {
    id: 'identity_verification',
    name: 'Verificación de Identidad',
    description: 'Verificación biométrica con Didit.me',
    required: true,
    documentType: 'license'
  }
];

/**
 * ESPECIALIDADES MÉDICAS COMPLETAS
 * Organizadas por categorías con dashboards personalizados
 */
export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
  // === MEDICINA GENERAL ===
  {
    id: 'medicina_general',
    name: 'Medicina General',
    description: 'Atención médica integral y preventiva para todas las edades',
    category: 'medicina_general',
    icon: 'Stethoscope',
    color: 'blue',
    estimatedPatients: 'high',
    complexity: 'basic',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'vital_signs',
        name: 'Signos Vitales',
        description: 'Monitoreo de presión arterial, peso, talla, etc.',
        component: 'VitalSignsWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'prevention_alerts',
        name: 'Alertas Preventivas',
        description: 'Recordatorios de vacunas, chequeos preventivos',
        component: 'PreventionAlertsWidget',
        priority: 'important',
        category: 'patient_management'
      }
    ],
    requiredValidations: BASE_VALIDATIONS
  },

  // === ESPECIALIDADES MÉDICAS ===
  {
    id: 'cardiologia',
    name: 'Cardiología',
    description: 'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular',
    category: 'especialidades_medicas',
    icon: 'Heart',
    color: 'red',
    estimatedPatients: 'medium',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'ecg_monitor',
        name: 'Monitor ECG',
        description: 'Seguimiento de electrocardiogramas y ritmos cardíacos',
        component: 'ECGMonitorWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'cardiac_risk',
        name: 'Evaluación de Riesgo Cardíaco',
        description: 'Calculadora de riesgo cardiovascular y estratificación',
        component: 'CardiacRiskWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'medication_interactions',
        name: 'Interacciones Medicamentosas',
        description: 'Verificación de interacciones entre medicamentos cardíacos',
        component: 'MedicationInteractionsWidget',
        priority: 'important',
        category: 'treatments'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'cardiology_board',
        name: 'Certificación en Cardiología',
        description: 'Título de especialidad en cardiología',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },

  {
    id: 'dermatologia',
    name: 'Dermatología',
    description: 'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas',
    category: 'especialidades_medicas',
    icon: 'Zap',
    color: 'orange',
    estimatedPatients: 'medium',
    complexity: 'intermediate',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'skin_analysis',
        name: 'Análisis Dermatológico',
        description: 'Herramientas para análisis y seguimiento de lesiones cutáneas',
        component: 'SkinAnalysisWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'photo_documentation',
        name: 'Documentación Fotográfica',
        description: 'Seguimiento fotográfico de lesiones y tratamientos',
        component: 'PhotoDocumentationWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'treatment_protocols',
        name: 'Protocolos de Tratamiento',
        description: 'Guías de tratamiento para condiciones dermatológicas comunes',
        component: 'TreatmentProtocolsWidget',
        priority: 'important',
        category: 'treatments'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'dermatology_board',
        name: 'Certificación en Dermatología',
        description: 'Título de especialidad en dermatología',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },

  // === PEDIATRÍA ===
  {
    id: 'pediatria',
    name: 'Pediatría',
    description: 'Atención médica especializada para bebés, niños y adolescentes',
    category: 'pediatria_especializada',
    icon: 'Baby',
    color: 'green',
    estimatedPatients: 'high',
    complexity: 'intermediate',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'growth_charts',
        name: 'Gráficas de Crecimiento',
        description: 'Seguimiento de peso, talla y desarrollo infantil',
        component: 'GrowthChartsWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'vaccination_schedule',
        name: 'Esquema de Vacunación',
        description: 'Calendario y seguimiento de vacunas pediátricas',
        component: 'VaccinationScheduleWidget',
        priority: 'essential',
        category: 'patient_management'
      },
      {
        id: 'developmental_milestones',
        name: 'Hitos del Desarrollo',
        description: 'Evaluación de desarrollo psicomotor y cognitivo',
        component: 'DevelopmentalMilestonesWidget',
        priority: 'important',
        category: 'diagnostics'
      },
      {
        id: 'parent_communication',
        name: 'Comunicación con Padres',
        description: 'Canal específico para comunicación con padres/tutores',
        component: 'ParentCommunicationWidget',
        priority: 'important',
        category: 'communication'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'pediatrics_board',
        name: 'Certificación en Pediatría',
        description: 'Título de especialidad en pediatría',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },

  // === ESPECIALIDADES QUIRÚRGICAS ===
  {
    id: 'cirugia_general',
    name: 'Cirugía General',
    description: 'Diagnóstico y tratamiento quirúrgico de enfermedades abdominales y generales',
    category: 'especialidades_quirurgicas',
    icon: 'Scissors',
    color: 'purple',
    estimatedPatients: 'medium',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'surgical_schedule',
        name: 'Programación Quirúrgica',
        description: 'Calendario de cirugías y preparación preoperatoria',
        component: 'SurgicalScheduleWidget',
        priority: 'essential',
        category: 'patient_management'
      },
      {
        id: 'preop_checklist',
        name: 'Lista Preoperatoria',
        description: 'Checklist de evaluación preoperatoria y autorización',
        component: 'PreOpChecklistWidget',
        priority: 'essential',
        category: 'treatments'
      },
      {
        id: 'postop_followup',
        name: 'Seguimiento Postoperatorio',
        description: 'Monitoreo de recuperación y cuidados postquirúrgicos',
        component: 'PostOpFollowupWidget',
        priority: 'essential',
        category: 'patient_management'
      },
      {
        id: 'surgical_outcomes',
        name: 'Resultados Quirúrgicos',
        description: 'Análisis de resultados y complicaciones quirúrgicas',
        component: 'SurgicalOutcomesWidget',
        priority: 'important',
        category: 'analytics'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'surgery_board',
        name: 'Certificación en Cirugía General',
        description: 'Título de especialidad en cirugía general',
        required: true,
        documentType: 'specialty_board'
      },
      {
        id: 'hospital_privileges',
        name: 'Privilegios Hospitalarios',
        description: 'Documento de privilegios quirúrgicos en hospital',
        required: true,
        documentType: 'hospital_affiliation'
      }
    ]
  },

  // === MEDICINA DIAGNÓSTICA ===
  {
    id: 'radiologia',
    name: 'Radiología',
    description: 'Diagnóstico por imágenes médicas y procedimientos intervencionistas',
    category: 'medicina_diagnostica',
    icon: 'Scan',
    color: 'teal',
    estimatedPatients: 'high',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'imaging_viewer',
        name: 'Visor de Imágenes',
        description: 'Visualización y análisis de estudios radiológicos DICOM',
        component: 'ImagingViewerWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'radiology_reports',
        name: 'Informes Radiológicos',
        description: 'Creación y gestión de informes radiológicos estructurados',
        component: 'RadiologyReportsWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'study_prioritization',
        name: 'Priorización de Estudios',
        description: 'Sistema de priorización de estudios urgentes y rutinarios',
        component: 'StudyPrioritizationWidget',
        priority: 'important',
        category: 'patient_management'
      },
      {
        id: 'ai_assistance',
        name: 'Asistencia IA',
        description: 'Herramientas de inteligencia artificial para análisis de imágenes',
        component: 'AIAssistanceWidget',
        priority: 'optional',
        category: 'diagnostics'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'radiology_board',
        name: 'Certificación en Radiología',
        description: 'Título de especialidad en radiología e imágenes',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },

  // === SALUD MENTAL ===
  {
    id: 'psiquiatria',
    name: 'Psiquiatría',
    description: 'Diagnóstico y tratamiento de trastornos mentales y del comportamiento',
    category: 'salud_mental',
    icon: 'Brain',
    color: 'indigo',
    estimatedPatients: 'medium',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES,
      {
        id: 'mental_health_assessments',
        name: 'Evaluaciones de Salud Mental',
        description: 'Escalas de evaluación y cuestionarios psiquiátricos',
        component: 'MentalHealthAssessmentsWidget',
        priority: 'essential',
        category: 'diagnostics'
      },
      {
        id: 'medication_monitoring',
        name: 'Monitoreo de Medicación',
        description: 'Seguimiento de efectividad y efectos secundarios de psicofármacos',
        component: 'MedicationMonitoringWidget',
        priority: 'essential',
        category: 'treatments'
      },
      {
        id: 'therapy_notes',
        name: 'Notas de Terapia',
        description: 'Registro estructurado de sesiones terapéuticas',
        component: 'TherapyNotesWidget',
        priority: 'essential',
        category: 'patient_management'
      },
      {
        id: 'crisis_management',
        name: 'Manejo de Crisis',
        description: 'Protocolos y herramientas para situaciones de crisis mental',
        component: 'CrisisManagementWidget',
        priority: 'important',
        category: 'patient_management'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'psychiatry_board',
        name: 'Certificación en Psiquiatría',
        description: 'Título de especialidad en psiquiatría',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  }
];

/**
 * Función para obtener especialidad por ID
 */
export function getSpecialtyById(id: string): MedicalSpecialty | undefined {
  return MEDICAL_SPECIALTIES.find(specialty => specialty.id === id);
}

/**
 * Función para obtener especialidades por categoría
 */
export function getSpecialtiesByCategory(category: SpecialtyCategory): MedicalSpecialty[] {
  return MEDICAL_SPECIALTIES.filter(specialty => specialty.category === category);
}

/**
 * Función para obtener dashboards features por especialidad
 */
export function getDashboardFeatures(specialtyId: string): DashboardFeature[] {
  const specialty = getSpecialtyById(specialtyId);
  return specialty?.dashboardFeatures || BASE_DASHBOARD_FEATURES;
}

/**
 * Función para obtener validaciones requeridas por especialidad
 */
export function getRequiredValidations(specialtyId: string): ValidationRequirement[] {
  const specialty = getSpecialtyById(specialtyId);
  return specialty?.requiredValidations || BASE_VALIDATIONS;
}
