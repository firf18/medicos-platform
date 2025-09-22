/**
 * Medicina Deportiva Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina Deportiva - PRÓXIMAMENTE
 */

import { Trophy } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const sports_medicine: SpecialtyConfig = {
  id: 'sports_medicine',
  name: 'Medicina Deportiva',
  description: 'Prevención y tratamiento de lesiones deportivas',
  category: 'primary_care',
  icon: Trophy,
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
      id: 'patient_management_sports_medicine',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina deportiva',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_sports_medicine',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina deportiva',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_sports_medicine',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina deportiva',
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
      id: 'sports_medicine_consultation',
      name: 'Consulta de Medicina Deportiva',
      description: 'Flujo de trabajo optimizado para consultas de medicina deportiva',
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
    'Certificación en medicina deportiva',
    'Capacitación especializada en la plataforma'
  ]
};