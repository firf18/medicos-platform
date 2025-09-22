/**
 * Neumología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Neumología - PRÓXIMAMENTE
 */

import { Lungs } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const pulmonology: SpecialtyConfig = {
  id: 'pulmonology',
  name: 'Neumología',
  description: 'Diagnóstico y tratamiento de enfermedades respiratorias',
  category: 'internal_medicine',
  icon: Lungs,
  color: 'sky',
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
      id: 'patient_management_pulmonology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para neumología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_pulmonology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para neumología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_pulmonology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para neumología',
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
      id: 'pulmonology_consultation',
      name: 'Consulta de Neumología',
      description: 'Flujo de trabajo optimizado para consultas de neumología',
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
    'Certificación en neumología',
    'Capacitación especializada en la plataforma'
  ]
};