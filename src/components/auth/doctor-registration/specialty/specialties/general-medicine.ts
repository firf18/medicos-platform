/**
 * General Medicine Specialty Configuration - Platform Médicos Elite
 * 
 * Configuración completa para Medicina General - COMPLETAMENTE DISPONIBLE
 */

import { Stethoscope } from 'lucide-react';
import { SpecialtyConfig } from '../types';

export const general_medicine: SpecialtyConfig = {
  id: 'general_medicine',
  name: 'Medicina General',
  description: 'Atención médica integral para pacientes de todas las edades',
  category: 'primary_care',
  icon: Stethoscope,
  color: 'blue',
  isComingSoon: false,
  isAvailable: true,
  
  developmentStatus: 'available',
  
  popularity: 'high',
  complexity: 'intermediate',
  
  // ============================================================================
  // CARACTERÍSTICAS DISPONIBLES
  // ============================================================================
  features: [
    // Características Principales (Core)
    {
      id: 'patient_management',
      name: 'Gestión de Pacientes',
      description: 'Sistema completo de registro, búsqueda y gestión de expedientes digitales',
      category: 'core',
      isAvailable: true
    },
    {
      id: 'appointment_scheduling',
      name: 'Agenda y Citas',
      description: 'Sistema avanzado de programación con recordatorios automáticos',
      category: 'core',
      isAvailable: true
    },
    {
      id: 'medical_records',
      name: 'Historiales Médicos',
      description: 'Creación y gestión de historiales digitales con plantillas',
      category: 'core',
      isAvailable: true
    },
    {
      id: 'vital_signs_monitoring',
      name: 'Monitoreo de Signos Vitales',
      description: 'Registro y seguimiento con alertas automáticas',
      category: 'core',
      isAvailable: true
    },
    {
      id: 'prescription_management',
      name: 'Gestión de Recetas',
      description: 'Prescripción electrónica con verificaciones de seguridad',
      category: 'core',
      isAvailable: true
    },
    {
      id: 'secure_messaging',
      name: 'Mensajería Segura',
      description: 'Comunicación cifrada entre médicos y pacientes',
      category: 'core',
      isAvailable: true
    },

    // Características Avanzadas
    {
      id: 'telemedicine',
      name: 'Consultas Virtuales',
      description: 'Plataforma completa de telemedicina con video HD',
      category: 'advanced',
      isAvailable: true
    },
    {
      id: 'lab_integration',
      name: 'Integración de Laboratorio',
      description: 'Conexión directa con laboratorios para órdenes y resultados',
      category: 'advanced',
      isAvailable: true
    },
    {
      id: 'treatment_protocols',
      name: 'Protocolos de Tratamiento',
      description: 'Guías clínicas personalizables basadas en evidencia',
      category: 'advanced',
      isAvailable: true
    },
    {
      id: 'medication_adherence',
      name: 'Adherencia a Medicamentos',
      description: 'Seguimiento y recordatorios para mejorar cumplimiento',
      category: 'advanced',
      isAvailable: true
    },
    {
      id: 'vaccination_tracker',
      name: 'Control de Vacunas',
      description: 'Seguimiento completo del esquema de vacunación',
      category: 'advanced',
      isAvailable: true
    },
    {
      id: 'clinical_analytics',
      name: 'Analítica Clínica',
      description: 'Dashboard avanzado con métricas clínicas y KPIs',
      category: 'advanced',
      isAvailable: true
    },

    // Características Premium
    {
      id: 'ai_diagnosis_support',
      name: 'Asistente de Diagnóstico IA',
      description: 'Inteligencia artificial para apoyo en diagnóstico diferencial',
      category: 'premium',
      isAvailable: true
    },
    {
      id: 'emergency_consultation',
      name: 'Consultas de Emergencia',
      description: 'Sistema de atención médica urgente 24/7 con triaje automático',
      category: 'premium',
      isAvailable: true
    },
    {
      id: 'outcome_tracking',
      name: 'Seguimiento de Resultados',
      description: 'Medición y análisis de resultados clínicos a largo plazo',
      category: 'premium',
      isAvailable: true
    },
    {
      id: 'billing_integration',
      name: 'Facturación Integrada',
      description: 'Sistema completo de facturación y gestión financiera',
      category: 'premium',
      isAvailable: true
    },
    {
      id: 'population_health',
      name: 'Salud Poblacional',
      description: 'Análisis epidemiológico y gestión de salud comunitaria',
      category: 'premium',
      isAvailable: true
    }
  ],

  // ============================================================================
  // FLUJOS DE TRABAJO INCLUIDOS
  // ============================================================================
  workflowTemplates: [
    {
      id: 'routine_checkup',
      name: 'Chequeo de Rutina',
      description: 'Flujo completo para consulta preventiva',
      estimatedTime: '30-45 min',
      steps: [
        'Verificar datos del paciente',
        'Registrar signos vitales',
        'Actualizar historia clínica',
        'Realizar examen físico',
        'Solicitar estudios necesarios',
        'Prescribir tratamiento',
        'Programar seguimiento'
      ]
    },
    {
      id: 'chronic_disease_management',
      name: 'Manejo de Enfermedad Crónica',
      description: 'Seguimiento de pacientes con condiciones crónicas',
      estimatedTime: '20-30 min',
      steps: [
        'Revisar adherencia a medicamentos',
        'Evaluar control de la enfermedad',
        'Analizar laboratorios recientes',
        'Ajustar tratamiento si necesario',
        'Educar al paciente',
        'Programar próxima cita'
      ]
    },
    {
      id: 'acute_illness',
      name: 'Enfermedad Aguda',
      description: 'Atención de cuadros agudos',
      estimatedTime: '15-25 min',
      steps: [
        'Evaluación rápida de síntomas',
        'Triage de severidad',
        'Diagnóstico diferencial',
        'Tratamiento inmediato',
        'Instrucciones de seguimiento',
        'Criterios de alarma'
      ]
    }
  ],

  // ============================================================================
  // INTEGRACIONES DISPONIBLES
  // ============================================================================
  integrations: [
    'EMR Systems (HL7, FHIR)',
    'Laboratory Networks (LabCorp, Quest)',
    'Pharmacy Systems',
    'Insurance Providers',
    'Telemedicine Platforms (Zoom, WebRTC)',
    'Medical Devices (IoT)',
    'Business Intelligence (Tableau, Power BI)',
    'Payment Processors',
    'SMS/Email Services',
    'Calendar Systems (Google, Outlook)'
  ],

  // ============================================================================
  // REQUERIMIENTOS ESPECIALES
  // ============================================================================
  specialRequirements: [
    'Licencia médica vigente',
    'Verificación de identidad completada',
    'Capacitación básica en telemedicina',
    'Conocimiento básico de EMR'
  ]
};
