/**
 * Dashboard Configuration Validations - Red-Salud Platform
 * 
 * Validaciones específicas para configuración de dashboards médicos personalizados.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { z } from 'zod';

// ============================================================================
// VALIDACIONES DE CONFIGURACIÓN DEL DASHBOARD
// ============================================================================

export const dashboardConfigurationSchema = z.object({
  selectedFeatures: z.array(z.string())
    .min(1, 'Debe seleccionar al menos una característica')
    .max(10, 'No puede seleccionar más de 10 características'),
  
  workingHours: z.object({
    monday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    tuesday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    wednesday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    thursday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    friday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    saturday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    }),
    sunday: z.object({
      isWorkingDay: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional()
    })
  }).refine((hours) => {
    // Verificar que al menos un día tenga horarios configurados
    const workingDays = Object.values(hours).filter(day => day.isWorkingDay);
    return workingDays.length > 0;
  }, 'Debe configurar al menos un día de trabajo'),
  
  dashboardLayout: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
    language: z.enum(['es', 'en']).default('es'),
    timezone: z.string().default('America/Caracas'),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
    timeFormat: z.enum(['12h', '24h']).default('24h')
  }).optional(),
  
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true)
  }).optional()
});

// ============================================================================
// CARACTERÍSTICAS DISPONIBLES DEL DASHBOARD
// ============================================================================

export const DASHBOARD_FEATURES = {
  // Gestión de Pacientes
  patient_management: {
    id: 'patient_management',
    name: 'Gestión de Pacientes',
    category: 'core',
    description: 'Lista y búsqueda de pacientes',
    required: true,
    medicalRoles: ['doctor', 'nurse', 'administrator']
  },
  medical_records: {
    id: 'medical_records',
    name: 'Expedientes Médicos',
    category: 'core',
    description: 'Acceso a historiales médicos',
    required: true,
    medicalRoles: ['doctor', 'nurse']
  },
  appointment_scheduling: {
    id: 'appointment_scheduling',
    name: 'Programación de Citas',
    category: 'core',
    description: 'Calendario de citas médicas',
    required: true,
    medicalRoles: ['doctor', 'nurse', 'administrator']
  },
  
  // Laboratorio e Integración
  lab_integration: {
    id: 'lab_integration',
    name: 'Integración de Laboratorio',
    category: 'integration',
    description: 'Resultados de laboratorio',
    required: false,
    medicalRoles: ['doctor', 'nurse', 'laboratory']
  },
  imaging_integration: {
    id: 'imaging_integration',
    name: 'Integración de Imágenes',
    category: 'integration',
    description: 'Radiologías y estudios de imagen',
    required: false,
    medicalRoles: ['doctor', 'radiologist']
  },
  
  // Monitoreo y Alertas
  vital_signs_monitoring: {
    id: 'vital_signs_monitoring',
    name: 'Monitoreo de Signos Vitales',
    category: 'monitoring',
    description: 'Seguimiento de signos vitales',
    required: false,
    medicalRoles: ['doctor', 'nurse', 'intensivist']
  },
  health_monitoring: {
    id: 'health_monitoring',
    name: 'Monitoreo de Salud',
    category: 'monitoring',
    description: 'Seguimiento general de salud',
    required: false,
    medicalRoles: ['doctor', 'nurse']
  },
  critical_alerts: {
    id: 'critical_alerts',
    name: 'Alertas Críticas',
    category: 'monitoring',
    description: 'Notificaciones de emergencia',
    required: false,
    medicalRoles: ['doctor', 'nurse', 'emergency']
  },
  
  // Comunicación
  patient_portal: {
    id: 'patient_portal',
    name: 'Portal del Paciente',
    category: 'communication',
    description: 'Comunicación con pacientes',
    required: false,
    medicalRoles: ['doctor', 'nurse']
  },
  telemedicine: {
    id: 'telemedicine',
    name: 'Telemedicina',
    category: 'communication',
    description: 'Consultas virtuales',
    required: false,
    medicalRoles: ['doctor']
  },
  family_communication: {
    id: 'family_communication',
    name: 'Comunicación Familiar',
    category: 'communication',
    description: 'Comunicación con familiares',
    required: false,
    medicalRoles: ['doctor', 'nurse', 'pediatrician']
  },
  
  // Gestión de Medicamentos
  medication_management: {
    id: 'medication_management',
    name: 'Gestión de Medicamentos',
    category: 'treatment',
    description: 'Prescripciones y seguimiento',
    required: false,
    medicalRoles: ['doctor', 'pharmacist']
  },
  prescription_management: {
    id: 'prescription_management',
    name: 'Gestión de Recetas',
    category: 'treatment',
    description: 'Recetas médicas digitales',
    required: false,
    medicalRoles: ['doctor']
  },
  
  // Especialidades Específicas
  surgical_planning: {
    id: 'surgical_planning',
    name: 'Planificación Quirúrgica',
    category: 'specialty',
    description: 'Gestión de cirugías',
    required: false,
    medicalRoles: ['surgeon']
  },
  rehabilitation_tracking: {
    id: 'rehabilitation_tracking',
    name: 'Seguimiento de Rehabilitación',
    category: 'specialty',
    description: 'Progreso de rehabilitación',
    required: false,
    medicalRoles: ['physiatrist', 'physiotherapist']
  },
  vaccination_tracking: {
    id: 'vaccination_tracking',
    name: 'Seguimiento de Vacunas',
    category: 'specialty',
    description: 'Control de vacunación',
    required: false,
    medicalRoles: ['pediatrician', 'family_doctor']
  },
  
  // Analytics y Reportes
  analytics_dashboard: {
    id: 'analytics_dashboard',
    name: 'Dashboard de Analíticas',
    category: 'analytics',
    description: 'Métricas y estadísticas',
    required: false,
    medicalRoles: ['doctor', 'administrator']
  },
  performance_metrics: {
    id: 'performance_metrics',
    name: 'Métricas de Rendimiento',
    category: 'analytics',
    description: 'Indicadores de desempeño',
    required: false,
    medicalRoles: ['administrator', 'quality_manager']
  },
  
  // Compliance y Seguridad
  audit_trail: {
    id: 'audit_trail',
    name: 'Registro de Auditoría',
    category: 'compliance',
    description: 'Trazabilidad de acciones',
    required: false,
    medicalRoles: ['administrator', 'compliance_officer']
  },
  compliance_monitoring: {
    id: 'compliance_monitoring',
    name: 'Monitoreo de Compliance',
    category: 'compliance',
    description: 'Cumplimiento normativo',
    required: false,
    medicalRoles: ['administrator', 'compliance_officer']
  }
} as const;

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface WorkingDay {
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
}

interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ============================================================================

/**
 * Valida la configuración de horarios de trabajo
 */
export function validateWorkingHours(workingHours: WorkingHours): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const days = Object.entries(workingHours);
  
  // Debe tener al menos un día de trabajo
  const workingDays = days.filter(([, day]) => day.isWorkingDay);
  if (workingDays.length === 0) {
    errors.push('Debe configurar al menos un día de trabajo');
    return { isValid: false, errors, warnings };
  }
  
  // Validar cada día de trabajo
  for (const [dayName, day] of workingDays) {
    if (!day.startTime || !day.endTime) {
      errors.push(`${dayName}: Debe especificar hora de inicio y fin para días de trabajo`);
      continue;
    }
    
    const start = new Date(`2000-01-01T${day.startTime}`);
    const end = new Date(`2000-01-01T${day.endTime}`);
    
    if (start >= end) {
      errors.push(`${dayName}: La hora de inicio debe ser anterior a la hora de fin`);
      continue;
    }
    
    // Verificar que no sea más de 12 horas de trabajo
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours > 12) {
      warnings.push(`${dayName}: Más de 12 horas de trabajo pueden afectar la calidad de atención`);
    }
    
    // Verificar horarios inusuales
    if (start.getHours() < 6 || end.getHours() > 22) {
      warnings.push(`${dayName}: Horario fuera del rango típico (06:00 - 22:00)`);
    }
  }
  
  // Verificar distribución semanal
  if (workingDays.length > 6) {
    warnings.push('Trabajar 7 días a la semana puede llevar al agotamiento profesional');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida que las características seleccionadas sean apropiadas para el rol médico
 */
export function validateFeaturesForRole(
  selectedFeatures: string[], 
  medicalRole: string, 
  specialty?: string
): { isValid: boolean; errors: string[]; recommendations: string[] } {
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  // Obtener características disponibles para el rol
  const availableFeatures = Object.values(DASHBOARD_FEATURES).filter(feature =>
    feature.medicalRoles.includes(medicalRole as any)
  );
  
  // Verificar que todas las características seleccionadas estén disponibles
  const unavailableFeatures = selectedFeatures.filter(featureId =>
    !availableFeatures.some(feature => feature.id === featureId)
  );
  
  if (unavailableFeatures.length > 0) {
    errors.push(`Las siguientes características no están disponibles para ${medicalRole}: ${unavailableFeatures.join(', ')}`);
  }
  
  // Verificar características requeridas
  const requiredFeatures = availableFeatures.filter(feature => feature.required);
  const missingRequired = requiredFeatures.filter(feature =>
    !selectedFeatures.includes(feature.id)
  );
  
  if (missingRequired.length > 0) {
    errors.push(`Características requeridas faltantes: ${missingRequired.map(f => f.name).join(', ')}`);
  }
  
  // Recomendaciones basadas en especialidad
  if (specialty) {
    const specialtyRecommendations = getSpecialtyRecommendations(specialty);
    const missingRecommended = specialtyRecommendations.filter(rec =>
      !selectedFeatures.includes(rec)
    );
    
    if (missingRecommended.length > 0) {
      recommendations.push(`Recomendado para ${specialty}: ${missingRecommended.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    recommendations
  };
}

/**
 * Obtiene recomendaciones de características basadas en la especialidad
 */
function getSpecialtyRecommendations(specialty: string): string[] {
  const specialtyRecommendations: Record<string, string[]> = {
    'cardiology': ['vital_signs_monitoring', 'lab_integration', 'critical_alerts'],
    'neurology': ['imaging_integration', 'critical_alerts', 'family_communication'],
    'oncology': ['lab_integration', 'medication_management', 'family_communication'],
    'pediatrics': ['vaccination_tracking', 'family_communication', 'health_monitoring'],
    'surgery': ['surgical_planning', 'critical_alerts', 'imaging_integration'],
    'psychiatry': ['telemedicine', 'medication_management', 'patient_portal'],
    'emergency_medicine': ['critical_alerts', 'vital_signs_monitoring', 'lab_integration']
  };
  
  return specialtyRecommendations[specialty] || [];
}

/**
 * Valida la configuración completa del dashboard
 */
export function validateDashboardConfiguration(config: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Validar características seleccionadas
  if (!config.selectedFeatures || config.selectedFeatures.length === 0) {
    errors.push('Debe seleccionar al menos una característica del dashboard');
  } else if (config.selectedFeatures.length > 10) {
    errors.push('No puede seleccionar más de 10 características');
  }
  
  // Validar horarios de trabajo
  if (config.workingHours) {
    const hoursValidation = validateWorkingHours(config.workingHours);
    errors.push(...hoursValidation.errors);
    warnings.push(...hoursValidation.warnings);
  }
  
  // Validar configuración de diseño
  if (config.dashboardLayout) {
    if (config.dashboardLayout.timezone && !isValidTimezone(config.dashboardLayout.timezone)) {
      errors.push('Zona horaria inválida');
    }
  }
  
  // Recomendaciones generales
  if (config.selectedFeatures?.length < 3) {
    recommendations.push('Considere agregar más características para aprovechar mejor la plataforma');
  }
  
  if (!config.notificationPreferences?.email) {
    warnings.push('Las notificaciones por email están deshabilitadas, podría perderse información importante');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
}

/**
 * Valida si una zona horaria es válida
 */
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Genera configuración por defecto basada en rol y especialidad
 */
export function generateDefaultConfiguration(medicalRole: string, specialty?: string): any {
  const baseFeatures = ['patient_management', 'medical_records', 'appointment_scheduling'];
  const specialtyFeatures = specialty ? getSpecialtyRecommendations(specialty) : [];
  
  return {
    selectedFeatures: [...baseFeatures, ...specialtyFeatures.slice(0, 3)],
    workingHours: {
      monday: { isWorkingDay: true, startTime: '08:00', endTime: '17:00' },
      tuesday: { isWorkingDay: true, startTime: '08:00', endTime: '17:00' },
      wednesday: { isWorkingDay: true, startTime: '08:00', endTime: '17:00' },
      thursday: { isWorkingDay: true, startTime: '08:00', endTime: '17:00' },
      friday: { isWorkingDay: true, startTime: '08:00', endTime: '17:00' },
      saturday: { isWorkingDay: false },
      sunday: { isWorkingDay: false }
    },
    dashboardLayout: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Caracas',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
      inApp: true
    }
  };
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type DashboardConfigurationValidation = z.infer<typeof dashboardConfigurationSchema>;

export type DashboardFeature = typeof DASHBOARD_FEATURES[keyof typeof DASHBOARD_FEATURES];

export type { WorkingDay, WorkingHours };

export interface DashboardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}
