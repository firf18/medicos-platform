/**
 * Ortopedia y Traumatología Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Ortopedia y Traumatología - PRÓXIMAMENTE
 */

import { Bone } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const orthopedics: SpecialtyConfig = {
  id: 'orthopedics',
  name: 'Ortopedia y Traumatología',
  description: 'Tratamiento del sistema musculoesquelético',
  category: 'surgery',
  icon: Bone,
  color: 'orange',
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
      id: 'patient_management_orthopedics',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para ortopedia y traumatología',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_orthopedics',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para ortopedia y traumatología',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_orthopedics',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para ortopedia y traumatología',
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
      id: 'orthopedics_consultation',
      name: 'Consulta de Ortopedia y Traumatología',
      description: 'Flujo de trabajo optimizado para consultas de ortopedia y traumatología',
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
    'Certificación en ortopedia y traumatología',
    'Capacitación especializada en la plataforma'
  ]
};