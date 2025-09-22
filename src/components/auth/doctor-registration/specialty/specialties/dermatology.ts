/**
 * Dermatología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Dermatología - PRÓXIMAMENTE
 */

import { Layers } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const dermatology: SpecialtyConfig = {
  id: 'dermatology',
  name: 'Dermatología',
  description: 'Diagnóstico y tratamiento de enfermedades de la piel',
  category: 'internal_medicine',
  icon: Layers,
  color: 'pink',
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
      id: 'patient_management_dermatology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para dermatología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_dermatology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para dermatología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_dermatology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para dermatología',
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
      id: 'dermatology_consultation',
      name: 'Consulta de Dermatología',
      description: 'Flujo de trabajo optimizado para consultas de dermatología',
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
    'Certificación en dermatología',
    'Capacitación especializada en la plataforma'
  ]
};