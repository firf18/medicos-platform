/**
 * Medical Specialty Types - Platform Médicos Elite
 * 
 * Tipos TypeScript para la configuración de especialidades médicas.
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

export interface SpecialtyConfig {
  id: string;
  name: string;
  description: string;
  category: SpecialtyCategory;
  icon: LucideIcon;
  color: SpecialtyColor;
  isComingSoon: boolean;
  isAvailable: boolean;
  
  // Características del dashboard
  features: SpecialtyFeature[];
  
  // Información de estado de desarrollo
  developmentStatus: DevelopmentStatus;
  estimatedLaunch?: string; // Fecha estimada de lanzamiento
  
  // Información adicional
  popularity: 'low' | 'medium' | 'high';
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  requiredCertifications?: string[];
  
  // Configuración específica
  workflowTemplates?: WorkflowTemplate[];
  integrations?: string[];
  specialRequirements?: string[];
}

export interface SpecialtyFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium' | 'specialty';
  isAvailable: boolean;
  comingSoon?: boolean;
  estimatedCompletion?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
  estimatedTime: string;
}

// ============================================================================
// ENUMS Y UNIONES DE TIPOS
// ============================================================================

export type SpecialtyCategory = 
  | 'primary_care'
  | 'internal_medicine'
  | 'surgery'
  | 'pediatrics'
  | 'diagnostic'
  | 'emergency';

export type SpecialtyColor = 
  | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'pink'
  | 'indigo' | 'teal' | 'amber' | 'cyan' | 'yellow' | 'sky'
  | 'gray' | 'violet';

export type DevelopmentStatus =
  | 'available'        // Completamente disponible
  | 'beta'            // En fase beta
  | 'development'     // En desarrollo activo
  | 'planning'        // En planificación
  | 'coming_soon';    // Próximamente

// ============================================================================
// INTERFACES AUXILIARES
// ============================================================================

export interface CategoryInfo {
  id: SpecialtyCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  color: SpecialtyColor;
  count: number;
}

export interface SpecialtyStats {
  total: number;
  available: number;
  comingSoon: number;
  byCategory: Record<SpecialtyCategory, number>;
  byStatus: Record<DevelopmentStatus, number>;
}

export interface SpecialtySearchResult {
  specialty: SpecialtyConfig;
  relevanceScore: number;
  matchedFields: string[];
}

// ============================================================================
// TIPOS PARA COMPONENTES
// ============================================================================

export interface SpecialtyCardProps {
  specialty: SpecialtyConfig;
  isSelected: boolean;
  onSelect: (specialty: SpecialtyConfig) => void;
  viewMode: 'compact' | 'detailed';
  showFeatures?: boolean;
}

export interface SpecialtyListProps {
  specialties: SpecialtyConfig[];
  selectedSpecialty?: SpecialtyConfig | null;
  onSpecialtySelect: (specialty: SpecialtyConfig) => void;
  viewMode: 'grid' | 'list';
  categoryFilter?: SpecialtyCategory | 'all';
  showOnlyAvailable?: boolean;
}

export interface CategorySelectorProps {
  categories: CategoryInfo[];
  selectedCategory: SpecialtyCategory | 'all';
  onCategorySelect: (category: SpecialtyCategory | 'all') => void;
  layout: 'horizontal' | 'vertical';
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const CATEGORY_LABELS: Record<SpecialtyCategory, string> = {
  primary_care: 'Atención Primaria',
  internal_medicine: 'Medicina Interna',
  surgery: 'Especialidades Quirúrgicas',
  pediatrics: 'Pediatría Especializada',
  diagnostic: 'Especialidades Diagnósticas',
  emergency: 'Medicina de Emergencias'
};

export const STATUS_LABELS: Record<DevelopmentStatus, string> = {
  available: 'Disponible',
  beta: 'Beta',
  development: 'En Desarrollo',
  planning: 'Planificación',
  coming_soon: 'Próximamente'
};

export const COLOR_CLASSES: Record<SpecialtyColor, {
  border: string;
  bg: string;
  text: string;
  icon: string;
  hover: string;
}> = {
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    hover: 'hover:border-blue-400'
  },
  green: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'text-green-600',
    hover: 'hover:border-green-400'
  },
  red: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: 'text-red-600',
    hover: 'hover:border-red-400'
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    hover: 'hover:border-purple-400'
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    icon: 'text-orange-600',
    hover: 'hover:border-orange-400'
  },
  pink: {
    border: 'border-pink-200',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    icon: 'text-pink-600',
    hover: 'hover:border-pink-400'
  },
  indigo: {
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    icon: 'text-indigo-600',
    hover: 'hover:border-indigo-400'
  },
  teal: {
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    icon: 'text-teal-600',
    hover: 'hover:border-teal-400'
  },
  amber: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    hover: 'hover:border-amber-400'
  },
  cyan: {
    border: 'border-cyan-200',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    icon: 'text-cyan-600',
    hover: 'hover:border-cyan-400'
  },
  yellow: {
    border: 'border-yellow-200',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: 'text-yellow-600',
    hover: 'hover:border-yellow-400'
  },
  sky: {
    border: 'border-sky-200',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    icon: 'text-sky-600',
    hover: 'hover:border-sky-400'
  },
  gray: {
    border: 'border-gray-200',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    icon: 'text-gray-600',
    hover: 'hover:border-gray-400'
  },
  violet: {
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    icon: 'text-violet-600',
    hover: 'hover:border-violet-400'
  }
};
