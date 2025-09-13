// Utilidades para manejar roles de usuario

export type UserRole = 'admin' | 'doctor' | 'patient' | 'clinic' | 'laboratory';

export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  patient: 'Paciente',
  clinic: 'Clínica',
  laboratory: 'Laboratorio',
};

export const hasPermission = (
  userRole: UserRole | null | undefined,
  requiredRoles: UserRole[]
): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

export const canAccessPatientDashboard = (role: UserRole | null | undefined): boolean => {
  return hasPermission(role, ['patient', 'admin']);
};

export const canAccessDoctorDashboard = (role: UserRole | null | undefined): boolean => {
  return hasPermission(role, ['doctor', 'admin']);
};

export const canAccessClinicDashboard = (role: UserRole | null | undefined): boolean => {
  return hasPermission(role, ['clinic', 'admin']);
};

export const canAccessLaboratoryDashboard = (role: UserRole | null | undefined): boolean => {
  return hasPermission(role, ['laboratory', 'admin']);
};

export const getRoleDisplayName = (role: UserRole): string => {
  return USER_ROLES[role] || role;
};