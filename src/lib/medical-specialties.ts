/**
 * ⚠️ DEPRECATED: Medical Specialties - Red-Salud Platform
 * 
 * Este archivo ha sido refactorizado por responsabilidades para cumplir con el
 * principio de responsabilidad única y mejorar la mantenibilidad.
 * 
 * NUEVA ESTRUCTURA MODULAR:
 * - src/types/medical-specialties.types.ts (Tipos e interfaces)
 * - src/lib/medical-specialties/base-features.ts (Características base)
 * - src/lib/medical-specialties/base-validations.ts (Validaciones base)
 * - src/lib/medical-specialties/specialties-data.ts (Datos de especialidades)
 * - src/lib/medical-specialties/specialty-utils.ts (Funciones de utilidad)
 * - src/lib/medical-specialties/index.ts (Punto de entrada principal)
 * 
 * @deprecated Usar imports desde src/lib/medical-specialties/ en lugar de este archivo
 */

console.warn(`
⚠️  DEPRECATION WARNING: medical-specialties.ts
Este archivo ha sido refactorizado por responsabilidades médicas.
Usa los nuevos archivos modulares en src/lib/medical-specialties/

Ejemplo de migración:
ANTES: import { MEDICAL_SPECIALTIES, getSpecialtyById } from './medical-specialties'
DESPUÉS: import { MEDICAL_SPECIALTIES, getSpecialtyById } from './medical-specialties/index'

O más específico:
import { MEDICAL_SPECIALTIES } from './medical-specialties/specialties-data'
import { getSpecialtyById } from './medical-specialties/specialty-utils'
`);

// ============================================================================
// RE-EXPORTACIONES PARA COMPATIBILIDAD HACIA ATRÁS
// ============================================================================

// Re-exportar tipos principales
export type {
  MedicalSpecialty,
  DashboardFeature,
  ValidationRequirement,
  SpecialtyCategory
} from '@/types/medical-specialties.types';

// Re-exportar características base
export { 
  BASE_DASHBOARD_FEATURES,
  getEssentialFeatures,
  getFeaturesByCategory,
  getFeaturesByPriority
} from '@/lib/medical-specialties/base-features';

// ============================================================================
// DATOS CONSOLIDADOS (VERSIÓN SIMPLIFICADA)
// ============================================================================

import { MedicalSpecialty, DashboardFeature, ValidationRequirement } from '@/types/medical-specialties.types';
import { BASE_DASHBOARD_FEATURES } from '@/lib/medical-specialties/base-features';

// Validaciones base para compatibilidad
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

// Especialidades principales para compatibilidad
export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
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
      ...BASE_DASHBOARD_FEATURES.slice(0, 5), // Solo las características esenciales
      {
        id: 'vital_signs',
        name: 'Signos Vitales',
        description: 'Monitoreo de presión arterial, peso, talla, etc.',
        component: 'VitalSignsWidget',
        priority: 'essential',
        category: 'diagnostics'
      }
    ],
    requiredValidations: BASE_VALIDATIONS
  },
  {
    id: 'cardiologia',
    name: 'Cardiología',
    description: 'Diagnóstico y tratamiento de enfermedades del corazón',
    category: 'especialidades_medicas',
    icon: 'Heart',
    color: 'red',
    estimatedPatients: 'medium',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'ecg_monitor',
        name: 'Monitor ECG',
        description: 'Seguimiento de electrocardiogramas',
        component: 'ECGMonitorWidget',
        priority: 'essential',
        category: 'diagnostics'
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
    id: 'pediatria',
    name: 'Pediatría',
    description: 'Atención médica especializada para niños',
    category: 'pediatria_especializada',
    icon: 'Baby',
    color: 'green',
    estimatedPatients: 'high',
    complexity: 'intermediate',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'growth_charts',
        name: 'Gráficas de Crecimiento',
        description: 'Seguimiento de peso y talla infantil',
        component: 'GrowthChartsWidget',
        priority: 'essential',
        category: 'diagnostics'
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
  }
];

// ============================================================================
// FUNCIONES DE UTILIDAD PARA COMPATIBILIDAD
// ============================================================================

/**
 * @deprecated Usar getSpecialtyById desde ./medical-specialties/specialty-utils
 */
export function getSpecialtyById(id: string): MedicalSpecialty | undefined {
  console.warn('getSpecialtyById está deprecated. Usar desde medical-specialties/specialty-utils');
  return MEDICAL_SPECIALTIES.find(specialty => specialty.id === id);
}

/**
 * @deprecated Usar getSpecialtiesByCategory desde ./medical-specialties/specialty-utils
 */
export function getSpecialtiesByCategory(category: string): MedicalSpecialty[] {
  console.warn('getSpecialtiesByCategory está deprecated. Usar desde medical-specialties/specialty-utils');
  return MEDICAL_SPECIALTIES.filter(specialty => specialty.category === category);
}

/**
 * @deprecated Usar getDashboardFeatures desde ./medical-specialties/specialty-utils
 */
export function getDashboardFeatures(specialtyId: string): DashboardFeature[] {
  console.warn('getDashboardFeatures está deprecated. Usar desde medical-specialties/specialty-utils');
  const specialty = getSpecialtyById(specialtyId);
  return specialty?.dashboardFeatures || BASE_DASHBOARD_FEATURES;
}

/**
 * @deprecated Usar getRequiredValidations desde ./medical-specialties/specialty-utils
 */
export function getRequiredValidations(specialtyId: string): ValidationRequirement[] {
  console.warn('getRequiredValidations está deprecated. Usar desde medical-specialties/specialty-utils');
  const specialty = getSpecialtyById(specialtyId);
  return specialty?.requiredValidations || BASE_VALIDATIONS;
}

// ============================================================================
// DOCUMENTACIÓN DE MIGRACIÓN
// ============================================================================

/**
 * GUÍA DE MIGRACIÓN COMPLETA:
 * 
 * 1. TIPOS E INTERFACES:
 *    ANTES: import { MedicalSpecialty } from './medical-specialties'
 *    DESPUÉS: import { MedicalSpecialty } from '@/types/medical-specialties.types'
 * 
 * 2. CARACTERÍSTICAS BASE:
 *    ANTES: import { BASE_DASHBOARD_FEATURES } from './medical-specialties'
 *    DESPUÉS: import { BASE_DASHBOARD_FEATURES } from './medical-specialties/base-features'
 * 
 * 3. DATOS DE ESPECIALIDADES:
 *    ANTES: import { MEDICAL_SPECIALTIES } from './medical-specialties'
 *    DESPUÉS: import { MEDICAL_SPECIALTIES } from './medical-specialties/specialties-data'
 * 
 * 4. FUNCIONES DE UTILIDAD:
 *    ANTES: import { getSpecialtyById } from './medical-specialties'
 *    DESPUÉS: import { getSpecialtyById } from './medical-specialties/specialty-utils'
 * 
 * 5. IMPORTACIÓN COMPLETA:
 *    NUEVO: import * from './medical-specialties' // Importa todo desde el índice
 * 
 * BENEFICIOS DE LA NUEVA ESTRUCTURA:
 * ✅ Separación clara de responsabilidades
 * ✅ Archivos más pequeños y mantenibles (<300 líneas)
 * ✅ Mejor organización por tipo de función
 * ✅ Reutilización mejorada de componentes
 * ✅ Testing más granular y específico
 * ✅ Escalabilidad mejorada para nuevas especialidades
 * 
 * ESTRUCTURA FINAL:
 * - types/medical-specialties.types.ts: Todas las interfaces y tipos
 * - base-features.ts: Características comunes a todos los dashboards
 * - base-validations.ts: Validaciones comunes a todas las especialidades
 * - specialties-data.ts: Definiciones completas de especialidades médicas
 * - specialty-utils.ts: Funciones de búsqueda, filtrado y utilidades
 * - index.ts: Punto de entrada centralizado
 */