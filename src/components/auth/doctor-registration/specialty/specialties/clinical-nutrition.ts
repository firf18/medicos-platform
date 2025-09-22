/**
 * Nutriología Clínica Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Nutriología Clínica - PRÓXIMAMENTE
 */

import { Apple } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const clinical_nutrition: SpecialtyConfig = {
  id: 'clinical_nutrition',
  name: 'Nutriología Clínica',
  description: 'Evaluación y tratamiento nutricional especializado',
  category: 'primary_care',
  icon: Apple,
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
      id: 'patient_management_clinical_nutrition',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para nutriología clínica',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_clinical_nutrition',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para nutriología clínica',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_clinical_nutrition',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para nutriología clínica',
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
      id: 'clinical_nutrition_consultation',
      name: 'Consulta de Nutriología Clínica',
      description: 'Flujo de trabajo optimizado para consultas de nutriología clínica',
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
    'Certificación en nutriología clínica',
    'Capacitación especializada en la plataforma'
  ]
};