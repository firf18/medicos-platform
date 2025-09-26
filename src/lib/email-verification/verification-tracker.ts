/**
 * Email Verification Tracker
 * @fileoverview Sistema robusto para rastrear verificaciones de email reales
 */

interface EmailVerificationRecord {
  email: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationTimestamp: number | null;
  verificationMethod: 'code' | 'manual' | null;
  attempts: number;
  lastAttemptTimestamp: number | null;
}

class EmailVerificationTracker {
  private static instance: EmailVerificationTracker;
  private verifications: Map<string, EmailVerificationRecord> = new Map();
  private readonly VERIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 minutos
  private readonly STORAGE_KEY = 'email_verification_tracker';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos para sesión completa

  private constructor() {
    this.loadFromStorage();
    this.setupStorageCleanup();
  }

  public static getInstance(): EmailVerificationTracker {
    if (!EmailVerificationTracker.instance) {
      EmailVerificationTracker.instance = new EmailVerificationTracker();
    }
    return EmailVerificationTracker.instance;
  }

  /**
   * Iniciar proceso de verificación
   */
  public startVerification(email: string): void {
    console.log('🔐 [VERIFICATION-TRACKER] Iniciando verificación para:', email);
    
    this.verifications.set(email, {
      email,
      isVerified: false,
      verificationCode: null,
      verificationTimestamp: null,
      verificationMethod: null,
      attempts: 0,
      lastAttemptTimestamp: null
    });
  }

  /**
   * Registrar intento de verificación
   */
  public recordVerificationAttempt(email: string, code: string): void {
    const record = this.verifications.get(email);
    if (!record) {
      console.error('❌ [VERIFICATION-TRACKER] No hay registro de verificación para:', email);
      return;
    }

    record.attempts++;
    record.lastAttemptTimestamp = Date.now();
    record.verificationCode = code;

    console.log('🔐 [VERIFICATION-TRACKER] Intento de verificación registrado:', {
      email,
      attempts: record.attempts,
      code: code.substring(0, 2) + '***'
    });
  }

  /**
   * Marcar como verificado SOLO después de verificación exitosa
   */
  public markAsVerified(email: string, method: 'code' | 'manual' = 'code'): void {
    const record = this.verifications.get(email);
    if (!record) {
      console.error('❌ [VERIFICATION-TRACKER] No hay registro de verificación para:', email);
      return;
    }

    record.isVerified = true;
    record.verificationTimestamp = Date.now();
    record.verificationMethod = method;

    // Guardar en storage inmediatamente
    this.saveToStorage();

    console.log('✅ [VERIFICATION-TRACKER] Email marcado como verificado:', {
      email,
      method,
      attempts: record.attempts,
      timestamp: new Date(record.verificationTimestamp).toISOString()
    });
  }

  /**
   * Verificar si el email está realmente verificado
   */
  public isEmailVerified(email: string): boolean {
    const record = this.verifications.get(email);
    if (!record) {
      console.log('❌ [VERIFICATION-TRACKER] No hay registro de verificación para:', email);
      return false;
    }

    // Verificar que la verificación no haya expirado
    if (record.verificationTimestamp) {
      const timeSinceVerification = Date.now() - record.verificationTimestamp;
      if (timeSinceVerification > this.VERIFICATION_TIMEOUT) {
        console.log('⏰ [VERIFICATION-TRACKER] Verificación expirada para:', email);
        record.isVerified = false;
        record.verificationTimestamp = null;
        record.verificationMethod = null;
        return false;
      }
    }

    const isVerified = record.isVerified && record.verificationMethod === 'code';
    
    console.log('🔍 [VERIFICATION-TRACKER] Verificación consultada:', {
      email,
      isVerified,
      method: record.verificationMethod,
      attempts: record.attempts,
      hasTimestamp: !!record.verificationTimestamp
    });

    return isVerified;
  }

  /**
   * Obtener información de verificación
   */
  public getVerificationInfo(email: string): EmailVerificationRecord | null {
    return this.verifications.get(email) || null;
  }

  /**
   * Limpiar verificaciones expiradas
   */
  public cleanupExpiredVerifications(): void {
    const now = Date.now();
    for (const [email, record] of this.verifications.entries()) {
      if (record.verificationTimestamp && (now - record.verificationTimestamp) > this.VERIFICATION_TIMEOUT) {
        console.log('🧹 [VERIFICATION-TRACKER] Limpiando verificación expirada:', email);
        this.verifications.delete(email);
      }
    }
  }

  /**
   * Resetear verificación para un email
   */
  public resetVerification(email: string): void {
    console.log('🔄 [VERIFICATION-TRACKER] Reseteando verificación para:', email);
    this.verifications.delete(email);
  }

  /**
   * Obtener estadísticas de verificación
   */
  public getStats(): { total: number; verified: number; pending: number } {
    const total = this.verifications.size;
    const verified = Array.from(this.verifications.values()).filter(r => r.isVerified).length;
    const pending = total - verified;

    return { total, verified, pending };
  }

  /**
   * Cargar verificaciones desde localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        // Solo cargar verificaciones que no hayan expirado
        for (const [email, record] of Object.entries(data.verifications)) {
          const verificationRecord = record as EmailVerificationRecord;
          
          // Verificar si la verificación sigue siendo válida
          if (verificationRecord.verificationTimestamp) {
            const timeSinceVerification = now - verificationRecord.verificationTimestamp;
            if (timeSinceVerification < this.SESSION_TIMEOUT) {
              this.verifications.set(email, verificationRecord);
              console.log('🔄 [VERIFICATION-TRACKER] Verificación restaurada desde storage:', email);
            }
          }
        }

        console.log('📦 [VERIFICATION-TRACKER] Verificaciones cargadas desde storage:', this.verifications.size);
      }
    } catch (error) {
      console.error('❌ [VERIFICATION-TRACKER] Error cargando desde storage:', error);
    }
  }

  /**
   * Guardar verificaciones en localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        verifications: Object.fromEntries(this.verifications),
        lastSaved: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('💾 [VERIFICATION-TRACKER] Verificaciones guardadas en storage');
    } catch (error) {
      console.error('❌ [VERIFICATION-TRACKER] Error guardando en storage:', error);
    }
  }

  /**
   * Configurar limpieza automática de storage
   */
  private setupStorageCleanup(): void {
    if (typeof window === 'undefined') return;

    // Limpiar storage al cerrar la pestaña
    window.addEventListener('beforeunload', () => {
      this.cleanupExpiredVerifications();
      this.saveToStorage();
    });

    // Limpiar storage periódicamente
    setInterval(() => {
      this.cleanupExpiredVerifications();
      this.saveToStorage();
    }, 60000); // Cada minuto
  }

  /**
   * Verificar si hay una sesión activa para un email
   */
  public hasActiveSession(email: string): boolean {
    const record = this.verifications.get(email);
    if (!record) return false;

    if (record.verificationTimestamp) {
      const timeSinceVerification = Date.now() - record.verificationTimestamp;
      return timeSinceVerification < this.SESSION_TIMEOUT && record.isVerified;
    }

    return false;
  }

  /**
   * Extender sesión de verificación
   */
  public extendSession(email: string): void {
    const record = this.verifications.get(email);
    if (record && record.isVerified) {
      record.verificationTimestamp = Date.now();
      this.saveToStorage();
      console.log('⏰ [VERIFICATION-TRACKER] Sesión extendida para:', email);
    }
  }

  /**
   * Limpiar todas las verificaciones (logout)
   */
  public clearAllVerifications(): void {
    this.verifications.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    console.log('🧹 [VERIFICATION-TRACKER] Todas las verificaciones limpiadas');
  }
}

export const emailVerificationTracker = EmailVerificationTracker.getInstance();
export type { EmailVerificationRecord };
