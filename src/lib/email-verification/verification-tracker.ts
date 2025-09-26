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

  private constructor() {}

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
}

export const emailVerificationTracker = EmailVerificationTracker.getInstance();
export type { EmailVerificationRecord };
