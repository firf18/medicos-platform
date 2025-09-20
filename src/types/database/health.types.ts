/**
 * Health Database Types - Red-Salud Platform
 * 
 * Tipos de base de datos específicos para el dominio de métricas y planes de salud.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import type { Json } from './base.types';

export type HealthTables = {
  health_metrics: {
    Row: {
      additional_data: Json | null
      created_at: string
      id: string
      metric_type: string
      notes: string | null
      patient_id: string
      recorded_at: string
      source: string | null
      unit: string
      value: number
    }
    Insert: {
      additional_data?: Json | null
      created_at?: string
      id?: string
      metric_type: string
      notes?: string | null
      patient_id: string
      recorded_at?: string
      source?: string | null
      unit: string
      value: number
    }
    Update: {
      additional_data?: Json | null
      created_at?: string
      id?: string
      metric_type?: string
      notes?: string | null
      patient_id?: string
      recorded_at?: string
      source?: string | null
      unit?: string
      value?: number
    }
  }
  health_plans: {
    Row: {
      created_at: string
      description: string | null
      doctor_id: string | null
      end_date: string | null
      id: string
      milestones: Json | null
      patient_id: string
      plan_type: string
      start_date: string
      status: string | null
      title: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      doctor_id?: string | null
      end_date?: string | null
      id?: string
      milestones?: Json | null
      patient_id: string
      plan_type: string
      start_date: string
      status?: string | null
      title: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      description?: string | null
      doctor_id?: string | null
      end_date?: string | null
      id?: string
      milestones?: Json | null
      patient_id?: string
      plan_type?: string
      start_date?: string
      status?: string | null
      title?: string
      updated_at?: string
    }
  }
  health_plan_tasks: {
    Row: {
      completed_at: string | null
      created_at: string
      description: string | null
      due_date: string | null
      health_plan_id: string
      id: string
      is_completed: boolean | null
      notes: string | null
      task_type: string
      title: string
      target_value: Json | null
    }
    Insert: {
      completed_at?: string | null
      created_at?: string
      description?: string | null
      due_date?: string | null
      health_plan_id: string
      id?: string
      is_completed?: boolean | null
      notes?: string | null
      task_type: string
      title: string
      target_value?: Json | null
    }
    Update: {
      completed_at?: string | null
      created_at?: string
      description?: string | null
      due_date?: string | null
      health_plan_id?: string
      id?: string
      is_completed?: boolean | null
      notes?: string | null
      task_type?: string
      title?: string
      target_value?: Json | null
    }
  }
}

// Tipos específicos para el dominio de health
export type HealthMetricRow = HealthTables['health_metrics']['Row'];
export type HealthMetricInsert = HealthTables['health_metrics']['Insert'];
export type HealthMetricUpdate = HealthTables['health_metrics']['Update'];

export type HealthPlanRow = HealthTables['health_plans']['Row'];
export type HealthPlanInsert = HealthTables['health_plans']['Insert'];
export type HealthPlanUpdate = HealthTables['health_plans']['Update'];

export type HealthPlanTaskRow = HealthTables['health_plan_tasks']['Row'];
export type HealthPlanTaskInsert = HealthTables['health_plan_tasks']['Insert'];
export type HealthPlanTaskUpdate = HealthTables['health_plan_tasks']['Update'];

// Tipos de métricas de salud
export type HealthMetricType = 
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'heart_rate'
  | 'body_temperature'
  | 'weight'
  | 'height'
  | 'bmi'
  | 'blood_glucose'
  | 'cholesterol_total'
  | 'cholesterol_hdl'
  | 'cholesterol_ldl'
  | 'triglycerides'
  | 'oxygen_saturation'
  | 'steps'
  | 'sleep_hours'
  | 'calories_burned'
  | 'water_intake'
  | 'medication_adherence'
  | 'pain_level'
  | 'mood_score'
  | 'energy_level'
  | 'stress_level'
  | 'custom';

// Fuentes de datos de métricas de salud
export type HealthMetricSource = 
  | 'manual_entry'
  | 'wearable_device'
  | 'smart_scale'
  | 'blood_pressure_monitor'
  | 'glucometer'
  | 'fitness_tracker'
  | 'smartphone_app'
  | 'medical_device'
  | 'clinic_measurement'
  | 'lab_result'
  | 'doctor_assessment';

// Tipos de planes de salud
export type HealthPlanType = 
  | 'weight_management'
  | 'diabetes_management'
  | 'hypertension_control'
  | 'cardiac_rehabilitation'
  | 'post_surgery_recovery'
  | 'chronic_disease_management'
  | 'wellness_maintenance'
  | 'preventive_care'
  | 'mental_health'
  | 'physical_therapy'
  | 'nutrition_plan'
  | 'exercise_program'
  | 'medication_management'
  | 'symptom_monitoring';

// Estados de planes de salud
export type HealthPlanStatus = 
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'under_review';

// Tipos de tareas en planes de salud
export type HealthPlanTaskType = 
  | 'medication'
  | 'exercise'
  | 'measurement'
  | 'appointment'
  | 'lab_test'
  | 'diet'
  | 'education'
  | 'monitoring'
  | 'lifestyle'
  | 'therapy'
  | 'follow_up'
  | 'assessment';

// Métrica de salud extendida con contexto
export interface HealthMetricWithContext extends HealthMetricRow {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
  };
  baseline?: {
    value: number;
    recordedAt: string;
  };
  trend?: {
    direction: 'improving' | 'stable' | 'declining';
    changePercent: number;
    periodDays: number;
  };
  ranges?: {
    normal: { min: number; max: number };
    optimal?: { min: number; max: number };
    warning?: { min: number; max: number };
    critical?: { min: number; max: number };
  };
}

// Plan de salud extendido con tareas
export interface HealthPlanWithTasks extends HealthPlanRow {
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tasks?: HealthPlanTaskRow[];
  progress?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  metrics?: HealthMetricRow[];
}

// Tarea de plan de salud extendida
export interface HealthPlanTaskWithDetails extends HealthPlanTaskRow {
  healthPlan?: {
    id: string;
    title: string;
    planType: HealthPlanType;
  };
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: string;
    completedInstances: number;
  };
  reminders?: Array<{
    time: string;
    method: 'notification' | 'email' | 'sms';
    enabled: boolean;
  }>;
}

// Resumen de salud del paciente
export interface PatientHealthSummary {
  patientId: string;
  currentMetrics: {
    [K in HealthMetricType]?: {
      value: number;
      unit: string;
      recordedAt: string;
      status: 'normal' | 'warning' | 'critical';
    };
  };
  activePlans: HealthPlanWithTasks[];
  recentActivity: Array<{
    date: string;
    type: 'metric' | 'task_completed' | 'plan_started' | 'goal_achieved';
    description: string;
    value?: number;
  }>;
  healthScore: {
    overall: number; // 0-100
    categories: {
      vitals: number;
      activity: number;
      nutrition: number;
      medication_adherence: number;
      mental_health: number;
    };
    trend: 'improving' | 'stable' | 'declining';
  };
  alerts: Array<{
    type: 'metric_abnormal' | 'task_overdue' | 'plan_expired' | 'goal_achieved';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    date: string;
  }>;
}

// Configuración de rangos normales por edad y género
export interface HealthMetricRanges {
  metricType: HealthMetricType;
  ranges: Array<{
    ageMin: number;
    ageMax: number;
    gender: 'male' | 'female' | 'all';
    normal: { min: number; max: number };
    optimal?: { min: number; max: number };
    warning?: { min: number; max: number };
    critical?: { min: number; max: number };
  }>;
  unit: string;
  notes?: string;
}

// Datos de tendencia de métricas de salud
export interface HealthMetricTrend {
  metricType: HealthMetricType;
  patientId: string;
  period: {
    start: string;
    end: string;
    intervalDays: number;
  };
  dataPoints: Array<{
    date: string;
    value: number;
    source: HealthMetricSource;
  }>;
  statistics: {
    average: number;
    min: number;
    max: number;
    trend: 'improving' | 'stable' | 'declining';
    variability: number;
    lastValue: number;
    changeFromBaseline: number;
  };
  annotations?: Array<{
    date: string;
    type: 'medication_change' | 'lifestyle_change' | 'illness' | 'treatment';
    description: string;
  }>;
}

// Objetivos de salud personalizados
export interface HealthGoal {
  id: string;
  patientId: string;
  doctorId?: string;
  title: string;
  description?: string;
  category: 'weight' | 'exercise' | 'nutrition' | 'medication' | 'vital_signs' | 'lifestyle' | 'custom';
  targetMetric: HealthMetricType;
  targetValue: number;
  targetDate: string;
  currentValue?: number;
  progress: number; // 0-100
  status: 'active' | 'achieved' | 'paused' | 'cancelled';
  milestones?: Array<{
    value: number;
    date: string;
    achieved: boolean;
    achievedAt?: string;
  }>;
  rewards?: Array<{
    threshold: number;
    description: string;
    earned: boolean;
    earnedAt?: string;
  }>;
}
