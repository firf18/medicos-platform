/**
 * Radiología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Radiología - PRÓXIMAMENTE
 */

import { Scan } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const radiology: SpecialtyConfig = {
  id: 'radiology',
  name: 'Radiología',
  description: 'Especialidad médica que utiliza imágenes médicas para diagnóstico',
  category: 'diagnostic',
  icon: Scan,
  color: 'teal',
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
      id: 'patient_management_radiology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para radiología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_radiology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para radiología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_radiology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para radiología',
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
      id: 'radiology_consultation',
      name: 'Consulta de Radiología',
      description: 'Flujo de trabajo optimizado para consultas de radiología',
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
    'Certificación en radiología',
    'Capacitación especializada en la plataforma'
  ]
};