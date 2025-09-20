/**
 * Base Dashboard Features - Red-Salud Platform
 * 
 * Características base que todos los dashboards médicos comparten.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { DashboardFeature } from '@/types/medical-specialties.types';

// ============================================================================
// CARACTERÍSTICAS ESENCIALES PARA TODOS LOS DASHBOARDS
// ============================================================================

export const ESSENTIAL_FEATURES: DashboardFeature[] = [
  {
    id: 'patient_list',
    name: 'Lista de Pacientes',
    description: 'Gestión y visualización de pacientes asignados con filtros avanzados',
    component: 'PatientListWidget',
    priority: 'essential',
    category: 'patient_management',
    requiredPermissions: ['patients:read'],
    estimatedImplementationTime: 3
  },
  {
    id: 'appointments',
    name: 'Agenda de Citas',
    description: 'Calendario y programación de citas médicas con integración de disponibilidad',
    component: 'AppointmentCalendarWidget',
    priority: 'essential',
    category: 'patient_management',
    requiredPermissions: ['appointments:read', 'appointments:create'],
    estimatedImplementationTime: 5
  },
  {
    id: 'medical_records',
    name: 'Expedientes Médicos',
    description: 'Acceso y edición de historiales médicos con cumplimiento HIPAA',
    component: 'MedicalRecordsWidget',
    priority: 'essential',
    category: 'patient_management',
    requiredPermissions: ['medical_records:read', 'medical_records:write'],
    estimatedImplementationTime: 7
  },
  {
    id: 'notifications',
    name: 'Notificaciones',
    description: 'Alertas médicas, recordatorios y comunicaciones importantes',
    component: 'NotificationsWidget',
    priority: 'essential',
    category: 'communication',
    requiredPermissions: ['notifications:read'],
    estimatedImplementationTime: 2
  }
];

// ============================================================================
// CARACTERÍSTICAS IMPORTANTES (RECOMENDADAS)
// ============================================================================

export const IMPORTANT_FEATURES: DashboardFeature[] = [
  {
    id: 'analytics_basic',
    name: 'Estadísticas Básicas',
    description: 'Métricas básicas de consultas, pacientes y rendimiento',
    component: 'BasicAnalyticsWidget',
    priority: 'important',
    category: 'analytics',
    requiredPermissions: ['analytics:read'],
    estimatedImplementationTime: 4
  },
  {
    id: 'task_management',
    name: 'Gestión de Tareas',
    description: 'Lista de tareas pendientes, recordatorios y seguimientos',
    component: 'TaskManagementWidget',
    priority: 'important',
    category: 'patient_management',
    requiredPermissions: ['tasks:read', 'tasks:create'],
    estimatedImplementationTime: 3
  },
  {
    id: 'quick_notes',
    name: 'Notas Rápidas',
    description: 'Sistema de notas rápidas para recordatorios y observaciones',
    component: 'QuickNotesWidget',
    priority: 'important',
    category: 'patient_management',
    requiredPermissions: ['notes:read', 'notes:write'],
    estimatedImplementationTime: 2
  },
  {
    id: 'patient_search',
    name: 'Búsqueda de Pacientes',
    description: 'Búsqueda avanzada de pacientes por múltiples criterios',
    component: 'PatientSearchWidget',
    priority: 'important',
    category: 'patient_management',
    requiredPermissions: ['patients:search'],
    estimatedImplementationTime: 4
  }
];

// ============================================================================
// CARACTERÍSTICAS OPCIONALES
// ============================================================================

export const OPTIONAL_FEATURES: DashboardFeature[] = [
  {
    id: 'weather_widget',
    name: 'Información del Clima',
    description: 'Widget informativo del clima para contextualización',
    component: 'WeatherWidget',
    priority: 'optional',
    category: 'administration',
    requiredPermissions: [],
    estimatedImplementationTime: 1
  },
  {
    id: 'news_feed',
    name: 'Noticias Médicas',
    description: 'Feed de noticias y actualizaciones médicas relevantes',
    component: 'NewsFeedWidget',
    priority: 'optional',
    category: 'education',
    requiredPermissions: ['news:read'],
    estimatedImplementationTime: 3
  },
  {
    id: 'calculator_tools',
    name: 'Calculadoras Médicas',
    description: 'Conjunto de calculadoras médicas comunes (IMC, dosis, etc.)',
    component: 'CalculatorToolsWidget',
    priority: 'optional',
    category: 'diagnostics',
    requiredPermissions: [],
    estimatedImplementationTime: 5
  },
  {
    id: 'shortcuts',
    name: 'Accesos Rápidos',
    description: 'Botones de acceso rápido a funciones frecuentes',
    component: 'ShortcutsWidget',
    priority: 'optional',
    category: 'administration',
    requiredPermissions: ['shortcuts:read'],
    estimatedImplementationTime: 2
  }
];

// ============================================================================
// CARACTERÍSTICAS DE COMUNICACIÓN
// ============================================================================

export const COMMUNICATION_FEATURES: DashboardFeature[] = [
  {
    id: 'patient_messages',
    name: 'Mensajes de Pacientes',
    description: 'Sistema de mensajería segura con pacientes',
    component: 'PatientMessagesWidget',
    priority: 'important',
    category: 'communication',
    requiredPermissions: ['messages:read', 'messages:send'],
    estimatedImplementationTime: 6
  },
  {
    id: 'colleague_chat',
    name: 'Chat con Colegas',
    description: 'Comunicación interna entre profesionales médicos',
    component: 'ColleagueChatWidget',
    priority: 'optional',
    category: 'communication',
    requiredPermissions: ['internal_chat:read', 'internal_chat:send'],
    estimatedImplementationTime: 4
  },
  {
    id: 'consultation_requests',
    name: 'Solicitudes de Consulta',
    description: 'Gestión de interconsultas y referencias médicas',
    component: 'ConsultationRequestsWidget',
    priority: 'important',
    category: 'communication',
    requiredPermissions: ['consultations:read', 'consultations:create'],
    estimatedImplementationTime: 5
  },
  {
    id: 'telemedicine_hub',
    name: 'Centro de Telemedicina',
    description: 'Acceso rápido a consultas virtuales y videollamadas',
    component: 'TelemedicineHubWidget',
    priority: 'optional',
    category: 'communication',
    requiredPermissions: ['telemedicine:access'],
    estimatedImplementationTime: 8
  }
];

// ============================================================================
// CARACTERÍSTICAS DE ADMINISTRACIÓN
// ============================================================================

export const ADMINISTRATIVE_FEATURES: DashboardFeature[] = [
  {
    id: 'schedule_overview',
    name: 'Resumen de Agenda',
    description: 'Vista panorámica de la agenda semanal y mensual',
    component: 'ScheduleOverviewWidget',
    priority: 'important',
    category: 'administration',
    requiredPermissions: ['schedule:read'],
    estimatedImplementationTime: 3
  },
  {
    id: 'billing_summary',
    name: 'Resumen de Facturación',
    description: 'Información resumida de facturación y cobros',
    component: 'BillingSummaryWidget',
    priority: 'optional',
    category: 'administration',
    requiredPermissions: ['billing:read'],
    estimatedImplementationTime: 4
  },
  {
    id: 'compliance_monitor',
    name: 'Monitor de Cumplimiento',
    description: 'Seguimiento de cumplimiento regulatorio y certificaciones',
    component: 'ComplianceMonitorWidget',
    priority: 'important',
    category: 'administration',
    requiredPermissions: ['compliance:read'],
    estimatedImplementationTime: 6
  },
  {
    id: 'resource_utilization',
    name: 'Utilización de Recursos',
    description: 'Métricas de uso de equipos, salas y recursos médicos',
    component: 'ResourceUtilizationWidget',
    priority: 'optional',
    category: 'administration',
    requiredPermissions: ['resources:read'],
    estimatedImplementationTime: 5
  }
];

// ============================================================================
// CARACTERÍSTICAS EDUCATIVAS
// ============================================================================

export const EDUCATIONAL_FEATURES: DashboardFeature[] = [
  {
    id: 'cme_tracker',
    name: 'Seguimiento de EMC',
    description: 'Tracking de Educación Médica Continua y certificaciones',
    component: 'CMETrackerWidget',
    priority: 'optional',
    category: 'education',
    requiredPermissions: ['education:read'],
    estimatedImplementationTime: 4
  },
  {
    id: 'case_studies',
    name: 'Casos de Estudio',
    description: 'Acceso a biblioteca de casos clínicos educativos',
    component: 'CaseStudiesWidget',
    priority: 'optional',
    category: 'education',
    requiredPermissions: ['education:read'],
    estimatedImplementationTime: 6
  },
  {
    id: 'medical_references',
    name: 'Referencias Médicas',
    description: 'Acceso rápido a referencias y guías clínicas',
    component: 'MedicalReferencesWidget',
    priority: 'optional',
    category: 'education',
    requiredPermissions: ['references:read'],
    estimatedImplementationTime: 3
  }
];

// ============================================================================
// COLECCIÓN COMPLETA DE CARACTERÍSTICAS BASE
// ============================================================================

export const BASE_DASHBOARD_FEATURES: DashboardFeature[] = [
  ...ESSENTIAL_FEATURES,
  ...IMPORTANT_FEATURES,
  ...OPTIONAL_FEATURES,
  ...COMMUNICATION_FEATURES,
  ...ADMINISTRATIVE_FEATURES,
  ...EDUCATIONAL_FEATURES
];

// ============================================================================
// FUNCIONES DE UTILIDAD PARA CARACTERÍSTICAS BASE
// ============================================================================

/**
 * Obtiene las características esenciales mínimas
 */
export function getEssentialFeatures(): DashboardFeature[] {
  return ESSENTIAL_FEATURES;
}

/**
 * Obtiene características por categoría
 */
export function getFeaturesByCategory(category: DashboardFeature['category']): DashboardFeature[] {
  return BASE_DASHBOARD_FEATURES.filter(feature => feature.category === category);
}

/**
 * Obtiene características por prioridad
 */
export function getFeaturesByPriority(priority: DashboardFeature['priority']): DashboardFeature[] {
  return BASE_DASHBOARD_FEATURES.filter(feature => feature.priority === priority);
}

/**
 * Obtiene características que requieren permisos específicos
 */
export function getFeaturesByPermission(permission: string): DashboardFeature[] {
  return BASE_DASHBOARD_FEATURES.filter(feature => 
    feature.requiredPermissions?.includes(permission)
  );
}

/**
 * Calcula el tiempo total estimado de implementación
 */
export function calculateImplementationTime(features: DashboardFeature[]): number {
  return features.reduce((total, feature) => 
    total + (feature.estimatedImplementationTime || 0), 0
  );
}

/**
 * Valida si una lista de características es válida
 */
export function validateFeatureConfiguration(selectedFeatures: string[]): {
  isValid: boolean;
  missingEssential: string[];
  warnings: string[];
} {
  const essentialIds = ESSENTIAL_FEATURES.map(f => f.id);
  const missingEssential = essentialIds.filter(id => !selectedFeatures.includes(id));
  
  const warnings: string[] = [];
  
  // Verificar si faltan características importantes
  const importantIds = IMPORTANT_FEATURES.map(f => f.id);
  const missingImportant = importantIds.filter(id => !selectedFeatures.includes(id));
  
  if (missingImportant.length > 0) {
    warnings.push(`Faltan características importantes recomendadas: ${missingImportant.join(', ')}`);
  }
  
  // Verificar si la selección es demasiado básica
  if (selectedFeatures.length < 6) {
    warnings.push('La configuración del dashboard parece muy básica. Considera agregar más características.');
  }
  
  return {
    isValid: missingEssential.length === 0,
    missingEssential,
    warnings
  };
}

/**
 * Genera configuración recomendada basada en el rol
 */
export function getRecommendedConfigurationForRole(role: string): string[] {
  const baseFeatures = ESSENTIAL_FEATURES.map(f => f.id);
  
  switch (role) {
    case 'senior_doctor':
      return [
        ...baseFeatures,
        'analytics_basic',
        'task_management',
        'patient_messages',
        'consultation_requests',
        'schedule_overview',
        'compliance_monitor'
      ];
      
    case 'resident':
      return [
        ...baseFeatures,
        'quick_notes',
        'medical_references',
        'case_studies',
        'cme_tracker'
      ];
      
    case 'specialist':
      return [
        ...baseFeatures,
        'analytics_basic',
        'consultation_requests',
        'telemedicine_hub',
        'medical_references'
      ];
      
    default:
      return baseFeatures;
  }
}

// ============================================================================
// MAPAS PARA ACCESO RÁPIDO
// ============================================================================

export const FEATURE_MAP = new Map(
  BASE_DASHBOARD_FEATURES.map(feature => [feature.id, feature])
);

export const FEATURES_BY_CATEGORY = BASE_DASHBOARD_FEATURES.reduce((acc, feature) => {
  if (!acc[feature.category]) {
    acc[feature.category] = [];
  }
  acc[feature.category].push(feature);
  return acc;
}, {} as Record<string, DashboardFeature[]>);

export const FEATURES_BY_PRIORITY = BASE_DASHBOARD_FEATURES.reduce((acc, feature) => {
  if (!acc[feature.priority]) {
    acc[feature.priority] = [];
  }
  acc[feature.priority].push(feature);
  return acc;
}, {} as Record<string, DashboardFeature[]>);
