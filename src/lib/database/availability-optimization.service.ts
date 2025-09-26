/**
 * Availability Optimization Service
 * @fileoverview Service for optimizing availability queries and real-time updates
 * @compliance HIPAA-compliant availability optimization with real-time updates
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { PreparedStatementsService } from './prepared-statements.service';

/**
 * Availability status
 */
export interface AvailabilityStatus {
  doctorId: string;
  specialtyId: string;
  isAvailable: boolean;
  nextAvailableSlot?: string;
  currentAppointments: number;
  maxAppointments: number;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  lastUpdated: string;
}

/**
 * Doctor availability summary
 */
export interface DoctorAvailabilitySummary {
  doctorId: string;
  specialtyId: string;
  doctorName: string;
  specialtyName: string;
  isAvailable: boolean;
  rating: number;
  experienceYears: number;
  consultationFee: number;
  nextAvailableSlot?: string;
  availableSlotsToday: number;
  avatarUrl?: string;
}

/**
 * Availability query options
 */
interface AvailabilityQueryOptions {
  specialtyId?: string;
  date?: string;
  timeSlot?: string;
  limit?: number;
  offset?: number;
  includeUnavailable?: boolean;
  minRating?: number;
  maxFee?: number;
}

/**
 * Availability Optimization Service
 */
export class AvailabilityOptimizationService {
  private static client = createClient();
  private static availabilityCache = new Map<string, AvailabilityStatus>();
  private static cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Get optimized doctor availability by specialty
   */
  static async getDoctorAvailabilityBySpecialty(
    specialtyId: string,
    options: AvailabilityQueryOptions = {}
  ): Promise<DoctorAvailabilitySummary[]> {
    const startTime = Date.now();
    
    try {
      const {
        date = new Date().toISOString().split('T')[0],
        timeSlot,
        limit = 20,
        offset = 0,
        includeUnavailable = false,
        minRating = 0,
        maxFee
      } = options;

      // Check cache first
      const cacheKey = `availability_${specialtyId}_${date}_${timeSlot || 'all'}_${limit}_${offset}`;
      const cached = this.getCachedAvailability(cacheKey);
      if (cached) {
        return cached;
      }

      // Build optimized query
      let query = this.client
        .from('doctors')
        .select(`
          id,
          specialty_id,
          rating,
          experience_years,
          consultation_fee,
          is_available,
          profiles!inner(
            first_name,
            last_name,
            avatar_url
          ),
          medical_specialties!inner(
            name,
            description
          )
        `)
        .eq('specialty_id', specialtyId)
        .eq('is_verified', true)
        .gte('rating', minRating);

      if (!includeUnavailable) {
        query = query.eq('is_available', true);
      }

      if (maxFee) {
        query = query.lte('consultation_fee', maxFee);
      }

      query = query
        .order('rating', { ascending: false })
        .order('experience_years', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: doctors, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch doctors: ${error.message}`);
      }

      // Get availability data for each doctor
      const availabilityPromises = doctors.map(doctor => 
        this.getDoctorAvailabilityDetails(doctor.id, date, timeSlot)
      );

      const availabilityData = await Promise.all(availabilityPromises);

      // Combine doctor data with availability
      const results: DoctorAvailabilitySummary[] = doctors.map((doctor, index) => {
        const availability = availabilityData[index];
        
        return {
          doctorId: doctor.id,
          specialtyId: doctor.specialty_id,
          doctorName: `${doctor.profiles.first_name} ${doctor.profiles.last_name}`,
          specialtyName: doctor.medical_specialties.name,
          isAvailable: availability.isAvailable,
          rating: doctor.rating,
          experienceYears: doctor.experience_years,
          consultationFee: doctor.consultation_fee,
          nextAvailableSlot: availability.nextAvailableSlot,
          availableSlotsToday: availability.currentAppointments < availability.maxAppointments 
            ? availability.maxAppointments - availability.currentAppointments 
            : 0,
          avatarUrl: doctor.profiles.avatar_url
        };
      });

      // Cache results
      this.setCachedAvailability(cacheKey, results);

      // Log performance metrics
      await logSecurityEvent(
        'data_access',
        'availability_query_optimized',
        {
          specialtyId,
          date,
          timeSlot,
          resultsCount: results.length,
          executionTime: Date.now() - startTime,
          fromCache: false
        },
        'info'
      );

      return results;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'availability_query_error',
        {
          specialtyId,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Get detailed availability for a specific doctor
   */
  static async getDoctorAvailabilityDetails(
    doctorId: string,
    date: string,
    timeSlot?: string
  ): Promise<AvailabilityStatus> {
    try {
      // Check cache first
      const cacheKey = `doctor_availability_${doctorId}_${date}`;
      const cached = this.availabilityCache.get(cacheKey);
      if (cached && Date.now() - new Date(cached.lastUpdated).getTime() < this.cacheExpiry) {
        return cached;
      }

      // Get doctor's working hours
      const { data: doctorConfig } = await this.client
        .from('doctor_dashboard_configs')
        .select('working_hours')
        .eq('doctor_id', doctorId)
        .single();

      // Get appointments for the date
      const { data: appointments } = await this.client
        .from('appointments')
        .select('appointment_date, duration_minutes')
        .eq('doctor_id', doctorId)
        .eq('status', 'scheduled')
        .gte('appointment_date', `${date}T00:00:00`)
        .lt('appointment_date', `${date}T23:59:59`);

      // Calculate availability
      const workingHours = doctorConfig?.working_hours || this.getDefaultWorkingHours();
      const currentAppointments = appointments?.length || 0;
      const maxAppointments = this.calculateMaxAppointments(workingHours);
      const isAvailable = currentAppointments < maxAppointments;

      // Find next available slot
      const nextAvailableSlot = isAvailable 
        ? this.findNextAvailableSlot(workingHours, appointments || [], timeSlot)
        : undefined;

      const availability: AvailabilityStatus = {
        doctorId,
        specialtyId: '', // Will be filled by caller
        isAvailable,
        nextAvailableSlot,
        currentAppointments,
        maxAppointments,
        workingHours: {
          start: workingHours.monday?.startTime || '09:00',
          end: workingHours.monday?.endTime || '17:00',
          days: this.getWorkingDays(workingHours)
        },
        lastUpdated: new Date().toISOString()
      };

      // Cache result
      this.availabilityCache.set(cacheKey, availability);

      return availability;

    } catch (error) {
      // Return default availability on error
      return {
        doctorId,
        specialtyId: '',
        isAvailable: false,
        currentAppointments: 0,
        maxAppointments: 0,
        workingHours: {
          start: '09:00',
          end: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get real-time availability updates
   */
  static async getRealTimeAvailabilityUpdates(
    doctorIds: string[]
  ): Promise<Map<string, AvailabilityStatus>> {
    const updates = new Map<string, AvailabilityStatus>();
    
    try {
      const promises = doctorIds.map(async (doctorId) => {
        const availability = await this.getDoctorAvailabilityDetails(
          doctorId, 
          new Date().toISOString().split('T')[0]
        );
        updates.set(doctorId, availability);
      });

      await Promise.all(promises);

      await logSecurityEvent(
        'data_access',
        'realtime_availability_updated',
        {
          doctorIdsCount: doctorIds.length,
          updatedCount: updates.size
        },
        'info'
      );

      return updates;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'realtime_availability_error',
        {
          doctorIdsCount: doctorIds.length,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Optimize appointment scheduling queries
   */
  static async getOptimizedAppointmentSlots(
    doctorId: string,
    date: string,
    duration: number = 30
  ): Promise<Array<{ time: string; available: boolean; reason?: string }>> {
    try {
      const availability = await this.getDoctorAvailabilityDetails(doctorId, date);
      
      if (!availability.isAvailable) {
        return [];
      }

      const slots = this.generateTimeSlots(
        availability.workingHours.start,
        availability.workingHours.end,
        duration
      );

      // Get existing appointments
      const { data: appointments } = await this.client
        .from('appointments')
        .select('appointment_date, duration_minutes')
        .eq('doctor_id', doctorId)
        .eq('status', 'scheduled')
        .gte('appointment_date', `${date}T00:00:00`)
        .lt('appointment_date', `${date}T23:59:59`);

      // Check availability for each slot
      const availableSlots = slots.map(slot => {
        const slotTime = `${date}T${slot}`;
        const isBooked = appointments?.some(apt => {
          const aptTime = new Date(apt.appointment_date);
          const slotTimeDate = new Date(slotTime);
          const diffMinutes = Math.abs(aptTime.getTime() - slotTimeDate.getTime()) / (1000 * 60);
          return diffMinutes < (apt.duration_minutes || 30);
        });

        return {
          time: slot,
          available: !isBooked,
          reason: isBooked ? 'Already booked' : undefined
        };
      });

      return availableSlots;

    } catch (error) {
      await logSecurityEvent(
        'data_access',
        'appointment_slots_error',
        {
          doctorId,
          date,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      return [];
    }
  }

  /**
   * Clear availability cache
   */
  static clearAvailabilityCache(doctorId?: string): void {
    if (doctorId) {
      // Clear specific doctor's cache
      for (const key of this.availabilityCache.keys()) {
        if (key.includes(doctorId)) {
          this.availabilityCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.availabilityCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let expiredEntries = 0;

    for (const [key, value] of this.availabilityCache.entries()) {
      if (now - new Date(value.lastUpdated).getTime() > this.cacheExpiry) {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.availabilityCache.size,
      expiredEntries,
      memoryUsage: JSON.stringify(Array.from(this.availabilityCache.values())).length
    };
  }

  // Helper methods

  private static getCachedAvailability(key: string): DoctorAvailabilitySummary[] | null {
    const cached = this.availabilityCache.get(key);
    if (cached && Date.now() - new Date(cached.lastUpdated).getTime() < this.cacheExpiry) {
      return cached as any;
    }
    return null;
  }

  private static setCachedAvailability(key: string, data: DoctorAvailabilitySummary[]): void {
    this.availabilityCache.set(key, {
      doctorId: '',
      specialtyId: '',
      isAvailable: false,
      currentAppointments: 0,
      maxAppointments: 0,
      workingHours: { start: '', end: '', days: [] },
      lastUpdated: new Date().toISOString(),
      ...data
    } as any);
  }

  private static getDefaultWorkingHours(): any {
    return {
      monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isWorkingDay: false },
      sunday: { isWorkingDay: false }
    };
  }

  private static calculateMaxAppointments(workingHours: any): number {
    let totalHours = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      if (workingHours[day]?.isWorkingDay) {
        const start = new Date(`2000-01-01T${workingHours[day].startTime}`);
        const end = new Date(`2000-01-01T${workingHours[day].endTime}`);
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
    }

    return Math.floor(totalHours * 2); // Assuming 30-minute slots
  }

  private static getWorkingDays(workingHours: any): string[] {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.filter(day => workingHours[day]?.isWorkingDay);
  }

  private static findNextAvailableSlot(
    workingHours: any,
    appointments: any[],
    preferredTimeSlot?: string
  ): string | undefined {
    // Simplified implementation - in production, this would be more sophisticated
    const today = new Date();
    const currentHour = today.getHours();
    
    if (preferredTimeSlot) {
      return preferredTimeSlot;
    }

    // Find next available hour
    for (let hour = currentHour + 1; hour < 18; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = appointments.some(apt => {
        const aptTime = new Date(apt.appointment_date);
        return aptTime.getHours() === hour;
      });

      if (!isBooked) {
        return timeSlot;
      }
    }

    return undefined;
  }

  private static generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      slots.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + duration);
    }
    
    return slots;
  }
}
