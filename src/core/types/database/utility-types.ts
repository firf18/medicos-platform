/**
 * Tipos de Utilidad para Base de Datos
 * 
 * Contiene tipos auxiliares, helpers y utilidades para
 * trabajar con los tipos de la base de datos de manera más eficiente.
 */

import type { Database } from './base-types';

// Tipos auxiliares para trabajar con la base de datos
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type { DatabaseWithoutInternals, DefaultSchema };

// Tipo genérico para obtener el Row de cualquier tabla
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

// Tipo genérico para obtener el Insert de cualquier tabla
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

// Tipo genérico para obtener el Update de cualquier tabla
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Tipo genérico para Enums
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

// Tipo genérico para CompositeTypes
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Tipos de conveniencia para tablas específicas
export type AppointmentRow = Tables<'appointments'>
export type AppointmentInsert = TablesInsert<'appointments'>
export type AppointmentUpdate = TablesUpdate<'appointments'>

export type PatientRow = Tables<'patients'>
export type PatientInsert = TablesInsert<'patients'>
export type PatientUpdate = TablesUpdate<'patients'>

export type DoctorRow = Tables<'doctors'>
export type DoctorInsert = TablesInsert<'doctors'>
export type DoctorUpdate = TablesUpdate<'doctors'>

export type ProfileRow = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type MedicalRecordRow = Tables<'medical_records'>
export type MedicalRecordInsert = TablesInsert<'medical_records'>
export type MedicalRecordUpdate = TablesUpdate<'medical_records'>

export type MedicalDocumentRow = Tables<'medical_documents'>
export type MedicalDocumentInsert = TablesInsert<'medical_documents'>
export type MedicalDocumentUpdate = TablesUpdate<'medical_documents'>

export type NotificationRow = Tables<'notifications'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationUpdate = TablesUpdate<'notifications'>

export type LabResultRow = Tables<'lab_results'>
export type LabResultInsert = TablesInsert<'lab_results'>
export type LabResultUpdate = TablesUpdate<'lab_results'>

export type SpecialtyRow = Tables<'specialties'>
export type SpecialtyInsert = TablesInsert<'specialties'>
export type SpecialtyUpdate = TablesUpdate<'specialties'>

// Tipos para relaciones comunes
export interface PatientWithProfile extends PatientRow {
  profile: ProfileRow
}

export interface DoctorWithProfile extends DoctorRow {
  profile: ProfileRow
  specialty: SpecialtyRow
}

export interface AppointmentWithDetails extends AppointmentRow {
  patient: PatientWithProfile
  doctor: DoctorWithProfile
  clinic?: Tables<'clinics'>
}

export interface MedicalRecordWithDetails extends MedicalRecordRow {
  patient: PatientRow
  doctor: DoctorRow
  appointment?: AppointmentRow
}

export interface LabResultWithDetails extends LabResultRow {
  patient: PatientRow
  doctor?: DoctorRow
  laboratory?: Tables<'laboratories'>
  service?: Tables<'laboratory_services'>
}

// Tipos para consultas complejas
export interface PatientDashboardData {
  patient: PatientWithProfile
  recentAppointments: AppointmentWithDetails[]
  activeMedications: Tables<'patient_medications'>[]
  recentLabResults: LabResultWithDetails[]
  unreadNotifications: NotificationRow[]
  emergencyInfo: Tables<'emergency_medical_info'>
}

export interface DoctorDashboardData {
  doctor: DoctorWithProfile
  todayAppointments: AppointmentWithDetails[]
  recentPatients: PatientWithProfile[]
  pendingLabResults: LabResultWithDetails[]
  unreadNotifications: Tables<'doctor_notifications'>[]
  clinicAffiliations: Tables<'clinic_doctors'>[]
}

// Tipos para filtros y búsquedas
export interface SearchFilters {
  query?: string
  dateFrom?: string
  dateTo?: string
  status?: string[]
  type?: string[]
  priority?: string[]
  limit?: number
  offset?: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Tipos para operaciones CRUD
export interface DatabaseOperation<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface BulkOperation<T = any> {
  success: boolean
  successCount: number
  failureCount: number
  results: DatabaseOperation<T>[]
  errors: string[]
}

// Tipos para auditoría
export interface AuditLog {
  id: string
  table_name: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: Json | null
  new_values: Json | null
  user_id: string | null
  timestamp: string
  ip_address: string | null
  user_agent: string | null
}

// Tipos para configuración de RLS
export interface RLSPolicy {
  table_name: string
  policy_name: string
  policy_type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  roles: string[]
  using_expression: string
  with_check_expression?: string
  is_enabled: boolean
}