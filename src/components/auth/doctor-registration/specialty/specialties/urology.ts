/**
 * Urología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Urología - PRÓXIMAMENTE
 */

import { Droplets } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const urology: SpecialtyConfig = {
  id: 'urology',
  name: 'Urología',
  description: 'Cirugía y medicina del sistema genitourinario',
  category: 'surgery',
  icon: Droplets,
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
      id: 'patient_management_urology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para urología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_urology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para urología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_urology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para urología',
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
      id: 'urology_consultation',
      name: 'Consulta de Urología',
      description: 'Flujo de trabajo optimizado para consultas de urología',
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
    'Certificación en urología',
    'Capacitación especializada en la plataforma'
  ]
};