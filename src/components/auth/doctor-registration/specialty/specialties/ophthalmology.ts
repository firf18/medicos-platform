/**
 * Oftalmología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Oftalmología - PRÓXIMAMENTE
 */

import { Eye } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const ophthalmology: SpecialtyConfig = {
  id: 'ophthalmology',
  name: 'Oftalmología',
  description: 'Cuidado de la salud ocular y visual',
  category: 'surgery',
  icon: Eye,
  color: 'amber',
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
      id: 'patient_management_ophthalmology',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para oftalmología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_ophthalmology',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para oftalmología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_ophthalmology',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para oftalmología',
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
      id: 'ophthalmology_consultation',
      name: 'Consulta de Oftalmología',
      description: 'Flujo de trabajo optimizado para consultas de oftalmología',
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
    'Certificación en oftalmología',
    'Capacitación especializada en la plataforma'
  ]
};