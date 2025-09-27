/**
 * Configuración del Sistema de Dashboards Dinámicos
 * Maneja el enrutamiento y configuración de dashboards por especialidad
 */

import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby, 
  Scissors, 
  Layers, 
  Shield, 
  Activity,
  Eye,
  Bone,
  Droplets,
  Zap,
  Microscope,
  AlertTriangle
} from 'lucide-react';

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  route: string;
  isAvailable: boolean;
  isDefault: boolean;
  features: string[];
  requiredPermissions: string[];
  color: string;
  category: 'primary_care' | 'specialty' | 'surgery' | 'diagnostic' | 'emergency';
}

export const DASHBOARD_CONFIGS: Record<string, DashboardConfig> = {
  'medicina-general': {
    id: 'medicina-general',
    name: 'Medicina General',
    description: 'Dashboard completo para atención médica integral y preventiva',
    icon: Stethoscope,
    route: '/dashboard/medicina-general',
    isAvailable: true,
    isDefault: true,
    features: [
      'patient_management',
      'appointment_scheduling',
      'medical_records',
      'vital_signs_monitoring',
      'prescription_management',
      'secure_messaging',
      'telemedicine',
      'lab_integration',
      'prevention_alerts',
      'analytics'
    ],
    requiredPermissions: ['doctor'],
    color: 'blue',
    category: 'primary_care'
  },
  'cardiologia': {
    id: 'cardiologia',
    name: 'Cardiología',
    description: 'Especialista en enfermedades del corazón y sistema circulatorio',
    icon: Heart,
    route: '/dashboard/cardiologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'ecg_monitoring',
      'cardiac_catheterization',
      'stress_testing',
      'heart_rate_monitoring',
      'blood_pressure_tracking',
      'cardiac_medications',
      'emergency_protocols'
    ],
    requiredPermissions: ['doctor', 'cardiology_specialist'],
    color: 'red',
    category: 'specialty'
  },
  'neurologia': {
    id: 'neurologia',
    name: 'Neurología',
    description: 'Especialista en enfermedades del sistema nervioso',
    icon: Brain,
    route: '/dashboard/neurologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'eeg_monitoring',
      'neurological_exam',
      'brain_imaging',
      'seizure_tracking',
      'cognitive_assessment',
      'neurological_medications'
    ],
    requiredPermissions: ['doctor', 'neurology_specialist'],
    color: 'purple',
    category: 'specialty'
  },
  'pediatria': {
    id: 'pediatria',
    name: 'Pediatría',
    description: 'Especialista en medicina infantil y desarrollo',
    icon: Baby,
    route: '/dashboard/pediatria',
    isAvailable: true,
    isDefault: false,
    features: [
      'growth_charts',
      'vaccination_tracker',
      'developmental_assessment',
      'pediatric_medications',
      'parent_communication',
      'milestone_tracking'
    ],
    requiredPermissions: ['doctor', 'pediatrics_specialist'],
    color: 'green',
    category: 'specialty'
  },
  'cirugia-general': {
    id: 'cirugia-general',
    name: 'Cirugía General',
    description: 'Especialista en procedimientos quirúrgicos',
    icon: Scissors,
    route: '/dashboard/cirugia-general',
    isAvailable: true,
    isDefault: false,
    features: [
      'surgical_scheduling',
      'pre_op_assessment',
      'post_op_monitoring',
      'surgical_protocols',
      'anesthesia_management',
      'recovery_tracking'
    ],
    requiredPermissions: ['doctor', 'surgery_specialist'],
    color: 'orange',
    category: 'surgery'
  },
  'dermatologia': {
    id: 'dermatologia',
    name: 'Dermatología',
    description: 'Especialista en enfermedades de la piel',
    icon: Layers,
    route: '/dashboard/dermatologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'skin_imaging',
      'mole_tracking',
      'biopsy_management',
      'dermatological_treatments',
      'skin_condition_monitoring'
    ],
    requiredPermissions: ['doctor', 'dermatology_specialist'],
    color: 'pink',
    category: 'specialty'
  },
  'psiquiatria': {
    id: 'psiquiatria',
    name: 'Psiquiatría',
    description: 'Especialista en salud mental y trastornos psiquiátricos',
    icon: Shield,
    route: '/dashboard/psiquiatria',
    isAvailable: true,
    isDefault: false,
    features: [
      'mental_health_assessment',
      'therapy_sessions',
      'medication_management',
      'crisis_intervention',
      'patient_monitoring'
    ],
    requiredPermissions: ['doctor', 'psychiatry_specialist'],
    color: 'indigo',
    category: 'specialty'
  },
  'medicina-interna': {
    id: 'medicina-interna',
    name: 'Medicina Interna',
    description: 'Especialista en medicina interna y enfermedades complejas',
    icon: Activity,
    route: '/dashboard/medicina-interna',
    isAvailable: true,
    isDefault: false,
    features: [
      'complex_case_management',
      'internal_medicine_protocols',
      'chronic_disease_management',
      'multidisciplinary_care'
    ],
    requiredPermissions: ['doctor', 'internal_medicine_specialist'],
    color: 'teal',
    category: 'specialty'
  },
  'ortopedia': {
    id: 'ortopedia',
    name: 'Ortopedia',
    description: 'Especialista en sistema musculoesquelético',
    icon: Bone,
    route: '/dashboard/ortopedia',
    isAvailable: true,
    isDefault: false,
    features: [
      'bone_imaging',
      'mobility_assessment',
      'orthopedic_treatments',
      'rehabilitation_tracking',
      'sports_medicine'
    ],
    requiredPermissions: ['doctor', 'orthopedics_specialist'],
    color: 'amber',
    category: 'specialty'
  },
  'oftalmologia': {
    id: 'oftalmologia',
    name: 'Oftalmología',
    description: 'Especialista en salud ocular y visión',
    icon: Eye,
    route: '/dashboard/oftalmologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'vision_testing',
      'eye_examination',
      'retinal_imaging',
      'surgical_procedures',
      'vision_correction'
    ],
    requiredPermissions: ['doctor', 'ophthalmology_specialist'],
    color: 'cyan',
    category: 'specialty'
  },
  'ginecologia': {
    id: 'ginecologia',
    name: 'Ginecología',
    description: 'Especialista en salud femenina y reproductiva',
    icon: Droplets,
    route: '/dashboard/ginecologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'gynecological_exam',
      'prenatal_care',
      'family_planning',
      'reproductive_health',
      'hormonal_monitoring'
    ],
    requiredPermissions: ['doctor', 'gynecology_specialist'],
    color: 'rose',
    category: 'specialty'
  },
  'endocrinologia': {
    id: 'endocrinologia',
    name: 'Endocrinología',
    description: 'Especialista en sistema endocrino y hormonas',
    icon: Zap,
    route: '/dashboard/endocrinologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'hormone_monitoring',
      'diabetes_management',
      'thyroid_function',
      'metabolic_disorders',
      'endocrine_testing'
    ],
    requiredPermissions: ['doctor', 'endocrinology_specialist'],
    color: 'yellow',
    category: 'specialty'
  },
  'radiologia': {
    id: 'radiologia',
    name: 'Radiología',
    description: 'Especialista en diagnóstico por imágenes',
    icon: Microscope,
    route: '/dashboard/radiologia',
    isAvailable: true,
    isDefault: false,
    features: [
      'imaging_interpretation',
      'radiology_reports',
      'imaging_scheduling',
      'contrast_management',
      'radiation_safety'
    ],
    requiredPermissions: ['doctor', 'radiology_specialist'],
    color: 'slate',
    category: 'diagnostic'
  },
  'medicina-emergencia': {
    id: 'medicina-emergencia',
    name: 'Medicina de Emergencia',
    description: 'Especialista en atención de emergencias médicas',
    icon: AlertTriangle,
    route: '/dashboard/medicina-emergencia',
    isAvailable: true,
    isDefault: false,
    features: [
      'emergency_protocols',
      'triage_management',
      'critical_care',
      'emergency_medications',
      'rapid_response'
    ],
    requiredPermissions: ['doctor', 'emergency_medicine_specialist'],
    color: 'red',
    category: 'emergency'
  }
};

// Función para obtener configuración de dashboard por ID
export function getDashboardConfig(dashboardId: string): DashboardConfig | null {
  return DASHBOARD_CONFIGS[dashboardId] || null;
}

// Función para obtener todos los dashboards disponibles
export function getAvailableDashboards(): DashboardConfig[] {
  return Object.values(DASHBOARD_CONFIGS).filter(config => config.isAvailable);
}

// Función para obtener dashboards por categoría
export function getDashboardsByCategory(category: DashboardConfig['category']): DashboardConfig[] {
  return Object.values(DASHBOARD_CONFIGS).filter(config => 
    config.isAvailable && config.category === category
  );
}

// Función para verificar si un usuario tiene acceso a un dashboard
export function hasDashboardAccess(
  dashboardId: string, 
  userPermissions: string[]
): boolean {
  const config = getDashboardConfig(dashboardId);
  if (!config) return false;

  return config.requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
}

// Función para obtener el dashboard por defecto
export function getDefaultDashboard(): DashboardConfig | null {
  const defaultConfig = Object.values(DASHBOARD_CONFIGS).find(config => config.isDefault);
  return defaultConfig || null;
}

// Función para obtener dashboards recomendados para una especialidad
export function getRecommendedDashboards(specialtyId: string): DashboardConfig[] {
  const recommendations: Record<string, string[]> = {
    'medicina-general': ['medicina-general', 'medicina-interna', 'medicina-emergencia'],
    'cardiologia': ['cardiologia', 'medicina-general', 'medicina-emergencia'],
    'neurologia': ['neurologia', 'medicina-general', 'radiologia'],
    'pediatria': ['pediatria', 'medicina-general'],
    'cirugia-general': ['cirugia-general', 'medicina-general', 'medicina-emergencia'],
    'dermatologia': ['dermatologia', 'medicina-general'],
    'psiquiatria': ['psiquiatria', 'medicina-general'],
    'medicina-interna': ['medicina-interna', 'medicina-general'],
    'ortopedia': ['ortopedia', 'cirugia-general', 'medicina-general'],
    'oftalmologia': ['oftalmologia', 'medicina-general'],
    'ginecologia': ['ginecologia', 'medicina-general'],
    'endocrinologia': ['endocrinologia', 'medicina-general'],
    'radiologia': ['radiologia', 'medicina-general'],
    'medicina-emergencia': ['medicina-emergencia', 'medicina-general']
  };

  const recommendedIds = recommendations[specialtyId] || ['medicina-general'];
  return recommendedIds
    .map(id => getDashboardConfig(id))
    .filter(config => config !== null) as DashboardConfig[];
}

// Constantes para colores de categorías
export const CATEGORY_COLORS = {
  primary_care: 'blue',
  specialty: 'purple',
  surgery: 'orange',
  diagnostic: 'teal',
  emergency: 'red'
} as const;

// Constantes para iconos de categorías
export const CATEGORY_ICONS = {
  primary_care: Stethoscope,
  specialty: Activity,
  surgery: Scissors,
  diagnostic: Microscope,
  emergency: AlertTriangle
} as const;
