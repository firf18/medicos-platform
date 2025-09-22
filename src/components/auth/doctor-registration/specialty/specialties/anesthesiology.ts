/**
 * Anestesiología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Anestesiología - PRÓXIMAMENTE
 */

import { Moon } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const anesthesiology: SpecialtyConfig = {
  id: 'anesthesiology',
  name: 'Anestesiología',
  description: 'Manejo anestésico y cuidados perioperatorios',
  category: 'surgery',
  icon: Moon,
  color: 'indigo',
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
      id: 'patient_management_anesthesiology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para anestesiología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_anesthesiology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para anestesiología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_anesthesiology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para anestesiología',
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
      id: 'anesthesiology_consultation',
      name: 'Consulta de Anestesiología',
      description: 'Flujo de trabajo optimizado para consultas de anestesiología',
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
    'Certificación en anestesiología',
    'Capacitación especializada en la plataforma'
  ]
};