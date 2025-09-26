/**
 * Frontend Error Monitoring Service
 * @fileoverview Service for monitoring and reporting frontend errors
 * @compliance Error tracking with privacy compliance
 */

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  errorType: 'javascript' | 'network' | 'api' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class FrontendErrorMonitor {
  private static instance: FrontendErrorMonitor;
  private errorQueue: ErrorReport[] = [];
  private isOnline = true;
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    
    // Only setup error handlers on the client side
    if (typeof window !== 'undefined') {
      this.setupErrorHandlers();
      this.setupNetworkMonitoring();
    }
  }

  static getInstance(): FrontendErrorMonitor {
    if (!FrontendErrorMonitor.instance) {
      FrontendErrorMonitor.instance = new FrontendErrorMonitor();
    }
    return FrontendErrorMonitor.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers(): void {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        userId: this.userId,
        errorType: 'javascript',
        severity: this.determineSeverity(event.error),
        context: {
          filename: event.filename,
          type: event.type
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        userId: this.userId,
        errorType: 'javascript',
        severity: 'medium',
        context: {
          reason: event.reason,
          type: 'unhandledrejection'
        }
      });
    });
  }

  private setupNetworkMonitoring(): void {
    // Only setup network monitoring on the client side
    if (typeof window === 'undefined') return;
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        // Log failed requests
        if (!response.ok) {
          this.reportError({
            message: `API Request Failed: ${response.status} ${response.statusText}`,
            url: args[0]?.toString() || 'unknown',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
            userId: this.userId,
            errorType: 'api',
            severity: response.status >= 500 ? 'high' : 'medium',
            context: {
              status: response.status,
              statusText: response.statusText,
              duration,
              method: args[1]?.method || 'GET'
            }
          });
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.reportError({
          message: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          stack: error instanceof Error ? error.stack : undefined,
          url: args[0]?.toString() || 'unknown',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: this.sessionId,
          userId: this.userId,
          errorType: 'network',
          severity: 'high',
          context: {
            duration,
            method: args[1]?.method || 'GET'
          }
        });
        throw error;
      }
    };
  }

  private determineSeverity(error: Error | null): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('syntax') || message.includes('unexpected token')) {
      return 'critical';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'high';
    }
    
    if (message.includes('validation') || message.includes('form')) {
      return 'medium';
    }
    
    return 'low';
  }

  public reportError(errorReport: ErrorReport): void {
    // Add to queue
    this.errorQueue.push(errorReport);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Frontend Error:', errorReport);
    }
    
    // Send to server if online
    if (this.isOnline) {
      this.sendErrorsToServer();
    }
  }

  public reportApiError(endpoint: string, status: number, error: string): void {
    // Only report on client side
    if (typeof window === 'undefined') return;
    
    this.reportError({
      message: `API Error: ${error}`,
      url: endpoint,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.userId,
      errorType: 'api',
      severity: status >= 500 ? 'high' : 'medium',
      context: {
        endpoint,
        status,
        error
      }
    });
  }

  public reportValidationError(field: string, error: string): void {
    // Only report on client side
    if (typeof window === 'undefined') return;
    
    this.reportError({
      message: `Validation Error: ${error}`,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.userId,
      errorType: 'validation',
      severity: 'low',
      context: {
        field,
        error
      }
    });
  }

  private async sendErrorsToServer(): Promise<void> {
    if (this.errorQueue.length === 0) return;
    
    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      await fetch('/api/monitoring/frontend-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToSend,
          sessionId: this.sessionId,
          userId: this.userId
        })
      });
    } catch (error) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errorsToSend);
      console.error('Failed to send error reports to server:', error);
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getErrorCount(): number {
    return this.errorQueue.length;
  }

  public clearErrors(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const errorMonitor = FrontendErrorMonitor.getInstance();

// Export types
export type { ErrorReport };
