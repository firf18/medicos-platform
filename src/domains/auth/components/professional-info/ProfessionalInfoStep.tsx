/**
 * Professional Info Step Component - Refactored
 * @fileoverview Main professional information step component using modular sub-components
 * @compliance HIPAA-compliant professional data collection with audit trail
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { ProfessionalInfoStepProps } from '../../types/professional-info.types';
import { useProfessionalInfoForm } from '../../hooks/useProfessionalInfoForm';
import { DocumentInfoSection } from './DocumentInfoSection';
import { AcademicInfoSection } from './AcademicInfoSection';
import { ProfessionalDetailsSection } from './ProfessionalDetailsSection';
import { generateVerificationSummary } from '../../services/license-verification.service';

export const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  onNext,
  onPrevious
}) => {
  const {
    formData,
    errors,
    verificationStatus,
    verificationResult,
    isVerifying,
    isVerified,
    handleInputChange,
    validateForm,
    submitForm,
    canSubmit
  } = useProfessionalInfoForm({
    initialData: data,
    onDataChange: updateData,
    onStepComplete,
    onStepError
  });

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success && onNext) {
      onNext();
    }
  };

  const getVerificationStatusIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <Clock className="h-4 w-4 animate-pulse" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getVerificationMessage = () => {
    if (!verificationResult) return null;
    
    if (verificationResult.isValid && verificationResult.isVerified) {
      return generateVerificationSummary(verificationResult);
    }
    
    return verificationResult.error || 'Verificación pendiente';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Información Profesional
        </h2>
        <p className="text-gray-600">
          Complete su información profesional y académica para verificar su licencia médica
        </p>
      </div>


      {/* Document Information Section */}
      <DocumentInfoSection
        formData={formData}
        errors={errors}
        onFieldChange={handleInputChange}
        isVerifying={isVerifying}
        verificationStatus={{
          isValid: isVerified,
          isVerifying: isVerifying,
          message: getVerificationMessage() || undefined,
          severity: verificationResult?.isValid ? 'success' : 'error'
        }}
        verificationResult={verificationResult}
      />

      {/* Academic Information Section */}
      <AcademicInfoSection
        formData={formData}
        errors={errors}
        onFieldChange={handleInputChange}
      />

      {/* Professional Details Section */}
      <ProfessionalDetailsSection
        formData={formData}
        errors={errors}
        onFieldChange={handleInputChange}
      />


      {/* Form Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p><strong>Por favor corrija los siguientes errores:</strong></p>
            <ul className="list-disc list-inside mt-2">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProfessionalInfoStep;
