/**
 * Cirugía Torácica Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Cirugía Torácica - PRÓXIMAMENTE
 */

import { Lungs } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const thoracic_surgery: SpecialtyConfig = {
  id: 'thoracic_surgery',
  name: 'Cirugía Torácica',
  description: 'Cirugía de tórax, pulmones y mediastino',
  category: 'surgery',
  icon: Lungs,
  color: 'blue',
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
      id: 'patient_management_thoracic_surgery',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para cirugía torácica',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_thoracic_surgery',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para cirugía torácica',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_thoracic_surgery',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para cirugía torácica',
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
      id: 'thoracic_surgery_consultation',
      name: 'Consulta de Cirugía Torácica',
      description: 'Flujo de trabajo optimizado para consultas de cirugía torácica',
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
    'Certificación en cirugía torácica',
    'Capacitación especializada en la plataforma'
  ]
};