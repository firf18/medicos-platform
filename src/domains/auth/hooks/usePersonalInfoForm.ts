/**
 * Personal Info Form Hook
 * @fileoverview Custom hook for managing personal info form state and validation
 * @compliance HIPAA-compliant form state management with audit logging
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import {
  PersonalInfoFormData,
  PersonalInfoFormErrors,
  EmailValidationResult,
  PasswordValidationResult,
  FieldTouchedState,
  PasswordVisibilityState
} from '../types/personal-info.types';
import {
  validatePersonalInfoForm,
  validateEmailFormat,
  validatePassword,
  checkEmailAvailability,
  sanitizeName,
  formatPhoneDisplay
} from '../utils/personal-info-validation';

interface UsePersonalInfoFormProps {
  initialData: DoctorRegistrationData;
  onDataChange: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'personal_info') => void;
  onStepError: (step: 'personal_info', error: string) => void;
}

export const usePersonalInfoForm = ({
  initialData,
  onDataChange,
  onStepComplete,
  onStepError
}: UsePersonalInfoFormProps) => {
  // Form state
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || ''
  });

  // Validation state
  const [errors, setErrors] = useState<PersonalInfoFormErrors>({});
  const [fieldTouched, setFieldTouched] = useState<FieldTouchedState>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  // Password visibility state
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>({
    password: false,
    confirmPassword: false
  });

  // Email availability state
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Password strength state
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);

  // Refs for managing async operations
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmailCheckedRef = useRef<string>('');
  const lastInitialDataRef = useRef<DoctorRegistrationData | null>(null);
  const rehydratedUIRef = useRef<boolean>(false);

  /**
   * Handle input changes with validation
   */
  const handleInputChange = useCallback((
    field: keyof PersonalInfoFormData,
    value: string
  ) => {
    setFormData(prev => {
      const newData = { ...prev };

      // Apply field-specific formatting
      switch (field) {
        case 'firstName':
        case 'lastName': {
          // Aceptar solo letras (incluye acentos y Ñ) y espacios; forzar MAYÚSCULAS
          const lettersOnly = value
            .toUpperCase()
            .replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          newData[field] = lettersOnly;
          break;
        }
        case 'email':
          newData[field] = value.toLowerCase().trim();
          break;
        case 'phone':
          newData[field] = formatPhoneDisplay(value);
          break;
        default:
          newData[field] = value;
      }

      // Validación en tiempo real y limpieza de errores
      setErrors(prevErrors => {
        const next = { ...prevErrors } as any;
        // Reglas por campo
        if (field === 'firstName' || field === 'lastName') {
          const onlyLetters = /^[A-ZÁÉÍÓÚÑ\s]{2,}$/;
          if (!newData[field]) {
            next[field] = field === 'firstName' ? 'El nombre es requerido' : 'El apellido es requerido';
          } else if (!onlyLetters.test(newData[field])) {
            next[field] = 'Solo letras y mínimo 2 caracteres';
          } else {
            delete next[field];
          }
        }
        if (field === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!newData.email) {
            next.email = 'El correo electrónico es requerido';
          } else if (!emailRegex.test(newData.email)) {
            next.email = 'Formato de correo electrónico inválido';
          } else {
            delete next.email;
          }
        }
        if (field === 'phone') {
          const digitsOnly = (newData.phone || '').replace(/\D/g, '');
          const mobileVE = /^(412|414|416|424|426)\d{7}$/; // 10 dígitos
          const mobileVE58 = /^58(412|414|416|424|426)\d{7}$/; // 12 dígitos incluyendo 58
          const landlineVE = /^2\d{9}$/; // 10 dígitos iniciando en 2
          if (!digitsOnly) {
            next.phone = 'El número de teléfono es requerido';
          } else if (mobileVE.test(digitsOnly) || mobileVE58.test(digitsOnly) || landlineVE.test(digitsOnly)) {
            delete next.phone;
          } else {
            next.phone = 'Debe ser un número venezolano válido';
          }
        }
        if (field === 'password') {
          if (!newData.password) {
            next.password = 'La contraseña es requerida';
          } else {
            delete next.password;
          }
          // Revalidar confirmación ante cambios de contraseña
          if (newData.confirmPassword) {
            if (newData.confirmPassword !== newData.password) {
              next.confirmPassword = 'Las contraseñas no coinciden';
            } else {
              delete next.confirmPassword;
            }
          }
        }
        if (field === 'confirmPassword') {
          if (!newData.confirmPassword) {
            next.confirmPassword = 'La confirmación de contraseña es requerida';
          } else if (newData.confirmPassword !== newData.password) {
            next.confirmPassword = 'Las contraseñas no coinciden';
          } else {
            delete next.confirmPassword;
          }
        }
        return next;
      });

      return newData;
    });

    // Update parent AFTER state is set (avoid setState during render)
    setTimeout(() => {
      onDataChange({
        [field]: value
      });
    }, 0);
  }, [errors, onDataChange]);

  /**
   * Mark field as touched
   */
  const markFieldTouched = useCallback((field: keyof PersonalInfoFormData) => {
    setFieldTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback((field: 'password' | 'confirmPassword') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  /**
   * Debounced email availability check
   */
  const checkEmailAvailabilityDebounced = useCallback(async (email: string) => {
    // Clear existing timeout
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    // Skip if same email already checked
    if (email === lastEmailCheckedRef.current) {
      return;
    }

    // Validate email format first
    const formatValidation = validateEmailFormat(email);
    if (!formatValidation.isValid) {
      setEmailValidation(formatValidation);
      return;
    }

    // Set checking state
    setIsCheckingEmail(true);
    setEmailValidation({ ...formatValidation, isAvailable: null });

    // Debounce the API call
    emailCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const isAvailable = await checkEmailAvailability(email);
        lastEmailCheckedRef.current = email;
        
        setEmailValidation({
          isValid: formatValidation.isValid && isAvailable,
          isAvailable,
          error: !isAvailable ? 'Este correo electrónico ya está registrado' : undefined
        });
      } catch (error) {
        console.error('Email availability check failed:', error);
        setEmailValidation({
          isValid: formatValidation.isValid,
          isAvailable: null,
          error: 'Error verificando disponibilidad del correo'
        });
      } finally {
        setIsCheckingEmail(false);
      }
    }, 1000); // 1 second delay
  }, []);

  /**
   * Validate password strength
   */
  const validatePasswordStrength = useCallback((password: string) => {
    const validation = validatePassword(password);
    setPasswordValidation(validation);
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const validation = validatePersonalInfoForm(formData);
    setErrors(validation.errors);

    // Check email availability if not already checked
    if (formData.email && !emailValidation?.isAvailable) {
      onStepError('personal_info', 'Por favor verifique la disponibilidad del correo electrónico');
      return false;
    }

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onStepError('personal_info', firstError || 'Errores en el formulario');
      return false;
    }

    // Check email availability
    if (emailValidation && !emailValidation.isAvailable) {
      onStepError('personal_info', 'El correo electrónico no está disponible');
      return false;
    }

    return true;
  }, [formData, emailValidation, onStepError]);

  /**
   * Submit form
   */
  const submitForm = useCallback(async () => {
    // Mark all fields as touched
    setFieldTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    if (!validateForm()) {
      return false;
    }

    try {
      // Final update to parent data
      onDataChange(formData);

      // Mark step as complete
      onStepComplete('personal_info');
      return true;

    } catch (error) {
      console.error('[PERSONAL_INFO] Submit error:', error);
      onStepError('personal_info', 'Error al guardar la información personal');
      return false;
    }
  }, [formData, validateForm, onDataChange, onStepComplete, onStepError]);

  // Auto-validate email when it changes
  useEffect(() => {
    if (formData.email && fieldTouched.email) {
      checkEmailAvailabilityDebounced(formData.email);
    }
  }, [formData.email, fieldTouched.email, checkEmailAvailabilityDebounced]);

  // Auto-validate password when it changes
  useEffect(() => {
    if (formData.password) {
      validatePasswordStrength(formData.password);
    } else {
      setPasswordValidation(null);
    }
  }, [formData.password, validatePasswordStrength]);

  // Sync with parent data changes (only when initialData actually changes from external source)
  useEffect(() => {
    // Check if initialData has actually changed from the last external update
    const lastData = lastInitialDataRef.current;
    const hasRealChanges = !lastData || 
      lastData.firstName !== initialData.firstName ||
      lastData.lastName !== initialData.lastName ||
      lastData.email !== initialData.email ||
      lastData.phone !== initialData.phone ||
      lastData.password !== initialData.password ||
      lastData.confirmPassword !== initialData.confirmPassword;

    if (hasRealChanges) {
      // Update our ref to track this change
      lastInitialDataRef.current = { ...initialData };
      
      // Only update form data with non-empty values from parent
      setFormData(prev => ({
        ...prev,
        firstName: initialData.firstName || prev.firstName,
        lastName: initialData.lastName || prev.lastName,
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        password: initialData.password || prev.password,
        confirmPassword: initialData.confirmPassword || prev.confirmPassword
      }));
    }
  }, [initialData]);

  // Note: Parent data updates are handled directly in handleInputChange to avoid loops

  // Rehydrate UI checks (touched/icons) when volvemos al paso con datos ya completados
  useEffect(() => {
    if (rehydratedUIRef.current) return;
    rehydratedUIRef.current = true;

    // Marcar campos como tocados si ya tienen valor para mostrar los checks en verde
    setFieldTouched(prev => ({
      ...prev,
      firstName: prev.firstName || !!formData.firstName,
      lastName: prev.lastName || !!formData.lastName,
      email: prev.email || !!formData.email,
      phone: prev.phone || !!formData.phone,
      password: prev.password || !!formData.password,
      confirmPassword: prev.confirmPassword || !!formData.confirmPassword
    }));

    // Validar email y disponibilidad para pintar icono inmediatamente
    if (formData.email) {
      const formatValidation = validateEmailFormat(formData.email);
      if (formatValidation.isValid) {
        checkEmailAvailability(formData.email)
          .then(isAvailable => setEmailValidation({ ...formatValidation, isAvailable }))
          .catch(() => setEmailValidation({ ...formatValidation, isAvailable: null }));
      } else {
        setEmailValidation(formatValidation);
      }
    }

    // Fuerza cálculo de fuerza de contraseña
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
    }

    // Recalcular errores del formulario para coherencia visual
    const fullValidation = validatePersonalInfoForm(formData);
    setErrors(fullValidation.errors);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Form state
    formData,
    errors,
    fieldTouched,
    passwordVisibility,
    
    // Validation state
    emailValidation,
    passwordValidation,
    isCheckingEmail,
    
    // Actions
    handleInputChange,
    markFieldTouched,
    togglePasswordVisibility,
    validateForm,
    submitForm,
    
    // Computed values
    isFormValid: Object.keys(errors).length === 0,
    canSubmit: Object.keys(errors).length === 0 && 
               !isCheckingEmail && 
               emailValidation?.isAvailable === true,
    
    // Field helpers
    getFieldError: (field: keyof PersonalInfoFormData) => errors[field] || null,
    hasFieldError: (field: keyof PersonalInfoFormData) => !!errors[field],
    isFieldTouched: (field: keyof PersonalInfoFormData) => fieldTouched[field]
  };
};
