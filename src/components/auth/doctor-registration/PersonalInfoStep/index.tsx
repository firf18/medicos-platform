// Componente principal refactorizado de PersonalInfoStep
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import FormField from './FormField';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import NameFieldsSection from './NameFieldsSection';
import ContactFieldsSection from './ContactFieldsSection';
import PasswordFieldsSection from './PasswordFieldsSection';
import { EmailVerification } from '@/components/auth/EmailVerification';
import { useEmailVerification } from '@/contexts/EmailVerificationContext';
import { emailVerificationTracker } from '@/lib/email-verification/verification-tracker';
import { phoneVerificationTracker } from '@/lib/phone-verification/phone-verification-tracker';
import { validateEmail, validateName, validateVenezuelanPhone, validatePasswordStrength, checkEmailAvailability, checkPhoneAvailability } from './utils';
import type { EmailValidationResult, PasswordValidationResult, FormData } from './types';

interface PersonalInfoStepProps {
  onStepComplete: (data: any) => void;
  onStepError: (error: string) => void;
  formData: any;
  updateData: (data: any) => void;
  formErrors?: {
    hasErrors: boolean;
    getFieldError: (field: string) => string | undefined;
    setFieldError: (field: string, error: string) => void;
    clearFieldError: (field: string) => void;
    hasFieldError: (field: string) => boolean;
    getFieldErrorElement: (field: string) => JSX.Element | null;
  };
  onValidationChange?: (isValid: boolean) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onStepComplete,
  onStepError,
  formData: initialFormData,
  updateData,
  formErrors,
  onValidationChange
}) => {
  // Estados internos
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isPhoneAvailable, setIsPhoneAvailable] = useState<boolean | null>(null);
  const [emailValidationResult, setEmailValidationResult] = useState<EmailValidationResult | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    isValid: false,
    errors: []
  });
  const [passwordValidationResult, setPasswordValidationResult] = useState<PasswordValidationResult | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Usar el contexto de verificación de email y teléfono
  const { 
    isEmailVerified, 
    setIsEmailVerified, 
    verifiedEmail, 
    setVerifiedEmail,
    isPhoneVerified,
    setIsPhoneVerified,
    verifiedPhone,
    setVerifiedPhone
  } = useEmailVerification();

  // Flag para evitar actualizaciones después de desmontar
  const isMountedRef = React.useRef(true);

  // Sincronizar datos externos con estado interno
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // Inicializar tracker de email si ya hay un email válido (idempotente)
  useEffect(() => {
    if (formData.email && validateEmail(formData.email)) {
      // Verificar si hay una sesión activa
      const hasActiveSession = emailVerificationTracker.hasActiveSession(formData.email);
      
      if (hasActiveSession) {
        console.log('📧 Email ya tiene sesión activa al cargar componente');
        setIsEmailVerified(true);
        setVerifiedEmail(formData.email);
        emailVerificationTracker.extendSession(formData.email);
      } else {
        console.log('📧 Inicializando tracker de email al cargar componente');
        const wasCreated = emailVerificationTracker.startVerification(formData.email);
        if (wasCreated) {
          console.log('📧 Nuevo tracker de email creado');
        } else {
          console.log('📧 Tracker de email ya existía');
        }
      }
    }
  }, [formData.email, setIsEmailVerified, setVerifiedEmail]);

  // Inicializar estado de teléfono al cargar si hay uno válido: primero validar disponibilidad
  useEffect(() => {
    if (formData.phone && validateVenezuelanPhone(formData.phone)) {
      console.log('📱 Verificando teléfono al cargar componente:', formData.phone);
      
      checkPhoneAvailability(formData.phone).then(result => {
        if (!isMountedRef.current) return;
        setIsPhoneAvailable(result.isAvailable);
        if (result.isAvailable) {
          // Verificar si hay una sesión activa
          const hasActiveSession = phoneVerificationTracker.hasActiveSession(formData.phone);
          if (hasActiveSession) {
            console.log('📱 Teléfono ya tiene sesión activa al cargar componente');
            setIsPhoneVerified(true);
            setVerifiedPhone(formData.phone);
            phoneVerificationTracker.extendSession(formData.phone);
          } else {
            console.log('📱 Inicializando tracker de teléfono al cargar componente');
            const wasCreated = phoneVerificationTracker.startVerification(formData.phone);
            if (wasCreated) {
              console.log('📱 Nuevo tracker de teléfono creado');
            } else {
              console.log('📱 Tracker de teléfono ya existía');
            }
            // Marcar como verificado para persistencia local de la sesión
            phoneVerificationTracker.markAsVerified(formData.phone, 'auto');
            setIsPhoneVerified(true);
            setVerifiedPhone(formData.phone);
          }
        } else {
          setIsPhoneVerified(false);
          setVerifiedPhone(null);
        }
      });
    } else {
      setIsPhoneAvailable(null);
    }
  }, [formData.phone, setIsPhoneVerified, setVerifiedPhone]);

  // Inicializar tracker de teléfono desde el contexto si ya está verificado
  useEffect(() => {
    if (verifiedPhone && validateVenezuelanPhone(verifiedPhone)) {
      console.log('📱 Inicializando tracker de teléfono desde contexto:', verifiedPhone);
      
      // Verificar si hay una sesión activa
      const hasActiveSession = phoneVerificationTracker.hasActiveSession(verifiedPhone);
      
      if (!hasActiveSession) {
        console.log('📱 Creando sesión para teléfono verificado en contexto');
        const wasCreated = phoneVerificationTracker.startVerification(verifiedPhone);
        if (wasCreated) {
          console.log('📱 Nuevo tracker de teléfono creado desde contexto');
        } else {
          console.log('📱 Tracker de teléfono ya existía desde contexto');
        }
        phoneVerificationTracker.markAsVerified(verifiedPhone, 'auto');
      } else {
        console.log('📱 Extendiendo sesión para teléfono verificado en contexto');
        phoneVerificationTracker.extendSession(verifiedPhone);
      }
    }
  }, [verifiedPhone]);

  // Verificar si el email actual ya está verificado
  useEffect(() => {
    if (formData.email && verifiedEmail === formData.email) {
      // Verificar si hay una sesión activa en el tracker
      const hasActiveSession = emailVerificationTracker.hasActiveSession(formData.email);
      
      if (hasActiveSession) {
        // El email actual ya está verificado con sesión activa
        console.log('✅ Email ya verificado con sesión activa:', { 
          formDataEmail: formData.email, 
          verifiedEmail,
          hasActiveSession 
        });
        setIsEmailVerified(true);
        // Extender la sesión
        emailVerificationTracker.extendSession(formData.email);
      } else {
        // Sesión expirada, resetear verificación
        console.log('⏰ Sesión de email expirada, reseteando verificación:', { 
          formDataEmail: formData.email, 
          verifiedEmail 
        });
        setIsEmailVerified(false);
        setVerifiedEmail(null);
      }
    } else if (formData.email && verifiedEmail && verifiedEmail !== formData.email) {
      // El email cambió, resetear verificación solo si hay un email diferente verificado
      console.log('🔄 Email cambió, reseteando verificación:', { 
        formDataEmail: formData.email, 
        verifiedEmail 
      });
      setIsEmailVerified(false);
      setVerifiedEmail(null);
    }
    // No resetear si no hay email verificado previo
  }, [formData.email, verifiedEmail, setIsEmailVerified, setVerifiedEmail]);

  // Iniciar verificación automática cuando el email sea válido y disponible
  useEffect(() => {
    if (formData.email && 
        validateEmail(formData.email) && 
        isEmailAvailable === true && 
        !isEmailVerified && 
        !showEmailVerification) {
      
      // Verificar si hay una sesión activa antes de mostrar verificación
      const hasActiveSession = emailVerificationTracker.hasActiveSession(formData.email);
      
      if (!hasActiveSession) {
        console.log('🔍 Iniciando verificación de email - no hay sesión activa');
        setShowEmailVerification(true);
      } else {
        console.log('✅ Email ya tiene sesión activa, no mostrar verificación');
        setIsEmailVerified(true);
        setVerifiedEmail(formData.email);
      }
    }
  }, [formData.email, isEmailAvailable, isEmailVerified, showEmailVerification, emailValidationResult]);

  // Verificar si el teléfono actual ya está verificado
  useEffect(() => {
    if (formData.phone && verifiedPhone === formData.phone) {
      // Verificar si hay una sesión activa en el tracker
      const hasActiveSession = phoneVerificationTracker.hasActiveSession(formData.phone);
      
      if (hasActiveSession) {
        // El teléfono actual ya está verificado con sesión activa
        console.log('✅ Teléfono ya verificado con sesión activa:', { 
          formDataPhone: formData.phone, 
          verifiedPhone,
          hasActiveSession 
        });
        setIsPhoneVerified(true);
        // Extender la sesión
        phoneVerificationTracker.extendSession(formData.phone);
      } else {
        // Sesión expirada, resetear verificación
        console.log('⏰ Sesión de teléfono expirada, reseteando verificación:', { 
          formDataPhone: formData.phone, 
          verifiedPhone 
        });
        setIsPhoneVerified(false);
        setVerifiedPhone(null);
      }
    } else if (formData.phone && verifiedPhone && verifiedPhone !== formData.phone) {
      // El teléfono cambió, resetear verificación solo si hay un teléfono diferente verificado
      console.log('🔄 Teléfono cambió, reseteando verificación:', { 
        formDataPhone: formData.phone, 
        verifiedPhone 
      });
      setIsPhoneVerified(false);
      setVerifiedPhone(null);
    }
    // No resetear si no hay teléfono verificado previo
  }, [formData.phone, verifiedPhone, setIsPhoneVerified, setVerifiedPhone]);

  // Mantener sincronizado el tracker si el contexto dice verificado y no hay registro
  useEffect(() => {
    if (formData.phone && validateVenezuelanPhone(formData.phone)) {
      const hasActiveSession = phoneVerificationTracker.hasActiveSession(formData.phone);
      const isVerifiedInTracker = phoneVerificationTracker.isPhoneVerified(formData.phone);
      console.log('📱 [PHONE-VERIFICATION] Estado actual:', {
        phone: formData.phone,
        hasActiveSession,
        isVerifiedInTracker,
        isPhoneVerified,
        verifiedPhone
      });

      if (isPhoneAvailable === true) {
        if (hasActiveSession || isVerifiedInTracker) {
          setIsPhoneVerified(true);
          setVerifiedPhone(formData.phone);
          if (hasActiveSession) {
            phoneVerificationTracker.extendSession(formData.phone);
          }
        } else if (isPhoneVerified && verifiedPhone === formData.phone && !isVerifiedInTracker) {
          const wasCreated = phoneVerificationTracker.startVerification(formData.phone);
          if (wasCreated) {
            console.log('📱 Nuevo tracker creado para sincronización');
          } else {
            console.log('📱 Tracker ya existía para sincronización');
          }
          phoneVerificationTracker.markAsVerified(formData.phone, 'auto');
        }
      }
    }
  }, [formData.phone, isPhoneAvailable, isPhoneVerified, verifiedPhone, setIsPhoneVerified, setVerifiedPhone]);

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
        const strength = validatePasswordStrength(value);
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
    } else if (field === 'phone') {
      validateField(field, value);
      // Marcar campo como tocado si tiene contenido
      if (value.trim()) {
        setFieldTouched(prev => ({
          ...prev,
          [field]: true
        }));
        const isValidPhone = validateVenezuelanPhone(value);
        if (isValidPhone) {
          // Comprobar disponibilidad en backend antes de marcar como verificado
          checkPhoneAvailability(value).then(result => {
            if (!isMountedRef.current) return;
            setIsPhoneAvailable(result.isAvailable);
            if (result.isAvailable) {
              setIsPhoneVerified(true);
              setVerifiedPhone(value);
              // Sincronizar tracker (idempotente)
              const wasCreated = phoneVerificationTracker.startVerification(value);
              if (wasCreated) {
                console.log('📱 Nuevo tracker creado para teléfono disponible');
              } else {
                console.log('📱 Tracker ya existía para teléfono disponible');
              }
              phoneVerificationTracker.markAsVerified(value, 'auto');
              // Limpiar error si existía
              formErrors?.clearFieldError('teléfono');
            } else {
              setIsPhoneVerified(false);
              setVerifiedPhone(null);
              formErrors?.setFieldError('teléfono', 'Este teléfono ya está registrado');
            }
          });
        } else {
          setIsPhoneAvailable(null);
          setIsPhoneVerified(false);
          setVerifiedPhone(null);
        }
      } else {
        // Limpiar estados de verificación si el campo está vacío
        setIsPhoneAvailable(null);
        setIsPhoneVerified(false);
        setVerifiedPhone(null);
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
    // Verificar teléfono disponible
    if (isPhoneAvailable === false) {
      isValid = false;
    }

    // Verificar que el email esté verificado
    if (!isEmailVerified) {
      isValid = false;
    }

    // Verificar que el teléfono esté verificado
    if (!isPhoneVerified) {
      isValid = false;
    }

    return isValid;
  }, [formData, formErrors, isEmailAvailable, isPhoneAvailable, isEmailVerified, isPhoneVerified, validateField]);

  // Referencias estables para callbacks
  const handleEmailVerificationCompleteRef = useRef(() => {
    console.log('🎉 Verificación de email completada:', { 
      email: formData.email,
      currentVerifiedEmail: verifiedEmail,
      currentIsEmailVerified: isEmailVerified
    });
    console.log('🔧 Estableciendo verificación en contexto...');
    setIsEmailVerified(true);
    setVerifiedEmail(formData.email);
    setShowEmailVerification(false);
    console.log('✅ Verificación establecida en contexto');
    // Marcar el campo de email como verificado
    if (formErrors) {
      formErrors.clearFieldError('correo electrónico');
    }
  });

  // Actualizar la referencia cuando cambien las dependencias
  useEffect(() => {
    handleEmailVerificationCompleteRef.current = () => {
      console.log('🎉 Verificación de email completada:', { 
        email: formData.email,
        currentVerifiedEmail: verifiedEmail,
        currentIsEmailVerified: isEmailVerified
      });
      console.log('🔧 Estableciendo verificación en contexto...');
      setIsEmailVerified(true);
      setVerifiedEmail(formData.email);
      setShowEmailVerification(false);
      console.log('✅ Verificación establecida en contexto');
      // Marcar el campo de email como verificado
      if (formErrors) {
        formErrors.clearFieldError('correo electrónico');
      }
    };
  }, [formData.email, setIsEmailVerified, setVerifiedEmail, formErrors, verifiedEmail, isEmailVerified]);

  // Callback estable que no cambia
  const handleEmailVerificationComplete = useCallback(() => {
    handleEmailVerificationCompleteRef.current();
  }, []);

  // Referencia estable para callback de error
  const handleEmailVerificationErrorRef = useRef((error: string) => {
    if (formErrors) {
      formErrors.setFieldError('correo electrónico', error);
    }
  });

  // Actualizar la referencia cuando cambien las dependencias
  useEffect(() => {
    handleEmailVerificationErrorRef.current = (error: string) => {
      if (formErrors) {
        formErrors.setFieldError('correo electrónico', error);
      }
    };
  }, [formErrors]);

  // Callback estable que no cambia
  const handleEmailVerificationError = useCallback((error: string) => {
    handleEmailVerificationErrorRef.current(error);
  }, []);

  const handleStartEmailVerification = useCallback(() => {
    if (validateEmail(formData.email) && isEmailAvailable === true) {
      setShowEmailVerification(true);
    }
  }, [formData.email, isEmailAvailable]);

  // Efecto para notificar cambios en la validación
  useEffect(() => {
    if (onValidationChange) {
      const isValid = validateFormForSubmission();
      onValidationChange(isValid);
    }
  }, [formData, isEmailAvailable, isPhoneAvailable, isEmailVerified, isPhoneVerified, onValidationChange]);

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
    <form 
      onSubmit={(e) => e.preventDefault()} 
      className="space-y-6"
      autoComplete="on"
      noValidate
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Personal
        </h2>
        <p className="text-gray-600">
          Complete su información personal para crear su cuenta médica segura
        </p>
      </div>

      {/* Formulario modularizado con subcomponentes */}
      <div className="space-y-6">
        {/* Sección de Nombre y Apellido */}
        <NameFieldsSection
          formData={{
            firstName: formData.firstName,
            lastName: formData.lastName
          }}
          onFieldChange={(field, value) => handleInputChange(field, value)}
          onFieldBlur={(field, value) => markFieldAsTouched(field, value)}
          fieldTouched={fieldTouched}
          formErrors={formErrors}
        />

        {/* Sección de Contacto (Email y Teléfono) */}
        <ContactFieldsSection
          formData={{
            email: formData.email,
            phone: formData.phone
          }}
          onFieldChange={(field, value) => handleInputChange(field, value)}
          onFieldBlur={(field, value) => markFieldAsTouched(field, value)}
          onFieldPaste={(field, e) => {
            if (field === 'email') {
            // Manejar pegado de texto
            setTimeout(() => {
              const pastedValue = e.currentTarget.value;
              handleInputChange('email', pastedValue);
              markFieldAsTouched('email', pastedValue);
              // Validar inmediatamente después de pegar
              validateField('email', pastedValue);
            }, 0);
            }
          }}
          fieldTouched={fieldTouched}
          formErrors={formErrors}
          isEmailAvailable={isEmailAvailable}
          isEmailVerified={isEmailVerified}
          isPhoneAvailable={isPhoneAvailable}
          isPhoneVerified={isPhoneVerified}
          onStartEmailVerification={handleStartEmailVerification}
        />

        {/* Sección de Contraseñas */}
        <PasswordFieldsSection
          formData={{
            password: formData.password,
            confirmPassword: formData.confirmPassword
          }}
          onFieldChange={(field, value) => handleInputChange(field, value)}
          onFieldBlur={(field, value) => markFieldAsTouched(field, value)}
          fieldTouched={fieldTouched}
          formErrors={formErrors}
          passwordStrength={passwordStrength}
        />

        {/* Información de seguridad */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            <span className="font-medium">Seguridad médica:</span> Todos los datos se encriptan y cumplen con 
            estándares internacionales de protección de información médica (HIPAA, GDPR).
          </AlertDescription>
        </Alert>

        {/* Verificación de email */}
        {showEmailVerification && (() => {
          console.log('🔍 PersonalInfoStep: Pasando callbacks a EmailVerification:', {
            handleEmailVerificationComplete: typeof handleEmailVerificationComplete,
            handleEmailVerificationError: typeof handleEmailVerificationError
          });
          return (
            <div className="mt-6">
              <EmailVerification
                email={formData.email}
                onVerificationComplete={handleEmailVerificationComplete}
                onVerificationError={handleEmailVerificationError}
              />
            </div>
          );
        })()}
      </div>
    </form>
  );
};

export default PersonalInfoStep;
