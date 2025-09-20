/**
 * Specialized Registration Hook
 * @fileoverview Hook for managing specialized user registration forms
 * @compliance HIPAA-compliant registration state management
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth';
import { AUTH_ROUTES } from '@/lib/routes';
import {
  UserType,
  SpecializedRegistrationData,
  RegistrationFormErrors,
  USER_TYPE_CONFIG
} from '../types/specialized-registration.types';
import {
  validateRegistrationData,
  sanitizeRegistrationData,
  isFormReadyForSubmission
} from '../utils/specialized-registration-validation';

interface UseSpecializedRegistrationProps {
  initialUserType?: UserType;
  onSuccess?: (userType: UserType, userId: string) => void;
  onError?: (error: string) => void;
}

export const useSpecializedRegistration = ({
  initialUserType = 'patient',
  onSuccess,
  onError
}: UseSpecializedRegistrationProps = {}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  // Form state
  const [userType, setUserType] = useState<UserType>(initialUserType);
  const [formData, setFormData] = useState<Partial<SpecializedRegistrationData>>({});
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for field validation
  const touchedFieldsRef = useRef<Set<string>>(new Set());
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle user type change
   */
  const handleUserTypeChange = useCallback((newUserType: UserType) => {
    setUserType(newUserType);
    // Clear form data and errors when switching user type
    setFormData({});
    setErrors({});
    touchedFieldsRef.current.clear();
  }, []);

  /**
   * Handle field change
   */
  const handleFieldChange = useCallback((
    field: keyof SpecializedRegistrationData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field as keyof RegistrationFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof RegistrationFormErrors];
        return newErrors;
      });
    }

    // Debounced validation for touched fields
    if (touchedFieldsRef.current.has(field)) {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        validateField(field);
      }, 500);
    }
  }, [errors, userType]);

  /**
   * Handle field blur
   */
  const handleFieldBlur = useCallback((field: keyof SpecializedRegistrationData) => {
    touchedFieldsRef.current.add(field);
    validateField(field);
  }, [userType, formData]);

  /**
   * Validate single field
   */
  const validateField = useCallback((field: keyof SpecializedRegistrationData) => {
    const validation = validateRegistrationData(userType, formData);
    
    if (validation.errors[field as keyof RegistrationFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: validation.errors[field as keyof RegistrationFormErrors]
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof RegistrationFormErrors];
        return newErrors;
      });
    }
  }, [userType, formData]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const validation = validateRegistrationData(userType, formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Find first error field and focus
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
      }
      
      toast({
        title: 'Formulario incompleto',
        description: 'Por favor corrige los errores antes de continuar',
        variant: 'destructive'
      });
      
      return false;
    }
    
    return true;
  }, [userType, formData, toast]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sanitize data
      const sanitizedData = sanitizeRegistrationData(userType, formData as SpecializedRegistrationData);
      
      // Prepare metadata based on user type
      const metadata: Record<string, any> = {
        role: userType,
        registrationSource: 'specialized_form'
      };
      
      // Add user-type specific metadata
      switch (userType) {
        case 'patient':
          metadata.dateOfBirth = sanitizedData.dateOfBirth;
          metadata.emergencyContactName = sanitizedData.emergencyContactName;
          metadata.emergencyContactPhone = sanitizedData.emergencyContactPhone;
          break;
          
        case 'doctor':
          metadata.licenseNumber = sanitizedData.licenseNumber;
          metadata.specialtyId = sanitizedData.specialtyId;
          metadata.yearsOfExperience = sanitizedData.yearsOfExperience;
          break;
          
        case 'clinic':
          metadata.clinicName = sanitizedData.clinicName;
          metadata.address = sanitizedData.address;
          metadata.city = sanitizedData.city;
          metadata.state = sanitizedData.state;
          break;
          
        case 'laboratory':
          metadata.labName = sanitizedData.labName;
          metadata.address = sanitizedData.address;
          metadata.city = sanitizedData.city;
          metadata.state = sanitizedData.state;
          metadata.certifications = sanitizedData.certifications;
          break;
      }
      
      // Perform registration
      const { user, error } = await signUp(
        sanitizedData.email,
        sanitizedData.password,
        metadata
      );
      
      if (error) {
        throw new Error(error.message || 'Error durante el registro');
      }
      
      if (!user) {
        throw new Error('No se pudo crear el usuario');
      }
      
      // Success handling
      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada exitosamente',
        variant: 'default'
      });
      
      // Call success callback
      onSuccess?.(userType, user.id);
      
      // Redirect to appropriate dashboard
      const redirectPath = USER_TYPE_CONFIG[userType].redirectPath;
      router.push(redirectPath);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado durante el registro';
      
      toast({
        title: 'Error de registro',
        description: errorMessage,
        variant: 'destructive'
      });
      
      onError?.(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  }, [userType, formData, validateForm, signUp, toast, router, onSuccess, onError]);

  /**
   * Get form completion percentage
   */
  const getCompletionPercentage = useCallback((): number => {
    const requiredFields = getRequiredFields(userType);
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof SpecializedRegistrationData];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [userType, formData]);

  /**
   * Get required fields for user type
   */
  const getRequiredFields = (type: UserType): string[] => {
    const baseFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    
    switch (type) {
      case 'patient':
        return [...baseFields, 'dateOfBirth'];
        
      case 'doctor':
        return [...baseFields, 'licenseNumber', 'specialtyId'];
        
      case 'clinic':
        return [...baseFields, 'clinicName', 'address', 'city', 'state', 'phone'];
        
      case 'laboratory':
        return [...baseFields, 'labName', 'address', 'city', 'state', 'phone'];
        
      default:
        return baseFields;
    }
  };

  /**
   * Check if form can be submitted
   */
  const canSubmit = useCallback((): boolean => {
    return isFormReadyForSubmission(userType, formData) && !isLoading;
  }, [userType, formData, isLoading]);

  return {
    // State
    userType,
    formData,
    errors,
    isLoading,
    
    // Actions
    handleUserTypeChange,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    validateForm,
    
    // Utilities
    getCompletionPercentage,
    canSubmit,
    
    // Constants
    userTypeConfig: USER_TYPE_CONFIG[userType]
  };
};
