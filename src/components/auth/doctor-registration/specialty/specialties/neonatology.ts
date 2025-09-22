/**
 * Neonatología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Neonatología - PRÓXIMAMENTE
 */

import { Baby } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const neonatology: SpecialtyConfig = {
  id: 'neonatology',
  name: 'Neonatología',
  description: 'Cuidados médicos especializados para recién nacidos',
  category: 'pediatrics',
  icon: Baby,
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
      id: 'patient_management_neonatology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para neonatología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_neonatology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para neonatología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_neonatology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para neonatología',
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
      id: 'neonatology_consultation',
      name: 'Consulta de Neonatología',
      description: 'Flujo de trabajo optimizado para consultas de neonatología',
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
    'Certificación en neonatología',
    'Capacitación especializada en la plataforma'
  ]
};