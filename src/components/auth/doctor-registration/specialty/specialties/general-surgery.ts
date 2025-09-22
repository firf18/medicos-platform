/**
 * Cirugía General Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Cirugía General - PRÓXIMAMENTE
 */

import { Scissors } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const general_surgery: SpecialtyConfig = {
  id: 'general_surgery',
  name: 'Cirugía General',
  description: 'Procedimientos quirúrgicos generales y abdominales',
  category: 'surgery',
  icon: Scissors,
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
      id: 'patient_management_general_surgery',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para cirugía general',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_general_surgery',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para cirugía general',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_general_surgery',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para cirugía general',
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
      id: 'general_surgery_consultation',
      name: 'Consulta de Cirugía General',
      description: 'Flujo de trabajo optimizado para consultas de cirugía general',
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
    'Certificación en cirugía general',
    'Capacitación especializada en la plataforma'
  ]
};