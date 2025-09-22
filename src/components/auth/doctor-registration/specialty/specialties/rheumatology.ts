/**
 * Reumatología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Reumatología - PRÓXIMAMENTE
 */

import { Bone } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const rheumatology: SpecialtyConfig = {
  id: 'rheumatology',
  name: 'Reumatología',
  description: 'Enfermedades reumáticas y autoinmunes',
  category: 'internal_medicine',
  icon: Bone,
  color: 'red',
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
      id: 'patient_management_rheumatology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para reumatología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_rheumatology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para reumatología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_rheumatology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para reumatología',
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
      id: 'rheumatology_consultation',
      name: 'Consulta de Reumatología',
      description: 'Flujo de trabajo optimizado para consultas de reumatología',
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
    'Certificación en reumatología',
    'Capacitación especializada en la plataforma'
  ]
};