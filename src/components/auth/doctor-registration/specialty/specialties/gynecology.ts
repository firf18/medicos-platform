/**
 * Ginecología y Obstetricia Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Ginecología y Obstetricia - PRÓXIMAMENTE
 */

import { Heart } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const gynecology: SpecialtyConfig = {
  id: 'gynecology',
  name: 'Ginecología y Obstetricia',
  description: 'Salud del sistema reproductor femenino y embarazo',
  category: 'surgery',
  icon: Heart,
  color: 'pink',
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
      id: 'patient_management_gynecology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para ginecología y obstetricia',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_gynecology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para ginecología y obstetricia',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_gynecology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para ginecología y obstetricia',
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
      id: 'gynecology_consultation',
      name: 'Consulta de Ginecología y Obstetricia',
      description: 'Flujo de trabajo optimizado para consultas de ginecología y obstetricia',
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
    'Certificación en ginecología y obstetricia',
    'Capacitación especializada en la plataforma'
  ]
};