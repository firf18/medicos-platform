/**
 * Gastroenterología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Gastroenterología - PRÓXIMAMENTE
 */

import { Stomach } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const gastroenterology: SpecialtyConfig = {
  id: 'gastroenterology',
  name: 'Gastroenterología',
  description: 'Diagnóstico y tratamiento del sistema digestivo',
  category: 'internal_medicine',
  icon: Stomach,
  color: 'green',
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
      id: 'patient_management_gastroenterology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para gastroenterología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_gastroenterology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para gastroenterología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_gastroenterology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para gastroenterología',
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
      id: 'gastroenterology_consultation',
      name: 'Consulta de Gastroenterología',
      description: 'Flujo de trabajo optimizado para consultas de gastroenterología',
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
    'Certificación en gastroenterología',
    'Capacitación especializada en la plataforma'
  ]
};