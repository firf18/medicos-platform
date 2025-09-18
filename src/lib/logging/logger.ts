/**
 * Sistema de Logging Avanzado - Red-Salud
 * 
 * Este módulo proporciona funcionalidades avanzadas de logging para el sistema,
 * incluyendo diferentes niveles de severidad, categorías y persistencia.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'auth' | 'registration' | 'verification' | 'security' | 'system' | 'api' | 'database';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
}

// Clase para manejar el logging
class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Límite máximo de logs en memoria

  /**
   * Registra un mensaje de log
   */
  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    context?: {
      userId?: string;
      sessionId?: string;
      correlationId?: string;
    }
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      ...context
    };

    // Agregar log al buffer
    this.logs.push(logEntry);

    // Mantener el tamaño del buffer
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Mostrar en consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.printToConsole(logEntry);
    }

    // En producción, enviar a servicio de logging externo
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Métodos de conveniencia para diferentes niveles de log
   */
  debug(
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    context?: {
      userId?: string;
      sessionId?: string;
      correlationId?: string;
    }
  ): void {
    this.log('debug', category, message, metadata, context);
  }

  info(
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    context?: {
      userId?: string;
      sessionId?: string;
      correlationId?: string;
    }
  ): void {
    this.log('info', category, message, metadata, context);
  }

  warn(
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    context?: {
      userId?: string;
      sessionId?: string;
      correlationId?: string;
    }
  ): void {
    this.log('warn', category, message, metadata, context);
  }

  error(
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    context?: {
      userId?: string;
      sessionId?: string;
      correlationId?: string;
    }
  ): void {
    this.log('error', category, message, metadata, context);
  }

  /**
   * Imprime el log en la consola
   */
  private printToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(7);
    const category = entry.category.padEnd(12);
    
    const logMessage = `[${timestamp}] ${level} [${category}] ${entry.message}`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage, entry.metadata || '');
        break;
      case 'info':
        console.info(logMessage, entry.metadata || '');
        break;
      case 'warn':
        console.warn(logMessage, entry.metadata || '');
        break;
      case 'error':
        console.error(logMessage, entry.metadata || '');
        break;
    }
  }

  /**
   * Envía el log a un servicio externo (simulado)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // En una implementación real, esto enviaría los logs a un servicio como:
      // - AWS CloudWatch
      // - Google Cloud Logging
      // - Datadog
      // - Loggly
      // - Elasticsearch + Kibana
      // - Sentry para errores
      
      // Por ahora, solo simulamos el envío
      if (process.env.LOGGING_SERVICE_URL) {
        // Implementación real:
        // await fetch(process.env.LOGGING_SERVICE_URL, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`
        //   },
        //   body: JSON.stringify(entry)
        // });
      }
    } catch (error) {
      // No hacer nada si falla el envío de logs
      console.warn('Failed to send log to external service:', error);
    }
  }

  /**
   * Obtiene los logs filtrados
   */
  getLogs(filters?: {
    level?: LogLevel;
    category?: LogCategory;
    userId?: string;
    startTime?: string;
    endTime?: string;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      
      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!);
      }
      
      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!);
      }
    }

    return filteredLogs;
  }

  /**
   * Limpia los logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Exporta los logs en formato JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Exportar funciones de conveniencia
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);