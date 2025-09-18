/**
 * Hook de Manejo de Errores Médicos - Red-Salud
 * 
 * Este hook proporciona funcionalidades avanzadas para el manejo de errores
 * en formularios médicos, incluyendo validación en tiempo real y mensajes user-friendly.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ZodError } from 'zod';
import { 
  FormattedError, 
  formatZodError, 
  groupErrorsByField, 
  getFirstErrorForField,
  hasCriticalErrors,
  createErrorSummary
} from '@/lib/error-handling/zod-error-formatter';

// ============================================================================
// TIPOS DEL HOOK
// ============================================================================

export interface UseFormErrorsState {
  errors: FormattedError[];
  warnings: FormattedError[];
  hasErrors: boolean;
  hasWarnings: boolean;
  hasCriticalErrors: boolean;
  errorSummary: string;
  errorsByField: Record<string, FormattedError[]>;
}

export interface UseFormErrorsActions {
  setZodError: (error: ZodError) => void;
  setFieldError: (field: string, message: string, severity?: 'error' | 'warning' | 'info') => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  getFieldError: (field: string) => string | null;
  hasFieldError: (field: string) => boolean;
  validateField: (field: string, value: unknown, validator: (value: unknown) => boolean, message: string) => void;
  getFieldClassName: (field: string, baseClassName?: string) => string;
  getFieldErrorElement: (field: string) => React.ReactElement | null;
}

export interface UseFormErrorsOptions {
  showWarningsAsErrors?: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useFormErrors(options: UseFormErrorsOptions = {}): UseFormErrorsState & UseFormErrorsActions {
  const {
    showWarningsAsErrors = false
  } = options;

  const [errors, setErrors] = useState<FormattedError[]>([]);
  const [warnings, setWarnings] = useState<FormattedError[]>([]);

  // ============================================================================
  // ESTADO COMPUTADO
  // ============================================================================

  const state = useMemo((): UseFormErrorsState => {
    const allErrors = showWarningsAsErrors ? [...errors, ...warnings] : errors;
    const errorsByField = groupErrorsByField(allErrors);
    const errorSummary = createErrorSummary(allErrors);

    return {
      errors,
      warnings,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      hasCriticalErrors: hasCriticalErrors(allErrors),
      errorSummary,
      errorsByField
    };
  }, [errors, warnings, showWarningsAsErrors]);

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const setZodError = useCallback((error: ZodError) => {
    const formatted = formatZodError(error);
    setErrors(formatted.errors);
    setWarnings(formatted.warnings);
  }, []);

  const setFieldError = useCallback((
    field: string, 
    message: string, 
    severity: 'error' | 'warning' | 'info' = 'error'
  ) => {
    const newError: FormattedError = {
      field,
      message,
      code: 'custom',
      severity
    };

    if (severity === 'warning') {
      setWarnings(prev => {
        const filtered = prev.filter(e => e.field !== field);
        return [...filtered, newError];
      });
    } else {
      setErrors(prev => {
        const filtered = prev.filter(e => e.field !== field);
        return [...filtered, newError];
      });
    }
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field));
    setWarnings(prev => prev.filter(e => e.field !== field));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setWarnings([]);
  }, []);

  const getFieldError = useCallback((field: string): string | null => {
    return getFirstErrorForField([...errors, ...warnings], field);
  }, [errors, warnings]);

  const hasFieldError = useCallback((field: string): boolean => {
    return getFieldError(field) !== null;
  }, [getFieldError]);

  const validateField = useCallback((
    field: string, 
    value: unknown, 
    validator: (value: unknown) => boolean, 
    message: string
  ) => {
    if (!validator(value)) {
      setFieldError(field, message, 'error');
    } else {
      clearFieldError(field);
    }
  }, [setFieldError, clearFieldError]);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const getFieldClassName = useCallback((field: string, baseClassName: string = ''): string => {
    const hasError = hasFieldError(field);
    const errorClass = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    return `${baseClassName} ${errorClass}`.trim();
  }, [hasFieldError]);

  const getFieldErrorElement = useCallback((field: string): React.ReactElement | null => {
    const errorMessage = getFieldError(field);
    if (!errorMessage) return null;

    return React.createElement('p', {
      className: "text-sm text-red-600 flex items-center mt-1"
    }, [
      React.createElement('svg', {
        key: 'icon',
        className: "h-3 w-3 mr-1",
        fill: "currentColor",
        viewBox: "0 0 20 20"
      }, React.createElement('path', {
        fillRule: "evenodd",
        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
        clipRule: "evenodd"
      })),
      errorMessage
    ]);
  }, [getFieldError]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  return {
    // Estado
    ...state,
    
    // Acciones
    setZodError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    validateField,
    
    // Utilidades adicionales
    getFieldClassName,
    getFieldErrorElement
  };
}

// ============================================================================
// HOOK ESPECÍFICO PARA REGISTRO DE MÉDICOS
// ============================================================================

export function useDoctorRegistrationErrors() {
  const formErrors = useFormErrors({
    showWarningsAsErrors: false
  });

  // Validaciones específicas para registro de médicos
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      formErrors.setFieldError('correo electrónico', 'El correo electrónico es requerido');
    } else if (!emailRegex.test(email)) {
      formErrors.setFieldError('correo electrónico', 'Ingresa un correo electrónico válido');
    } else {
      formErrors.clearFieldError('correo electrónico');
    }
  }, [formErrors]);

  const validatePhone = useCallback((phone: string) => {
    if (!phone.trim()) {
      formErrors.setFieldError('teléfono', 'El teléfono es requerido');
      return;
    }

    // Validación específica para números venezolanos
    const venezuelanPhoneRegex = /^\+58[24]\d{9}$/;
    
    if (!venezuelanPhoneRegex.test(phone)) {
      formErrors.setFieldError('teléfono', 'Debe ser un número venezolano válido. Formato: +58XXXXXXXXX (ej: +584241234567)');
    } else {
      formErrors.clearFieldError('teléfono');
    }
  }, [formErrors]);

  const validatePassword = useCallback((password: string) => {
    if (!password.trim()) {
      formErrors.setFieldError('contraseña', 'La contraseña es requerida');
      return;
    }

    const errors: string[] = [];
    
    // Validación para médicos
    if (password.length < 6) {
      errors.push('Mínimo 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Al menos un número');
    }

    // Verificar patrones comunes (más importante que caracteres especiales)
    const commonPatterns = ['123456', 'password', 'doctor', 'medico', 'admin', 'qwerty'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push('No debe contener patrones comunes');
    }

    if (errors.length > 0) {
      formErrors.setFieldError('contraseña', errors.join(', '));
    } else {
      formErrors.clearFieldError('contraseña');
    }
  }, [formErrors]);

  const validatePasswordMatch = useCallback((password: string, confirmPassword: string) => {
    if (confirmPassword && password !== confirmPassword) {
      formErrors.setFieldError('confirmación de contraseña', 'Las contraseñas no coinciden');
    } else {
      formErrors.clearFieldError('confirmación de contraseña');
    }
  }, [formErrors]);

  const validateName = useCallback((name: string, field: 'nombre' | 'apellido') => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!name.trim()) {
      formErrors.setFieldError(field, `El ${field} es requerido`);
    } else if (name.trim().length < 2) {
      formErrors.setFieldError(field, `El ${field} debe tener al menos 2 caracteres`);
    } else if (!nameRegex.test(name)) {
      formErrors.setFieldError(field, `El ${field} solo puede contener letras y espacios`);
    } else {
      formErrors.clearFieldError(field);
    }
  }, [formErrors]);

  return {
    ...formErrors,
    validateEmail,
    validatePhone,
    validatePassword,
    validatePasswordMatch,
    validateName
  };
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default useFormErrors;
