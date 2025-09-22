/**
 * Endocrinología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Endocrinología - PRÓXIMAMENTE
 */

import { Zap } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const endocrinology: SpecialtyConfig = {
  id: 'endocrinology',
  name: 'Endocrinología',
  description: 'Diagnóstico y tratamiento de trastornos hormonales',
  category: 'internal_medicine',
  icon: Zap,
  color: 'yellow',
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
      id: 'patient_management_endocrinology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para endocrinología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_endocrinology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para endocrinología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_endocrinology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para endocrinología',
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
      id: 'endocrinology_consultation',
      name: 'Consulta de Endocrinología',
      description: 'Flujo de trabajo optimizado para consultas de endocrinología',
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
    'Certificación en endocrinología',
    'Capacitación especializada en la plataforma'
  ]
};