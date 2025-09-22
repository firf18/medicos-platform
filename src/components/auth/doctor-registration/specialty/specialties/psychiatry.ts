/**
 * Psiquiatría Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Psiquiatría - PRÓXIMAMENTE
 */

import { Brain } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const psychiatry: SpecialtyConfig = {
  id: 'psychiatry',
  name: 'Psiquiatría',
  description: 'Diagnóstico y tratamiento de trastornos mentales',
  category: 'internal_medicine',
  icon: Brain,
  color: 'indigo',
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
      id: 'patient_management_psychiatry',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para psiquiatría',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_psychiatry',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para psiquiatría',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_psychiatry',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para psiquiatría',
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
      id: 'psychiatry_consultation',
      name: 'Consulta de Psiquiatría',
      description: 'Flujo de trabajo optimizado para consultas de psiquiatría',
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
    'Certificación en psiquiatría',
    'Capacitación especializada en la plataforma'
  ]
};