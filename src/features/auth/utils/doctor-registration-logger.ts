/**
 * Utilidades de Logging para Registro de Médicos
 * 
 * Centraliza todas las funciones de logging y eventos de seguridad
 * relacionadas con el registro médico.
 */

import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/doctor-registration';
import { shouldLogDataUpdate } from '@/lib/config/logging';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  email?: string;
  licenseNumber?: string;
  step?: RegistrationStep;
  timestamp?: string;
}

export class DoctorRegistrationLogger {
  /**
   * Log de inicio de registro
   */
  static logRegistrationStarted(context: LogContext): void {
    logSecurityEvent('doctor_registration_started', {
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.info('registration', 'Doctor registration started', {
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de progreso de paso
   */
  static logStepProgress(step: RegistrationStep, context: LogContext): void {
    if (shouldLogDataUpdate()) {
      logger.debug('registration', `Step ${step} progress`, {
        step,
        email: context.email,
        sessionId: context.sessionId,
        timestamp: context.timestamp || new Date().toISOString()
      });
    }
  }

  /**
   * Log de completado de paso
   */
  static logStepCompleted(step: RegistrationStep, context: LogContext): void {
    logSecurityEvent('registration_step_completed', {
      step,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.info('registration', `Step ${step} completed`, {
      step,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de error en paso
   */
  static logStepError(step: RegistrationStep, error: string, context: LogContext): void {
    logSecurityEvent('registration_step_error', {
      step,
      error,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.error('registration', `Step ${step} error`, {
      step,
      error,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de actualización de datos
   */
  static logDataUpdate(updatedFields: string[], context: LogContext): void {
    if (shouldLogDataUpdate()) {
      logger.debug('registration', 'Registration data updated', {
        fields: updatedFields,
        email: context.email,
        sessionId: context.sessionId,
        timestamp: context.timestamp || new Date().toISOString()
      });
    }
  }

  /**
   * Log de guardado de progreso
   */
  static logProgressSaved(context: LogContext): void {
    logger.debug('registration', 'Registration progress saved', {
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });
  }

  /**
   * Log de carga de progreso
   */
  static logProgressLoaded(context: LogContext): void {
    logger.debug('registration', 'Registration progress loaded', {
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });
  }

  /**
   * Log de limpieza de progreso
   */
  static logProgressCleared(reason: string, context: LogContext): void {
    logSecurityEvent('registration_progress_cleared', {
      reason,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.info('registration', 'Registration progress cleared', {
      reason,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de navegación entre pasos
   */
  static logStepNavigation(fromStep: RegistrationStep, toStep: RegistrationStep, context: LogContext): void {
    logger.debug('registration', 'Step navigation', {
      fromStep,
      toStep,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });
  }

  /**
   * Log de validación exitosa
   */
  static logValidationSuccess(step: RegistrationStep, context: LogContext): void {
    logger.debug('registration', `Validation success for ${step}`, {
      step,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });
  }

  /**
   * Log de validación fallida
   */
  static logValidationFailure(step: RegistrationStep, errors: string[], context: LogContext): void {
    logSecurityEvent('registration_validation_failed', {
      step,
      errors,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.warn('registration', `Validation failed for ${step}`, {
      step,
      errors,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de registro completado
   */
  static logRegistrationCompleted(context: LogContext): void {
    logSecurityEvent('doctor_registration_completed', {
      email: context.email,
      licenseNumber: context.licenseNumber,
      userId: context.userId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.info('registration', 'Doctor registration completed successfully', {
      email: context.email,
      licenseNumber: context.licenseNumber,
      userId: context.userId
    });
  }

  /**
   * Log de registro fallido
   */
  static logRegistrationFailed(error: string, context: LogContext): void {
    logSecurityEvent('doctor_registration_failed', {
      error,
      email: context.email,
      licenseNumber: context.licenseNumber,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.error('registration', 'Doctor registration failed', {
      error,
      email: context.email,
      licenseNumber: context.licenseNumber
    });
  }

  /**
   * Log de evento de seguridad personalizado
   */
  static logSecurityEvent(eventType: string, data: Record<string, any>, context: LogContext): void {
    logSecurityEvent(eventType, {
      ...data,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.info('security', `Security event: ${eventType}`, {
      eventType,
      data,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de performance
   */
  static logPerformanceMetric(metric: string, value: number, context: LogContext): void {
    logger.debug('performance', `Registration performance: ${metric}`, {
      metric,
      value,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });
  }

  /**
   * Log de error de API
   */
  static logApiError(endpoint: string, error: string, context: LogContext): void {
    logSecurityEvent('registration_api_error', {
      endpoint,
      error,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.error('api', `Registration API error: ${endpoint}`, {
      endpoint,
      error,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Log de timeout
   */
  static logTimeout(operation: string, duration: number, context: LogContext): void {
    logSecurityEvent('registration_timeout', {
      operation,
      duration,
      email: context.email,
      sessionId: context.sessionId,
      timestamp: context.timestamp || new Date().toISOString()
    });

    logger.warn('registration', `Registration timeout: ${operation}`, {
      operation,
      duration,
      email: context.email,
      sessionId: context.sessionId
    });
  }

  /**
   * Crea contexto de logging a partir de datos de registro
   */
  static createContext(
    data: Partial<DoctorRegistrationData>,
    sessionId?: string,
    userId?: string,
    step?: RegistrationStep
  ): LogContext {
    return {
      userId,
      sessionId,
      email: data.email,
      licenseNumber: data.licenseNumber,
      step,
      timestamp: new Date().toISOString()
    };
  }
}