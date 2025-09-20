/**
 * Final Review Hook
 * @fileoverview Hook for managing final review step state and actions
 * @compliance HIPAA-compliant registration review management
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { AgreementState, ModalState } from '../types/final-review.types';

interface UseFinalReviewProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'final_review') => void;
  onStepError: (step: 'final_review', error: string) => void;
  onFinalSubmit?: () => Promise<void>;
}

export const useFinalReview = ({
  data,
  updateData,
  onStepComplete,
  onStepError,
  onFinalSubmit
}: UseFinalReviewProps) => {
  const router = useRouter();
  const { signUp } = useAuth();

  // State for agreements
  const [agreements, setAgreements] = useState<AgreementState>({
    termsAccepted: false,
    privacyAccepted: false,
    complianceAccepted: false
  });

  // State for modals
  const [modals, setModals] = useState<ModalState>({
    showTerms: false,
    showPrivacy: false,
    showCompliance: false
  });

  // State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle agreement changes
  const handleAgreementChange = useCallback((
    type: keyof AgreementState,
    value: boolean
  ) => {
    setAgreements(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  // Handle modal visibility
  const handleShowModal = useCallback((type: keyof ModalState) => {
    setModals(prev => ({
      ...prev,
      [type]: true
    }));
  }, []);

  const handleCloseModal = useCallback((type: keyof ModalState) => {
    setModals(prev => ({
      ...prev,
      [type]: false
    }));
  }, []);

  // Handle inline editing
  const startEditing = useCallback((field: string, value: string) => {
    setEditingField(field);
    setFieldValue(value);
  }, []);

  const saveEditing = useCallback(() => {
    if (editingField) {
      updateData({ [editingField]: fieldValue });
      setEditingField(null);
      setFieldValue('');
    }
  }, [editingField, fieldValue, updateData]);

  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setFieldValue('');
  }, []);

  // Validation
  const validateAgreements = useCallback((): boolean => {
    const allAgreed = Object.values(agreements).every(value => value === true);
    
    if (!allAgreed) {
      onStepError('final_review', 'Debes aceptar todos los términos y condiciones');
      return false;
    }
    
    return true;
  }, [agreements, onStepError]);

  // Submit registration
  const handleSubmitRegistration = useCallback(async () => {
    if (!validateAgreements()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // If custom submit handler is provided, use it
      if (onFinalSubmit) {
        await onFinalSubmit();
        onStepComplete('final_review');
        return;
      }

      // Otherwise, perform default registration
      const { error } = await signUp(data.email, data.password, {
        full_name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        role: 'doctor',
        specialty_id: data.specialtyId,
        license_number: data.licenseNumber,
        years_of_experience: data.yearsOfExperience,
        bio: data.bio,
        university: data.university,
        graduation_year: data.graduationYear,
        medical_board: data.medicalBoard,
        document_type: data.documentType,
        document_number: data.documentNumber,
        working_hours: data.workingHours,
        selected_features: data.selectedFeatures,
        sub_specialties: data.subSpecialties,
        license_state: data.licenseState,
        license_expiry: data.licenseExpiry
      });

      if (error) {
        throw new Error(error.message || 'Error durante el registro');
      }

      // Mark step as complete
      onStepComplete('final_review');

      // Redirect to success page
      router.push('/auth/register/doctor/success');

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado durante el registro';
      
      onStepError('final_review', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateAgreements,
    onFinalSubmit,
    signUp,
    data,
    onStepComplete,
    router,
    onStepError
  ]);

  // Calculate completion status
  const getCompletionStatus = useCallback(() => {
    const sections = {
      personalInfo: !!(data.firstName && data.lastName && data.email && data.phone),
      professionalInfo: !!(data.specialtyId && data.licenseNumber && data.yearsOfExperience !== undefined),
      verification: !!(data.documentNumber),
      dashboardConfig: !!(data.selectedFeatures.length >= 0 && data.workingHours)
    };

    const completedSections = Object.values(sections).filter(Boolean).length;
    const totalSections = Object.keys(sections).length;

    return {
      sections,
      completedSections,
      totalSections,
      percentage: Math.round((completedSections / totalSections) * 100)
    };
  }, [data]);

  // Check if ready to submit
  const canSubmit = useCallback((): boolean => {
    const { percentage } = getCompletionStatus();
    const allAgreed = Object.values(agreements).every(value => value === true);
    
    return percentage === 100 && allAgreed && !isSubmitting;
  }, [getCompletionStatus, agreements, isSubmitting]);

  return {
    // State
    agreements,
    modals,
    editingField,
    fieldValue,
    isSubmitting,
    
    // Actions
    handleAgreementChange,
    handleShowModal,
    handleCloseModal,
    startEditing,
    saveEditing,
    cancelEditing,
    handleSubmitRegistration,
    
    // Utilities
    getCompletionStatus,
    canSubmit
  };
};
