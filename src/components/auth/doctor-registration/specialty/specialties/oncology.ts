/**
 * Oncología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Oncología - PRÓXIMAMENTE
 */

import { Shield } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const oncology: SpecialtyConfig = {
  id: 'oncology',
  name: 'Oncología',
  description: 'Diagnóstico y tratamiento del cáncer',
  category: 'internal_medicine',
  icon: Shield,
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
      id: 'patient_management_oncology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para oncología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_oncology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para oncología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_oncology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para oncología',
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
      id: 'oncology_consultation',
      name: 'Consulta de Oncología',
      description: 'Flujo de trabajo optimizado para consultas de oncología',
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
    'Certificación en oncología',
    'Capacitación especializada en la plataforma'
  ]
};