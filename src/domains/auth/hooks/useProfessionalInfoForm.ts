/**
 * Professional Info Form Hook
 * @fileoverview Custom hook for managing professional info form state and validation
 * @compliance HIPAA-compliant form state management with audit logging
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import {
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  LicenseVerificationResult,
  VerificationStatus
} from '../types/professional-info.types';
import {
  validateProfessionalInfoForm,
  processDocumentNumber
} from '../utils/professional-info-validation';
import { verifyMedicalLicense } from '../services/license-verification.service';

interface UseProfessionalInfoFormProps {
  initialData: DoctorRegistrationData;
  onDataChange: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'professional_info') => void;
  onStepError: (step: 'professional_info', error: string) => void;
}

export const useProfessionalInfoForm = ({
  initialData,
  onDataChange,
  onStepComplete,
  onStepError
}: UseProfessionalInfoFormProps) => {
  // Form state
  const [formData, setFormData] = useState<ProfessionalInfoFormData>({
    yearsOfExperience: initialData.yearsOfExperience || 0,
    bio: initialData.bio || '',
    licenseNumber: initialData.licenseNumber || '',
    documentType: initialData.documentType || 'cedula_identidad',
    documentNumber: initialData.documentNumber || '',
    university: initialData.university || '',
    graduationYear: initialData.graduationYear || undefined,
    medicalBoard: initialData.medicalBoard || ''
  });

  // Validation state
  const [errors, setErrors] = useState<ProfessionalInfoFormErrors>({});
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<LicenseVerificationResult | null>(null);

  // Refs for managing verification
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVerificationRef = useRef<string>('');

  /**
   * Handle input changes with validation
   */
  const handleInputChange = useCallback((
    field: keyof ProfessionalInfoFormData,
    value: string | number
  ) => {
    setFormData(prev => {
      const newData = { ...prev };

      // Special handling for document number formatting
      if (field === 'documentNumber' && typeof value === 'string') {
        newData[field] = processDocumentNumber(value, prev.documentType);
      } else {
        newData[field] = value as any;
      }

      // Clear field-specific errors
      if (errors[field]) {
        setErrors(prevErrors => {
          const { [field]: removed, ...rest } = prevErrors;
          return rest;
        });
      }

      // Update parent data
      onDataChange({
        [field]: newData[field]
      });

      return newData;
    });
  }, [errors, onDataChange]);

  /**
   * Trigger automatic license verification
   */
  const triggerLicenseVerification = useCallback(async (
    documentNumber: string,
    licenseNumber: string,
    fullName?: string
  ) => {
    // Clear existing timeout
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    // Check if we need to verify
    const verificationKey = `${documentNumber}-${licenseNumber}`;
    if (verificationKey === lastVerificationRef.current) {
      return; // Already verified this combination
    }

    // Basic validation before API call
    if (!documentNumber.trim() || !licenseNumber.trim()) {
      return;
    }

    // Set verification in progress
    setVerificationStatus('verifying');
    setVerificationResult(null);

    try {
      const result = await verifyMedicalLicense(
        documentNumber,
        licenseNumber,
        fullName
      );

      setVerificationResult(result);
      setVerificationStatus(result.isValid ? 'verified' : 'failed');
      lastVerificationRef.current = verificationKey;

      // Update parent data with verification results
      if (result.isValid && result.analysis) {
        onDataChange({
          specialty: result.analysis.specialty,
          dashboardAccess: result.analysis.dashboardAccess,
          verificationResult: result
        });
      }

    } catch (error) {
      console.error('[PROFESSIONAL_INFO] Verification error:', error);
      setVerificationStatus('error');
      setVerificationResult({
        isValid: false,
        isVerified: false,
        error: 'Error durante la verificación. Intente nuevamente.'
      });
    }
  }, [onDataChange]);

  /**
   * Debounced license verification
   */
  const debouncedVerification = useCallback((
    documentNumber: string,
    licenseNumber: string,
    fullName?: string
  ) => {
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    verificationTimeoutRef.current = setTimeout(() => {
      triggerLicenseVerification(documentNumber, licenseNumber, fullName);
    }, 1500); // 1.5 second delay
  }, [triggerLicenseVerification]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const validation = validateProfessionalInfoForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onStepError('professional_info', firstError || 'Errores en el formulario');
      return false;
    }

    return true;
  }, [formData, onStepError]);

  /**
   * Submit form
   */
  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      return false;
    }

    try {
      // Final update to parent data
      onDataChange(formData);

      // Mark step as complete
      onStepComplete('professional_info');
      return true;

    } catch (error) {
      console.error('[PROFESSIONAL_INFO] Submit error:', error);
      onStepError('professional_info', 'Error al guardar la información profesional');
      return false;
    }
  }, [formData, validateForm, onDataChange, onStepComplete, onStepError]);

  /**
   * Reset verification state
   */
  const resetVerification = useCallback(() => {
    setVerificationStatus('idle');
    setVerificationResult(null);
    lastVerificationRef.current = '';
    
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }
  }, []);

  // Auto-trigger verification when document and license are available
  useEffect(() => {
    const { documentNumber, licenseNumber } = formData;
    const fullName = `${initialData.firstName || ''} ${initialData.lastName || ''}`.trim();
    
    if (documentNumber && licenseNumber && fullName) {
      debouncedVerification(documentNumber, licenseNumber, fullName);
    }
  }, [formData.documentNumber, formData.licenseNumber, initialData.firstName, initialData.lastName, debouncedVerification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Form state
    formData,
    errors,
    
    // Verification state
    verificationStatus,
    verificationResult,
    isVerifying: verificationStatus === 'verifying',
    isVerified: verificationStatus === 'verified' && verificationResult?.isValid,
    
    // Actions
    handleInputChange,
    validateForm,
    submitForm,
    resetVerification,
    triggerLicenseVerification,
    
    // Computed values
    isFormValid: Object.keys(errors).length === 0,
    canSubmit: Object.keys(errors).length === 0 && verificationStatus !== 'verifying'
  };
};
