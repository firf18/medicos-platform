/**
 * Angiología y Cirugía Vascular Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Angiología y Cirugía Vascular - PRÓXIMAMENTE
 */

import { GitBranch } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const vascular_surgery: SpecialtyConfig = {
  id: 'vascular_surgery',
  name: 'Angiología y Cirugía Vascular',
  description: 'Cirugía de vasos sanguíneos y sistema circulatorio',
  category: 'surgery',
  icon: GitBranch,
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
      id: 'patient_management_vascular_surgery',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para angiología y cirugía vascular',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_vascular_surgery',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para angiología y cirugía vascular',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_vascular_surgery',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para angiología y cirugía vascular',
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
      id: 'vascular_surgery_consultation',
      name: 'Consulta de Angiología y Cirugía Vascular',
      description: 'Flujo de trabajo optimizado para consultas de angiología y cirugía vascular',
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
    'Certificación en angiología y cirugía vascular',
    'Capacitación especializada en la plataforma'
  ]
};