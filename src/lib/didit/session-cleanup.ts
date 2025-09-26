/**
 * 🧹 DIDIT SESSION CLEANUP - Platform Médicos Elite
 * 
 * Utilidades para limpiar sesiones expiradas y evitar polling infinito
 * Basado en documentación oficial de Didit
 */

import { logger } from '@/lib/logging/logger';

export interface SessionCleanupOptions {
  maxAge?: number; // Tiempo máximo en ms (default: 30 minutos)
  checkInterval?: number; // Intervalo de verificación en ms (default: 5 minutos)
  enableAutoCleanup?: boolean; // Habilitar limpieza automática
}

export class DiditSessionCleanup {
  private activeSessions: Map<string, { createdAt: Date; lastChecked: Date }> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private options: Required<SessionCleanupOptions>;

  constructor(options: SessionCleanupOptions = {}) {
    this.options = {
      maxAge: options.maxAge || 30 * 60 * 1000, // 30 minutos
      checkInterval: options.checkInterval || 5 * 60 * 1000, // 5 minutos
      enableAutoCleanup: options.enableAutoCleanup ?? true
    };

    if (this.options.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Registra una sesión activa
   */
  registerSession(sessionId: string): void {
    this.activeSessions.set(sessionId, {
      createdAt: new Date(),
      lastChecked: new Date()
    });

    logger.info('session-cleanup', 'Sesión registrada para limpieza', {
      sessionId,
      totalSessions: this.activeSessions.size,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Actualiza el último check de una sesión
   */
  updateLastChecked(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastChecked = new Date();
    }
  }

  /**
   * Remueve una sesión del tracking
   */
  removeSession(sessionId: string): void {
    const removed = this.activeSessions.delete(sessionId);
    
    if (removed) {
      logger.info('session-cleanup', 'Sesión removida del tracking', {
        sessionId,
        remainingSessions: this.activeSessions.size,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Verifica si una sesión está expirada
   */
  isSessionExpired(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return true; // Si no está en tracking, considerarla expirada
    }

    const now = new Date();
    const age = now.getTime() - session.createdAt.getTime();
    
    return age > this.options.maxAge;
  }

  /**
   * Obtiene sesiones expiradas
   */
  getExpiredSessions(): string[] {
    const expired: string[] = [];
    const now = new Date();

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const age = now.getTime() - session.createdAt.getTime();
      if (age > this.options.maxAge) {
        expired.push(sessionId);
      }
    }

    return expired;
  }

  /**
   * Limpia sesiones expiradas
   */
  cleanupExpiredSessions(): number {
    const expiredSessions = this.getExpiredSessions();
    
    for (const sessionId of expiredSessions) {
      this.removeSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      logger.info('session-cleanup', 'Sesiones expiradas limpiadas', {
        expiredCount: expiredSessions.length,
        remainingSessions: this.activeSessions.size,
        expiredSessions,
        timestamp: new Date().toISOString()
      });
    }

    return expiredSessions.length;
  }

  /**
   * Inicia la limpieza automática
   */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.options.checkInterval);

    logger.info('session-cleanup', 'Limpieza automática iniciada', {
      checkInterval: this.options.checkInterval,
      maxAge: this.options.maxAge,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Detiene la limpieza automática
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      
      logger.info('session-cleanup', 'Limpieza automática detenida', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  getStats(): {
    totalSessions: number;
    expiredSessions: number;
    activeSessions: number;
    oldestSession?: Date;
    newestSession?: Date;
  } {
    const expiredSessions = this.getExpiredSessions();
    const activeSessions = Array.from(this.activeSessions.values());
    
    let oldestSession: Date | undefined;
    let newestSession: Date | undefined;

    if (activeSessions.length > 0) {
      const dates = activeSessions.map(s => s.createdAt);
      oldestSession = new Date(Math.min(...dates.map(d => d.getTime())));
      newestSession = new Date(Math.max(...dates.map(d => d.getTime())));
    }

    return {
      totalSessions: this.activeSessions.size,
      expiredSessions: expiredSessions.length,
      activeSessions: this.activeSessions.size - expiredSessions.length,
      oldestSession,
      newestSession
    };
  }

  /**
   * Limpia todas las sesiones
   */
  clearAllSessions(): void {
    const count = this.activeSessions.size;
    this.activeSessions.clear();
    
    logger.info('session-cleanup', 'Todas las sesiones limpiadas', {
      clearedCount: count,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Destruye el cleanup manager
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.clearAllSessions();
    
    logger.info('session-cleanup', 'Session cleanup manager destruido', {
      timestamp: new Date().toISOString()
    });
  }
}

// Instancia singleton para uso global
export const sessionCleanup = new DiditSessionCleanup({
  maxAge: 30 * 60 * 1000, // 30 minutos
  checkInterval: 5 * 60 * 1000, // 5 minutos
  enableAutoCleanup: true
});

// Utilidades de conveniencia
export const registerDiditSession = (sessionId: string) => {
  sessionCleanup.registerSession(sessionId);
};

export const updateDiditSessionCheck = (sessionId: string) => {
  sessionCleanup.updateLastChecked(sessionId);
};

export const removeDiditSession = (sessionId: string) => {
  sessionCleanup.removeSession(sessionId);
};

export const isDiditSessionExpired = (sessionId: string): boolean => {
  return sessionCleanup.isSessionExpired(sessionId);
};

export const getDiditSessionStats = () => {
  return sessionCleanup.getStats();
};

export default sessionCleanup;
