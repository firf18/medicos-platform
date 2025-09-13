'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

import { DoctorRegistrationData } from '@/types/medical/specialties';

interface PersonalInfoStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'personal_info') => void;
  onStepError: (step: 'personal_info', error: string) => void;
  isLoading: boolean;
  formErrors?: {
    errors: any[];
    warnings: any[];
    hasErrors: boolean;
    hasWarnings: boolean;
    hasCriticalErrors: boolean;
    errorSummary: string;
    errorsByField: Record<string, any[]>;
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
  isLoading,
  formErrors
}: PersonalInfoStepProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    password: data.password || '',
    confirmPassword: data.confirmPassword || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);

  // Función para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar teléfono
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Función para validar contraseña
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
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
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Manejar cambios en los campos
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateData({ [field]: value });
    
    // Validar campo específico usando el sistema de errores mejorado
    if (formErrors) {
      switch (field) {
        case 'firstName':
          formErrors.validateName(value, 'nombre');
          break;
        case 'lastName':
          formErrors.validateName(value, 'apellido');
          break;
        case 'email':
          formErrors.validateEmail(value);
          break;
        case 'phone':
          formErrors.validatePhone(value);
          break;
        case 'password':
          formErrors.validatePassword(value);
          // También validar confirmación si ya tiene valor
          if (formData.confirmPassword) {
            formErrors.validatePasswordMatch(value, formData.confirmPassword);
          }
          break;
        case 'confirmPassword':
          formErrors.validatePasswordMatch(formData.password, value);
          break;
        default:
          formErrors.clearFieldError(field);
      }
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Ingresa un teléfono válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(', ');
      }
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar disponibilidad de email
  const checkEmailAvailability = async (email: string) => {
    if (!validateEmail(email)) return;
    
    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { checkEmailAvailability } = await import('@/lib/supabase/doctor-registration');
      
      setIsEmailAvailable(null); // Mostrar estado de carga
      
      const isAvailable = await checkEmailAvailability(email);
      setIsEmailAvailable(isAvailable);
      
      if (!isAvailable) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Este correo electrónico ya está registrado' 
        }));
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      setIsEmailAvailable(null);
    }
  };

  // Efecto para validar cuando cambian los datos (solo después de que el usuario haya interactuado)
  useEffect(() => {
    // Solo validar si el usuario ha empezado a llenar el formulario
    const hasUserInteracted = Object.values(formData).some(value => value.trim() !== '');
    
    if (hasUserInteracted) {
      const isValid = validateForm();
      if (isValid && isEmailAvailable !== false) {
        onStepComplete('personal_info');
      } else {
        onStepError('personal_info', 'Complete todos los campos correctamente');
      }
    }
  }, [formData, isEmailAvailable, onStepComplete, onStepError]);

  // Efecto para verificar email
  useEffect(() => {
    if (formData.email && validateEmail(formData.email)) {
      const timer = setTimeout(() => {
        checkEmailAvailability(formData.email);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.email]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Personal
        </h2>
        <p className="text-gray-600">
          Ingresa tus datos personales para crear tu cuenta en Red-Salud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Nombre *
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Tu nombre"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={formErrors?.getFieldClassName('nombre', '') || (errors.firstName ? 'border-red-500' : '')}
          />
          {formErrors?.getFieldErrorElement('nombre') || (errors.firstName && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.firstName}
            </p>
          ))}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Apellido *
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Tu apellido"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={formErrors?.getFieldClassName('apellido', '') || (errors.lastName ? 'border-red-500' : '')}
          />
          {formErrors?.getFieldErrorElement('apellido') || (errors.lastName && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.lastName}
            </p>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Correo Electrónico *
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={
              formErrors?.getFieldClassName('correo electrónico', '') || 
              (errors.email 
                ? 'border-red-500' 
                : isEmailAvailable === true 
                  ? 'border-green-500' 
                  : isEmailAvailable === false 
                    ? 'border-red-500' 
                    : '')
            }
          />
          {isEmailAvailable === true && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {isEmailAvailable === false && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
          {isEmailAvailable === null && formData.email && validateEmail(formData.email) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        {formErrors?.getFieldErrorElement('correo electrónico') || (errors.email && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.email}
          </p>
        ))}
        {isEmailAvailable === true && !errors.email && !formErrors?.hasFieldError('correo electrónico') && (
          <p className="text-sm text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Email disponible
          </p>
        )}
        {isEmailAvailable === false && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Este email ya está registrado
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          Teléfono *
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={formErrors?.getFieldClassName('teléfono', '') || (errors.phone ? 'border-red-500' : '')}
        />
        {formErrors?.getFieldErrorElement('teléfono') || (errors.phone && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.phone}
          </p>
        ))}
      </div>

      {/* Contraseña */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Contraseña *
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={formErrors?.getFieldClassName('contraseña', '') || (errors.password ? 'border-red-500' : '')}
          />
          {formErrors?.getFieldErrorElement('contraseña') || (errors.password && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.password}
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Confirmar Contraseña *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={formErrors?.getFieldClassName('confirmación de contraseña', '') || (errors.confirmPassword ? 'border-red-500' : '')}
          />
          {formErrors?.getFieldErrorElement('confirmación de contraseña') || (errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.confirmPassword}
            </p>
          ))}
        </div>
      </div>

      {/* Requisitos de contraseña */}
      {formData.password && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Requisitos de contraseña:</span>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {[
                { check: formData.password.length >= 8, text: 'Mínimo 8 caracteres' },
                { check: /[A-Z]/.test(formData.password), text: 'Una mayúscula' },
                { check: /[a-z]/.test(formData.password), text: 'Una minúscula' },
                { check: /\d/.test(formData.password), text: 'Un número' },
                { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'Un carácter especial' }
              ].map((req, index) => (
                <div key={index} className={`flex items-center ${req.check ? 'text-green-600' : 'text-gray-500'}`}>
                  {req.check ? <CheckCircle className="h-3 w-3 mr-1" /> : <div className="w-3 h-3 mr-1 border border-gray-300 rounded-full" />}
                  {req.text}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
