/**
 * Patología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Patología - PRÓXIMAMENTE
 */

import { Microscope } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const pathology: SpecialtyConfig = {
  id: 'pathology',
  name: 'Patología',
  description: 'Diagnóstico de enfermedades mediante análisis de tejidos',
  category: 'diagnostic',
  icon: Microscope,
  color: 'violet',
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
      id: 'patient_management_pathology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para patología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_pathology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para patología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_pathology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para patología',
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
      id: 'pathology_consultation',
      name: 'Consulta de Patología',
      description: 'Flujo de trabajo optimizado para consultas de patología',
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
    'Certificación en patología',
    'Capacitación especializada en la plataforma'
  ]
};