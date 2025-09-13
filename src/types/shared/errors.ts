export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationError {
  errors: FormError[];
}