/**
 * Neurología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Neurología - PRÓXIMAMENTE
 */

import { Brain } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const neurology: SpecialtyConfig = {
  id: 'neurology',
  name: 'Neurología',
  description: 'Especialidad médica que trata el sistema nervioso',
  category: 'internal_medicine',
  icon: Brain,
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
      id: 'patient_management_neurology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para neurología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_neurology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para neurología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_neurology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para neurología',
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
      id: 'neurology_consultation',
      name: 'Consulta de Neurología',
      description: 'Flujo de trabajo optimizado para consultas de neurología',
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
    'Certificación en neurología',
    'Capacitación especializada en la plataforma'
  ]
};