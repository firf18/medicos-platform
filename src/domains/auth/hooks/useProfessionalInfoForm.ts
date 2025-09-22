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
  VerificationStatus,
  DocumentType
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
    documentType: initialData.documentType || 'cedula_identidad',
    documentNumber: initialData.documentNumber || '',
    university: initialData.university || '',
    graduationYear: typeof initialData.graduationYear === 'string' 
      ? initialData.graduationYear 
      : initialData.graduationYear 
        ? `${initialData.graduationYear}` 
        : '',
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

      // Special handling when document type changes - clear document number
      if (field === 'documentType') {
        newData.documentType = value as DocumentType;
        newData.documentNumber = ''; // Clear document number when type changes
      } else if (field === 'documentNumber' && typeof value === 'string') {
        newData[field] = processDocumentNumber(value, prev.documentType);
      } else if (field === 'yearsOfExperience') {
        newData[field] = value as number;
      } else if (field === 'graduationYear') {
        newData[field] = value as string;
      } else {
        (newData as any)[field] = value;
      }

      return newData;
    });

    // Clear field-specific errors (separate from setState)
    if (errors[field]) {
      setErrors(prevErrors => {
        const { [field]: removed, ...rest } = prevErrors;
        return rest;
      });
    }

    // Clear verification when document type or number changes
    if (field === 'documentType' || field === 'documentNumber') {
      setVerificationStatus('idle');
      setVerificationResult(null);
    }

    // Update parent data (separate from setState)
    let processedValue = value;
    if (field === 'documentNumber' && typeof value === 'string') {
      processedValue = processDocumentNumber(value, formData.documentType);
    }
    
    // When document type changes, also clear document number in parent
    if (field === 'documentType') {
      onDataChange({
        documentType: processedValue as DocumentType,
        documentNumber: '' // Clear in parent too
      });
    } else {
      onDataChange({
        [field]: processedValue
      });
    }
  }, [errors, onDataChange, formData.documentType]);

  /**
   * Compare names for verification
   */
  const compareNames = useCallback((providedName: string, officialName: string) => {
    // Normalize names for comparison
    const normalize = (name: string) => 
      name.toLowerCase()
        .trim()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/\s+/g, ' ');

    const normalizedProvided = normalize(providedName);
    const normalizedOfficial = normalize(officialName);

    // Split into words to compare individual names
    const providedWords = normalizedProvided.split(' ').filter(word => word.length > 2);
    const officialWords = normalizedOfficial.split(' ').filter(word => word.length > 2);

    // Calculate match percentage
    let matches = 0;
    providedWords.forEach(providedWord => {
      if (officialWords.some(officialWord => 
        officialWord.includes(providedWord) || providedWord.includes(officialWord)
      )) {
        matches++;
      }
    });

    const confidence = matches / Math.max(providedWords.length, 1);
    const isMatch = confidence >= 0.6; // 60% threshold

    return {
      matches: isMatch,
      confidence,
      message: isMatch 
        ? 'Los nombres coinciden correctamente'
        : `Los nombres no coinciden. Oficial: ${officialName}. Verifique y corrija los nombres en el paso anterior.`
    };
  }, []);

  /**
   * Assign dashboard based on specialty
   */
  const assignDashboard = useCallback((specialty?: string, profession?: string) => {
    if (!specialty && !profession) {
      return {
        primaryDashboard: 'medicina-general',
        allowedDashboards: ['medicina-general'],
        reason: 'Dashboard por defecto - información incompleta',
        requiresApproval: false
      };
    }

    // Map specialties to dashboards
    const specialtyMap: Record<string, string> = {
      'MEDICINA INTERNA': 'medicina-interna',
      'CARDIOLOGIA': 'cardiologia',
      'PEDIATRIA': 'pediatria',
      'GINECOLOGIA': 'ginecologia',
      'DERMATOLOGIA': 'dermatologia',
      'NEUROLOGIA': 'neurologia',
      'PSIQUIATRIA': 'psiquiatria',
      'CIRUGIA': 'cirugia',
      'TRAUMATOLOGIA': 'traumatologia',
      'OFTALMOLOGIA': 'oftalmologia',
      'RADIOLOGIA': 'radiologia'
    };

    const specialtyKey = specialty?.toUpperCase() || '';
    const dashboardKey = Object.keys(specialtyMap).find(key => 
      specialtyKey.includes(key)
    );

    const primaryDashboard = dashboardKey ? specialtyMap[dashboardKey] : 'medicina-general';
    
    return {
      primaryDashboard,
      allowedDashboards: [primaryDashboard, 'medicina-general'], // Always include general
      reason: dashboardKey 
        ? `Dashboard asignado automáticamente por especialidad: ${specialty}`
        : 'Dashboard general - especialidad no reconocida',
      requiresApproval: false
    };
  }, []);

  /**
   * Trigger automatic license verification
   */
  const triggerLicenseVerification = useCallback(async (
    documentNumber: string,
    fullName?: string
  ) => {
    // Clear existing timeout
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    // Check if we need to verify
    const verificationKey = `${documentNumber}`;
    if (verificationKey === lastVerificationRef.current) {
      return; // Already verified this combination
    }

    // Basic validation before API call
    if (!documentNumber.trim()) {
      return;
    }

    // Set verification in progress
    setVerificationStatus('verifying');
    setVerificationResult(null);

    try {
      const result = await verifyMedicalLicense(
        documentNumber,
        fullName
      );

      // Perform name comparison if we have both names
      if (result.isValid && result.doctorName && fullName) {
        const nameComparison = compareNames(fullName, result.doctorName);
        (result as any).nameMatch = nameComparison;
        
        // Assign dashboard based on specialty
        const dashboardAccess = assignDashboard(result.specialty, result.profession);
        
        // Update analysis with our computed values
        result.analysis = {
          ...result.analysis,
          isValidMedicalProfessional: result.isValid,
          specialty: result.specialty || 'Medicina General',
          dashboardAccess,
          nameVerification: nameComparison,
          recommendations: []
        };
      }

      setVerificationResult(result);
      setVerificationStatus(result.isValid ? 'verified' : 'failed');
      lastVerificationRef.current = verificationKey;

      // Update parent data with verification results
      if (result.isValid && result.analysis) {
        // Verificación completada - resultado se maneja localmente en este hook
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
   * Debounced license verification with immediate SACS query
   */
  const debouncedVerification = useCallback((
    documentNumber: string,
    fullName?: string
  ) => {
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    verificationTimeoutRef.current = setTimeout(() => {
      // Only trigger if document number is complete and valid format
      if (documentNumber.length >= 9 && (documentNumber.startsWith('V-') || documentNumber.startsWith('E-'))) {
        triggerLicenseVerification(documentNumber, fullName);
      }
    }, 2000); // 2 second delay for SACS queries
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
    const { documentNumber } = formData;
    const fullName = `${initialData.firstName || ''} ${initialData.lastName || ''}`.trim();
    
    if (documentNumber && fullName) {
      debouncedVerification(documentNumber, fullName);
    }
  }, [formData.documentNumber, initialData.firstName, initialData.lastName, debouncedVerification]);

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
    canSubmit: (() => {
      const hasNoErrors = Object.keys(errors).length === 0;
      const isNotVerifying = verificationStatus !== 'verifying';
      const hasBasicData = formData.university && formData.graduationYear && formData.medicalBoard && 
                          formData.bio && formData.bio.length >= 50 && formData.documentNumber;
      
      // Debug logging
      console.log('[PROFESSIONAL_INFO_DEBUG]', {
        hasNoErrors,
        errorsCount: Object.keys(errors).length,
        errors: errors,
        verificationStatus,
        isNotVerifying,
        hasBasicData,
        formData: {
          university: !!formData.university,
          graduationYear: !!formData.graduationYear,
          medicalBoard: !!formData.medicalBoard,
          bio: formData.bio.length,
          documentNumber: !!formData.documentNumber
        },
        finalCanSubmit: hasNoErrors && isNotVerifying && hasBasicData
      });
      
      // Permitir avanzar si no hay errores, no está verificando y tiene datos básicos
      return hasNoErrors && isNotVerifying && hasBasicData;
    })()
  };
};
