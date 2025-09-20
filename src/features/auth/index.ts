// Exportar componentes
export * from './components/login-form';
export * from './components/register-form';
export * from './components/forgot-password-form';
export * from './components/reset-password-form';
export * from './components/email-verification-form';
export * from './components/resend-verification-form';
export * from './components/auth-guard';
export * from './components/email-verification-banner';
export * from './components/auth-error-display';
export * from './components/auth-loading-state';
export * from './components/realtime-notifications';
export * from './components/realtime-appointments';
export * from './components/session-manager';
export * from './components/language-switcher';

// Exportar hooks
export * from './hooks/use-auth';
export * from './hooks/use-session';
export * from './hooks/use-session-recovery';
export * from './hooks/useAuthActions';
export * from './hooks/use-email-verification';
export * from './hooks/use-session-expiration';
export * from './hooks/use-protected-route';
export * from './hooks/use-realtime-subscription';
export * from './hooks/use-advanced-session';

// Exportar hooks refactorizados
export { useDoctorRegistration } from './hooks/useDoctorRegistration';

// Exportar servicios
export { DoctorRegistrationValidationService } from './services/doctor-registration-validation';
export { DoctorRegistrationApiService } from './services/doctor-registration-api';

// Exportar utilidades
export * from './utils/role-utils';
export { DoctorRegistrationLogger } from './utils/doctor-registration-logger';

// Exportar contextos
export * from './contexts/auth-context';

// Exportar esquemas
export * from './schemas/auth.schema';

// Exportar tipos refactorizados
export type {
  DoctorRegistrationData,
  RegistrationStep,
  RegistrationProgress,
  ValidationResult,
  ApiResponse,
  LogContext,
  UseDoctorRegistrationProps,
  UseDoctorRegistrationReturn,
  StepComponentProps,
  NavigationProps,
  ValidationService,
  ApiService,
  LoggingService,
  RegistrationConfig
} from './types/doctor-registration';

// Exportar constantes
export {
  REGISTRATION_STEPS,
  STEP_LABELS,
  STEP_DESCRIPTIONS
} from './types/doctor-registration';