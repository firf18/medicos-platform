/**
 * Hook para Formulario de Información Personal
 * 
 * Maneja toda la lógica del formulario de información personal
 * incluyendo validación, estado y efectos secundarios.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DoctorRegistrationApiService } from '../services/doctor-registration-api';
import { validateEmail, validateName, validateVenezuelanPhone, validatePasswordStrength } from '../utils/validation-utils';
import { DoctorRegistrationLogger } from '../utils/doctor-registration-logger';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface EmailValidation {
  isValid: boolean;
  isAvailable: boolean | null;
  isChecking?: boolean;
}

interface PasswordStrength {
  score: number;
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

interface UsePersonalInfoFormProps {
  initialData: Partial<FormData>;
  onDataChange: (data: Partial<FormData>) => void;
  onStepComplete: (step: string) => void;
  onStepError: (step: string, error: string) => void;
  formErrors?: {
    hasFieldError: (field: string) => boolean;
    setFieldError: (field: string, error: string) => void;
    clearFieldError: (field: string) => void;
  };
}

export const usePersonalInfoForm = ({
  initialData,
  onDataChange,
  onStepComplete,
  onStepError,
  formErrors
}: UsePersonalInfoFormProps) => {
  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || ''
  });

  // Estado de campos tocados
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

  // Estado de validación de email
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({
    isValid: false,
    isAvailable: null,
    isChecking: false
  });

  // Estado de fortaleza de contraseña
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    isValid: false,
    errors: [],
    suggestions: []
  });

  // Referencias
  const isMountedRef = useRef(true);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================

  const validateField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'firstName':
        if (!validateName(value)) {
          formErrors?.setFieldError('nombre', 'El nombre debe tener al menos 2 caracteres y solo contener letras');
        } else {
          formErrors?.clearFieldError('nombre');
        }
        break;
      
      case 'lastName':
        if (!validateName(value)) {
          formErrors?.setFieldError('apellido', 'El apellido debe tener al menos 2 caracteres y solo contener letras');
        } else {
          formErrors?.clearFieldError('apellido');
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          formErrors?.setFieldError('correo electrónico', 'El correo electrónico es requerido');
          setEmailValidation({ isValid: false, isAvailable: null });
        } else if (!validateEmail(value)) {
          formErrors?.setFieldError('correo electrónico', 'Ingresa un correo electrónico válido');
          setEmailValidation({ isValid: false, isAvailable: null });
        } else {
          formErrors?.clearFieldError('correo electrónico');
          checkEmailAvailabilityDebounced(value);
        }
        break;
      
      case 'phone':
        if (!value.trim()) {
          formErrors?.setFieldError('teléfono', 'El teléfono es requerido');
        } else if (!validateVenezuelanPhone(value)) {
          formErrors?.setFieldError('teléfono', 'Debe ser un número venezolano válido (+58XXXXXXXXX)');
        } else {
          formErrors?.clearFieldError('teléfono');
        }
        break;
      
      case 'password':
        const strength = validatePasswordStrength(value);
        setPasswordStrength(strength);
        
        if (!strength.isValid) {
          formErrors?.setFieldError('contraseña', strength.errors.join(', '));
        } else {
          formErrors?.clearFieldError('contraseña');
        }
        break;
      
      case 'confirmPassword':
        if (value !== formData.password) {
          formErrors?.setFieldError('confirmación de contraseña', 'Las contraseñas no coinciden');
        } else {
          formErrors?.clearFieldError('confirmación de contraseña');
        }
        break;
    }
  }, [formData.password, formErrors]);

  // ============================================================================
  // VERIFICACIÓN DE EMAIL CON DEBOUNCE
  // ============================================================================

  const checkEmailAvailabilityDebounced = useCallback((email: string) => {
    // Limpiar timeout anterior
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    setEmailValidation(prev => ({ ...prev, isChecking: true }));

    emailCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const isAvailable = await DoctorRegistrationApiService.checkEmailAvailability(email);
        
        if (isMountedRef.current) {
          setEmailValidation({
            isValid: true,
            isAvailable: isAvailable.success && isAvailable.data?.available === true,
            isChecking: false
          });

          // Log del resultado
          DoctorRegistrationLogger.logSecurityEvent('email_availability_checked', {
            email,
            available: isAvailable.success && isAvailable.data?.available === true
          }, { email });
        }
      } catch (error) {
        if (isMountedRef.current) {
          setEmailValidation({
            isValid: false,
            isAvailable: null,
            isChecking: false
          });

          DoctorRegistrationLogger.logApiError('check-email-availability', 
            error instanceof Error ? error.message : 'Unknown error', 
            { email }
          );
        }
      }
    }, 500); // Debounce de 500ms
  }, []);

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Notificar cambio al componente padre
      onDataChange(newData);
      
      // Validar campo si ya fue tocado
      if (fieldTouched[field]) {
        setTimeout(() => validateField(field, value), 0);
      }
      
      return newData;
    });
  }, [fieldTouched, onDataChange, validateField]);

  const handleFieldBlur = useCallback((field: string) => {
    setFieldTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo al perder el foco
    const value = formData[field as keyof FormData];
    validateField(field, value);
  }, [formData, validateField]);

  // ============================================================================
  // VALIDACIÓN COMPLETA DEL FORMULARIO
  // ============================================================================

  const validateAllFields = useCallback(() => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field as keyof FormData];
      validateField(field, value);
      
      // Marcar todos los campos como tocados
      setFieldTouched(prev => ({ ...prev, [field]: true }));
      
      // Verificar si el campo es válido
      switch (field) {
        case 'firstName':
        case 'lastName':
          if (!validateName(value)) isValid = false;
          break;
        case 'email':
          if (!validateEmail(value) || emailValidation.isAvailable !== true) isValid = false;
          break;
        case 'phone':
          if (!validateVenezuelanPhone(value)) isValid = false;
          break;
        case 'password':
          if (!passwordStrength.isValid) isValid = false;
          break;
        case 'confirmPassword':
          if (value !== formData.password) isValid = false;
          break;
      }
    });

    return isValid;
  }, [formData, emailValidation.isAvailable, passwordStrength.isValid, validateField]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isFormValid = useCallback(() => {
    return (
      validateName(formData.firstName) &&
      validateName(formData.lastName) &&
      validateEmail(formData.email) &&
      emailValidation.isAvailable === true &&
      validateVenezuelanPhone(formData.phone) &&
      passwordStrength.isValid &&
      formData.password === formData.confirmPassword
    );
  }, [formData, emailValidation.isAvailable, passwordStrength.isValid]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Sincronizar con datos iniciales
  useEffect(() => {
    setFormData({
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      password: initialData.password || '',
      confirmPassword: initialData.confirmPassword || ''
    });
  }, [initialData]);

  // Validar contraseña cuando cambie
  useEffect(() => {
    if (formData.password) {
      const strength = validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  // Notificar cuando el formulario esté completo y válido
  useEffect(() => {
    if (isFormValid()) {
      onStepComplete('personal_info');
    }
  }, [isFormValid, onStepComplete]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  return {
    formData,
    fieldTouched,
    emailValidation,
    passwordStrength,
    handleInputChange,
    handleFieldBlur,
    validateAllFields,
    isFormValid: isFormValid()
  };
};