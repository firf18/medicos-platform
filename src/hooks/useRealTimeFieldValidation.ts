/**
 * Hook personalizado para validación en tiempo real de campos - Red-Salud
 * 
 * Este hook proporciona validación en tiempo real para campos de formulario
 * con debounce para evitar validaciones excesivas.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ZodSchema } from 'zod';

interface UseRealTimeFieldValidationProps<T> {
  schema: ZodSchema<T>;
  initialValue?: T;
  debounceMs?: number;
  fieldName?: string;
}

interface UseRealTimeFieldValidationReturn<T> {
  value: T;
  setValue: (value: T) => void;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  setIsTouched: (touched: boolean) => void;
  validate: () => boolean;
  suggestions: string[];
}

// Función de debounce
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Función para generar sugerencias basadas en el tipo de campo
function generateSuggestions(fieldName: string, value: any): string[] {
  const suggestions: string[] = [];
  
  // Sugerencias específicas por tipo de campo
  if (fieldName.includes('email')) {
    if (!value || !value.includes('@')) {
      suggestions.push('El email debe contener un @');
    }
    if (!value || !value.includes('.')) {
      suggestions.push('El email debe contener un dominio');
    }
  } else if (fieldName.includes('phone')) {
    if (value && !/^\+58[24]\d{9}$/.test(value)) {
      suggestions.push('El teléfono debe tener formato +58XXXXXXXXX');
    }
  } else if (fieldName.includes('password')) {
    if (value && value.length < 6) {
      suggestions.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (value && !/[A-Z]/.test(value)) {
      suggestions.push('La contraseña debe incluir al menos una mayúscula');
    }
    if (value && !/[a-z]/.test(value)) {
      suggestions.push('La contraseña debe incluir al menos una minúscula');
    }
    if (value && !/\d/.test(value)) {
      suggestions.push('La contraseña debe incluir al menos un número');
    }
  } else if (fieldName.includes('name')) {
    if (value && value.length < 2) {
      suggestions.push('El nombre debe tener al menos 2 caracteres');
    }
    if (value && /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
      suggestions.push('El nombre solo puede contener letras y espacios');
    }
  }
  
  return suggestions;
}

export function useRealTimeFieldValidation<T>({
  schema,
  initialValue,
  debounceMs = 300,
  fieldName = ''
}: UseRealTimeFieldValidationProps<T>): UseRealTimeFieldValidationReturn<T> {
  const [value, setValue] = useState<T>(initialValue as T);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const validationRef = useRef<NodeJS.Timeout | null>(null);

  // Función de validación con debounce
  const validateWithDebounce = useCallback(
    debounce((val: T) => {
      try {
        schema.parse(val);
        setError(null);
        setIsValid(true);
        setSuggestions([]);
      } catch (err: any) {
        setError(err.errors?.[0]?.message || 'Valor inválido');
        setIsValid(false);
        // Generar sugerencias basadas en el error
        const fieldSuggestions = generateSuggestions(fieldName, val);
        setSuggestions(fieldSuggestions);
      }
    }, debounceMs),
    [schema, debounceMs, fieldName]
  );

  // Validación inmediata
  const validate = useCallback((): boolean => {
    try {
      schema.parse(value);
      setError(null);
      setIsValid(true);
      setSuggestions([]);
      return true;
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Valor inválido');
      setIsValid(false);
      // Generar sugerencias basadas en el error
      const fieldSuggestions = generateSuggestions(fieldName, value);
      setSuggestions(fieldSuggestions);
      return false;
    }
  }, [schema, value, fieldName]);

  // Efecto para validar cuando cambia el valor
  useEffect(() => {
    if (isTouched) {
      validateWithDebounce(value);
    }
    
    // Marcar como dirty si el valor cambia
    if (!isDirty && value !== initialValue) {
      setIsDirty(true);
    }
    
    return () => {
      if (validationRef.current) {
        clearTimeout(validationRef.current);
      }
    };
  }, [value, isTouched, validateWithDebounce, isDirty, initialValue]);

  // Resetear estado cuando cambia el initialValue
  useEffect(() => {
    if (initialValue !== undefined && value !== initialValue) {
      setValue(initialValue);
      setIsDirty(false);
      setIsTouched(false);
      setError(null);
      setIsValid(true);
      setSuggestions([]);
    }
  }, [initialValue, value]);

  return {
    value,
    setValue: (newValue: T) => {
      setValue(newValue);
    },
    error,
    isValid,
    isDirty,
    isTouched,
    setIsTouched,
    validate,
    suggestions
  };
}