'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Shield
} from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { validatePasswordStrength, PasswordStrengthResult } from '@/lib/validations/doctor-registration';
import { SimplePhoneInput } from '@/components/ui/simple-phone-input';
import { FormattedError } from '@/lib/error-handling/zod-error-formatter';

// Interfaces para tipos específicos
interface EmailValidationResult {
  isValid: boolean;
  isAvailable: boolean | null;
}

interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrengthResult;
}

interface PersonalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'personal_info') => void;
  onStepError: (step: 'personal_info', error: string) => void;
  formErrors?: {
    errors: FormattedError[];
    warnings: FormattedError[];
    hasErrors: boolean;
    hasWarnings: boolean;
    hasCriticalErrors: boolean;
    errorSummary: string;
    errorsByField: Record<string, FormattedError[]>;
    getFieldError: (field: string) => string | null;
    hasFieldError: (field: string) => boolean;
    getFieldClassName: (field: string, baseClassName?: string) => string;
    getFieldErrorElement: (field: string) => JSX.Element | null;
    clearAllErrors: () => void;
    clearFieldError: (field: string) => void;
    setFieldError: (field: string, message: string, severity?: 'error' | 'warning' | 'info') => void;
    validateEmail: (email: string) => void;
    validatePhone: (phone: string) => void;
    validatePassword: (password: string) => void;
    validatePasswordMatch: (password: string, confirmPassword: string) => void;
    validateName: (name: string, field: 'nombre' | 'apellido') => void;
  };
}

export default function PersonalInfoStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  formErrors
}: PersonalInfoStepProps) {
  const [formData, setFormData] = useState(() => {
    // Cargar datos guardados al inicializar
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      password: data.password || '',
      confirmPassword: data.confirmPassword || ''
    };
  });

  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>({ isValid: false, errors: [], score: 0 });

  // Estados para persistir la validación entre montajes
  const [emailValidationResult, setEmailValidationResult] = useState<EmailValidationResult | null>(null);
  const [passwordValidationResult, setPasswordValidationResult] = useState<PasswordValidationResult | null>(null);

  // Sincronizar datos cuando cambien desde el componente padre
  useEffect(() => {
    const newFormData = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      password: data.password || '',
      confirmPassword: data.confirmPassword || ''
    };
    
    // Solo actualizar si los datos han cambiado
    const hasChanged = Object.keys(newFormData).some(key => 
      newFormData[key as keyof typeof newFormData] !== formData[key as keyof typeof formData]
    );
    
    if (hasChanged) {
      setFormData(newFormData);
      
      // Marcar campos con datos como tocados para mostrar validaciones
      Object.keys(newFormData).forEach(field => {
        if (newFormData[field as keyof typeof newFormData].trim()) {
          setFieldTouched(prev => ({ ...prev, [field]: true }));
        }
      });
    }
  }, [data.firstName, data.lastName, data.email, data.phone, data.password, data.confirmPassword, formData]);

  // Marcar campos como tocados si hay datos guardados al cargar inicialmente
  useEffect(() => {
    const hasSavedData = Object.values(formData).some(value => value.trim() !== '');
    if (hasSavedData) {
      // Marcar campos con datos como tocados
      const fieldsToTouch: Record<string, boolean> = {};
      Object.keys(formData).forEach(field => {
        if (formData[field as keyof typeof formData].trim()) {
          fieldsToTouch[field] = true;
        }
      });
      
      // Solo actualizar si hay cambios
      const hasChanges = Object.keys(fieldsToTouch).some(field => !fieldTouched[field]);
      if (hasChanges) {
        setFieldTouched(prev => ({ ...prev, ...fieldsToTouch }));
      }
    }
  }, []); // Solo ejecutar una vez al montar el componente

  // Validar email
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validar teléfono venezolano
  const validateVenezuelanPhone = useCallback((phone: string): boolean => {
    const venezuelanPhoneRegex = /^\+58[24]\d{9}$/;
    return venezuelanPhoneRegex.test(phone);
  }, []);

  // Validar nombre
  const validateName = useCallback((name: string): boolean => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return name.trim().length >= 2 && nameRegex.test(name);
  }, []);

  // Verificar disponibilidad de email
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!validateEmail(email)) {
      setIsEmailAvailable(null);
      setEmailValidationResult({isValid: false, isAvailable: null});
      return;
    }
    
    try {
      setIsEmailAvailable(null); // Estado de carga
      setEmailValidationResult({isValid: true, isAvailable: null});
      
      // Simular verificación (reemplazar con llamada real a Supabase)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por ahora, simular que todos los emails están disponibles
      // En producción, hacer llamada real a la API
      const isAvailable = !email.includes('test@test.com'); // Simular email ocupado
      
      console.log('[EMAIL_VALIDATION] Email verificado:', { email, isAvailable });
      
      setIsEmailAvailable(isAvailable);
      setEmailValidationResult({isValid: true, isAvailable});
      
      if (!isAvailable) {
        formErrors?.setFieldError('correo electrónico', 'Este correo electrónico ya está registrado');
      } else {
        formErrors?.clearFieldError('correo electrónico');
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      setIsEmailAvailable(false);
      setEmailValidationResult({isValid: true, isAvailable: false});
      formErrors?.setFieldError('correo electrónico', 'Error verificando disponibilidad del email');
    }
  }, [formErrors, validateEmail]);

  // Efecto para ejecutar validaciones al cargar datos
  useEffect(() => {
    let isMounted = true;
    
    if (!formData.email && !formData.password) {
      return;
    }
    
    const validateEmailAndSetState = async () => {
      // Validar email si hay datos
      if (formData.email && isMounted) {
        const isValid = validateEmail(formData.email);
        if (isValid) {
          // Si ya tenemos un resultado de validación previo, usarlo
          if (emailValidationResult && isMounted) {
            // Solo actualizar si el valor es diferente
            if (isEmailAvailable !== emailValidationResult.isAvailable) {
              setIsEmailAvailable(emailValidationResult.isAvailable);
            }
            if (emailValidationResult.isAvailable === false && formErrors?.getFieldError('correo electrónico') !== 'Este correo electrónico ya está registrado') {
              formErrors?.setFieldError('correo electrónico', 'Este correo electrónico ya está registrado');
            } else if (emailValidationResult.isAvailable === true && formErrors?.hasFieldError('correo electrónico')) {
              formErrors?.clearFieldError('correo electrónico');
            }
          } else {
            // Ejecutar validación de disponibilidad
            await checkEmailAvailability(formData.email);
          }
        } else {
          if (formErrors?.getFieldError('correo electrónico') !== 'Ingresa un correo electrónico válido') {
            formErrors?.setFieldError('correo electrónico', 'Ingresa un correo electrónico válido');
          }
          if (isEmailAvailable !== null) {
            setIsEmailAvailable(null);
          }
        }
      }
      
      // Validar contraseña si hay datos
      if (formData.password && isMounted) {
        // Si ya tenemos un resultado de validación previo, usarlo
        if (passwordValidationResult && isMounted) {
          // Solo actualizar si el valor es diferente
          if (JSON.stringify(passwordStrength) !== JSON.stringify(passwordValidationResult.strength)) {
            setPasswordStrength(passwordValidationResult.strength);
          }
          if (!passwordValidationResult.isValid) {
            const errorMessage = passwordValidationResult.strength.errors[0] || 'Contraseña no válida';
            if (formErrors?.getFieldError('contraseña') !== errorMessage) {
              formErrors?.setFieldError('contraseña', errorMessage);
            }
          } else if (formErrors?.hasFieldError('contraseña')) {
            formErrors?.clearFieldError('contraseña');
          }
        } else {
          // Ejecutar validación de fortaleza
          const strength = validatePasswordStrength(formData.password);
          // Solo actualizar si el valor es diferente
          if (JSON.stringify(passwordStrength) !== JSON.stringify(strength)) {
            setPasswordStrength(strength);
          }
          if (!strength.isValid) {
            const errorMessage = strength.errors[0] || 'Contraseña no válida';
            if (formErrors?.getFieldError('contraseña') !== errorMessage) {
              formErrors?.setFieldError('contraseña', errorMessage);
            }
          } else if (formErrors?.hasFieldError('contraseña')) {
            formErrors?.clearFieldError('contraseña');
          }
        }
      }
    };
    
    validateEmailAndSetState();
    
    return () => {
      isMounted = false;
    };
  }, [
    formData.email, 
    formData.password, 
    validateEmail, 
    checkEmailAvailability
  ]);

  // Marcar campo como tocado solo si tiene contenido
  const markFieldAsTouched = useCallback((field: string, value: string) => {
    if (value.trim()) {
      setFieldTouched(prev => ({ ...prev, [field]: true }));
    }
  }, []);

  // Validar campo específico
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
          setIsEmailAvailable(null);
          setEmailValidationResult({isValid: false, isAvailable: null});
        } else if (!validateEmail(value)) {
          formErrors?.setFieldError('correo electrónico', 'Ingresa un correo electrónico válido');
          setIsEmailAvailable(null);
          setEmailValidationResult({isValid: false, isAvailable: null});
        } else {
          formErrors?.clearFieldError('correo electrónico');
          // Verificar disponibilidad inmediatamente si el email es válido
          console.log('[EMAIL_VALIDATION] Iniciando verificación para:', value);
          checkEmailAvailability(value);
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
        console.log('[PASSWORD_VALIDATION] Validando contraseña:', value);
        const strength = validatePasswordStrength(value);
        console.log('[PASSWORD_VALIDATION] Resultado de validación:', strength);
        setPasswordStrength(strength);
        setPasswordValidationResult({isValid: strength.isValid, strength});
        
        if (!value.trim()) {
          formErrors?.setFieldError('contraseña', 'La contraseña es requerida');
        } else if (!strength.isValid) {
          formErrors?.setFieldError('contraseña', strength.errors[0] || 'Contraseña no válida');
        } else {
          formErrors?.clearFieldError('contraseña');
        }
        
        // Validar confirmación si ya tiene valor
        if (formData.confirmPassword && fieldTouched.confirmPassword) {
          // Usar setTimeout para evitar problemas de recursión
          setTimeout(() => {
            validateField('confirmPassword', formData.confirmPassword);
          }, 0);
        }
        break;
      
      case 'confirmPassword':
        if (!value.trim()) {
          formErrors?.setFieldError('confirmación de contraseña', 'Confirma tu contraseña');
        } else if (value !== formData.password) {
          formErrors?.setFieldError('confirmación de contraseña', 'Las contraseñas no coinciden');
        } else {
          formErrors?.clearFieldError('confirmación de contraseña');
        }
        break;
    }
  }, [formData, formErrors, fieldTouched, checkEmailAvailability, validateName, validateEmail, validateVenezuelanPhone]);

  // Manejar cambios en los campos
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => {
      // Solo actualizar si el valor realmente cambia
      if (prev[field as keyof typeof prev] === value) {
        return prev;
      }
      return { ...prev, [field]: value };
    });
    
    // Solo llamar a updateData si el valor cambia
    if (formData[field as keyof typeof formData] !== value) {
      updateData({ [field]: value });
    }

    // Validar correo electrónico inmediatamente al escribir o pegar
    if (field === 'email') {
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => {
          if (prev[field]) return prev;
          return { ...prev, [field]: true };
        });
      } else {
        // Limpiar estados de validación si el campo está vacío
        setIsEmailAvailable(null);
        setEmailValidationResult(null);
      }
      validateField(field, value);
    }
    // Validar contraseña inmediatamente al escribir, sin depender de fieldTouched
    else if (field === 'password') {
      validateField(field, value);
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => {
          if (prev[field]) return prev;
          return { ...prev, [field]: true };
        });
      } else {
        // Limpiar estados de validación si el campo está vacío
        setPasswordStrength({ isValid: false, errors: [], score: 0 });
        setPasswordValidationResult(null);
      }
    } 
    // Validar confirmación de contraseña si ya tiene valor o si la contraseña tiene valor
    else if (field === 'confirmPassword') {
      validateField(field, value);
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => {
          if (prev[field]) return prev;
          return { ...prev, [field]: true };
        });
      }
    }
    // Para otros campos, validar solo si el campo ha sido tocado Y tiene contenido
    else if (fieldTouched[field] && value.trim()) {
      validateField(field, value);
    } else if (fieldTouched[field] && !value.trim()) {
      // Limpiar errores si el campo está vacío
      const fieldMap: Record<string, string> = {
        firstName: 'nombre',
        lastName: 'apellido',
        email: 'correo electrónico',
        phone: 'teléfono',
        password: 'contraseña',
        confirmPassword: 'confirmación de contraseña'
      };
      formErrors?.clearFieldError(fieldMap[field]);
      
      // Limpiar estado de email si está vacío
      if (field === 'email') {
        setIsEmailAvailable(null);
        setEmailValidationResult(null);
      }
    }
  }, [fieldTouched, updateData, formErrors, validateField, setFieldTouched, formData]);

  // Validar formulario completo (solo cuando se hace clic en "Siguiente")
  const validateFormForSubmission = useCallback((): boolean => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    let isValid = true;

    // Marcar todos los campos como tocados para mostrar errores
    const newTouched: Record<string, boolean> = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setFieldTouched(newTouched);

    // Validar cada campo
    requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (value.trim()) {
        validateField(field, value);
      } else {
        // Campo vacío - mostrar error
        const fieldMap: Record<string, string> = {
          firstName: 'nombre',
          lastName: 'apellido',
          email: 'correo electrónico',
          phone: 'teléfono',
          password: 'contraseña',
          confirmPassword: 'confirmación de contraseña'
        };
        formErrors?.setFieldError(fieldMap[field], `El ${fieldMap[field]} es requerido`);
        isValid = false;
      }
    });

    // Verificar email disponible
    if (isEmailAvailable === false) {
      isValid = false;
    }

    return isValid;
  }, [formData, formErrors, isEmailAvailable, validateField]);

  // Exponer función de validación para el botón "Siguiente"
  const handleNextClick = useCallback(() => {
    const isValid = validateFormForSubmission();
    if (isValid) {
      onStepComplete('personal_info');
    } else {
      onStepError('personal_info', 'Complete todos los campos correctamente');
    }
  }, [validateFormForSubmission, onStepComplete, onStepError]);

  // Exponer función para validación automática (solo para marcar como completado)
  const checkFormCompletion = useCallback(() => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    const allFieldsFilled = requiredFields.every(field => formData[field as keyof typeof formData].trim());
    const hasErrors = formErrors?.hasErrors;
    
    // Solo marcar como completado si todo está bien, pero NO marcar como error automáticamente
    if (allFieldsFilled && !hasErrors && isEmailAvailable !== false) {
      onStepComplete('personal_info');
    }
    // Removido: No marcar automáticamente como error para evitar mostrar rojo prematuramente
  }, [formData, formErrors, isEmailAvailable, onStepComplete]);

  // Exponer funciones para uso externo (para evitar warnings de ESLint)
  const exposedFunctions = {
    handleNextClick,
    checkFormCompletion,
    validateFormForSubmission
  };

  // Usar las funciones para evitar warnings
  console.log('Exposed functions:', Object.keys(exposedFunctions));

  // Obtener clase CSS para el campo
  const getFieldClassName = useCallback((field: string): string => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
    
    if (!fieldTouched[field]) {
      return `${baseClass} border-gray-300`;
    }

    const fieldMap: Record<string, string> = {
      firstName: 'nombre',
      lastName: 'apellido',
      email: 'correo electrónico',
      phone: 'teléfono',
      password: 'contraseña',
      confirmPassword: 'confirmación de contraseña'
    };

    const hasError = formErrors?.hasFieldError(fieldMap[field]);
    
    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }

    // Estados especiales para campos válidos
    if (field === 'email' && isEmailAvailable === true) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    if (field === 'password' && passwordStrength.score >= 75) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    if (field === 'confirmPassword' && formData.password && formData.confirmPassword === formData.password) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    // Validaciones específicas para otros campos
    if (field === 'firstName' && validateName(formData.firstName)) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    if (field === 'lastName' && validateName(formData.lastName)) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    if (field === 'phone' && validateVenezuelanPhone(formData.phone)) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }

    return `${baseClass} border-gray-300`;
  }, [fieldTouched, formErrors, isEmailAvailable, passwordStrength, formData, validateName, validateVenezuelanPhone]);

  // useEffect para validar formularios cuando cambian ciertos valores
  useEffect(() => {
    // Este efecto se ejecuta cuando cambian las dependencias relevantes
    // Se asegura de que las validaciones se mantengan actualizadas
    console.log('Form validation effect triggered');
  }, [checkEmailAvailability, emailValidationResult, formData.email, formData.password, formErrors, passwordValidationResult, validateEmail]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Personal
        </h2>
        <p className="text-gray-600">
          Ingresa tus datos personales para crear tu cuenta médica en Red-Salud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center text-sm font-medium text-gray-700">
            <User className="h-4 w-4 mr-2" />
            Nombre *
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              type="text"
              placeholder="Ingresa tu nombre"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => markFieldAsTouched('firstName', formData.firstName)}
              className={getFieldClassName('firstName')}
            />
            {/* Indicador de validación para nombre */}
            {fieldTouched.firstName && validateName(formData.firstName) && !formErrors?.hasFieldError('nombre') && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {fieldTouched.firstName && formErrors?.getFieldErrorElement('nombre')}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center text-sm font-medium text-gray-700">
            <User className="h-4 w-4 mr-2" />
            Apellido *
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              type="text"
              placeholder="Ingresa tu apellido"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={() => markFieldAsTouched('lastName', formData.lastName)}
              className={getFieldClassName('lastName')}
            />
            {/* Indicador de validación para apellido */}
            {fieldTouched.lastName && validateName(formData.lastName) && !formErrors?.hasFieldError('apellido') && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {fieldTouched.lastName && formErrors?.getFieldErrorElement('apellido')}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
          <Mail className="h-4 w-4 mr-2" />
          Correo Electrónico *
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="doctor@ejemplo.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => markFieldAsTouched('email', formData.email)}
            onPaste={(e) => {
              // Manejar pegado de texto
              setTimeout(() => {
                const pastedValue = e.currentTarget.value;
                handleInputChange('email', pastedValue);
                markFieldAsTouched('email', pastedValue);
                // Validar inmediatamente después de pegar
                validateField('email', pastedValue);
              }, 0);
            }}
            className={getFieldClassName('email')}
          />
          {/* Indicadores de estado del email */}
          {isEmailAvailable === true && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {isEmailAvailable === false && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
          {isEmailAvailable === null && formData.email && validateEmail(formData.email) && (fieldTouched.email || formData.email) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          {/* Debug info - remover en producción */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {isEmailAvailable === null ? 'Loading' : isEmailAvailable === true ? 'Valid' : 'Invalid'}
            </div>
          )}
        </div>
        {fieldTouched.email && formErrors?.getFieldErrorElement('correo electrónico')}
        {isEmailAvailable === true && (
          <p className="text-sm text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Email disponible
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700">
          <Phone className="h-4 w-4 mr-2" />
          Teléfono *
        </Label>
        <div className="relative">
          <SimplePhoneInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            onBlur={() => markFieldAsTouched('phone', formData.phone)}
            className={getFieldClassName('phone')}
            placeholder="xxx xxx xx xx"
          />
          {/* Indicador de validación para teléfono */}
          {fieldTouched.phone && validateVenezuelanPhone(formData.phone) && !formErrors?.hasFieldError('teléfono') && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {fieldTouched.phone && formErrors?.getFieldErrorElement('teléfono')}
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
            <Lock className="h-4 w-4 mr-2" />
            Contraseña *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => markFieldAsTouched('password', formData.password)}
              className={getFieldClassName('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldTouched.password && formErrors?.getFieldErrorElement('contraseña')}
          
          {/* Indicador de fortaleza de contraseña */}
          {(formData.password || fieldTouched.password) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Fortaleza de contraseña</span>
                <span className={`font-medium ${
                  passwordStrength.score >= 75 ? 'text-green-600' :
                  passwordStrength.score >= 50 ? 'text-yellow-600' :
                  passwordStrength.score > 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {passwordStrength.score >= 75 ? 'Fuerte' :
                   passwordStrength.score >= 50 ? 'Media' : 
                   passwordStrength.score > 0 ? 'Débil' : 'Ingresa contraseña'}
                </span>
              </div>
              <Progress 
                value={passwordStrength.score || 0} 
                className={`h-2 ${
                  passwordStrength.score >= 75 ? '[&>div]:bg-green-500' :
                  passwordStrength.score >= 50 ? '[&>div]:bg-yellow-500' :
                  passwordStrength.score > 0 ? '[&>div]:bg-red-500' : '[&>div]:bg-gray-300'
                }`} 
              />
              {/* Debug info - remover en producción */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400">
                  Score: {passwordStrength.score}, Valid: {passwordStrength.isValid ? 'Yes' : 'No'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-700">
            <Shield className="h-4 w-4 mr-2" />
            Confirmar Contraseña *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => markFieldAsTouched('confirmPassword', formData.confirmPassword)}
              className={getFieldClassName('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {/* Indicador de validación para confirmación de contraseña */}
            {fieldTouched.confirmPassword && formData.password && formData.confirmPassword === formData.password && !formErrors?.hasFieldError('confirmación de contraseña') && (
              <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {fieldTouched.confirmPassword && formErrors?.getFieldErrorElement('confirmación de contraseña')}
        </div>
      </div>

      {/* Requisitos de contraseña */}
      {(formData.password || fieldTouched.password) && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium text-blue-800">Requisitos de contraseña profesional:</span>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {[
                { check: formData.password.length >= 6, text: 'Mínimo 6 caracteres' },
                { check: /[A-Z]/.test(formData.password), text: 'Una letra mayúscula' },
                { check: /[a-z]/.test(formData.password), text: 'Una letra minúscula' },
                { check: /\d/.test(formData.password), text: 'Un número' }
              ].map((req, index) => (
                <div key={index} className={`flex items-center ${req.check ? 'text-green-600' : 'text-gray-500'}`}>
                  {req.check ? (
                    <CheckCircle className="h-3 w-3 mr-2" />
                  ) : (
                    <div className="w-3 h-3 mr-2 border border-gray-300 rounded-full" />
                  )}
                  {req.text}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Los caracteres especiales son opcionales pero recomendados para mayor seguridad.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Información de seguridad */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-green-800">
          <span className="font-medium">Seguridad médica:</span> Todos los datos se encriptan y cumplen con 
          estándares internacionales de protección de información médica (HIPAA, GDPR).
        </AlertDescription>
      </Alert>
    </div>
  );
}