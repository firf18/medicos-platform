/**
 * Medical Specialties Index - Red-Salud Platform
 * 
 * Punto de entrada principal para el módulo de especialidades médicas.
 * Re-exporta todas las funciones y tipos necesarios.
 */

// ============================================================================
// RE-EXPORTACIONES DE TIPOS
// ============================================================================

export type {
  MedicalSpecialty,
  DashboardFeature,
  ValidationRequirement,
  SpecialtyCategory
} from '@/types/medical-specialties.types';

// ============================================================================
// RE-EXPORTACIONES DE DATOS
// ============================================================================

export {
  MEDICAL_SPECIALTIES,
  BASE_VALIDATIONS,
  SPECIALTY_MAP,
  SPECIALTIES_BY_CATEGORY,
  SPECIALTIES_BY_COMPLEXITY
} from './specialties-data';

export {
  BASE_DASHBOARD_FEATURES,
  ESSENTIAL_FEATURES,
  IMPORTANT_FEATURES,
  OPTIONAL_FEATURES,
  COMMUNICATION_FEATURES,
  ADMINISTRATIVE_FEATURES,
  EDUCATIONAL_FEATURES,
  FEATURE_MAP,
  FEATURES_BY_CATEGORY,
  FEATURES_BY_PRIORITY,
  getEssentialFeatures,
  getFeaturesByCategory,
  getFeaturesByPriority,
  getFeaturesByPermission,
  calculateImplementationTime,
  validateFeatureConfiguration,
  getRecommendedConfigurationForRole
} from './base-features';

// ============================================================================
// RE-EXPORTACIONES DE UTILIDADES
// ============================================================================

export {
  // Funciones de búsqueda y filtrado
  getSpecialtyById,
  getSpecialtiesByCategory,
  getSpecialtiesByComplexity,
  getSpecialtiesByPatientEstimate,
  searchSpecialtiesByName,
  
  // Funciones de características del dashboard
  getDashboardFeatures,
  getDashboardFeaturesByPriority,
  getDashboardFeaturesByCategory,
  isFeatureAvailableForSpecialty,
  getEssentialFeaturesForSpecialty,
  
  // Funciones de validaciones
  getRequiredValidations,
  isValidationRequired,
  getValidationsByDocumentType,
  
  // Funciones de análisis y estadísticas
  calculateImplementationTime,
  getSpecialtyFeatureStats,
  compareSpecialtiesByComplexity,
  
  // Funciones de validación y configuración
  validateSpecialtyConfiguration,
  getRecommendedConfigurationForSpecialty,
  
  // Funciones de utilidad general
  getAllSpecialties,
  getTotalSpecialtiesCount,
  getPopularSpecialties,
  getSpecializedSpecialties,
  specialtyExists,
  getSpecialtySummary
} from './specialty-utils';

// ============================================================================
// FUNCIONES DE CONVENIENCIA
// ============================================================================

/**
 * Función de conveniencia para obtener información completa de una especialidad
 */
export function getSpecialtyInfo(specialtyId: string): {
  specialty: MedicalSpecialty | undefined;
  features: DashboardFeature[];
  validations: ValidationRequirement[];
  stats: ReturnType<typeof getSpecialtyFeatureStats>;
} {
  return {
    specialty: getSpecialtyById(specialtyId),
    features: getDashboardFeatures(specialtyId),
    validations: getRequiredValidations(specialtyId),
    stats: getSpecialtyFeatureStats(specialtyId)
  };
}

/**
 * Función de conveniencia para obtener configuración completa recomendada
 */
export function getCompleteSpecialtyConfiguration(specialtyId: string): {
  recommendedFeatures: string[];
  validation: ReturnType<typeof validateSpecialtyConfiguration>;
  implementationTime: number;
} {
  return {
    recommendedFeatures: getRecommendedConfigurationForSpecialty(specialtyId),
    validation: validateSpecialtyConfiguration(specialtyId, getRecommendedConfigurationForSpecialty(specialtyId)),
    implementationTime: calculateImplementationTime(specialtyId)
  };
}
