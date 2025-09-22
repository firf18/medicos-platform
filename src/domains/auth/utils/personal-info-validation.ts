/**
 * Personal Info Validation Utils
 * @fileoverview Validation utilities for doctor personal information
 * @compliance Medical data validation with security audit trail
 */

import {
  PersonalInfoFormData,
  EmailValidationResult,
  PasswordValidationResult,
  PhoneValidationResult,
  NameValidationResult,
  NAME_VALIDATION,
  EMAIL_VALIDATION,
  PHONE_VALIDATION,
  PASSWORD_VALIDATION
} from '../types/personal-info.types';
import { validatePasswordStrength } from '@/lib/validations/personal-info.validations';

/**
 * Validate first name or last name
 * @param name - Name to validate
 * @param fieldType - Type of name field
 * @returns Validation result
 */
export const validateName = (
  name: string, 
  fieldType: 'firstName' | 'lastName'
): NameValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return {
      isValid: false,
      error: `${fieldType === 'firstName' ? 'El nombre' : 'El apellido'} es requerido`
    };
  }

  if (trimmedName.length < NAME_VALIDATION.MIN_LENGTH) {
    return {
      isValid: false,
      error: `${fieldType === 'firstName' ? 'El nombre' : 'El apellido'} debe tener al menos ${NAME_VALIDATION.MIN_LENGTH} caracteres`
    };
  }

  if (trimmedName.length > NAME_VALIDATION.MAX_LENGTH) {
    return {
      isValid: false,
      error: `${fieldType === 'firstName' ? 'El nombre' : 'El apellido'} no puede exceder ${NAME_VALIDATION.MAX_LENGTH} caracteres`
    };
  }

  if (!NAME_VALIDATION.PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      error: `${fieldType === 'firstName' ? 'El nombre' : 'El apellido'} solo puede contener letras, espacios, apostrofes y guiones`
    };
  }

  // Check for suspicious patterns
  if (/(.)\1{3,}/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Formato de nombre inválido'
    };
  }

  return { isValid: true };
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Validation result
 */
export const validateEmailFormat = (email: string): EmailValidationResult => {
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!trimmedEmail) {
    return {
      isValid: false,
      isAvailable: null,
      error: 'El correo electrónico es requerido'
    };
  }

  if (trimmedEmail.length > EMAIL_VALIDATION.MAX_LENGTH) {
    return {
      isValid: false,
      isAvailable: null,
      error: `El correo electrónico no puede exceder ${EMAIL_VALIDATION.MAX_LENGTH} caracteres`
    };
  }

  if (!EMAIL_VALIDATION.PATTERN.test(trimmedEmail)) {
    return {
      isValid: false,
      isAvailable: null,
      error: 'Formato de correo electrónico inválido'
    };
  }

  // Check for suspicious patterns
  if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return {
      isValid: false,
      isAvailable: null,
      error: 'Formato de correo electrónico inválido'
    };
  }

  return {
    isValid: true,
    isAvailable: null // Will be checked separately via API
  };
};

/**
 * Check email availability via API
 * @param email - Email to check
 * @returns Promise with availability result
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!response.ok) {
      // Graceful fallback: do not spam console in non-critical check
      return true; // Assume available on error to not block registration
    }

    const result = await response.json();
    return result.available;
  } catch (_) {
    return true; // Assume available on network or server error
  }
};

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Validation result with formatted phone
 */
export const validatePhone = (phone: string): PhoneValidationResult => {
  const trimmedPhone = phone.trim();
  
  if (!trimmedPhone) {
    return {
      isValid: false,
      formatted: '',
      error: 'El número de teléfono es requerido'
    };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = trimmedPhone.replace(/\D/g, '');

  if (digitsOnly.length < PHONE_VALIDATION.MIN_LENGTH) {
    return {
      isValid: false,
      formatted: trimmedPhone,
      error: `El número de teléfono debe tener al menos ${PHONE_VALIDATION.MIN_LENGTH} dígitos`
    };
  }

  if (digitsOnly.length > PHONE_VALIDATION.MAX_LENGTH) {
    return {
      isValid: false,
      formatted: trimmedPhone,
      error: `El número de teléfono no puede exceder ${PHONE_VALIDATION.MAX_LENGTH} dígitos`
    };
  }

  // Acceptance: Venezuelan mobile 412/414/416/424/426 (with or without 58), or landline starting with 2
  const mobileVE = /^(412|414|416|424|426)\d{7}$/; // 10 digits
  const mobileVE58 = /^58(412|414|416|424|426)\d{7}$/; // 12 digits including 58
  const landlineVE = /^2\d{9}$/; // 10 digits starting with 2

  let formattedPhone = trimmedPhone;
  if (mobileVE.test(digitsOnly)) {
    formattedPhone = `+58 ${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
  } else if (mobileVE58.test(digitsOnly)) {
    formattedPhone = `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5, 8)} ${digitsOnly.substring(8)}`;
  } else if (landlineVE.test(digitsOnly)) {
    formattedPhone = `+58 ${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
  }

  const isValid = mobileVE.test(digitsOnly) || mobileVE58.test(digitsOnly) || landlineVE.test(digitsOnly);
  return {
    isValid,
    formatted: formattedPhone,
    error: isValid ? undefined : 'Debe ser un número venezolano válido'
  };
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with strength analysis
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  if (!password) {
    return {
      isValid: false,
      strength: { isValid: false, errors: ['La contraseña es requerida'], score: 0 },
      error: 'La contraseña es requerida'
    };
  }

  if (password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
    return {
      isValid: false,
      strength: { isValid: false, errors: [`Mínimo ${PASSWORD_VALIDATION.MIN_LENGTH} caracteres`], score: 0 },
      error: `La contraseña debe tener al menos ${PASSWORD_VALIDATION.MIN_LENGTH} caracteres`
    };
  }

  if (password.length > PASSWORD_VALIDATION.MAX_LENGTH) {
    return {
      isValid: false,
      strength: { isValid: false, errors: [`Máximo ${PASSWORD_VALIDATION.MAX_LENGTH} caracteres`], score: 0 },
      error: `La contraseña no puede exceder ${PASSWORD_VALIDATION.MAX_LENGTH} caracteres`
    };
  }

  const strength = validatePasswordStrength(password);
  
  return {
    isValid: strength.isValid,
    strength,
    error: strength.isValid ? undefined : 'La contraseña no cumple con los requisitos de seguridad'
  };
};

/**
 * Validate password confirmation
 * @param password - Original password
 * @param confirmPassword - Password confirmation
 * @returns Validation result
 */
export const validatePasswordConfirmation = (
  password: string, 
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: 'La confirmación de contraseña es requerida'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden'
    };
  }

  return { isValid: true };
};

/**
 * Comprehensive form validation
 * @param formData - Form data to validate
 * @returns Validation result with all errors
 */
export const validatePersonalInfoForm = (formData: PersonalInfoFormData) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'firstName');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error!;
    isValid = false;
  }

  // Validate last name
  const lastNameValidation = validateName(formData.lastName, 'lastName');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error!;
    isValid = false;
  }

  // Validate email format
  const emailValidation = validateEmailFormat(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
    isValid = false;
  }

  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
    isValid = false;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!;
    isValid = false;
  }

  // Validate password confirmation
  const confirmPasswordValidation = validatePasswordConfirmation(
    formData.password, 
    formData.confirmPassword
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error!;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Sanitize name input
 * @param name - Name to sanitize
 * @returns Sanitized name
 */
export const sanitizeName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\u00C0-\u017F'-]/g, '') // Remove invalid characters
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
};

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneDisplay = (phone: string): string => {
  const validation = validatePhone(phone);
  return validation.formatted || phone;
};

/**
 * Generate password strength message
 * @param strength - Password strength result
 * @returns Human-readable strength message
 */
export const getPasswordStrengthMessage = (strength: { score: number; isValid: boolean }): string => {
  if (!strength.isValid) {
    return 'Contraseña débil';
  }

  switch (strength.score) {
    case 0:
    case 1:
      return 'Contraseña muy débil';
    case 2:
      return 'Contraseña débil';
    case 3:
      return 'Contraseña moderada';
    case 4:
      return 'Contraseña fuerte';
    case 5:
      return 'Contraseña muy fuerte';
    default:
      return 'Contraseña evaluada';
  }
};
