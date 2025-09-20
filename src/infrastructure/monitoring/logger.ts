/**
 * Sistema de Logging - Infraestructura
 * 
 * Sistema centralizado de logging con diferentes niveles
 * y configuración específica para cada módulo.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private enabledModules: Set<string>;

  constructor(options: { 
    level?: LogLevel; 
    prefix?: string;
    enabledModules?: string[];
  } = {}) {
    this.level = options.level || (process.env.NODE_ENV === 'development' ? 'debug' : 'error');
    this.prefix = options.prefix || 'App';
    this.enabledModules = new Set(options.enabledModules || ['*']);
  }

  private shouldLog(level: LogLevel, module: string): boolean {
    // Verificar si el módulo está habilitado
    if (!this.enabledModules.has('*') && !this.enabledModules.has(module)) {
      return false;
    }

    // Verificar nivel de logging
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, module: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const moduleStr = module.padEnd(12);
    
    let formatted = `[${timestamp}] ${levelStr} [${this.prefix}:${moduleStr}] ${message}`;
    
    if (data !== undefined) {
      formatted += ` ${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted;
  }

  private log(level: LogLevel, module: string, message: string, data?: any): void {
    if (!this.shouldLog(level, module)) return;

    const formatted = this.formatMessage(level, module, message, data);
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data
    };

    // Enviar a consola
    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }

    // En producción, enviar a servicio de logging externo
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Implementar envío a servicio externo (ej: Sentry, LogRocket, etc.)
    // Por ahora, solo almacenar en localStorage para debugging
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Mantener solo los últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silencioso para evitar loops de logging
    }
  }

  debug(module: string, message: string, data?: any): void {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: any): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: any): void {
    this.log('error', module, message, data);
  }

  // Métodos de conveniencia para módulos específicos
  supabase(level: LogLevel, message: string, data?: any): void {
    this.log(level, 'supabase', message, data);
  }

  auth(level: LogLevel, message: string, data?: any): void {
    this.log(level, 'auth', message, data);
  }

  api(level: LogLevel, message: string, data?: any): void {
    this.log(level, 'api', message, data);
  }

  validation(level: LogLevel, message: string, data?: any): void {
    this.log(level, 'validation', message, data);
  }

  security(level: LogLevel, message: string, data?: any): void {
    this.log(level, 'security', message, data);
  }

  performance(level: LogLevel, message: string, data?: any): void {
    this.log(level, 'performance', message, data);
  }

  // Método para obtener logs almacenados
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Método para limpiar logs
  clearLogs(): void {
    try {
      localStorage.removeItem('app_logs');
    } catch {
      // Silencioso
    }
  }

  // Método para cambiar configuración en runtime
  configure(options: {
    level?: LogLevel;
    enabledModules?: string[];
  }): void {
    if (options.level) {
      this.level = options.level;
    }
    if (options.enabledModules) {
      this.enabledModules = new Set(options.enabledModules);
    }
  }
}

// Instancia singleton del logger
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  prefix: 'RedSalud',
  enabledModules: process.env.NODE_ENV === 'development' 
    ? ['*'] 
    : ['error', 'security', 'auth']
});

// Exportar la clase para crear instancias personalizadas
export { Logger };

// Tipos para uso externo
export type { LogLevel, LogEntry };