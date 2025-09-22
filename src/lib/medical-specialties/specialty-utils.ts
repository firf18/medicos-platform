/**
 * Medical Specialty Utilities - Red-Salud Platform
 * 
 * Funciones de utilidad para trabajar con especialidades médicas.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { MedicalSpecialty, DashboardFeature, ValidationRequirement } from '@/types/medical-specialties.types';
import { MEDICAL_SPECIALTIES, BASE_VALIDATIONS } from './specialties-data';
import { BASE_DASHBOARD_FEATURES } from './base-features';

// ============================================================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================================================

/**
 * Obtiene una especialidad por su ID
 */
export function getSpecialtyById(id: string): MedicalSpecialty | undefined {
  return MEDICAL_SPECIALTIES.find(specialty => specialty.id === id);
}

/**
 * Obtiene especialidades por categoría
 */
export function getSpecialtiesByCategory(category: string): MedicalSpecialty[] {
  return MEDICAL_SPECIALTIES.filter(specialty => specialty.category === category);
}

/**
 * Obtiene especialidades por nivel de complejidad
 */
export function getSpecialtiesByComplexity(complexity: MedicalSpecialty['complexity']): MedicalSpecialty[] {
  return MEDICAL_SPECIALTIES.filter(specialty => specialty.complexity === complexity);
}

/**
 * Obtiene especialidades por estimación de pacientes
 */
export function getSpecialtiesByPatientEstimate(estimate: MedicalSpecialty['estimatedPatients']): MedicalSpecialty[] {
  return MEDICAL_SPECIALTIES.filter(specialty => specialty.estimatedPatients === estimate);
}

/**
 * Busca especialidades por nombre (búsqueda parcial)
 */
export function searchSpecialtiesByName(query: string): MedicalSpecialty[] {
  const lowercaseQuery = query.toLowerCase();
  return MEDICAL_SPECIALTIES.filter(specialty => 
    specialty.name.toLowerCase().includes(lowercaseQuery) ||
    specialty.description.toLowerCase().includes(lowercaseQuery)
  );
}

// ============================================================================
// FUNCIONES DE CARACTERÍSTICAS DEL DASHBOARD
// ============================================================================

/**
 * Obtiene las características del dashboard para una especialidad
 */
export function getDashboardFeatures(specialtyId: string): DashboardFeature[] {
  const specialty = getSpecialtyById(specialtyId);
  return specialty?.dashboardFeatures || BASE_DASHBOARD_FEATURES;
}

/**
 * Obtiene características por prioridad para una especialidad
 */
export function getDashboardFeaturesByPriority(specialtyId: string, priority: DashboardFeature['priority']): DashboardFeature[] {
  const features = getDashboardFeatures(specialtyId);
  return features.filter(feature => feature.priority === priority);
}

/**
 * Obtiene características por categoría para una especialidad
 */
export function getDashboardFeaturesByCategory(specialtyId: string, category: DashboardFeature['category']): DashboardFeature[] {
  const features = getDashboardFeatures(specialtyId);
  return features.filter(feature => feature.category === category);
}

/**
 * Verifica si una característica está disponible para una especialidad
 */
export function isFeatureAvailableForSpecialty(featureId: string, specialtyId: string): boolean {
  const features = getDashboardFeatures(specialtyId);
  return features.some(feature => feature.id === featureId);
}

/**
 * Obtiene características esenciales para una especialidad
 */
export function getEssentialFeaturesForSpecialty(specialtyId: string): DashboardFeature[] {
  return getDashboardFeaturesByPriority(specialtyId, 'essential');
}

// ============================================================================
// FUNCIONES DE VALIDACIONES
// ============================================================================

/**
 * Obtiene las validaciones requeridas para una especialidad
 */
export function getRequiredValidations(specialtyId: string): ValidationRequirement[] {
  const specialty = getSpecialtyById(specialtyId);
  return specialty?.requiredValidations || BASE_VALIDATIONS;
}

/**
 * Verifica si una validación es requerida para una especialidad
 */
export function isValidationRequired(specialtyId: string, validationId: string): boolean {
  const validations = getRequiredValidations(specialtyId);
  return validations.some(validation => validation.id === validationId);
}

/**
 * Obtiene validaciones por tipo de documento
 */
export function getValidationsByDocumentType(specialtyId: string, documentType: string): ValidationRequirement[] {
  const validations = getRequiredValidations(specialtyId);
  return validations.filter(validation => validation.documentType === documentType);
}

// ============================================================================
// FUNCIONES DE ANÁLISIS Y ESTADÍSTICAS
// ============================================================================

/**
 * Calcula el tiempo total estimado de implementación para una especialidad
 */
export function calculateImplementationTime(specialtyId: string): number {
  const features = getDashboardFeatures(specialtyId);
  return features.reduce((total, feature) => 
    total + (feature.estimatedImplementationTime || 0), 0
  );
}

/**
 * Obtiene estadísticas de características por especialidad
 */
export function getSpecialtyFeatureStats(specialtyId: string): {
  totalFeatures: number;
  essentialFeatures: number;
  importantFeatures: number;
  optionalFeatures: number;
  estimatedImplementationTime: number;
} {
  const features = getDashboardFeatures(specialtyId);
  
  return {
    totalFeatures: features.length,
    essentialFeatures: features.filter(f => f.priority === 'essential').length,
    importantFeatures: features.filter(f => f.priority === 'important').length,
    optionalFeatures: features.filter(f => f.priority === 'optional').length,
    estimatedImplementationTime: calculateImplementationTime(specialtyId)
  };
}

/**
 * Compara dos especialidades por complejidad
 */
export function compareSpecialtiesByComplexity(specialtyId1: string, specialtyId2: string): number {
  const complexityOrder = { 'basic': 1, 'intermediate': 2, 'advanced': 3 };
  const specialty1 = getSpecialtyById(specialtyId1);
  const specialty2 = getSpecialtyById(specialtyId2);
  
  if (!specialty1 || !specialty2) return 0;
  
  return complexityOrder[specialty1.complexity] - complexityOrder[specialty2.complexity];
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN Y CONFIGURACIÓN
// ============================================================================

/**
 * Valida la configuración de características para una especialidad
 */
export function validateSpecialtyConfiguration(specialtyId: string, selectedFeatures: string[]): {
  isValid: boolean;
  missingEssential: string[];
  warnings: string[];
  recommendations: string[];
} {
  const essentialFeatures = getEssentialFeaturesForSpecialty(specialtyId);
  const essentialIds = essentialFeatures.map(f => f.id);
  const missingEssential = essentialIds.filter(id => !selectedFeatures.includes(id));
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Verificar si faltan características importantes
  const importantFeatures = getDashboardFeaturesByPriority(specialtyId, 'important');
  const importantIds = importantFeatures.map(f => f.id);
  const missingImportant = importantIds.filter(id => !selectedFeatures.includes(id));
  
  if (missingImportant.length > 0) {
    warnings.push(`Faltan características importantes recomendadas: ${missingImportant.join(', ')}`);
  }
  
  // Verificar si la selección es demasiado básica
  if (selectedFeatures.length < 6) {
    warnings.push('La configuración del dashboard parece muy básica. Considera agregar más características.');
  }
  
  // Recomendaciones específicas por especialidad
  const specialty = getSpecialtyById(specialtyId);
  if (specialty) {
    switch (specialty.id) {
      case 'cardiologia':
        if (!selectedFeatures.includes('ecg_monitor')) {
          recommendations.push('Considera agregar el monitor ECG para cardiología');
        }
        break;
      case 'pediatria':
        if (!selectedFeatures.includes('growth_charts')) {
          recommendations.push('Las gráficas de crecimiento son esenciales para pediatría');
        }
        break;
      case 'dermatologia':
        if (!selectedFeatures.includes('skin_analysis')) {
          recommendations.push('El análisis de piel es fundamental para dermatología');
        }
        break;
    }
  }
  
  return {
    isValid: missingEssential.length === 0,
    missingEssential,
    warnings,
    recommendations
  };
}

/**
 * Genera configuración recomendada para una especialidad
 */
export function getRecommendedConfigurationForSpecialty(specialtyId: string): string[] {
  const specialty = getSpecialtyById(specialtyId);
  if (!specialty) return [];
  
  const essentialFeatures = getEssentialFeaturesForSpecialty(specialtyId);
  const importantFeatures = getDashboardFeaturesByPriority(specialtyId, 'important');
  
  // Siempre incluir características esenciales
  const recommended = essentialFeatures.map(f => f.id);
  
  // Agregar características importantes según la complejidad
  if (specialty.complexity === 'advanced') {
    recommended.push(...importantFeatures.slice(0, 3).map(f => f.id));
  } else if (specialty.complexity === 'intermediate') {
    recommended.push(...importantFeatures.slice(0, 2).map(f => f.id));
  } else {
    recommended.push(...importantFeatures.slice(0, 1).map(f => f.id));
  }
  
  return recommended;
}

// ============================================================================
// FUNCIONES DE UTILIDAD GENERAL
// ============================================================================

/**
 * Obtiene todas las especialidades disponibles
 */
export function getAllSpecialties(): MedicalSpecialty[] {
  return [...MEDICAL_SPECIALTIES];
}

/**
 * Obtiene el número total de especialidades
 */
export function getTotalSpecialtiesCount(): number {
  return MEDICAL_SPECIALTIES.length;
}

/**
 * Obtiene especialidades populares (alta estimación de pacientes)
 */
export function getPopularSpecialties(): MedicalSpecialty[] {
  return getSpecialtiesByPatientEstimate('high');
}

/**
 * Obtiene especialidades especializadas (baja estimación de pacientes)
 */
export function getSpecializedSpecialties(): MedicalSpecialty[] {
  return getSpecialtiesByPatientEstimate('low');
}

/**
 * Verifica si una especialidad existe
 */
export function specialtyExists(specialtyId: string): boolean {
  return getSpecialtyById(specialtyId) !== undefined;
}

/**
 * Obtiene información resumida de una especialidad
 */
export function getSpecialtySummary(specialtyId: string): {
  id: string;
  name: string;
  category: string;
  complexity: string;
  patientEstimate: string;
  featureCount: number;
} | null {
  const specialty = getSpecialtyById(specialtyId);
  if (!specialty) return null;
  
  return {
    id: specialty.id,
    name: specialty.name,
    category: specialty.category,
    complexity: specialty.complexity,
    patientEstimate: specialty.estimatedPatients,
    featureCount: specialty.dashboardFeatures.length
  };
}
