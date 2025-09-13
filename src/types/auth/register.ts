export type UserRole = 'patient' | 'doctor' | 'clinic' | 'laboratory' | 'admin';

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface RegisterResponse {
  success: boolean;
  error?: string;
  user?: any;
}