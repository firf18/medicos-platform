import { Appointment } from '@/types/database/appointments';
import { Notification } from '@/types/database/notifications';
import { Patient } from '@/types/database/patients';
import { Doctor } from '@/types/database/doctors';

export interface ClinicDashboardData {
  doctors: Doctor[];
  appointments: Appointment[];
  patients: Patient[];
  notifications: Notification[];
}

export interface ClinicStats {
  activeDoctors: number;
  todayAppointments: number;
  totalPatients: number;
  unreadNotifications: number;
}