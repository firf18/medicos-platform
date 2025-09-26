import { createClient } from './client'
import { Database } from '@/types/supabase'

type ClinicRegistration = Database['public']['Tables']['clinic_registrations']['Row']
type ClinicRegistrationInsert = Database['public']['Tables']['clinic_registrations']['Insert']
type Clinic = Database['public']['Tables']['clinics']['Row']

export class ClinicService {
  private supabase = createClient()

  /**
   * Registra una nueva clínica
   */
  async registerClinic(data: Omit<ClinicRegistrationInsert, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Verificar si ya existe una clínica con el mismo email o RIF
      const { data: existingClinic } = await this.supabase
        .from('clinic_registrations')
        .select('email, rif')
        .or(`email.eq.${data.email},rif.eq.${data.rif}`)
        .maybeSingle()

      if (existingClinic) {
        if (existingClinic.email === data.email) {
          throw new Error('Ya existe una clínica registrada con este email')
        }
        if (existingClinic.rif === data.rif) {
          throw new Error('Ya existe una clínica registrada con este RIF')
        }
      }

      // Crear el registro
      const { data: registration, error } = await this.supabase
        .from('clinic_registrations')
        .insert([{
          ...data,
          registration_step: 'completed',
          status: 'pending',
          verification_status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      return { success: true, data: registration }
    } catch (error) {
      console.error('Error registering clinic:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Obtiene el estado de un registro de clínica
   */
  async getRegistrationStatus(registrationId: string) {
    try {
      const { data, error } = await this.supabase
        .from('clinic_registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching registration status:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Actualiza el estado de un registro de clínica
   */
  async updateRegistrationStatus(
    registrationId: string, 
    status: 'pending' | 'under_review' | 'approved' | 'rejected',
    verificationStatus?: 'pending' | 'verified' | 'failed'
  ) {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      if (verificationStatus) {
        updateData.verification_status = verificationStatus
      }

      const { data, error } = await this.supabase
        .from('clinic_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating registration status:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Aprueba un registro y crea la clínica oficial
   */
  async approveRegistration(registrationId: string) {
    try {
      // Obtener los datos del registro
      const { data: registration, error: fetchError } = await this.supabase
        .from('clinic_registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (fetchError) throw fetchError

      // Crear la clínica oficial
      const clinicData = {
        name: registration.clinic_name,
        legal_name: registration.legal_name,
        email: registration.email,
        phone: registration.phone,
        address: registration.address,
        city: registration.city,
        state: registration.state,
        rif: registration.rif,
        clinic_type: registration.clinic_type,
        description: registration.description,
        emergency_contact_name: registration.emergency_contact_name,
        emergency_contact_phone: registration.emergency_contact_phone,
        status: 'approved' as const,
        verification_status: 'verified' as const,
        is_active: true,
        verified_at: new Date().toISOString(),
        activated_at: new Date().toISOString()
      }

      const { data: clinic, error: clinicError } = await this.supabase
        .from('clinics')
        .insert([clinicData])
        .select()
        .single()

      if (clinicError) throw clinicError

      // Actualizar el estado del registro
      await this.updateRegistrationStatus(registrationId, 'approved', 'verified')

      return { success: true, data: clinic }
    } catch (error) {
      console.error('Error approving registration:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Obtiene todas las clínicas registradas
   */
  async getClinics(filters?: {
    status?: string
    city?: string
    state?: string
    clinic_type?: string
  }) {
    try {
      let query = this.supabase.from('clinics').select('*')

      if (filters) {
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.city) query = query.eq('city', filters.city)
        if (filters.state) query = query.eq('state', filters.state)
        if (filters.clinic_type) query = query.eq('clinic_type', filters.clinic_type)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching clinics:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Obtiene una clínica por ID
   */
  async getClinicById(clinicId: string) {
    try {
      const { data, error } = await this.supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching clinic:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Busca clínicas por nombre o ubicación
   */
  async searchClinics(searchTerm: string) {
    try {
      const { data, error } = await this.supabase
        .from('clinics')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error searching clinics:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}

// Exportar una instancia singleton
export const clinicService = new ClinicService()
