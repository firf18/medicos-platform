/**
 * Otorrinolaringología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Otorrinolaringología - PRÓXIMAMENTE
 */

import { Ear } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const otolaryngology: SpecialtyConfig = {
  id: 'otolaryngology',
  name: 'Otorrinolaringología',
  description: 'Cirugía y medicina de oído, nariz y garganta',
  category: 'surgery',
  icon: Ear,
  color: 'green',
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
      id: 'patient_management_otolaryngology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para otorrinolaringología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_otolaryngology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para otorrinolaringología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_otolaryngology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para otorrinolaringología',
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
      id: 'otolaryngology_consultation',
      name: 'Consulta de Otorrinolaringología',
      description: 'Flujo de trabajo optimizado para consultas de otorrinolaringología',
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
    'Certificación en otorrinolaringología',
    'Capacitación especializada en la plataforma'
  ]
};