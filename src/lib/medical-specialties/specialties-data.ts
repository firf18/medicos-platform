/**
 * Medical Specialties Data - Red-Salud Platform
 * 
 * Datos completos de especialidades médicas con características específicas.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { MedicalSpecialty, ValidationRequirement } from '@/types/medical-specialties.types';
import { BASE_DASHBOARD_FEATURES } from './base-features';

// ============================================================================
// VALIDACIONES BASE PARA TODAS LAS ESPECIALIDADES
// ============================================================================

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

// ============================================================================
// ESPECIALIDADES MÉDICAS PRINCIPALES
// ============================================================================

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
  },
  {
    id: 'dermatologia',
    name: 'Dermatología',
    description: 'Diagnóstico y tratamiento de enfermedades de la piel',
    category: 'especialidades_medicas',
    icon: 'Camera',
    color: 'purple',
    estimatedPatients: 'medium',
    complexity: 'intermediate',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'skin_analysis',
        name: 'Análisis de Piel',
        description: 'Herramientas para evaluación dermatológica',
        component: 'SkinAnalysisWidget',
        priority: 'essential',
        category: 'diagnostics'
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
  {
    id: 'neurologia',
    name: 'Neurología',
    description: 'Diagnóstico y tratamiento de enfermedades del sistema nervioso',
    category: 'especialidades_medicas',
    icon: 'Brain',
    color: 'indigo',
    estimatedPatients: 'low',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'neurological_assessment',
        name: 'Evaluación Neurológica',
        description: 'Herramientas especializadas para examen neurológico',
        component: 'NeurologicalAssessmentWidget',
        priority: 'essential',
        category: 'diagnostics'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'neurology_board',
        name: 'Certificación en Neurología',
        description: 'Título de especialidad en neurología',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },
  {
    id: 'ginecologia',
    name: 'Ginecología',
    description: 'Atención médica especializada en salud femenina',
    category: 'especialidades_medicas',
    icon: 'Heart',
    color: 'pink',
    estimatedPatients: 'high',
    complexity: 'intermediate',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'women_health_tracking',
        name: 'Seguimiento de Salud Femenina',
        description: 'Herramientas para seguimiento ginecológico',
        component: 'WomenHealthTrackingWidget',
        priority: 'essential',
        category: 'diagnostics'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'gynecology_board',
        name: 'Certificación en Ginecología',
        description: 'Título de especialidad en ginecología',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },
  {
    id: 'ortopedia',
    name: 'Ortopedia',
    description: 'Diagnóstico y tratamiento de enfermedades del sistema musculoesquelético',
    category: 'especialidades_medicas',
    icon: 'Bone',
    color: 'orange',
    estimatedPatients: 'medium',
    complexity: 'advanced',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'musculoskeletal_assessment',
        name: 'Evaluación Musculoesquelética',
        description: 'Herramientas para evaluación ortopédica',
        component: 'MusculoskeletalAssessmentWidget',
        priority: 'essential',
        category: 'diagnostics'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'orthopedics_board',
        name: 'Certificación en Ortopedia',
        description: 'Título de especialidad en ortopedia',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  },
  {
    id: 'oftalmologia',
    name: 'Oftalmología',
    description: 'Diagnóstico y tratamiento de enfermedades de los ojos',
    category: 'especialidades_medicas',
    icon: 'Eye',
    color: 'cyan',
    estimatedPatients: 'medium',
    complexity: 'intermediate',
    dashboardFeatures: [
      ...BASE_DASHBOARD_FEATURES.slice(0, 5),
      {
        id: 'vision_assessment',
        name: 'Evaluación Visual',
        description: 'Herramientas para evaluación oftalmológica',
        component: 'VisionAssessmentWidget',
        priority: 'essential',
        category: 'diagnostics'
      }
    ],
    requiredValidations: [
      ...BASE_VALIDATIONS,
      {
        id: 'ophthalmology_board',
        name: 'Certificación en Oftalmología',
        description: 'Título de especialidad en oftalmología',
        required: true,
        documentType: 'specialty_board'
      }
    ]
  }
];

// ============================================================================
// MAPAS PARA ACCESO RÁPIDO
// ============================================================================

export const SPECIALTY_MAP = new Map(
  MEDICAL_SPECIALTIES.map(specialty => [specialty.id, specialty])
);

export const SPECIALTIES_BY_CATEGORY = MEDICAL_SPECIALTIES.reduce((acc, specialty) => {
  if (!acc[specialty.category]) {
    acc[specialty.category] = [];
  }
  acc[specialty.category].push(specialty);
  return acc;
}, {} as Record<string, MedicalSpecialty[]>);

export const SPECIALTIES_BY_COMPLEXITY = MEDICAL_SPECIALTIES.reduce((acc, specialty) => {
  if (!acc[specialty.complexity]) {
    acc[specialty.complexity] = [];
  }
  acc[specialty.complexity].push(specialty);
  return acc;
}, {} as Record<string, MedicalSpecialty[]>);
