export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  user?: any;
}