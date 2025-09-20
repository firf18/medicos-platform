// Componente principal refactorizado de PersonalInfoStep
import React, { useState, useCallback, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import SimplePhoneInput from 'react-simple-phone-input';
import FormField from './FormField';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { validateEmail, validateName, validateVenezuelanPhone, validatePasswordStrength, checkEmailAvailability } from './utils';
import type { PersonalInfoStepProps, EmailValidationResult, PasswordValidationResult, FormData } from './types';

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onStepComplete,
  onStepError,
  formData: initialFormData,
  updateData,
  formErrors
}) => {
  // Estados internos
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [emailValidationResult, setEmailValidationResult] = useState<EmailValidationResult | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    isValid: false,
    errors: []
  });
  const [passwordValidationResult, setPasswordValidationResult] = useState<PasswordValidationResult | null>(null);

  // Flag para evitar actualizaciones después de desmontar
  const isMountedRef = React.useRef(true);

  // Sincronizar datos externos con estado interno
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // Marcar campo como tocado
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
          if (process.env.NODE_ENV === 'development') {
            console.log('[EMAIL_VALIDATION] Iniciando verificación para:', value);
          }
          checkEmailAvailability(value).then(result => {
            if (isMountedRef.current) {
              setIsEmailAvailable(result.isAvailable);
              setEmailValidationResult({ isValid: true, isAvailable: result.isAvailable });
            }
          });
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
        if (process.env.NODE_ENV === 'development') {
          console.log('[PASSWORD_VALIDATION] Validando contraseña:', value);
        }
        const strength = validatePasswordStrength(value);
        if (process.env.NODE_ENV === 'development') {
          console.log('[PASSWORD_VALIDATION] Resultado de validación:', strength);
        }
        setPasswordStrength(strength);
        setPasswordValidationResult({isValid: strength.isValid, strength});
        
        if (!value.trim()) {
          formErrors?.setFieldError('contraseña', 'La contraseña es requerida');
        } else if (!strength.isValid) {
          formErrors?.setFieldError('contraseña', strength.errors[0] || 'Contraseña no válida');
        } else {
          formErrors?.clearFieldError('contraseña');
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
  }, [formData, formErrors]);

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
    if (initialFormData[field as keyof typeof initialFormData] !== value) {
      updateData({ [field]: value });
    }

    // Lógica de validación específica para campos
    if (field === 'email') {
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => ({
          ...prev,
          [field]: true
        }));
      } else {
        // Limpiar estados de validación si el campo está vacío
        setIsEmailAvailable(null);
        setEmailValidationResult(null);
      }
      validateField(field, value);
    } else if (field === 'password') {
      validateField(field, value);
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => ({
          ...prev,
          [field]: true
        }));
      } else {
        // Limpiar estados de validación si el campo está vacío
        setPasswordStrength({ isValid: false, errors: [], score: 0 });
        setPasswordValidationResult(null);
      }
    } else if (field === 'confirmPassword') {
      validateField(field, value);
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => ({
          ...prev,
          [field]: true
        }));
      }
    } else if (fieldTouched[field] && value.trim()) {
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
  }, [fieldTouched, updateData, formErrors, validateField, setFieldTouched, initialFormData]);

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

  // Limpiar referencias al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Efecto para validar email y contraseña mientras se escribe
  useEffect(() => {
    if (!formData.email && !formData.password) {
      return;
    }
    
    const validateEmailAndSetState = async () => {
      // Validar email si hay datos
      if (formData.email && isMountedRef.current) {
        const isValid = validateEmail(formData.email);
        if (isValid) {
          // Si ya tenemos un resultado de validación previo, usarlo
          if (emailValidationResult && isMountedRef.current) {
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
            const result = await checkEmailAvailability(formData.email);
            if (isMountedRef.current) {
              setIsEmailAvailable(result.isAvailable);
              setEmailValidationResult({ isValid: true, isAvailable: result.isAvailable });
            }
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
      if (formData.password && isMountedRef.current) {
        // Si ya tenemos un resultado de validación previo, usarlo
        if (passwordValidationResult && isMountedRef.current) {
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
  }, [
    formData.email, 
    formData.password, 
    emailValidationResult,
    formErrors,
    isEmailAvailable,
    passwordStrength,
    passwordValidationResult
  ]);

  // Renderizado del componente
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
        <FormField
          id="firstName"
          type="text"
          placeholder="Ingresa tu nombre"
          value={formData.firstName}
          onChange={(value) => handleInputChange('firstName', value)}
          onBlur={() => markFieldAsTouched('firstName', formData.firstName)}
          fieldName="firstName"
          fieldTouched={fieldTouched.firstName || false}
          hasError={formErrors?.hasFieldError('nombre') || false}
          errorElement={fieldTouched.firstName ? formErrors?.getFieldErrorElement('nombre') || null : null}
          icon={<User className="h-4 w-4 mr-2" />}
          label="Nombre"
          isRequired
          isValid={validateName(formData.firstName)}
        />

        {/* Apellido */}
        <FormField
          id="lastName"
          type="text"
          placeholder="Ingresa tu apellido"
          value={formData.lastName}
          onChange={(value) => handleInputChange('lastName', value)}
          onBlur={() => markFieldAsTouched('lastName', formData.lastName)}
          fieldName="lastName"
          fieldTouched={fieldTouched.lastName || false}
          hasError={formErrors?.hasFieldError('apellido') || false}
          errorElement={fieldTouched.lastName ? formErrors?.getFieldErrorElement('apellido') || null : null}
          icon={<User className="h-4 w-4 mr-2" />}
          label="Apellido"
          isRequired
          isValid={validateName(formData.lastName)}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <FormField
          id="email"
          type="email"
          placeholder="doctor@ejemplo.com"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
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
          fieldName="email"
          fieldTouched={fieldTouched.email || false}
          hasError={formErrors?.hasFieldError('correo electrónico') || false}
          errorElement={fieldTouched.email ? formErrors?.getFieldErrorElement('correo electrónico') || null : null}
          icon={<Mail className="h-4 w-4 mr-2" />}
          label="Correo Electrónico"
          isRequired
          isValid={validateEmail(formData.email) && isEmailAvailable === true}
          showValidIndicator={false}
          rightElement={
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailAvailable === true && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {isEmailAvailable === false && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {isEmailAvailable === null && formData.email && validateEmail(formData.email) && (fieldTouched.email || formData.email) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
              {/* Debug info - remover en producción */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 whitespace-nowrap">
                  {isEmailAvailable === null ? 'Loading' : isEmailAvailable === true ? 'Valid' : 'Invalid'}
                </div>
              )}
            </div>
          }
        />
        {isEmailAvailable === true && (
          <p className="text-sm text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Email disponible
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700">
          <Phone className="h-4 w-4 mr-2" />
          Teléfono *
        </label>
        <div className="relative">
          <SimplePhoneInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value || '')}
            onBlur={() => markFieldAsTouched('phone', formData.phone)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${fieldTouched.phone && formErrors?.hasFieldError('teléfono') ? 'border-red-500 focus:ring-red-500' : fieldTouched.phone && validateVenezuelanPhone(formData.phone) ? 'border-green-500 focus:ring-green-500' : 'border-gray-300'}`}
            placeholder="xxx xxx xx xx"
          />
          {/* Indicador de validación para teléfono */}
          {fieldTouched.phone && validateVenezuelanPhone(formData.phone) && !(formErrors?.hasFieldError('teléfono') || false) && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {fieldTouched.phone && formErrors?.getFieldErrorElement('teléfono')}
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contraseña */}
        <PasswordField
          id="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          onBlur={() => markFieldAsTouched('password', formData.password)}
          fieldName="password"
          fieldTouched={fieldTouched.password || false}
          hasError={formErrors?.hasFieldError('contraseña') || false}
          errorElement={fieldTouched.password ? formErrors?.getFieldErrorElement('contraseña') || null : null}
          icon={<Lock className="h-4 w-4 mr-2" />}
          label="Contraseña"
          isRequired
          isValid={passwordStrength.isValid}
        />

        {/* Indicador de fortaleza de contraseña */}
        <PasswordStrengthIndicator
          passwordStrength={passwordStrength}
          password={formData.password}
          fieldTouched={fieldTouched.password || false}
        />

        {/* Confirmar Contraseña */}
        <PasswordField
          id="confirmPassword"
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          onBlur={() => markFieldAsTouched('confirmPassword', formData.confirmPassword)}
          fieldName="confirmPassword"
          fieldTouched={fieldTouched.confirmPassword || false}
          hasError={formErrors?.hasFieldError('confirmación de contraseña') || false}
          errorElement={fieldTouched.confirmPassword ? formErrors?.getFieldErrorElement('confirmación de contraseña') || null : null}
          icon={<Shield className="h-4 w-4 mr-2" />}
          label="Confirmar Contraseña"
          isRequired
          isConfirmation
          passwordToCompare={formData.password}
        />
      </div>

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
};

export default PersonalInfoStep;