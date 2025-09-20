/**
 * Didit Verification Types
 * @fileoverview Types for Didit identity verification system
 * @compliance HIPAA-compliant identity verification data structures
 */

import type { VenezuelanDoctorData, DiditDecision } from '@/lib/didit-integration';

// Verification summary interface
export interface VerificationSummary {
  isFullyVerified: boolean;
  verificationScore: number;
  completedChecks: string[];
  failedChecks: string[];
  warnings: string[];
}

// Suspicious activity tracking
export interface SuspiciousActivity {
  type: 'multiple_attempts' | 'rapid_attempts' | 'failed_attempts' | 'suspicious_behavior';
  timestamp: Date;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high';
}

// Verification session state
export interface VerificationState {
  // Main status
  status: 'idle' | 'initiating' | 'session_created' | 'user_verifying' | 'processing' | 'completed' | 'failed' | 'expired';
  
  // Session data
  sessionId: string | null;
  sessionNumber: number | null;
  verificationUrl: string | null;
  
  // Results
  decision: DiditDecision | null;
  verificationSummary: VerificationSummary | null;
  
  // Error handling
  error: string | null;
  lastError: Error | null;
  retryCount: number;
  
  // Security monitoring
  suspiciousActivities: SuspiciousActivity[];
  
  // Progress tracking
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedTimeRemaining: number | null;
  
  // Configuration
  autoRetry: boolean;
  maxRetries: number;
}

// Hook options interface
export interface UseDiditVerificationOptions {
  // Callbacks
  onVerificationComplete?: (data: { 
    sessionId: string; 
    decision: DiditDecision; 
    summary: VerificationSummary 
  }) => void;
  onVerificationError?: (error: string, details?: unknown) => void;
  onStatusChange?: (status: VerificationState['status'], data?: any) => void;
  
  // Configuration
  autoRetry?: boolean;
  maxRetries?: number;
  customWorkflowId?: string;
  customCallbackUrl?: string;
  
  // Polling configuration
  enablePolling?: boolean;
  pollingInterval?: number;
  maxPollingTime?: number;
}

// Hook return interface
export interface UseDiditVerificationReturn {
  // State
  state: VerificationState;
  
  // Derived states for UI
  isIdle: boolean;
  isInitiating: boolean;
  isSessionCreated: boolean;
  isUserVerifying: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isExpired: boolean;
  hasError: boolean;
  
  // Actions
  startVerification: (doctorData: VenezuelanDoctorData) => Promise<void>;
  retryVerification: () => Promise<void>;
  cancelVerification: () => void;
  resetVerification: () => void;
  checkStatus: () => Promise<void>;
  
  // Utilities
  getStatusMessage: () => string;
  getProgressPercentage: () => number;
  getTimeElapsed: () => number | null;
  canRetry: () => boolean;
  
  // Security
  reportSuspiciousActivity: (activity: Omit<SuspiciousActivity, 'timestamp'>) => void;
  getSuspiciousActivities: () => SuspiciousActivity[];
  
  // Analytics
  getVerificationMetrics: () => VerificationMetrics;
}

// Verification metrics for analytics
export interface VerificationMetrics {
  sessionId: string | null;
  totalTime: number | null;
  retryCount: number;
  suspiciousActivityCount: number;
  verificationScore: number | null;
  completedChecksCount: number;
  failedChecksCount: number;
  status: VerificationState['status'];
}

// Verification step tracking
export interface VerificationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  error?: string;
  data?: Record<string, unknown>;
}

// Session configuration
export interface SessionConfig {
  workflowId: string;
  callbackUrl: string;
  expirationTime: number;
  allowedRetries: number;
  securityLevel: 'standard' | 'high' | 'maximum';
}

// Verification result details
export interface VerificationResult {
  sessionId: string;
  decision: DiditDecision;
  summary: VerificationSummary;
  steps: VerificationStep[];
  metadata: {
    startTime: Date;
    endTime: Date;
    totalDuration: number;
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  };
  securityFlags: string[];
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
}

// Error types
export type VerificationErrorType = 
  | 'network_error'
  | 'session_expired'
  | 'user_cancelled'
  | 'invalid_data'
  | 'server_error'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'compliance_violation'
  | 'unknown_error';

export interface VerificationError {
  type: VerificationErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  sessionId?: string;
  recoverable: boolean;
  retryAfter?: number;
}

// Constants
export const VERIFICATION_STATUS = {
  IDLE: 'idle',
  INITIATING: 'initiating',
  SESSION_CREATED: 'session_created',
  USER_VERIFYING: 'user_verifying',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
} as const;

export const SUSPICIOUS_ACTIVITY_TYPES = {
  MULTIPLE_ATTEMPTS: 'multiple_attempts',
  RAPID_ATTEMPTS: 'rapid_attempts',
  FAILED_ATTEMPTS: 'failed_attempts',
  SUSPICIOUS_BEHAVIOR: 'suspicious_behavior'
} as const;

export const SECURITY_LEVELS = {
  STANDARD: 'standard',
  HIGH: 'high',
  MAXIMUM: 'maximum'
} as const;

export const DEFAULT_CONFIG = {
  MAX_RETRIES: 3,
  POLLING_INTERVAL: 2000,
  MAX_POLLING_TIME: 300000, // 5 minutes
  SESSION_TIMEOUT: 1800000, // 30 minutes
  SUSPICIOUS_ACTIVITY_THRESHOLD: 5
} as const;
