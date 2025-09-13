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

// Exportar contextos
export * from './contexts/auth-context';

// Exportar utilidades
export * from './utils/role-utils';

// Exportar esquemas
export * from './schemas/auth.schema';