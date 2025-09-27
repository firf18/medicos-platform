/**
 * Session Timeout Manager
 * @fileoverview Manages session timeouts for registration flow
 * @compliance HIPAA-compliant session timeout management
 */

export class SessionTimeoutManager {
  private static instance: SessionTimeoutManager;
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas
  private onTimeoutCallback: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): SessionTimeoutManager {
    if (!SessionTimeoutManager.instance) {
      SessionTimeoutManager.instance = new SessionTimeoutManager();
    }
    return SessionTimeoutManager.instance;
  }

  public startTimeout(onTimeout: () => void): void {
    this.onTimeoutCallback = onTimeout;
    this.resetTimeout();
  }

  public resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
    }, this.SESSION_TIMEOUT);
  }

  public clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  public extendSession(): void {
    this.resetTimeout();
  }
}
