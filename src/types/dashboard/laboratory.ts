import { Notification } from '@/types/database/notifications';
import { LabResult } from '@/types/database/lab-results';
import { LaboratoryService } from '@/types/database/laboratory-services';

export interface LaboratoryDashboardData {
  tests: LaboratoryService[];
  results: LabResult[];
  pendingRequests: LaboratoryService[]; // Solicitudes pendientes de servicios
  notifications: Notification[];
}

export interface LaboratoryStats {
  pendingTests: number;
  completedToday: number;
  unreadNotifications: number;
  totalRequests: number;
}