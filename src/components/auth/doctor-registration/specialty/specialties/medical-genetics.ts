/**
 * Genética Médica Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Genética Médica - PRÓXIMAMENTE
 */

import { Dna } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const medical_genetics: SpecialtyConfig = {
  id: 'medical_genetics',
  name: 'Genética Médica',
  description: 'Diagnóstico y consejo genético',
  category: 'diagnostic',
  icon: Dna,
  color: 'cyan',
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
      id: 'patient_management_medical_genetics',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para genética médica',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_medical_genetics',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para genética médica',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_medical_genetics',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para genética médica',
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
      id: 'medical_genetics_consultation',
      name: 'Consulta de Genética Médica',
      description: 'Flujo de trabajo optimizado para consultas de genética médica',
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
    'Certificación en genética médica',
    'Capacitación especializada en la plataforma'
  ]
};