/**
 * Auth Components Index - Red-Salud Platform
 * 
 * Exportaciones organizadas de componentes de autenticación por dominio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// Componentes compartidos
export { BaseRegistrationForm } from './shared/BaseRegistrationForm';
export { RoleSelector } from './shared/RoleSelector';
export { PersonalInfoFields } from './shared/PersonalInfoFields';
export { FormNavigationButtons } from './shared/FormNavigationButtons';

// Componentes específicos de pacientes
export { PatientRegistrationForm } from './patient/PatientRegistrationForm';
export { PatientHealthFields } from './patient/PatientHealthFields';

// Componente principal (refactorizado)
export { default as RegisterForm } from './RegisterForm';

// Tipos exportados
export type { UserRole } from './shared/RoleSelector';
export type { PersonalInfoData } from './shared/PersonalInfoFields';
export type { PatientHealthData } from './patient/PatientHealthFields';

// Re-exportaciones para compatibilidad hacia atrás
export { default as LegacyRegisterForm } from './RegisterForm';
