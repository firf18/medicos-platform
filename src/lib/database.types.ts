export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          clinic_id: number | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: number
          notes: string | null
          patient_id: string
          prescription: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          clinic_id?: number | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: number
          notes?: string | null
          patient_id: string
          prescription?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          clinic_id?: number | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: number
          notes?: string | null
          patient_id?: string
          prescription?: string | null
          status?: string
          updated_at?: string
        }
      }
      clinics: {
        Row: {
          address: string
          city: string
          country: string | null
          created_at: string
          email: string | null
          id: number
          name: string
          phone: string | null
          state: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name: string
          phone?: string | null
          state: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
          state?: string
          updated_at?: string
        }
      }
      clinic_doctors: {
        Row: {
          clinic_id: string | null
          created_at: string
          doctor_id: string | null
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          bio: string | null
          consultation_fee: number | null
          created_at: string
          experience_years: number | null
          id: string
          is_available: boolean | null
          license_number: string
          rating: number | null
          specialty_id: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          id: string
          is_available?: boolean | null
          license_number: string
          rating?: number | null
          specialty_id: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string
          rating?: number | null
          specialty_id?: number
          updated_at?: string
        }
      }
      lab_results: {
        Row: {
          created_at: string
          doctor_id: string | null
          id: string
          is_critical: boolean | null
          laboratory_id: string | null
          patient_id: string | null
          performed_at: string | null
          result: string | null
          result_file_url: string | null
          service_id: string | null
          test_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          is_critical?: boolean | null
          laboratory_id?: string | null
          patient_id?: string | null
          performed_at?: string | null
          result?: string | null
          result_file_url?: string | null
          service_id?: string | null
          test_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          is_critical?: boolean | null
          laboratory_id?: string | null
          patient_id?: string | null
          performed_at?: string | null
          result?: string | null
          result_file_url?: string | null
          service_id?: string | null
          test_name?: string
          updated_at?: string
        }
      }
      laboratory_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          laboratory_id: string | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          laboratory_id?: string | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          laboratory_id?: string | null
          name?: string
          price?: number | null
          updated_at?: string
        }
      }
      laboratories: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
      }
      medical_records: {
        Row: {
          appointment_id: number | null
          created_at: string
          diagnosis: string
          doctor_id: string
          id: number
          notes: string | null
          patient_id: string
          treatment: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: number | null
          created_at?: string
          diagnosis: string
          doctor_id: string
          id?: number
          notes?: string | null
          patient_id: string
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: number | null
          created_at?: string
          diagnosis?: string
          doctor_id?: string
          id?: number
          notes?: string | null
          patient_id?: string
          treatment?: string | null
          updated_at?: string
        }
      }
      medical_documents: {
        Row: {
          created_at: string
          description: string | null
          doctor_id: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_critical: boolean | null
          patient_id: string
          shared_with_caregivers: boolean | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_critical?: boolean | null
          patient_id: string
          shared_with_caregivers?: boolean | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_critical?: boolean | null
          patient_id?: string
          shared_with_caregivers?: boolean | null
          tags?: string[] | null
          title?: string
        }
      }
      notifications: {
        Row: {
          channels: string[] | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          patient_id: string
          priority: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          channels?: string[] | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          patient_id: string
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          channels?: string[] | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          patient_id?: string
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
        }
      }
      patient_caregivers: {
        Row: {
          access_level: string
          caregiver_email: string
          caregiver_name: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_emergency_contact: boolean | null
          patient_id: string
          permissions: Json | null
          relationship: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          caregiver_email: string
          caregiver_name: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_emergency_contact?: boolean | null
          patient_id: string
          permissions?: Json | null
          relationship: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          caregiver_email?: string
          caregiver_name?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_emergency_contact?: boolean | null
          patient_id?: string
          permissions?: Json | null
          relationship?: string
          updated_at?: string
        }
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          patient_id: string
          phone: string
          priority: number | null
          relationship: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          patient_id: string
          phone: string
          priority?: number | null
          relationship: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          patient_id?: string
          phone?: string
          priority?: number | null
          relationship?: string
        }
      }
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
      patient_medications: {
        Row: {
          adherence_score: number | null
          created_at: string
          doctor_id: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean | null
          medication_name: string
          patient_id: string
          side_effects_reported: string[] | null
          start_date: string
          updated_at: string
        }
        Insert: {
          adherence_score?: number | null
          created_at?: string
          doctor_id?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          medication_name: string
          patient_id: string
          side_effects_reported?: string[] | null
          start_date: string
          updated_at?: string
        }
        Update: {
          adherence_score?: number | null
          created_at?: string
          doctor_id?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          medication_name?: string
          patient_id?: string
          side_effects_reported?: string[] | null
          start_date?: string
          updated_at?: string
        }
      }
      second_opinion_requests: {
        Row: {
          case_description: string
          case_title: string
          created_at: string
          current_diagnosis: string | null
          current_treatment: string | null
          id: string
          original_doctor_id: string | null
          patient_id: string
          requested_at: string
          responded_at: string | null
          specialist_id: string | null
          specialist_recommendations: string | null
          specialist_response: string | null
          specific_questions: string | null
          status: string | null
          urgency_level: string | null
        }
        Insert: {
          case_description: string
          case_title: string
          created_at?: string
          current_diagnosis?: string | null
          current_treatment?: string | null
          id?: string
          original_doctor_id?: string | null
          patient_id: string
          requested_at?: string
          responded_at?: string | null
          specialist_id?: string | null
          specialist_recommendations?: string | null
          specialist_response?: string | null
          specific_questions?: string | null
          status?: string | null
          urgency_level?: string | null
        }
        Update: {
          case_description?: string
          case_title?: string
          created_at?: string
          current_diagnosis?: string | null
          current_treatment?: string | null
          id?: string
          original_doctor_id?: string | null
          patient_id?: string
          requested_at?: string
          responded_at?: string | null
          specialist_id?: string | null
          specialist_recommendations?: string | null
          specialist_response?: string | null
          specific_questions?: string | null
          status?: string | null
          urgency_level?: string | null
        }
      }
      patients: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
      }
      specialties: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_clinic: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_doctor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_laboratory: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_patient: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

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