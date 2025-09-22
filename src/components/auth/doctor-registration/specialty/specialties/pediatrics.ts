/**
 * Pediatría Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Pediatría - PRÓXIMAMENTE
 */

import { Baby } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const pediatrics: SpecialtyConfig = {
  id: 'pediatrics',
  name: 'Pediatría',
  description: 'Medicina especializada en el cuidado de niños y adolescentes',
  category: 'primary_care',
  icon: Baby,
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
      id: 'patient_management_pediatrics',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para pediatría',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_pediatrics',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para pediatría',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_pediatrics',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para pediatría',
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
      id: 'pediatrics_consultation',
      name: 'Consulta de Pediatría',
      description: 'Flujo de trabajo optimizado para consultas de pediatría',
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
    'Certificación en pediatría',
    'Capacitación especializada en la plataforma'
  ]
};