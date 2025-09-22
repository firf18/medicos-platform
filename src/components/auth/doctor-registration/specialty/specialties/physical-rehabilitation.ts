/**
 * Medicina Física y Rehabilitación Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina Física y Rehabilitación - PRÓXIMAMENTE
 */

import { RotateCcw } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const physical_rehabilitation: SpecialtyConfig = {
  id: 'physical_rehabilitation',
  name: 'Medicina Física y Rehabilitación',
  description: 'Rehabilitación y medicina física',
  category: 'primary_care',
  icon: RotateCcw,
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
      id: 'patient_management_physical_rehabilitation',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina física y rehabilitación',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_physical_rehabilitation',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina física y rehabilitación',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_physical_rehabilitation',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina física y rehabilitación',
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
      id: 'physical_rehabilitation_consultation',
      name: 'Consulta de Medicina Física y Rehabilitación',
      description: 'Flujo de trabajo optimizado para consultas de medicina física y rehabilitación',
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
    'Certificación en medicina física y rehabilitación',
    'Capacitación especializada en la plataforma'
  ]
};