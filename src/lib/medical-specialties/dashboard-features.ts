/**
 * Medical Dashboard Features Configuration - Elite Platform
 * 
 * Configuración completa de características del dashboard por especialidad médica.
 * Incluye funcionalidades avanzadas para cada área de medicina.
 */

import {
  Stethoscope, Heart, Brain, Baby, Scissors, Scan, Zap, Eye, Bone,
  Activity, Droplets, Lungs, Shield, Bug, Sparkles, Users, Clock,
  Trophy, Briefcase, Moon, Microscope, Apple, Dna, RotateCcw,
  Calendar, MessageSquare, FileText, BarChart3, Video, Phone,
  AlertTriangle, Pill, Camera, Upload, Download, Share, Bell,
  Settings, Lock, Search, Filter, Plus, Edit, Trash2, Archive,
  Star, Bookmark, Tag, Map, Navigation, Compass, Globe, Wifi,
  Bluetooth, Headphones, Speaker, Mic, Volume2, Play, Pause,
  SkipBack, SkipForward, Repeat, Shuffle, Music, Radio, Tv,
  Monitor, Smartphone, Tablet, Laptop, HardDrive, Database,
  Server, Cloud, Folder, File, FileImage, FileVideo, FilePdf,
  Copy, Cut, Paste, Undo, Redo, Save, Print, Mail, Send,
  Inbox, Outbox, Drafts, Archive as ArchiveIcon, Flag, CheckCircle
} from 'lucide-react';

// Tipos de características
export interface DashboardFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'core' | 'advanced' | 'premium' | 'specialty';
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  isPremium: boolean;
  estimatedUsage: 'high' | 'medium' | 'low';
  requiredFor?: string[]; // IDs de especialidades que lo requieren obligatoriamente
  benefits: string[];
  technicalSpecs?: {
    integrations?: string[];
    dataTypes?: string[];
    apis?: string[];
    realTime?: boolean;
    aiPowered?: boolean;
  };
}

export interface SpecialtyDashboardConfig {
  specialtyId: string;
  specialtyName: string;
  coreFeatures: string[]; // IDs de características principales
  advancedFeatures: string[]; // IDs de características avanzadas
  premiumFeatures: string[]; // IDs de características premium
  comingSoonFeatures: string[]; // IDs de características en desarrollo
  workflowTemplates: {
    id: string;
    name: string;
    description: string;
    steps: string[];
  }[];
  integrations: string[];
  aiFeatures: string[];
}

// ============================================================================
// CARACTERÍSTICAS DEL DASHBOARD - BIBLIOTECA COMPLETA
// ============================================================================

export const DASHBOARD_FEATURES: Record<string, DashboardFeature> = {
  // ============================================================================
  // CARACTERÍSTICAS PRINCIPALES (CORE)
  // ============================================================================
  
  // Gestión de Pacientes
  'patient_management': {
    id: 'patient_management',
    name: 'Gestión de Pacientes',
    description: 'Sistema completo de registro, búsqueda y gestión de expedientes de pacientes',
    icon: Users,
    category: 'core',
    complexity: 'basic',
    isPremium: false,
    estimatedUsage: 'high',
    requiredFor: ['general_medicine', 'family_medicine', 'pediatrics'],
    benefits: [
      'Expedientes digitales completos',
      'Búsqueda avanzada de pacientes',
      'Historial médico centralizado',
      'Gestión de contactos de emergencia',
      'Seguimiento de estado del paciente'
    ],
    technicalSpecs: {
      integrations: ['EMR', 'HL7', 'FHIR'],
      dataTypes: ['demographics', 'medical_history', 'contacts'],
      realTime: true,
      aiPowered: false
    }
  },

  'appointment_scheduling': {
    id: 'appointment_scheduling',
    name: 'Agenda y Citas',
    description: 'Sistema avanzado de programación de citas con recordatorios automáticos',
    icon: Calendar,
    category: 'core',
    complexity: 'basic',
    isPremium: false,
    estimatedUsage: 'high',
    requiredFor: ['general_medicine', 'family_medicine', 'pediatrics'],
    benefits: [
      'Calendario inteligente',
      'Recordatorios automáticos SMS/Email',
      'Gestión de cancelaciones',
      'Lista de espera automática',
      'Sincronización con calendarios externos'
    ],
    technicalSpecs: {
      integrations: ['Google Calendar', 'Outlook', 'iCal', 'Twilio', 'SendGrid'],
      realTime: true,
      aiPowered: true
    }
  },

  'medical_records': {
    id: 'medical_records',
    name: 'Historiales Médicos',
    description: 'Creación, gestión y seguimiento de historiales médicos digitales',
    icon: FileText,
    category: 'core',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'high',
    requiredFor: ['general_medicine', 'internal_medicine', 'family_medicine'],
    benefits: [
      'Plantillas personalizables',
      'Búsqueda por síntomas/diagnósticos',
      'Versionado automático',
      'Firma digital',
      'Exportación PDF'
    ],
    technicalSpecs: {
      integrations: ['DICOM', 'HL7', 'ICD-10', 'SNOMED'],
      dataTypes: ['text', 'images', 'audio', 'structured_data'],
      realTime: true,
      aiPowered: true
    }
  },

  'vital_signs_monitoring': {
    id: 'vital_signs_monitoring',
    name: 'Monitoreo de Signos Vitales',
    description: 'Registro y seguimiento de signos vitales con alertas automáticas',
    icon: Activity,
    category: 'core',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Gráficos de tendencias',
      'Alertas por valores críticos',
      'Integración con dispositivos IoT',
      'Análisis predictivo',
      'Reportes automáticos'
    ],
    technicalSpecs: {
      integrations: ['Medical IoT devices', 'Fitbit', 'Apple Health', 'Google Fit'],
      dataTypes: ['numeric', 'time_series'],
      realTime: true,
      aiPowered: true
    }
  },

  // ============================================================================
  // COMUNICACIÓN Y TELEMEDICINA
  // ============================================================================

  'telemedicine': {
    id: 'telemedicine',
    name: 'Consultas Virtuales',
    description: 'Plataforma completa de telemedicina con video HD y herramientas diagnósticas',
    icon: Video,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: true,
    estimatedUsage: 'high',
    benefits: [
      'Video llamadas HD',
      'Compartir pantalla',
      'Grabación de consultas',
      'Chat en tiempo real',
      'Salas de espera virtuales',
      'Integración con wearables'
    ],
    technicalSpecs: {
      integrations: ['Zoom', 'WebRTC', 'Twilio Video', 'Agora'],
      dataTypes: ['video', 'audio', 'chat', 'screen_share'],
      realTime: true,
      aiPowered: true
    }
  },

  'secure_messaging': {
    id: 'secure_messaging',
    name: 'Mensajería Segura',
    description: 'Sistema de comunicación cifrada entre médicos y pacientes',
    icon: MessageSquare,
    category: 'core',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Mensajes cifrados E2E',
      'Archivos adjuntos seguros',
      'Notificaciones push',
      'Estados de lectura',
      'Archivo de conversaciones'
    ],
    technicalSpecs: {
      integrations: ['Signal Protocol', 'WhatsApp Business', 'Telegram'],
      dataTypes: ['text', 'images', 'documents', 'audio'],
      realTime: true,
      aiPowered: false
    }
  },

  'emergency_consultation': {
    id: 'emergency_consultation',
    name: 'Consultas de Emergencia',
    description: 'Sistema de atención médica urgente 24/7 con triaje automático',
    icon: AlertTriangle,
    category: 'premium',
    complexity: 'expert',
    isPremium: true,
    estimatedUsage: 'low',
    benefits: [
      'Triaje automático AI',
      'Conexión inmediata',
      'Escalación automática',
      'Geolocalización',
      'Coordinación con emergencias'
    ],
    technicalSpecs: {
      integrations: ['Emergency Services API', 'GPS', 'Hospital Networks'],
      dataTypes: ['location', 'vitals', 'symptoms', 'images'],
      realTime: true,
      aiPowered: true
    }
  },

  // ============================================================================
  // LABORATORIO E IMÁGENES
  // ============================================================================

  'lab_integration': {
    id: 'lab_integration',
    name: 'Integración de Laboratorio',
    description: 'Conexión directa con laboratorios para órdenes y resultados',
    icon: Microscope,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Órdenes digitales',
      'Resultados automáticos',
      'Comparación temporal',
      'Alertas de valores críticos',
      'Integración con múltiples labs'
    ],
    technicalSpecs: {
      integrations: ['LabCorp', 'Quest', 'Local Labs', 'HL7', 'LOINC'],
      dataTypes: ['lab_orders', 'results', 'reference_ranges'],
      realTime: true,
      aiPowered: true
    }
  },

  'medical_imaging': {
    id: 'medical_imaging',
    name: 'Imágenes Médicas',
    description: 'Visor DICOM y gestión de estudios de imagen',
    icon: Scan,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: true,
    estimatedUsage: 'medium',
    benefits: [
      'Visor DICOM avanzado',
      'Comparación de estudios',
      'Anotaciones digitales',
      'Mediciones precisas',
      'Almacenamiento en la nube'
    ],
    technicalSpecs: {
      integrations: ['PACS', 'DICOM', 'OHIF Viewer'],
      dataTypes: ['DICOM', 'JPEG', 'PNG', 'metadata'],
      realTime: false,
      aiPowered: true
    }
  },

  'ai_diagnosis_support': {
    id: 'ai_diagnosis_support',
    name: 'Asistente de Diagnóstico IA',
    description: 'Inteligencia artificial para apoyo en diagnóstico diferencial',
    icon: Brain,
    category: 'premium',
    complexity: 'expert',
    isPremium: true,
    estimatedUsage: 'medium',
    benefits: [
      'Diagnóstico diferencial sugerido',
      'Análisis de síntomas',
      'Detección de patrones',
      'Alertas de drug interactions',
      'Recomendaciones basadas en evidencia'
    ],
    technicalSpecs: {
      integrations: ['IBM Watson Health', 'Google Health AI', 'Microsoft Healthcare Bot'],
      dataTypes: ['symptoms', 'history', 'labs', 'images'],
      realTime: true,
      aiPowered: true
    }
  },

  // ============================================================================
  // MEDICAMENTOS Y TRATAMIENTOS
  // ============================================================================

  'prescription_management': {
    id: 'prescription_management',
    name: 'Gestión de Recetas',
    description: 'Sistema completo de prescripción electrónica con verificaciones',
    icon: Pill,
    category: 'core',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'high',
    benefits: [
      'Recetas electrónicas',
      'Base de datos de medicamentos',
      'Verificación de interacciones',
      'Alertas de alergias',
      'Seguimiento de adherencia'
    ],
    technicalSpecs: {
      integrations: ['Pharmacy Networks', 'RxNorm', 'FDA Drug Database'],
      dataTypes: ['medications', 'dosages', 'interactions', 'allergies'],
      realTime: true,
      aiPowered: true
    }
  },

  'treatment_protocols': {
    id: 'treatment_protocols',
    name: 'Protocolos de Tratamiento',
    description: 'Guías clínicas y protocolos personalizables por especialidad',
    icon: FileText,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Protocolos basados en evidencia',
      'Personalización por paciente',
      'Seguimiento de cumplimiento',
      'Actualizaciones automáticas',
      'Métricas de efectividad'
    ],
    technicalSpecs: {
      integrations: ['Clinical Guidelines', 'PubMed', 'Cochrane'],
      dataTypes: ['protocols', 'guidelines', 'outcomes'],
      realTime: false,
      aiPowered: true
    }
  },

  'medication_adherence': {
    id: 'medication_adherence',
    name: 'Adherencia a Medicamentos',
    description: 'Seguimiento y recordatorios para mejorar la adherencia',
    icon: Bell,
    category: 'advanced',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Recordatorios personalizados',
      'Tracking de adherencia',
      'Alertas para médicos',
      'Gamificación',
      'Reportes para familiares'
    ],
    technicalSpecs: {
      integrations: ['Mobile Apps', 'Smart Pill Dispensers', 'SMS/Push'],
      dataTypes: ['medication_schedule', 'adherence_data', 'reminders'],
      realTime: true,
      aiPowered: true
    }
  },

  // ============================================================================
  // ANÁLISIS Y REPORTES
  // ============================================================================

  'clinical_analytics': {
    id: 'clinical_analytics',
    name: 'Analítica Clínica',
    description: 'Dashboard avanzado con métricas clínicas y KPIs',
    icon: BarChart3,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: true,
    estimatedUsage: 'medium',
    benefits: [
      'KPIs clínicos en tiempo real',
      'Análisis de outcomes',
      'Benchmarking',
      'Predicción de riesgos',
      'Reportes personalizables'
    ],
    technicalSpecs: {
      integrations: ['Business Intelligence', 'Tableau', 'Power BI'],
      dataTypes: ['clinical_metrics', 'outcomes', 'population_health'],
      realTime: true,
      aiPowered: true
    }
  },

  'population_health': {
    id: 'population_health',
    name: 'Salud Poblacional',
    description: 'Análisis epidemiológico y gestión de salud comunitaria',
    icon: Globe,
    category: 'premium',
    complexity: 'expert',
    isPremium: true,
    estimatedUsage: 'low',
    benefits: [
      'Análisis epidemiológico',
      'Identificación de brotes',
      'Programas preventivos',
      'Métricas comunitarias',
      'Alertas de salud pública'
    ],
    technicalSpecs: {
      integrations: ['CDC APIs', 'WHO Data', 'Local Health Departments'],
      dataTypes: ['epidemiological', 'demographic', 'environmental'],
      realTime: true,
      aiPowered: true
    }
  },

  'outcome_tracking': {
    id: 'outcome_tracking',
    name: 'Seguimiento de Resultados',
    description: 'Medición y análisis de resultados clínicos a largo plazo',
    icon: CheckCircle,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Seguimiento longitudinal',
      'Métricas de calidad',
      'Comparación con estándares',
      'Identificación de mejoras',
      'Certificación de calidad'
    ],
    technicalSpecs: {
      integrations: ['Quality Measures', 'CMS', 'Joint Commission'],
      dataTypes: ['outcomes', 'quality_metrics', 'patient_satisfaction'],
      realTime: false,
      aiPowered: true
    }
  },

  // ============================================================================
  // CARACTERÍSTICAS ESPECIALIZADAS
  // ============================================================================

  // Cardiología
  'ecg_analysis': {
    id: 'ecg_analysis',
    name: 'Análisis de ECG',
    description: 'Interpretación automática de electrocardiogramas con IA',
    icon: Heart,
    category: 'specialty',
    complexity: 'expert',
    isPremium: true,
    estimatedUsage: 'high',
    requiredFor: ['cardiology'],
    benefits: [
      'Interpretación automática',
      'Detección de arritmias',
      'Comparación temporal',
      'Alertas críticas',
      'Integración con monitores'
    ],
    technicalSpecs: {
      integrations: ['Cardiology Devices', 'AliveCor', 'Philips'],
      dataTypes: ['ecg_waveforms', 'intervals', 'rhythms'],
      realTime: true,
      aiPowered: true
    }
  },

  'cardiac_monitoring': {
    id: 'cardiac_monitoring',
    name: 'Monitoreo Cardíaco',
    description: 'Seguimiento continuo de parámetros cardiovasculares',
    icon: Activity,
    category: 'specialty',
    complexity: 'advanced',
    isPremium: true,
    estimatedUsage: 'high',
    requiredFor: ['cardiology'],
    benefits: [
      'Monitoreo 24/7',
      'Alertas automáticas',
      'Tendencias visuales',
      'Reportes para pacientes',
      'Integración con wearables'
    ],
    technicalSpecs: {
      integrations: ['Holter monitors', 'Apple Watch', 'Fitbit', 'Garmin'],
      dataTypes: ['heart_rate', 'rhythm', 'variability'],
      realTime: true,
      aiPowered: true
    }
  },

  // Pediatría
  'growth_tracking': {
    id: 'growth_tracking',
    name: 'Seguimiento de Crecimiento',
    description: 'Curvas de crecimiento y desarrollo pediátrico',
    icon: Baby,
    category: 'specialty',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'high',
    requiredFor: ['pediatrics', 'neonatology'],
    benefits: [
      'Curvas de crecimiento WHO/CDC',
      'Alertas de desarrollo',
      'Comparación con percentiles',
      'Predicción de crecimiento',
      'Reportes para padres'
    ],
    technicalSpecs: {
      integrations: ['WHO Growth Standards', 'CDC Growth Charts'],
      dataTypes: ['anthropometric', 'developmental_milestones'],
      realTime: false,
      aiPowered: true
    }
  },

  'vaccination_tracker': {
    id: 'vaccination_tracker',
    name: 'Control de Vacunas',
    description: 'Seguimiento completo del esquema de vacunación',
    icon: Shield,
    category: 'specialty',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'high',
    requiredFor: ['pediatrics', 'family_medicine'],
    benefits: [
      'Esquemas personalizados',
      'Recordatorios automáticos',
      'Certificados digitales',
      'Registro nacional',
      'Alertas de lotes'
    ],
    technicalSpecs: {
      integrations: ['National Immunization Registries', 'CDC VFC'],
      dataTypes: ['vaccines', 'schedules', 'contraindications'],
      realTime: true,
      aiPowered: false
    }
  },

  // Neurología
  'neurological_assessment': {
    id: 'neurological_assessment',
    name: 'Evaluación Neurológica',
    description: 'Herramientas especializadas para examen neurológico',
    icon: Brain,
    category: 'specialty',
    complexity: 'expert',
    isPremium: true,
    estimatedUsage: 'medium',
    requiredFor: ['neurology', 'neurosurgery'],
    benefits: [
      'Escalas neurológicas digitales',
      'Seguimiento de síntomas',
      'Análisis de imagen cerebral',
      'Predicción de deterioro',
      'Protocolos especializados'
    ],
    technicalSpecs: {
      integrations: ['Neuroimaging Software', 'EEG Systems'],
      dataTypes: ['neurological_scales', 'brain_images', 'eeg_data'],
      realTime: false,
      aiPowered: true
    }
  },

  // Dermatología
  'skin_lesion_analysis': {
    id: 'skin_lesion_analysis',
    name: 'Análisis de Lesiones',
    description: 'Evaluación dermatológica con IA para detección temprana',
    icon: Camera,
    category: 'specialty',
    complexity: 'expert',
    isPremium: true,
    estimatedUsage: 'medium',
    requiredFor: ['dermatology'],
    benefits: [
      'Detección temprana de melanoma',
      'Análisis comparativo',
      'Seguimiento fotográfico',
      'Clasificación automática',
      'Recomendaciones de biopsia'
    ],
    technicalSpecs: {
      integrations: ['Dermatology AI Models', 'Dermoscopy Devices'],
      dataTypes: ['skin_images', 'lesion_characteristics'],
      realTime: true,
      aiPowered: true
    }
  },

  // ============================================================================
  // FUNCIONES ADMINISTRATIVAS
  // ============================================================================

  'billing_integration': {
    id: 'billing_integration',
    name: 'Facturación Integrada',
    description: 'Sistema completo de facturación y gestión financiera',
    icon: FileText,
    category: 'core',
    complexity: 'advanced',
    isPremium: true,
    estimatedUsage: 'high',
    benefits: [
      'Facturación automática',
      'Códigos CPT/ICD-10',
      'Integración con seguros',
      'Reportes financieros',
      'Gestión de cobranzas'
    ],
    technicalSpecs: {
      integrations: ['Insurance APIs', 'Payment Processors', 'Accounting Software'],
      dataTypes: ['billing_codes', 'claims', 'payments'],
      realTime: true,
      aiPowered: false
    }
  },

  'inventory_management': {
    id: 'inventory_management',
    name: 'Gestión de Inventario',
    description: 'Control de medicamentos, suministros y equipos médicos',
    icon: Archive,
    category: 'advanced',
    complexity: 'intermediate',
    isPremium: false,
    estimatedUsage: 'medium',
    benefits: [
      'Control de stock',
      'Alertas de vencimiento',
      'Órdenes automáticas',
      'Trazabilidad completa',
      'Reportes de uso'
    ],
    technicalSpecs: {
      integrations: ['Supply Chain Systems', 'Barcode Scanners', 'RFID'],
      dataTypes: ['inventory_items', 'usage_patterns', 'expiration_dates'],
      realTime: true,
      aiPowered: true
    }
  },

  'compliance_monitoring': {
    id: 'compliance_monitoring',
    name: 'Monitoreo de Cumplimiento',
    description: 'Seguimiento automático de normativas y certificaciones',
    icon: Shield,
    category: 'advanced',
    complexity: 'advanced',
    isPremium: true,
    estimatedUsage: 'low',
    benefits: [
      'Auditorías automáticas',
      'Alertas de cumplimiento',
      'Documentación requerida',
      'Preparación para inspecciones',
      'Certificaciones continuas'
    ],
    technicalSpecs: {
      integrations: ['Regulatory Databases', 'Audit Systems'],
      dataTypes: ['compliance_metrics', 'audit_trails', 'certifications'],
      realTime: true,
      aiPowered: false
    }
  }
};

// ============================================================================
// CONFIGURACIONES POR ESPECIALIDAD
// ============================================================================

export const SPECIALTY_DASHBOARD_CONFIGS: Record<string, SpecialtyDashboardConfig> = {
  'general_medicine': {
    specialtyId: 'general_medicine',
    specialtyName: 'Medicina General',
    coreFeatures: [
      'patient_management',
      'appointment_scheduling', 
      'medical_records',
      'vital_signs_monitoring',
      'prescription_management',
      'secure_messaging'
    ],
    advancedFeatures: [
      'telemedicine',
      'lab_integration',
      'treatment_protocols',
      'medication_adherence',
      'vaccination_tracker',
      'clinical_analytics'
    ],
    premiumFeatures: [
      'ai_diagnosis_support',
      'emergency_consultation',
      'outcome_tracking',
      'billing_integration',
      'population_health'
    ],
    comingSoonFeatures: [
      'genomic_analysis',
      'predictive_health',
      'virtual_reality_therapy',
      'blockchain_records'
    ],
    workflowTemplates: [
      {
        id: 'routine_checkup',
        name: 'Chequeo de Rutina',
        description: 'Flujo completo para consulta preventiva',
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
    integrations: [
      'EMR Systems',
      'Laboratory Networks',
      'Pharmacy Systems',
      'Insurance Providers',
      'Telemedicine Platforms'
    ],
    aiFeatures: [
      'Diagnosis Support',
      'Drug Interaction Checking',
      'Clinical Decision Support',
      'Predictive Risk Assessment'
    ]
  },

  // Configuraciones simplificadas para otras especialidades
  'cardiology': {
    specialtyId: 'cardiology',
    specialtyName: 'Cardiología',
    coreFeatures: ['patient_management', 'medical_records', 'ecg_analysis'],
    advancedFeatures: ['cardiac_monitoring', 'telemedicine'],
    premiumFeatures: ['ai_diagnosis_support'],
    comingSoonFeatures: ['advanced_cardiac_ai'],
    workflowTemplates: [],
    integrations: ['Cardiac Monitors', 'ECG Devices'],
    aiFeatures: ['ECG Interpretation', 'Risk Stratification']
  },

  'pediatrics': {
    specialtyId: 'pediatrics',
    specialtyName: 'Pediatría',
    coreFeatures: ['patient_management', 'growth_tracking', 'vaccination_tracker'],
    advancedFeatures: ['telemedicine', 'medication_adherence'],
    premiumFeatures: ['ai_diagnosis_support'],
    comingSoonFeatures: ['developmental_assessment'],
    workflowTemplates: [],
    integrations: ['Pediatric Guidelines', 'Vaccination Registries'],
    aiFeatures: ['Growth Prediction', 'Developmental Screening']
  },

  'dermatology': {
    specialtyId: 'dermatology',
    specialtyName: 'Dermatología',
    coreFeatures: ['patient_management', 'medical_records', 'skin_lesion_analysis'],
    advancedFeatures: ['medical_imaging', 'telemedicine'],
    premiumFeatures: ['ai_diagnosis_support'],
    comingSoonFeatures: ['3d_skin_mapping'],
    workflowTemplates: [],
    integrations: ['Dermoscopy Devices', 'Image Analysis'],
    aiFeatures: ['Lesion Classification', 'Cancer Detection']
  },

  'neurology': {
    specialtyId: 'neurology',
    specialtyName: 'Neurología',
    coreFeatures: ['patient_management', 'medical_records', 'neurological_assessment'],
    advancedFeatures: ['medical_imaging', 'telemedicine'],
    premiumFeatures: ['ai_diagnosis_support'],
    comingSoonFeatures: ['brain_mapping'],
    workflowTemplates: [],
    integrations: ['Neuroimaging', 'EEG Systems'],
    aiFeatures: ['Neurological Scoring', 'Progression Prediction']
  }
};

// Función para obtener características por categoría
export function getFeaturesByCategory(category: DashboardFeature['category']): DashboardFeature[] {
  return Object.values(DASHBOARD_FEATURES).filter(feature => feature.category === category);
}

// Función para obtener configuración de especialidad
export function getSpecialtyConfig(specialtyId: string): SpecialtyDashboardConfig | null {
  return SPECIALTY_DASHBOARD_CONFIGS[specialtyId] || null;
}

// Función para verificar si una característica está disponible para una especialidad
export function isFeatureAvailableForSpecialty(featureId: string, specialtyId: string): boolean {
  const config = getSpecialtyConfig(specialtyId);
  if (!config) return false;
  
  return [
    ...config.coreFeatures,
    ...config.advancedFeatures,
    ...config.premiumFeatures
  ].includes(featureId);
}

// Función para obtener precio estimado (simulado)
export function getFeaturePricing(featureId: string): { monthly: number; annual: number } | null {
  const feature = DASHBOARD_FEATURES[featureId];
  if (!feature) return null;
  
  const basePrices = {
    'core': { monthly: 0, annual: 0 },
    'advanced': { monthly: 29, annual: 299 },
    'premium': { monthly: 99, annual: 999 },
    'specialty': { monthly: 199, annual: 1999 }
  };
  
  return basePrices[feature.category];
}
