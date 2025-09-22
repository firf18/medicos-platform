/**
 * Medicina de Emergencias Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina de Emergencias - PRÓXIMAMENTE
 */

import { Zap } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const emergency_medicine: SpecialtyConfig = {
  id: 'emergency_medicine',
  name: 'Medicina de Emergencias',
  description: 'Atención médica especializada en situaciones de emergencia',
  category: 'emergency',
  icon: Zap,
  color: 'red',
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
      id: 'patient_management_emergency_medicine',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina de emergencias',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_emergency_medicine',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina de emergencias',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_emergency_medicine',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina de emergencias',
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
      id: 'emergency_medicine_consultation',
      name: 'Consulta de Medicina de Emergencias',
      description: 'Flujo de trabajo optimizado para consultas de medicina de emergencias',
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
    'Certificación en medicina de emergencias',
    'Capacitación especializada en la plataforma'
  ]
};