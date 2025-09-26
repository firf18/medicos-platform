'use client';

import { useState, useEffect } from 'react';

// Validation utilities for Venezuelan data
export const useVenezuelanValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate RIF format
  const validateRIF = (rif: string): boolean => {
    const rifRegex = /^[JGVEP]-[0-9]{8}-[0-9]$/;
    return rifRegex.test(rif);
  };

  // Validate Venezuelan phone number
  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Venezuelan phone numbers: +58 + area code + number
    // Area codes: 2xx (Caracas, Miranda, Vargas), 2xx (other states)
    // Mobile: 4xx, 5xx
    const phoneRegex = /^(\+?58)?[2-5][0-9]{8}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Validate Venezuelan postal code
  const validatePostalCode = (postalCode: string): boolean => {
    // Venezuelan postal codes are 4 digits
    const postalRegex = /^[0-9]{4}$/;
    return postalRegex.test(postalCode);
  };

  // Validate Venezuelan states
  const validateState = (state: string): boolean => {
    const venezuelanStates = [
      'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
      'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
      'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
      'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
    ];
    return venezuelanStates.includes(state);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validate laboratory name
  const validateLaboratoryName = (name: string): boolean => {
    // Must be at least 2 characters, no special characters except spaces, hyphens, and periods
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\-\.]{2,100}$/;
    return nameRegex.test(name.trim());
  };

  // Validate address
  const validateAddress = (address: string): boolean => {
    // Must be at least 10 characters
    return address.trim().length >= 10;
  };

  // Validate city
  const validateCity = (city: string): boolean => {
    // Must be at least 2 characters, only letters and spaces
    const cityRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
    return cityRegex.test(city.trim());
  };

  // Validate website URL
  const validateWebsite = (website: string): boolean => {
    if (!website) return true; // Optional field
    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(website);
  };

  // Validate file upload
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo es demasiado grande. Máximo 10MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido. Use PDF, JPG, PNG, DOC o DOCX.' };
    }

    return { valid: true };
  };

  // Validate complete laboratory registration
  const validateLaboratoryRegistration = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!data.email || !validateEmail(data.email)) {
      errors.email = 'Email válido es requerido';
    }

    if (!data.laboratory_name || !validateLaboratoryName(data.laboratory_name)) {
      errors.laboratory_name = 'Nombre del laboratorio es requerido (2-100 caracteres)';
    }

    if (!data.legal_name || !validateLaboratoryName(data.legal_name)) {
      errors.legal_name = 'Nombre legal es requerido (2-100 caracteres)';
    }

    if (!data.rif || !validateRIF(data.rif)) {
      errors.rif = 'RIF válido es requerido (formato: J-12345678-9)';
    }

    if (!data.address || !validateAddress(data.address)) {
      errors.address = 'Dirección es requerida (mínimo 10 caracteres)';
    }

    if (!data.city || !validateCity(data.city)) {
      errors.city = 'Ciudad es requerida (2-50 caracteres)';
    }

    if (!data.state || !validateState(data.state)) {
      errors.state = 'Estado válido es requerido';
    }

    // Optional fields
    if (data.phone && !validatePhone(data.phone)) {
      errors.phone = 'Número de teléfono venezolano válido es requerido';
    }

    if (data.website && !validateWebsite(data.website)) {
      errors.website = 'URL de sitio web válida es requerida';
    }

    if (data.postal_code && !validatePostalCode(data.postal_code)) {
      errors.postal_code = 'Código postal válido es requerido (4 dígitos)';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Real-time validation
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        return !validateEmail(value) ? 'Email inválido' : null;
      case 'rif':
        return !validateRIF(value) ? 'RIF inválido (formato: J-12345678-9)' : null;
      case 'phone':
        return !validatePhone(value) ? 'Teléfono venezolano inválido' : null;
      case 'website':
        return !validateWebsite(value) ? 'URL inválida' : null;
      case 'postal_code':
        return !validatePostalCode(value) ? 'Código postal inválido (4 dígitos)' : null;
      case 'laboratory_name':
        return !validateLaboratoryName(value) ? 'Nombre inválido (2-100 caracteres)' : null;
      case 'legal_name':
        return !validateLaboratoryName(value) ? 'Nombre legal inválido (2-100 caracteres)' : null;
      case 'address':
        return !validateAddress(value) ? 'Dirección muy corta (mínimo 10 caracteres)' : null;
      case 'city':
        return !validateCity(value) ? 'Ciudad inválida (2-50 caracteres)' : null;
      case 'state':
        return !validateState(value) ? 'Estado inválido' : null;
      default:
        return null;
    }
  };

  // Format RIF input
  const formatRIF = (value: string): string => {
    // Remove all non-alphanumeric characters
    const clean = value.replace(/[^JGVEP0-9]/g, '').toUpperCase();
    
    if (clean.length === 0) return '';
    
    let formatted = clean[0]; // First character (J, G, V, E, or P)
    
    if (clean.length > 1) {
      formatted += '-' + clean.slice(1, 9); // 8 digits
    }
    
    if (clean.length > 9) {
      formatted += '-' + clean.slice(9, 10); // Last digit
    }
    
    return formatted;
  };

  // Format phone input
  const formatPhone = (value: string): string => {
    // Remove all non-digit characters
    const clean = value.replace(/\D/g, '');
    
    if (clean.length === 0) return '';
    
    // Add +58 prefix if not present
    let formatted = clean.startsWith('58') ? '+' + clean : 
                   clean.startsWith('58') ? '+' + clean : 
                   '+58' + clean;
    
    // Format as +58-XXX-XXXXXXX
    if (formatted.length > 3) {
      formatted = formatted.slice(0, 3) + '-' + formatted.slice(3, 6) + '-' + formatted.slice(6, 13);
    }
    
    return formatted;
  };

  return {
    validationErrors,
    setValidationErrors,
    validateRIF,
    validatePhone,
    validatePostalCode,
    validateState,
    validateEmail,
    validateLaboratoryName,
    validateAddress,
    validateCity,
    validateWebsite,
    validateFile,
    validateLaboratoryRegistration,
    validateField,
    formatRIF,
    formatPhone,
  };
};

// Hook for form validation with real-time feedback
export const useFormValidation = (initialValues: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { validateField } = useVenezuelanValidation();

  const handleChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(values).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
  };
};
