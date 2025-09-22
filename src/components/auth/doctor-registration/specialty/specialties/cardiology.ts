/**
 * Cardiología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Cardiología - PRÓXIMAMENTE
 */

import { Heart } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const cardiology: SpecialtyConfig = {
  id: 'cardiology',
  name: 'Cardiología',
  description: 'Especialidad médica que se ocupa del corazón y sistema cardiovascular',
  category: 'internal_medicine',
  icon: Heart,
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
      id: 'patient_management_cardiology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para cardiología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_cardiology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para cardiología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_cardiology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para cardiología',
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
      id: 'cardiology_consultation',
      name: 'Consulta de Cardiología',
      description: 'Flujo de trabajo optimizado para consultas de cardiología',
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
    'Certificación en cardiología',
    'Capacitación especializada en la plataforma'
  ]
};