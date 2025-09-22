/**
 * Infectología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Infectología - PRÓXIMAMENTE
 */

import { Bug } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const infectious_diseases: SpecialtyConfig = {
  id: 'infectious_diseases',
  name: 'Infectología',
  description: 'Diagnóstico y tratamiento de enfermedades infecciosas',
  category: 'internal_medicine',
  icon: Bug,
  color: 'orange',
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
      id: 'patient_management_infectious_diseases',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para infectología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_infectious_diseases',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para infectología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_infectious_diseases',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para infectología',
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
      id: 'infectious_diseases_consultation',
      name: 'Consulta de Infectología',
      description: 'Flujo de trabajo optimizado para consultas de infectología',
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
    'Certificación en infectología',
    'Capacitación especializada en la plataforma'
  ]
};