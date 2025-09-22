/**
 * Alergología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Alergología - PRÓXIMAMENTE
 */

import { Shield } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const allergy_immunology: SpecialtyConfig = {
  id: 'allergy_immunology',
  name: 'Alergología',
  description: 'Diagnóstico y tratamiento de alergias e inmunología',
  category: 'internal_medicine',
  icon: Shield,
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
      id: 'patient_management_allergy_immunology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para alergología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_allergy_immunology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para alergología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_allergy_immunology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para alergología',
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
      id: 'allergy_immunology_consultation',
      name: 'Consulta de Alergología',
      description: 'Flujo de trabajo optimizado para consultas de alergología',
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
    'Certificación en alergología',
    'Capacitación especializada en la plataforma'
  ]
};