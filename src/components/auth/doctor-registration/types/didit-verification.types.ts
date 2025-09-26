/**
 * Didit Verification Types
 * @fileoverview Shared types for Didit verification components
 * @compliance HIPAA-compliant type definitions
 */

export interface VerificationState {
  status: 'idle' | 'initiating' | 'session_created' | 'user_verifying' | 'manual_verification' | 'processing' | 'completed' | 'failed' | 'expired';
  sessionId?: string;
  verificationUrl?: string;
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  pollingCount: number;
  diditStatus?: string;
  verificationResults?: any;
}

export interface DiditVerificationData {
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  phone: string;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  isVerified: boolean;
  doctorName?: string;
  licenseStatus?: string;
  profession?: string;
  specialty?: string;
  analysis?: any;
}

export interface DiditStatusResponse {
  status: string;
  session_id?: string;
  verification_url?: string;
  error?: string;
}
