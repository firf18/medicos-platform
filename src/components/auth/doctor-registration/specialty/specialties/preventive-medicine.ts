/**
 * Medicina Preventiva Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Medicina Preventiva - PRÓXIMAMENTE
 */

import { Shield } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const preventive_medicine: SpecialtyConfig = {
  id: 'preventive_medicine',
  name: 'Medicina Preventiva',
  description: 'Prevención de enfermedades y promoción de la salud',
  category: 'primary_care',
  icon: Shield,
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
      id: 'patient_management_preventive_medicine',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para medicina preventiva',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_preventive_medicine',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para medicina preventiva',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_preventive_medicine',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para medicina preventiva',
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
      id: 'preventive_medicine_consultation',
      name: 'Consulta de Medicina Preventiva',
      description: 'Flujo de trabajo optimizado para consultas de medicina preventiva',
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
    'Certificación en medicina preventiva',
    'Capacitación especializada en la plataforma'
  ]
};