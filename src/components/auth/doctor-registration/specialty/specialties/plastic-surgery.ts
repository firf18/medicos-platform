/**
 * Cirugía Plástica Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Cirugía Plástica - PRÓXIMAMENTE
 */

import { Sparkles } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const plastic_surgery: SpecialtyConfig = {
  id: 'plastic_surgery',
  name: 'Cirugía Plástica',
  description: 'Cirugía reconstructiva y estética',
  category: 'surgery',
  icon: Sparkles,
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
      id: 'patient_management_plastic_surgery',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para cirugía plástica',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_plastic_surgery',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para cirugía plástica',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_plastic_surgery',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para cirugía plástica',
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
      id: 'plastic_surgery_consultation',
      name: 'Consulta de Cirugía Plástica',
      description: 'Flujo de trabajo optimizado para consultas de cirugía plástica',
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
    'Certificación en cirugía plástica',
    'Capacitación especializada en la plataforma'
  ]
};