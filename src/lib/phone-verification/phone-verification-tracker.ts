/**
 * Phone Verification Tracker
 * @fileoverview Sistema robusto para rastrear verificaciones de teléfono reales
 */

interface PhoneVerificationRecord {
  phone: string;
  isVerified: boolean;
  verificationTimestamp: number | null;
  verificationMethod: 'auto' | 'manual' | null;
  attempts: number;
  lastAttemptTimestamp: number | null;
}

class PhoneVerificationTracker {
  private static instance: PhoneVerificationTracker;
  private verifications: Map<string, PhoneVerificationRecord> = new Map();
  private readonly VERIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 minutos
  private readonly STORAGE_KEY = 'phone_verification_tracker';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos para sesión completa

  private constructor() {
    this.loadFromStorage();
    this.setupStorageCleanup();
  }

  public static getInstance(): PhoneVerificationTracker {
    if (!PhoneVerificationTracker.instance) {
      PhoneVerificationTracker.instance = new PhoneVerificationTracker();
    }
    return PhoneVerificationTracker.instance;
  }

  /**
   * Iniciar proceso de verificación
   */
  public startVerification(phone: string): void {
    console.log('📱 [PHONE-TRACKER] Iniciando verificación para:', phone);
    
    this.verifications.set(phone, {
      phone,
      isVerified: false,
      verificationTimestamp: null,
      verificationMethod: null,
      attempts: 0,
      lastAttemptTimestamp: null
    });
    
    console.log('📱 [PHONE-TRACKER] Registro creado para:', phone, 'Total registros:', this.verifications.size);
  }

  /**
   * Marcar como verificado SOLO después de verificación exitosa
   */
  public markAsVerified(phone: string, method: 'auto' | 'manual' = 'auto'): void {
    console.log('🔍 [PHONE-TRACKER] Intentando marcar como verificado:', phone, 'Método:', method);
    console.log('🔍 [PHONE-TRACKER] Registros actuales:', Array.from(this.verifications.keys()));
    
    const record = this.verifications.get(phone);
    if (!record) {
      console.error('❌ [PHONE-TRACKER] No hay registro de verificación para:', phone);
      console.error('❌ [PHONE-TRACKER] Registros disponibles:', Array.from(this.verifications.keys()));
      return;
    }

    record.isVerified = true;
    record.verificationTimestamp = Date.now();
    record.verificationMethod = method;

    // Guardar en storage inmediatamente
    this.saveToStorage();

    console.log('✅ [PHONE-TRACKER] Teléfono marcado como verificado:', {
      phone,
      method,
      attempts: record.attempts,
      timestamp: new Date(record.verificationTimestamp).toISOString(),
      isVerified: record.isVerified,
      verificationMethod: record.verificationMethod
    });
  }

  /**
   * Verificar si el teléfono está realmente verificado
   */
  public isPhoneVerified(phone: string): boolean {
    console.log('🔍 [PHONE-TRACKER] Consultando verificación para:', phone);
    console.log('🔍 [PHONE-TRACKER] Registros actuales:', Array.from(this.verifications.keys()));
    
    const record = this.verifications.get(phone);
    if (!record) {
      console.log('❌ [PHONE-TRACKER] No hay registro de verificación para:', phone);
      console.log('❌ [PHONE-TRACKER] Registros disponibles:', Array.from(this.verifications.keys()));
      return false;
    }

    // Verificar que la verificación no haya expirado
    if (record.verificationTimestamp) {
      const timeSinceVerification = Date.now() - record.verificationTimestamp;
      if (timeSinceVerification > this.SESSION_TIMEOUT) {
        console.log('⏰ [PHONE-TRACKER] Verificación expirada para:', phone);
        record.isVerified = false;
        record.verificationTimestamp = null;
        record.verificationMethod = null;
        return false;
      }
    }

    const isVerified = record.isVerified && record.verificationMethod === 'auto';
    
    console.log('🔍 [PHONE-TRACKER] Verificación consultada:', {
      phone,
      isVerified,
      method: record.verificationMethod,
      attempts: record.attempts,
      hasTimestamp: !!record.verificationTimestamp,
      recordIsVerified: record.isVerified,
      recordMethod: record.verificationMethod
    });

    return isVerified;
  }

  /**
   * Verificar si hay una sesión activa para un teléfono
   */
  public hasActiveSession(phone: string): boolean {
    const record = this.verifications.get(phone);
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
  public extendSession(phone: string): void {
    const record = this.verifications.get(phone);
    if (record && record.isVerified) {
      record.verificationTimestamp = Date.now();
      this.saveToStorage();
      console.log('⏰ [PHONE-TRACKER] Sesión extendida para:', phone);
    }
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
        for (const [phone, record] of Object.entries(data.verifications)) {
          const verificationRecord = record as PhoneVerificationRecord;
          
          // Verificar si la verificación sigue siendo válida
          if (verificationRecord.verificationTimestamp) {
            const timeSinceVerification = now - verificationRecord.verificationTimestamp;
            if (timeSinceVerification < this.SESSION_TIMEOUT) {
              this.verifications.set(phone, verificationRecord);
              console.log('🔄 [PHONE-TRACKER] Verificación restaurada desde storage:', phone);
            }
          }
        }

        console.log('📦 [PHONE-TRACKER] Verificaciones cargadas desde storage:', this.verifications.size);
      }
    } catch (error) {
      console.error('❌ [PHONE-TRACKER] Error cargando desde storage:', error);
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
      console.log('💾 [PHONE-TRACKER] Verificaciones guardadas en storage');
    } catch (error) {
      console.error('❌ [PHONE-TRACKER] Error guardando en storage:', error);
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
   * Limpiar verificaciones expiradas
   */
  public cleanupExpiredVerifications(): void {
    const now = Date.now();
    for (const [phone, record] of this.verifications.entries()) {
      if (record.verificationTimestamp && (now - record.verificationTimestamp) > this.SESSION_TIMEOUT) {
        console.log('🧹 [PHONE-TRACKER] Limpiando verificación expirada:', phone);
        this.verifications.delete(phone);
      }
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
    console.log('🧹 [PHONE-TRACKER] Todas las verificaciones limpiadas');
  }
}

export const phoneVerificationTracker = PhoneVerificationTracker.getInstance();
export type { PhoneVerificationRecord };
