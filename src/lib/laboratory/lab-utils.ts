/**
 * Laboratory Utilities - Red-Salud Platform
 * 
 * Funciones de utilidad específicas para el dominio de laboratorio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { 
  TestPriority, 
  TestStatus, 
  TestCategory,
  PriorityColorMap,
  StatusColorMap,
  LabTest,
  TestResult
} from '@/types/laboratory.types';
// Iconos movidos a src/components/laboratory/LabIcons.tsx

// ============================================================================
// MAPAS DE COLORES Y ESTILOS
// ============================================================================

export const PRIORITY_COLORS: PriorityColorMap = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  stat: 'bg-red-200 text-red-900 border-red-300 animate-pulse',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export const STATUS_COLORS: StatusColorMap = {
  received: 'bg-gray-100 text-gray-800 border-gray-200',
  registered: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  reviewed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  sent: 'bg-purple-100 text-purple-800 border-purple-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
};

export const CATEGORY_COLORS = {
  'Hematología': 'bg-red-50 text-red-700',
  'Bioquímica': 'bg-blue-50 text-blue-700',
  'Microbiología': 'bg-green-50 text-green-700',
  'Inmunología': 'bg-purple-50 text-purple-700',
  'Endocrinología': 'bg-yellow-50 text-yellow-700',
  'Genética': 'bg-pink-50 text-pink-700',
  'Toxicología': 'bg-orange-50 text-orange-700',
  'Anatomía Patológica': 'bg-indigo-50 text-indigo-700',
  'Citología': 'bg-teal-50 text-teal-700',
  'Histopatología': 'bg-cyan-50 text-cyan-700'
};

// ============================================================================
// FUNCIONES DE FORMATEO Y COLORES
// ============================================================================

/**
 * Obtiene la clase CSS para el color de prioridad
 */
export function getPriorityColor(priority: TestPriority): string {
  return PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Obtiene la clase CSS para el color de estado
 */
export function getStatusColor(status: TestStatus): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Funciones de iconos movidas a src/components/laboratory/LabIcons.tsx

/**
 * Convierte la prioridad a texto legible en español
 */
export function getPriorityText(priority: TestPriority): string {
  const priorityMap: Record<TestPriority, string> = {
    urgent: 'Urgente',
    stat: 'STAT',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  };
  
  return priorityMap[priority] || priority;
}

/**
 * Convierte el estado a texto legible en español
 */
export function getStatusText(status: TestStatus): string {
  const statusMap: Record<TestStatus, string> = {
    received: 'Recibido',
    registered: 'Registrado',
    processing: 'Procesando',
    completed: 'Completado',
    reviewed: 'Revisado',
    sent: 'Enviado',
    rejected: 'Rechazado',
    cancelled: 'Cancelado'
  };
  
  return statusMap[status] || status;
}

/**
 * Obtiene el color para la categoría del test
 */
export function getCategoryColor(category: TestCategory): string {
  return CATEGORY_COLORS[category] || 'bg-gray-50 text-gray-700';
}

// ============================================================================
// FUNCIONES DE UTILIDAD TEMPORAL
// ============================================================================

/**
 * Calcula el tiempo restante para completar un test
 */
export function calculateTimeRemaining(expectedCompletion: string): {
  text: string;
  isOverdue: boolean;
  urgency: 'low' | 'medium' | 'high';
} {
  const now = new Date();
  const completion = new Date(expectedCompletion);
  const diff = completion.getTime() - now.getTime();
  
  if (diff < 0) {
    const hoursOverdue = Math.abs(diff) / (1000 * 60 * 60);
    return {
      text: `Vencido hace ${Math.round(hoursOverdue)}h`,
      isOverdue: true,
      urgency: 'high'
    };
  }
  
  const hoursRemaining = diff / (1000 * 60 * 60);
  
  if (hoursRemaining < 2) {
    return {
      text: `${Math.round(hoursRemaining * 60)}min restantes`,
      isOverdue: false,
      urgency: 'high'
    };
  } else if (hoursRemaining < 24) {
    return {
      text: `${Math.round(hoursRemaining)}h restantes`,
      isOverdue: false,
      urgency: hoursRemaining < 6 ? 'medium' : 'low'
    };
  } else {
    const daysRemaining = Math.round(hoursRemaining / 24);
    return {
      text: `${daysRemaining} días restantes`,
      isOverdue: false,
      urgency: 'low'
    };
  }
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatTestDate(dateString: string, includeTime: boolean = false): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const timeFormat = includeTime ? 
    { hour: '2-digit', minute: '2-digit' } as const : 
    {};
  
  if (date.toDateString() === today.toDateString()) {
    return includeTime ? 
      `Hoy ${date.toLocaleTimeString('es-ES', timeFormat)}` :
      'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return includeTime ? 
      `Ayer ${date.toLocaleTimeString('es-ES', timeFormat)}` :
      'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      ...timeFormat
    });
  }
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si un test puede cambiar a un estado específico
 */
export function canChangeStatus(currentStatus: TestStatus, newStatus: TestStatus): boolean {
  const statusFlow: Record<TestStatus, TestStatus[]> = {
    received: ['registered', 'rejected'],
    registered: ['processing', 'cancelled'],
    processing: ['completed', 'rejected', 'cancelled'],
    completed: ['reviewed', 'sent'],
    reviewed: ['sent'],
    sent: [], // Estado final
    rejected: ['registered'], // Puede re-registrarse
    cancelled: [] // Estado final
  };
  
  return statusFlow[currentStatus]?.includes(newStatus) || false;
}

/**
 * Valida si un resultado crítico requiere notificación inmediata
 */
export function isCriticalResult(result: TestResult): boolean {
  return result.results.some(r => r.status === 'critical') ||
         result.quality_flags?.some(flag => 
           ['hemolyzed', 'contaminated', 'insufficient_sample'].includes(flag)
         ) || false;
}

/**
 * Valida si un test está dentro del tiempo objetivo
 */
export function isWithinTargetTime(test: LabTest, targetHours: number): boolean {
  const created = new Date(test.created_at);
  const now = new Date();
  const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  return hoursElapsed <= targetHours;
}

// ============================================================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// ============================================================================

/**
 * Filtra tests según múltiples criterios
 */
export function filterTests(
  tests: LabTest[],
  filters: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    dateRange?: { start: string; end: string };
  }
): LabTest[] {
  return tests.filter(test => {
    // Filtro por estado
    if (filters.status && filters.status !== 'all' && test.status !== filters.status) {
      return false;
    }
    
    // Filtro por prioridad
    if (filters.priority && filters.priority !== 'all' && test.priority !== filters.priority) {
      return false;
    }
    
    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        test.patient_name,
        test.doctor_name,
        test.test_type,
        test.notes || ''
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchLower)) {
        return false;
      }
    }
    
    // Filtro por rango de fechas
    if (filters.dateRange) {
      const testDate = new Date(test.created_at);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (testDate < startDate || testDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Ordena tests según un criterio específico
 */
export function sortTests(
  tests: LabTest[],
  sortBy: keyof LabTest,
  order: 'asc' | 'desc' = 'desc'
): LabTest[] {
  return [...tests].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Manejo especial para fechas
    if (sortBy === 'created_at' || sortBy === 'expected_completion') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    // Manejo especial para prioridad
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 5, stat: 4, high: 3, medium: 2, low: 1 };
      aValue = priorityOrder[aValue as TestPriority];
      bValue = priorityOrder[bValue as TestPriority];
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// FUNCIONES DE CÁLCULO DE ESTADÍSTICAS
// ============================================================================

/**
 * Calcula estadísticas básicas de una lista de tests
 */
export function calculateTestStatistics(tests: LabTest[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    total: tests.length,
    pending: tests.filter(t => ['received', 'registered', 'processing'].includes(t.status)).length,
    completed: tests.filter(t => ['completed', 'reviewed', 'sent'].includes(t.status)).length,
    completedToday: tests.filter(t => 
      ['completed', 'reviewed', 'sent'].includes(t.status) &&
      new Date(t.created_at) >= todayStart
    ).length,
    urgent: tests.filter(t => t.priority === 'urgent' || t.priority === 'stat').length,
    overdue: tests.filter(t => {
      const expected = new Date(t.expected_completion);
      return expected < now && !['completed', 'reviewed', 'sent'].includes(t.status);
    }).length
  };
}

/**
 * Calcula el tiempo promedio de procesamiento
 */
export function calculateAverageProcessingTime(tests: LabTest[]): number {
  const completedTests = tests.filter(t => 
    ['completed', 'reviewed', 'sent'].includes(t.status)
  );
  
  if (completedTests.length === 0) return 0;
  
  const totalHours = completedTests.reduce((sum, test) => {
    const created = new Date(test.created_at);
    const expected = new Date(test.expected_completion);
    return sum + (expected.getTime() - created.getTime()) / (1000 * 60 * 60);
  }, 0);
  
  return Math.round(totalHours / completedTests.length);
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN DE BUSINESS RULES
// ============================================================================

/**
 * Valida si un test cumple con los estándares de calidad
 */
export function validateTestQuality(test: LabTest): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Validar tiempo de procesamiento
  const timeRemaining = calculateTimeRemaining(test.expected_completion);
  if (timeRemaining.isOverdue) {
    errors.push('Test vencido - revisar inmediatamente');
  } else if (timeRemaining.urgency === 'high') {
    warnings.push('Test próximo a vencer');
  }
  
  // Validar prioridad vs tiempo
  if (test.priority === 'urgent' || test.priority === 'stat') {
    const hoursElapsed = (new Date().getTime() - new Date(test.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 2) {
      errors.push('Test urgente excede tiempo permitido');
    }
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Genera un ID único para muestras de laboratorio
 */
export function generateSampleId(prefix: string = 'LAB'): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const time = Date.now().toString().slice(-6);
  
  return `${prefix}${year}${month}${day}${time}`;
}
