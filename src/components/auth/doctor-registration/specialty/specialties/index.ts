/**
 * Medical Specialties Index - Platform Médicos Elite
 * 
 * Índice centralizado de todas las especialidades médicas disponibles.
 * Cada especialidad tiene su propio archivo de configuración.
 */

import { SpecialtyConfig } from '../types';

// ============================================================================
// IMPORTACIONES DE ESPECIALIDADES INDIVIDUALES
// ============================================================================

// Atención Primaria
import { general_medicine } from './general-medicine';
import { family_medicine } from './family-medicine';
import { pediatrics } from './pediatrics';
import { geriatrics } from './geriatrics';
import { preventive_medicine } from './preventive-medicine';
import { sports_medicine } from './sports-medicine';
import { occupational_medicine } from './occupational-medicine';
import { clinical_nutrition } from './clinical-nutrition';
import { physical_rehabilitation } from './physical-rehabilitation';

// Medicina Interna
import { internal_medicine } from './internal-medicine';
import { cardiology } from './cardiology';
import { neurology } from './neurology';
import { endocrinology } from './endocrinology';
import { gastroenterology } from './gastroenterology';
import { nephrology } from './nephrology';
import { pulmonology } from './pulmonology';
import { hematology } from './hematology';
import { oncology } from './oncology';
import { infectious_diseases } from './infectious-diseases';
import { rheumatology } from './rheumatology';
import { dermatology } from './dermatology';
import { psychiatry } from './psychiatry';
import { allergy_immunology } from './allergy-immunology';
import { palliative_care } from './palliative-care';

// Cirugía
import { general_surgery } from './general-surgery';
import { neurosurgery } from './neurosurgery';
import { orthopedics } from './orthopedics';
import { plastic_surgery } from './plastic-surgery';
import { thoracic_surgery } from './thoracic-surgery';
import { vascular_surgery } from './vascular-surgery';
import { urology } from './urology';
import { otolaryngology } from './otolaryngology';
import { ophthalmology } from './ophthalmology';
import { gynecology } from './gynecology';
import { anesthesiology } from './anesthesiology';

// Pediatría Especializada
import { neonatology } from './neonatology';

// Diagnóstico
import { radiology } from './radiology';
import { pathology } from './pathology';
import { medical_genetics } from './medical-genetics';

// Emergencias
import { emergency_medicine } from './emergency-medicine';

// ============================================================================
// ESPECIALIDADES DISPONIBLES
// ============================================================================

export const AVAILABLE_SPECIALTIES: Record<string, SpecialtyConfig> = {
  // Atención Primaria
  general_medicine,
  family_medicine,
  pediatrics,
  geriatrics,
  preventive_medicine,
  sports_medicine,
  occupational_medicine,
  clinical_nutrition,
  physical_rehabilitation,

  // Medicina Interna
  internal_medicine,
  cardiology,
  neurology,
  endocrinology,
  gastroenterology,
  nephrology,
  pulmonology,
  hematology,
  oncology,
  infectious_diseases,
  rheumatology,
  dermatology,
  psychiatry,
  allergy_immunology,
  palliative_care,

  // Cirugía
  general_surgery,
  neurosurgery,
  orthopedics,
  plastic_surgery,
  thoracic_surgery,
  vascular_surgery,
  urology,
  otolaryngology,
  ophthalmology,
  gynecology,
  anesthesiology,

  // Pediatría Especializada
  neonatology,

  // Diagnóstico
  radiology,
  pathology,
  medical_genetics,

  // Emergencias
  emergency_medicine
};

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Obtiene la configuración de una especialidad por ID
 */
export function getSpecialtyById(id: string): SpecialtyConfig | null {
  return AVAILABLE_SPECIALTIES[id] || null;
}

/**
 * Obtiene todas las especialidades por categoría
 */
export function getSpecialtiesByCategory(category: string): SpecialtyConfig[] {
  return Object.values(AVAILABLE_SPECIALTIES).filter(
    specialty => specialty.category === category
  );
}

/**
 * Obtiene todas las especialidades disponibles (no "próximamente")
 */
export function getAvailableSpecialties(): SpecialtyConfig[] {
  return Object.values(AVAILABLE_SPECIALTIES).filter(
    specialty => !specialty.isComingSoon
  );
}

/**
 * Obtiene especialidades próximamente
 */
export function getComingSoonSpecialties(): SpecialtyConfig[] {
  return Object.values(AVAILABLE_SPECIALTIES).filter(
    specialty => specialty.isComingSoon
  );
}

/**
 * Buscar especialidades por término
 */
export function searchSpecialties(term: string): SpecialtyConfig[] {
  const searchTerm = term.toLowerCase();
  return Object.values(AVAILABLE_SPECIALTIES).filter(
    specialty => 
      specialty.name.toLowerCase().includes(searchTerm) ||
      specialty.description.toLowerCase().includes(searchTerm)
  );
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

export const SPECIALTY_STATS = {
  total: Object.keys(AVAILABLE_SPECIALTIES).length,
  available: getAvailableSpecialties().length,
  comingSoon: getComingSoonSpecialties().length,
  byCategory: {
    primary_care: getSpecialtiesByCategory('primary_care').length,
    internal_medicine: getSpecialtiesByCategory('internal_medicine').length,
    surgery: getSpecialtiesByCategory('surgery').length,
    pediatrics: getSpecialtiesByCategory('pediatrics').length,
    diagnostic: getSpecialtiesByCategory('diagnostic').length,
    emergency: getSpecialtiesByCategory('emergency').length
  }
};

export default AVAILABLE_SPECIALTIES;
