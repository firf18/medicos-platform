/**
 * Medicina Paliativa Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina Paliativa - PRÓXIMAMENTE
 */

import { Heart } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const palliative_care: SpecialtyConfig = {
  id: 'palliative_care',
  name: 'Medicina Paliativa',
  description: 'Cuidados paliativos y manejo del dolor',
  category: 'internal_medicine',
  icon: Heart,
  color: 'purple',
  isComingSoon: true,
  isAvailable: false,
  
  developmentStatus: 'coming_soon',
  estimatedLaunch: 'Q2 2025',
  
  popularity: 'medium',
  complexity: 'intermediate',
  
  // ============================================================================
  // CARACTERÍSTICAS EN DESARROLLO
  // ============================================================================
  features: [
    {
      id: 'patient_management_palliative_care',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina paliativa',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_palliative_care',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina paliativa',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_palliative_care',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina paliativa',
      category: 'advanced',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    }
  ],

  // ============================================================================
  // INFORMACIÓN DE DESARROLLO
  // ============================================================================
  workflowTemplates: [
    {
      id: 'palliative_care_consultation',
      name: 'Consulta de Medicina Paliativa',
      description: 'Flujo de trabajo optimizado para consultas de medicina paliativa',
      estimatedTime: 'TBD',
      steps: [
        'Evaluación inicial especializada',
        'Aplicación de protocolos específicos',
        'Documentación especializada',
        'Plan de tratamiento',
        'Seguimiento programado'
      ]
    }
  ],

  integrations: [
    'EMR Systems',
    'Specialty-specific devices',
    'Laboratory integration',
    'Insurance systems'
  ],

  specialRequirements: [
    'Licencia médica especializada',
    'Certificación en medicina paliativa',
    'Capacitación especializada en la plataforma'
  ]
};