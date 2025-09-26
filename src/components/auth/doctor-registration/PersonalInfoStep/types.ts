// Tipos para el componente PersonalInfoStep

// Resultado de validación de email
export interface EmailValidationResult {
  isValid: boolean;
  isAvailable: boolean | null;
}

// Resultado de validación de contraseña
export interface PasswordValidationResult {
  isValid: boolean;
  strength: {
    score: number;
    isValid: boolean;
    errors: string[];
  };
}

// Tipos de campo de formulario
export type FormField = 'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirmPassword';

// Datos del formulario
export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Props del componente PersonalInfoStep
export interface PersonalInfoStepProps {
  onStepComplete: (data: any) => void;
  onStepError: (error: string) => void;
  formData: any;
  updateData: (data: any) => void;
  formErrors?: {
    hasErrors: boolean;
    getFieldError: (field: string) => string | undefined;
    setFieldError: (field: string, error: string) => void;
    clearFieldError: (field: string) => void;
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => JSX.Element | null;
  };
  onValidationChange?: (isValid: boolean) => void;
}