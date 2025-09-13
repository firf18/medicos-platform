import { Appointment } from '@/types/database/appointments';
import { MedicalRecord } from '@/types/database/medical-records';
import { Notification } from '@/types/database/notifications';
import { Patient } from '@/types/database/patients';

export interface DoctorDashboardData {
  appointments: Appointment[];
  patients: Patient[];
  medicalRecords: MedicalRecord[];
  notifications: Notification[];
}

export interface DoctorStats {
  todayAppointments: number;
  pendingRecords: number;
  unreadNotifications: number;
  totalPatients: number;
}