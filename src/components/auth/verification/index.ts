/**
 * Verification Components Index - Red-Salud Platform
 * 
 * Exportaciones organizadas de componentes de verificación de identidad médica.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// Componente principal
export { default as IdentityVerificationStep } from './IdentityVerificationStep';

// Componentes especializados
export { VerificationStatusCard } from './VerificationStatusCard';
export { VerificationResultsCard } from './VerificationResultsCard';
export { VerificationActions } from './VerificationActions';
export { DiditInfoCard } from './DiditInfoCard';

// Tipos exportados
export type { VerificationStatus } from './VerificationStatusCard';

// Re-exportaciones para compatibilidad
export { IdentityVerificationStep as RefactoredIdentityVerificationStep };
