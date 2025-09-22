/**
 * Medicina Interna Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina Interna - PRÓXIMAMENTE
 */

import { Activity } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const internal_medicine: SpecialtyConfig = {
  id: 'internal_medicine',
  name: 'Medicina Interna',
  description: 'Diagnóstico y tratamiento de enfermedades internas del adulto',
  category: 'internal_medicine',
  icon: Activity,
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
      id: 'patient_management_internal_medicine',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina interna',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_internal_medicine',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina interna',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_internal_medicine',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina interna',
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
      id: 'internal_medicine_consultation',
      name: 'Consulta de Medicina Interna',
      description: 'Flujo de trabajo optimizado para consultas de medicina interna',
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
    'Certificación en medicina interna',
    'Capacitación especializada en la plataforma'
  ]
};