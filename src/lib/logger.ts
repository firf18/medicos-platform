/**
 * Nivel de log
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Opciones de configuración para el logger
 */
interface LoggerOptions {
  level: LogLevel
  prefix?: string
}

/**
 * Logger simple para la aplicación
 */
class Logger {
  private level: LogLevel
  private prefix: string

  constructor(options: LoggerOptions) {
    this.level = options.level
    this.prefix = options.prefix || ''
  }

  /**
   * Determina si un nivel de log debe ser mostrado según la configuración
   * @param level - Nivel de log a verificar
   * @returns Boolean indicando si se debe mostrar
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  /**
   * Formatea un mensaje de log
   * @param level - Nivel de log
   * @param message - Mensaje a formatear
   * @param args - Argumentos adicionales
   * @returns Mensaje formateado
   */
  private formatMessage(level: LogLevel, message: string, args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = this.prefix ? `[${this.prefix}]` : ''
    const formattedArgs = args.length > 0 ? ` ${JSON.stringify(args)}` : ''
    return `${timestamp} ${prefix}[${level.toUpperCase()}] ${message}${formattedArgs}`
  }

  /**
   * Log de nivel debug
   * @param message - Mensaje a loggear
   * @param args - Argumentos adicionales
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, args))
    }
  }

  /**
   * Log de nivel info
   * @param message - Mensaje a loggear
   * @param args - Argumentos adicionales
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, args))
    }
  }

  /**
   * Log de nivel warn
   * @param message - Mensaje a loggear
   * @param args - Argumentos adicionales
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, args))
    }
  }

  /**
   * Log de nivel error
   * @param message - Mensaje a loggear
   * @param args - Argumentos adicionales
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, args))
    }
  }
}

// Crear instancias preconfiguradas para diferentes usos
export const logger = new Logger({ 
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  prefix: 'App'
})

export const authLogger = new Logger({ 
  level: 'debug',
  prefix: 'Auth'
})

export const apiLogger = new Logger({ 
  level: 'debug',
  prefix: 'API'
})

export default Logger