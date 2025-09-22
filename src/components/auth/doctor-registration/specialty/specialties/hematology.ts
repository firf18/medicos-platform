/**
 * Hematología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Hematología - PRÓXIMAMENTE
 */

import { Droplet } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const hematology: SpecialtyConfig = {
  id: 'hematology',
  name: 'Hematología',
  description: 'Diagnóstico y tratamiento de enfermedades de la sangre',
  category: 'internal_medicine',
  icon: Droplet,
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
      id: 'patient_management_hematology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para hematología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_hematology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para hematología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_hematology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para hematología',
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
      id: 'hematology_consultation',
      name: 'Consulta de Hematología',
      description: 'Flujo de trabajo optimizado para consultas de hematología',
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
    'Certificación en hematología',
    'Capacitación especializada en la plataforma'
  ]
};