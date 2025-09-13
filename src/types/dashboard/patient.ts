import { Appointment } from '@/types/database/appointments';
import { MedicalRecord } from '@/types/database/medical-records';
import { Notification } from '@/types/database/notifications';
import { LabResult } from '@/types/database/lab-results';

export interface PatientDashboardData {
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  medications: any[]; // TODO: Crear tipo específico para medicamentos
  notifications: Notification[];
  results: LabResult[]; // Agregado para resultados de laboratorio
}

export interface PatientStats {
  upcomingAppointments: number;
  pendingResults: number;
  activeMedications: number;
  unreadNotifications: number;
}