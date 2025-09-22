/**
 * Specialty Validations - Red-Salud Platform
 * 
 * Validaciones específicas para especialidades médicas y características del dashboard.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { z } from 'zod';

// ============================================================================
// VALIDACIONES DE ESPECIALIDAD MÉDICA
// ============================================================================

export const specialtySelectionSchema = z.object({
  specialtyId: z.string()
    .min(1, 'Debe seleccionar una especialidad médica'),
  
  subSpecialties: z.array(z.string())
    .max(3, 'No puedes seleccionar más de 3 sub-especialidades')
    .optional(),
  
  selectedFeatures: z.array(z.string())
    .max(10, 'No puedes seleccionar más de 10 características')
    .optional()
    .default([])
});

// ============================================================================
// CARACTERÍSTICAS REQUERIDAS POR ESPECIALIDAD
// ============================================================================

export const SPECIALTY_REQUIRED_FEATURES: Record<string, string[]> = {
  // Medicina General y Familiar
  'general_medicine': ['patient_management', 'medical_records', 'appointment_scheduling'],
  'family_medicine': ['patient_management', 'medical_records', 'appointment_scheduling', 'health_monitoring'],
  'internal_medicine': ['patient_management', 'medical_records', 'lab_integration', 'medication_management'],
  
  // Especialidades Médicas
  'cardiology': ['patient_management', 'medical_records', 'lab_integration', 'vital_signs_monitoring'],
  'neurology': ['patient_management', 'medical_records', 'lab_integration', 'diagnostic_tools'],
  'oncology': ['patient_management', 'medical_records', 'lab_integration', 'treatment_protocols', 'second_opinions'],
  'endocrinology': ['patient_management', 'medical_records', 'lab_integration', 'medication_management'],
  'gastroenterology': ['patient_management', 'medical_records', 'lab_integration', 'procedure_scheduling'],
  
  // Especialidades Quirúrgicas
  'surgery': ['patient_management', 'medical_records', 'appointment_scheduling', 'surgical_planning'],
  'neurosurgery': ['patient_management', 'medical_records', 'surgical_planning', 'critical_care'],
  'cardiac_surgery': ['patient_management', 'medical_records', 'surgical_planning', 'vital_signs_monitoring'],
  'orthopedic_surgery': ['patient_management', 'medical_records', 'surgical_planning', 'rehabilitation_tracking'],
  
  // Pediatría
  'pediatrics': ['patient_management', 'medical_records', 'vaccination_tracking', 'growth_monitoring'],
  'pediatric_cardiology': ['patient_management', 'medical_records', 'lab_integration', 'growth_monitoring'],
  'pediatric_neurology': ['patient_management', 'medical_records', 'developmental_tracking', 'family_communication'],
  
  // Especialidades Diagnósticas
  'radiology': ['imaging_management', 'report_generation', 'consultation_scheduling', 'diagnostic_tools'],
  'pathology': ['lab_integration', 'report_generation', 'consultation_scheduling', 'research_tools'],
  'nuclear_medicine': ['imaging_management', 'radiation_safety', 'appointment_scheduling', 'lab_integration'],
  
  // Especialidades de Salud Mental
  'psychiatry': ['patient_management', 'therapy_scheduling', 'medication_management', 'crisis_intervention'],
  'psychology': ['patient_management', 'therapy_scheduling', 'assessment_tools', 'progress_tracking'],
  
  // Especialidades Ambulatorias
  'dermatology': ['patient_management', 'medical_records', 'imaging_management', 'procedure_scheduling'],
  'ophthalmology': ['patient_management', 'medical_records', 'diagnostic_tools', 'surgical_planning'],
  'otolaryngology': ['patient_management', 'medical_records', 'diagnostic_tools', 'surgical_planning'],
  
  // Medicina de Emergencia
  'emergency_medicine': ['patient_management', 'critical_care', 'lab_integration', 'emergency_protocols'],
  'intensive_care': ['patient_management', 'critical_care', 'vital_signs_monitoring', 'medication_management'],
  
  // Especialidades Preventivas
  'preventive_medicine': ['patient_management', 'health_monitoring', 'vaccination_tracking', 'wellness_programs'],
  'occupational_medicine': ['patient_management', 'health_monitoring', 'risk_assessment', 'wellness_programs']
};

// ============================================================================
// VALIDACIONES ESPECÍFICAS DE ESPECIALIDADES
// ============================================================================

/**
 * Valida la coherencia entre especialidad y características seleccionadas
 */
export function validateSpecialtyFeatures(specialtyId: string, selectedFeatures: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Obtener características requeridas para la especialidad
  const requiredFeatures = SPECIALTY_REQUIRED_FEATURES[specialtyId] || ['patient_management'];
  
  // Verificar que todas las características requeridas estén seleccionadas
  const missingRequired = requiredFeatures.filter(feature => !selectedFeatures.includes(feature));
  
  if (missingRequired.length > 0) {
    errors.push(`Para esta especialidad son requeridas las siguientes características: ${missingRequired.join(', ')}`);
  }
  
  // Verificar límites
  if (selectedFeatures.length < 1) {
    errors.push('Debe seleccionar al menos una característica del dashboard');
  }
  
  if (selectedFeatures.length > 10) {
    errors.push('No puede seleccionar más de 10 características');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida que las sub-especialidades sean compatibles con la especialidad principal
 */
export function validateSubSpecialties(specialtyId: string, subSpecialties: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Mapeo de especialidades principales con sus sub-especialidades válidas
  const validSubSpecialties: Record<string, string[]> = {
    'cardiology': [
      'interventional_cardiology',
      'electrophysiology',
      'heart_failure',
      'pediatric_cardiology',
      'cardiac_imaging'
    ],
    'neurology': [
      'stroke_neurology',
      'epilepsy',
      'movement_disorders',
      'neuromuscular_disorders',
      'pediatric_neurology'
    ],
    'surgery': [
      'general_surgery',
      'trauma_surgery',
      'minimally_invasive_surgery',
      'bariatric_surgery',
      'endocrine_surgery'
    ],
    'pediatrics': [
      'neonatology',
      'pediatric_emergency',
      'pediatric_cardiology',
      'pediatric_neurology',
      'adolescent_medicine'
    ],
    'internal_medicine': [
      'geriatrics',
      'hospital_medicine',
      'critical_care',
      'infectious_diseases',
      'rheumatology'
    ]
  };
  
  const allowedSubs = validSubSpecialties[specialtyId] || [];
  
  // Verificar que las sub-especialidades sean válidas para la especialidad principal
  const invalidSubs = subSpecialties.filter(sub => !allowedSubs.includes(sub));
  
  if (invalidSubs.length > 0) {
    errors.push(`Las siguientes sub-especialidades no son válidas para ${specialtyId}: ${invalidSubs.join(', ')}`);
  }
  
  // Verificar límite de sub-especialidades
  if (subSpecialties.length > 3) {
    errors.push('No puede seleccionar más de 3 sub-especialidades');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida la coherencia entre especialidad y años de experiencia
 */
export function validateSpecialtyExperience(specialtyId: string, yearsOfExperience: number): { isValid: boolean; error?: string } {
  // Especialidades que requieren experiencia mínima específica
  const experienceRequirements: Record<string, number> = {
    // Especialidades complejas que requieren más experiencia
    'neurosurgery': 8,
    'cardiac_surgery': 8,
    'transplant_surgery': 10,
    'pediatric_surgery': 7,
    
    // Especialidades que requieren experiencia moderada
    'cardiology': 5,
    'neurology': 5,
    'oncology': 5,
    'gastroenterology': 4,
    'endocrinology': 4,
    
    // Especialidades que pueden comenzar con menos experiencia
    'general_medicine': 1,
    'family_medicine': 1,
    'internal_medicine': 2,
    'pediatrics': 2,
    'dermatology': 2,
    'ophthalmology': 3,
    
    // Especialidades de emergencia
    'emergency_medicine': 3,
    'intensive_care': 5,
    
    // Especialidades diagnósticas
    'radiology': 4,
    'pathology': 4,
    
    // Salud mental
    'psychiatry': 3,
    'psychology': 2
  };
  
  const requiredExperience = experienceRequirements[specialtyId] || 1;
  
  if (yearsOfExperience < requiredExperience) {
    return {
      isValid: false,
      error: `Esta especialidad requiere al menos ${requiredExperience} años de experiencia médica`
    };
  }
  
  return { isValid: true };
}

/**
 * Obtiene las características recomendadas para una especialidad
 */
export function getRecommendedFeatures(specialtyId: string): string[] {
  const required = SPECIALTY_REQUIRED_FEATURES[specialtyId] || ['patient_management'];
  
  // Características adicionales recomendadas por especialidad
  const recommendedAdditions: Record<string, string[]> = {
    'cardiology': ['telemedicine', 'patient_portal', 'health_monitoring'],
    'neurology': ['imaging_integration', 'patient_portal', 'family_communication'],
    'oncology': ['patient_portal', 'family_communication', 'research_tools'],
    'pediatrics': ['family_communication', 'vaccination_tracking', 'growth_charts'],
    'surgery': ['pre_op_assessment', 'post_op_monitoring', 'surgical_scheduling'],
    'psychiatry': ['secure_messaging', 'crisis_protocols', 'therapy_notes'],
    'emergency_medicine': ['triage_tools', 'critical_alerts', 'lab_stat_orders']
  };
  
  const additional = recommendedAdditions[specialtyId] || [];
  
  return [...required, ...additional];
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type SpecialtySelectionValidation = z.infer<typeof specialtySelectionSchema>;

// Tipos específicos de especialidades
export type MedicalSpecialtyCategory = 
  | 'general_medicine'
  | 'specialized_medicine'
  | 'surgical_specialties'
  | 'diagnostic_specialties'
  | 'pediatric_specialties'
  | 'mental_health'
  | 'emergency_medicine'
  | 'preventive_medicine';

export interface SpecialtyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  recommendations?: string[];
}
