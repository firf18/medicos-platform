export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          address: string
          city: string
          state: string
          country: string
          phone: string
          email: string
          website: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          address?: string
          city?: string
          state?: string
          country?: string
          phone?: string
          email?: string
          website?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          state?: string
          country?: string
          phone?: string
          email?: string
          website?: string
          created_at?: string
          updated_at?: string
        }
      }
      laboratories: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          address: string
          city: string
          state: string
          country: string
          phone: string
          email: string
          website: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          address?: string
          city?: string
          state?: string
          country?: string
          phone?: string
          email?: string
          website?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          state?: string
          country?: string
          phone?: string
          email?: string
          website?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']
  
export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']
  
export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']