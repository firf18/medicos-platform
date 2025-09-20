/**
 * Dashboard domain database types
 * @fileoverview Database types specific to dashboard and analytics data
 * @compliance HIPAA-compliant dashboard data structures
 */

// Dashboard tables are typically derived from other domains
// This file contains view-specific types and aggregated data structures

export interface DashboardTables {
  // Currently no specific dashboard tables in the database
  // Dashboard data is typically aggregated from other domains
}

// Dashboard-specific aggregated types
export interface DoctorDashboardStats {
  total_patients: number;
  appointments_today: number;
  pending_appointments: number;
  completed_appointments_this_week: number;
  average_rating: number;
  pending_lab_results: number;
  urgent_notifications: number;
  revenue_this_month: number;
}

export interface PatientDashboardStats {
  upcoming_appointments: number;
  pending_lab_results: number;
  active_medications: number;
  health_plan_completion: number;
  unread_notifications: number;
  overdue_tasks: number;
  recent_vital_signs: {
    blood_pressure?: string;
    heart_rate?: number;
    weight?: number;
    temperature?: number;
    last_recorded: string;
  };
}

export interface ClinicDashboardStats {
  total_doctors: number;
  total_patients: number;
  appointments_today: number;
  revenue_today: number;
  revenue_this_month: number;
  patient_satisfaction_avg: number;
  most_booked_services: {
    service_name: string;
    booking_count: number;
  }[];
  busiest_hours: {
    hour: number;
    appointment_count: number;
  }[];
}

export interface LaboratoryDashboardStats {
  pending_tests: number;
  completed_tests_today: number;
  critical_results_pending: number;
  average_turnaround_time: number;
  test_volume_by_type: {
    test_type: string;
    count: number;
  }[];
  revenue_this_month: number;
}

// Dashboard widget types
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'calendar' | 'alert';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  data_source: string;
  refresh_interval: number;
  permissions: string[];
  config: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  user_id: string;
  role: string;
  name: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics types
export interface AppointmentAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_rate: number;
  average_duration: number;
  peak_hours: number[];
  specialty_breakdown: {
    specialty: string;
    count: number;
    percentage: number;
  }[];
}

export interface PatientAnalytics {
  total_patients: number;
  new_patients_this_period: number;
  age_distribution: {
    age_range: string;
    count: number;
    percentage: number;
  }[];
  gender_distribution: {
    gender: string;
    count: number;
    percentage: number;
  }[];
  most_common_conditions: {
    condition: string;
    count: number;
  }[];
}

export interface RevenueAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  total_revenue: number;
  revenue_by_service: {
    service: string;
    revenue: number;
    count: number;
  }[];
  revenue_trend: {
    date: string;
    amount: number;
  }[];
  payment_methods: {
    method: string;
    amount: number;
    percentage: number;
  }[];
}
