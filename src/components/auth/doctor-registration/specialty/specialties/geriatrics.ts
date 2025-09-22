/**
 * Geriatría Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Geriatría - PRÓXIMAMENTE
 */

import { Clock } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const geriatrics: SpecialtyConfig = {
  id: 'geriatrics',
  name: 'Geriatría',
  description: 'Atención médica especializada para adultos mayores',
  category: 'primary_care',
  icon: Clock,
  color: 'gray',
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
      id: 'patient_management_geriatrics',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para geriatría',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_geriatrics',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para geriatría',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_geriatrics',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para geriatría',
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
      id: 'geriatrics_consultation',
      name: 'Consulta de Geriatría',
      description: 'Flujo de trabajo optimizado para consultas de geriatría',
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
    'Certificación en geriatría',
    'Capacitación especializada en la plataforma'
  ]
};