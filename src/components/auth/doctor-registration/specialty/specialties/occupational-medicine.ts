/**
 * Medicina del Trabajo Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina del Trabajo - PRÓXIMAMENTE
 */

import { Briefcase } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const occupational_medicine: SpecialtyConfig = {
  id: 'occupational_medicine',
  name: 'Medicina del Trabajo',
  description: 'Salud ocupacional y medicina laboral',
  category: 'primary_care',
  icon: Briefcase,
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
      id: 'patient_management_occupational_medicine',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina del trabajo',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_occupational_medicine',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina del trabajo',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_occupational_medicine',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina del trabajo',
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
      id: 'occupational_medicine_consultation',
      name: 'Consulta de Medicina del Trabajo',
      description: 'Flujo de trabajo optimizado para consultas de medicina del trabajo',
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
    'Certificación en medicina del trabajo',
    'Capacitación especializada en la plataforma'
  ]
};