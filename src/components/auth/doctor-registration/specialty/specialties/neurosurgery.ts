/**
 * Neurocirugía Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración para Neurocirugía - PRÓXIMAMENTE
 */

import { Brain } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const neurosurgery: SpecialtyConfig = {
  id: 'neurosurgery',
  name: 'Neurocirugía',
  description: 'Cirugía del sistema nervioso central y periférico',
  category: 'surgery',
  icon: Brain,
  color: 'purple',
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
      id: 'patient_management_neurosurgery',
      name: 'Gestión de Pacientes',
      description: 'Sistema especializado de gestión de pacientes para neurocirugía',
      category: 'core',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'specialty_tools_neurosurgery',
      name: 'Herramientas Especializadas',
      description: 'Conjunto de herramientas específicas para neurocirugía',
      category: 'specialty',
      isAvailable: false,
      comingSoon: true,
      estimatedCompletion: 'Q3 2025'
    },
    {
      id: 'protocols_neurosurgery',
      name: 'Protocolos Especializados',
      description: 'Protocolos y guías clínicas específicas para neurocirugía',
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
      id: 'neurosurgery_consultation',
      name: 'Consulta de Neurocirugía',
      description: 'Flujo de trabajo optimizado para consultas de neurocirugía',
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
    'Certificación en neurocirugía',
    'Capacitación especializada en la plataforma'
  ]
};