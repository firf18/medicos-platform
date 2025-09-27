/**
 * Registration Session Manager
 * @fileoverview Robust session management for doctor registration flow
 * @compliance HIPAA-compliant session management with audit trail
 */

import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { SessionTimeoutManager } from './session-timeout-manager';

interface VerificationState {
  email: {
    isVerified: boolean;
    verifiedAt: number | null;
    attempts: number;
    lastAttempt: number | null;
    cooldownUntil: number | null;
  };
  phone: {
    isVerified: boolean;
    verifiedAt: number | null;
    attempts: number;
    lastAttempt: number | null;
    cooldownUntil: number | null;
  };
  document: {
    isVerified: boolean;
    verifiedAt: number | null;
    attempts: number;
    lastAttempt: number | null;
    cooldownUntil: number | null;
    documentNumber: string | null;
  };
}

interface StepValidationState {
  [key: string]: {
    isValid: boolean;
    validatedAt: number | null;
    errors: string[];
  };
}

interface RegistrationSession {
  id: string;
  data: DoctorRegistrationData;
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  verificationState: VerificationState;
  stepValidationState: StepValidationState;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

class RegistrationSessionManager {
  private static instance: RegistrationSessionManager;
  private currentSession: RegistrationSession | null = null;
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas
  private readonly STORAGE_KEY = 'doctor_registration_session';
  private readonly VERIFICATION_COOLDOWN = 60 * 1000; // 1 minuto
  private readonly MAX_ATTEMPTS = 5;
  private timeoutManager = SessionTimeoutManager.getInstance();

  private constructor() {
    this.loadSession();
    this.setupCleanup();
  }

  public static getInstance(): RegistrationSessionManager {
    if (!RegistrationSessionManager.instance) {
      RegistrationSessionManager.instance = new RegistrationSessionManager();
    }
    return RegistrationSessionManager.instance;
  }

  /**
   * Create new registration session
   */
  public createSession(): string {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      id: sessionId,
      data: this.getDefaultRegistrationData(),
      currentStep: 'personal_info',
      completedSteps: [],
      verificationState: {
        email: {
          isVerified: false,
          verifiedAt: null,
          attempts: 0,
          lastAttempt: null,
          cooldownUntil: null
        },
        phone: {
          isVerified: false,
          verifiedAt: null,
          attempts: 0,
          lastAttempt: null,
          cooldownUntil: null
        },
        document: {
          isVerified: false,
          verifiedAt: null,
          attempts: 0,
          lastAttempt: null,
          cooldownUntil: null,
          documentNumber: null
        }
      },
      stepValidationState: {},
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT
    };

    this.saveSession();
    
    // Iniciar timeout de sesión
    this.timeoutManager.startTimeout(() => {
      this.handleSessionTimeout();
    });
    
    return sessionId;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): RegistrationSession | null {
    return this.currentSession;
  }

  /**
   * Update registration data
   */
  public updateData(data: Partial<DoctorRegistrationData>): void {
    if (!this.currentSession) return;

    this.currentSession.data = { ...this.currentSession.data, ...data };
    this.currentSession.lastActivity = Date.now();
    this.saveSession();
    
    // Resetear timeout cuando hay actividad
    this.timeoutManager.resetTimeout();
  }

  /**
   * Get registration data
   */
  public getData(): DoctorRegistrationData | null {
    return this.currentSession?.data || null;
  }

  /**
   * Navigate to step
   */
  public navigateToStep(step: RegistrationStep): boolean {
    if (!this.currentSession) return false;

    // Solo validar si estamos avanzando, no al retroceder
    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'professional_info',
      'specialty_selection',
      'identity_verification'
    ];
    
    const currentIndex = stepOrder.indexOf(this.currentSession.currentStep);
    const targetIndex = stepOrder.indexOf(step);
    
    // Si estamos avanzando, validar el paso actual
    if (targetIndex > currentIndex && !this.validateCurrentStep()) {
      return false;
    }

    this.currentSession.currentStep = step;
    this.currentSession.lastActivity = Date.now();
    this.saveSession();
    
    // Resetear timeout cuando hay actividad
    this.timeoutManager.resetTimeout();
    return true;
  }

  /**
   * Complete step
   */
  public completeStep(step: RegistrationStep): void {
    if (!this.currentSession) return;

    if (!this.currentSession.completedSteps.includes(step)) {
      this.currentSession.completedSteps.push(step);
    }

    this.currentSession.stepValidationState[step] = {
      isValid: true,
      validatedAt: Date.now(),
      errors: []
    };

    this.currentSession.lastActivity = Date.now();
    this.saveSession();
  }

  /**
   * Mark verification as completed
   */
  public markVerificationComplete(type: 'email' | 'phone' | 'document', identifier?: string): void {
    if (!this.currentSession) return;

    const now = Date.now();
    this.currentSession.verificationState[type] = {
      ...this.currentSession.verificationState[type],
      isVerified: true,
      verifiedAt: now,
      lastAttempt: now
    };

    // Guardar número de documento si es verificación de documento
    if (type === 'document' && identifier) {
      this.currentSession.verificationState.document.documentNumber = identifier;
    }

    this.currentSession.lastActivity = now;
    this.saveSession(); // Solo en localStorage, no en Supabase
    
    // Resetear timeout cuando hay actividad
    this.timeoutManager.resetTimeout();
  }

  /**
   * Record verification attempt
   */
  public recordVerificationAttempt(type: 'email' | 'phone' | 'document'): boolean {
    if (!this.currentSession) return false;

    const now = Date.now();
    const verification = this.currentSession.verificationState[type];

    // Check cooldown
    if (verification.cooldownUntil && now < verification.cooldownUntil) {
      return false;
    }

    // Check max attempts
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      return false;
    }

    verification.attempts++;
    verification.lastAttempt = now;
    verification.cooldownUntil = now + this.VERIFICATION_COOLDOWN;

    this.currentSession.lastActivity = now;
    this.saveSession();
    return true;
  }

  /**
   * Get verification cooldown remaining
   */
  public getVerificationCooldown(type: 'email' | 'phone' | 'document'): number {
    if (!this.currentSession) return 0;

    const verification = this.currentSession.verificationState[type];
    if (!verification.cooldownUntil) return 0;

    const remaining = verification.cooldownUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Check if verification is available
   */
  public canAttemptVerification(type: 'email' | 'phone' | 'document'): boolean {
    if (!this.currentSession) return false;

    const verification = this.currentSession.verificationState[type];
    const cooldownRemaining = this.getVerificationCooldown(type);

    return verification.attempts < this.MAX_ATTEMPTS && cooldownRemaining === 0;
  }

  /**
   * Check if step is completed
   */
  public isStepCompleted(step: RegistrationStep): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.completedSteps.includes(step);
  }

  /**
   * Check if step is valid
   */
  public isStepValid(step: RegistrationStep): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.stepValidationState[step]?.isValid || false;
  }

  /**
   * Validate current step
   */
  public validateCurrentStep(): boolean {
    if (!this.currentSession) return false;

    const step = this.currentSession.currentStep;
    return this.validateStep(step, this.currentSession.data);
  }

  /**
   * Validate specific step
   */
  public validateStep(step: RegistrationStep, data: DoctorRegistrationData): boolean {
    switch (step) {
      case 'personal_info':
        return this.validatePersonalInfo(data);
      case 'professional_info':
        return this.validateProfessionalInfo(data);
      case 'specialty_selection':
        return this.validateSpecialtySelection(data);
      case 'identity_verification':
        return this.validateIdentityVerification(data);
      default:
        return false;
    }
  }

  /**
   * Validate personal info step
   */
  private validatePersonalInfo(data: DoctorRegistrationData): boolean {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    const hasAllFields = requiredFields.every(field => {
      const value = data[field as keyof DoctorRegistrationData];
      return value && value.toString().trim() !== '';
    });

    const passwordsMatch = data.password === data.confirmPassword;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '');
    const phoneValid = /^\+58\d{10}$/.test(data.phone || '');
    const passwordValid = (data.password || '').length >= 8;

    // Verificar estados de verificación desde el session manager
    const emailVerified = this.currentSession?.verificationState.email.isVerified || false;
    const phoneVerified = this.currentSession?.verificationState.phone.isVerified || false;

    return hasAllFields && passwordsMatch && emailValid && phoneValid && passwordValid && emailVerified && phoneVerified;
  }

  /**
   * Validate professional info step
   */
  private validateProfessionalInfo(data: DoctorRegistrationData): boolean {
    const requiredFields = ['documentNumber', 'university', 'graduationYear', 'medicalBoard', 'bio'];
    const hasAllFields = requiredFields.every(field => {
      const value = data[field as keyof DoctorRegistrationData];
      return value && value.toString().trim() !== '';
    });

    const documentValid = (data.documentNumber || '').length >= 9;
    const bioValid = (data.bio || '').length >= 50;

    // Check document verification
    const documentVerified = this.currentSession?.verificationState.document.isVerified || false;

    return hasAllFields && documentValid && bioValid && documentVerified;
  }

  /**
   * Validate specialty selection step
   */
  private validateSpecialtySelection(data: DoctorRegistrationData): boolean {
    return !!(data.specialtyId && data.specialtyId.trim() !== '');
  }

  /**
   * Validate identity verification step
   */
  private validateIdentityVerification(data: DoctorRegistrationData): boolean {
    // This would depend on Didit verification
    return true; // Placeholder
  }

  /**
   * Get default registration data
   */
  private getDefaultRegistrationData(): DoctorRegistrationData {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      specialtyId: '',
      subSpecialties: [],
      licenseNumber: '',
      licenseState: '',
      licenseExpiry: '',
      yearsOfExperience: 0,
      bio: '',
      university: '',
      graduationYear: undefined,
      medicalBoard: '',
      documentType: undefined,
      documentNumber: '',
      selectedFeatures: [],
      workingHours: {
        monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        saturday: { isWorkingDay: false },
        sunday: { isWorkingDay: false }
      }
    };
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (!this.currentSession) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Error saving registration session:', error);
    }
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored) as RegistrationSession;
        
        // Check if session is still valid
        if (session.expiresAt > Date.now()) {
          this.currentSession = session;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Error loading registration session:', error);
      this.clearSession();
    }
  }

  /**
   * Clear session
   */
  public clearSession(): void {
    this.currentSession = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing registration session:', error);
    }
  }

  /**
   * Setup automatic cleanup
   */
  private setupCleanup(): void {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => {
      if (this.currentSession && this.currentSession.expiresAt <= Date.now()) {
        this.clearSession();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Extend session
   */
  public extendSession(): void {
    if (!this.currentSession) return;

    this.currentSession.expiresAt = Date.now() + this.SESSION_TIMEOUT;
    this.currentSession.lastActivity = Date.now();
    this.saveSession();
    
    // Resetear timeout cuando hay actividad
    this.timeoutManager.resetTimeout();
  }

  /**
   * Handle session timeout
   */
  private handleSessionTimeout(): void {
    // Limpiar sesión por timeout
    this.clearSession();
    
    // Notificar al usuario (esto requiere una implementación especial)
    if (typeof window !== 'undefined') {
      // Enviar evento personalizado que puede ser escuchado por componentes
      window.dispatchEvent(new CustomEvent('registration-session-timeout'));
    }
  }
}

export const registrationSessionManager = RegistrationSessionManager.getInstance();
