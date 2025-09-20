/**
 * Final Review Step Component - Refactored
 * @fileoverview Main component for final review step using modular sections
 * @compliance HIPAA-compliant registration review process
 */

'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle } from 'lucide-react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { getSpecialtyById } from '@/lib/medical-specialties';
import { useFinalReview } from '../../hooks/useFinalReview';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ProfessionalInfoSection } from './ProfessionalInfoSection';
import { VerificationSection } from './VerificationSection';
import { DashboardConfigSection } from './DashboardConfigSection';
import { AgreementSection } from './AgreementSection';
import TermsModal from '@/components/auth/doctor-registration/TermsModal';

interface FinalReviewStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'final_review') => void;
  onStepError: (step: 'final_review', error: string) => void;
  isLoading: boolean;
  onFinalSubmit?: () => Promise<void>;
}

export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  onFinalSubmit
}) => {
  const {
    agreements,
    modals,
    editingField,
    fieldValue,
    isSubmitting,
    handleAgreementChange,
    handleShowModal,
    handleCloseModal,
    startEditing,
    saveEditing,
    cancelEditing,
    handleSubmitRegistration,
    getCompletionStatus,
    canSubmit
  } = useFinalReview({
    data,
    updateData,
    onStepComplete,
    onStepError,
    onFinalSubmit
  });

  const specialty = getSpecialtyById(data.specialtyId);
  const completionStatus = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Revisión Final
        </h2>
        <p className="text-gray-600">
          Revisa toda tu información antes de completar el registro
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Completado</span>
          <span className="font-medium">{completionStatus.percentage}%</span>
        </div>
        <Progress value={completionStatus.percentage} className="h-2" />
        <p className="text-xs text-gray-500 text-center">
          {completionStatus.completedSections} de {completionStatus.totalSections} secciones completadas
        </p>
      </div>

      <Separator />

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <PersonalInfoSection
          data={data}
          editingField={editingField}
          fieldValue={fieldValue}
          onStartEdit={startEditing}
          onSaveEdit={saveEditing}
          onCancelEdit={cancelEditing}
        />

        {/* Professional Information */}
        <ProfessionalInfoSection
          data={data}
          specialty={specialty}
          onEdit={(field, value) => {
            updateData({ [field]: value });
          }}
        />

        {/* Verification Status */}
        <VerificationSection
          data={data}
          hasIdentityVerification={!!data.documentNumber}
          hasLicenseVerification={!!data.licenseNumber}
        />

        {/* Dashboard Configuration */}
        <DashboardConfigSection data={data} />

        <Separator />

        {/* Agreements */}
        <AgreementSection
          agreements={agreements}
          onAgreementChange={handleAgreementChange}
          onShowModal={handleShowModal}
        />

        {/* Submit Section */}
        <div className="pt-6 space-y-4">
          <Button
            onClick={handleSubmitRegistration}
            disabled={!canSubmit()}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando registro...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar Registro
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Al hacer clic en "Completar Registro", confirmas que toda la información 
            proporcionada es verídica y aceptas nuestros términos y condiciones.
          </p>
        </div>
      </div>

      {/* Modals */}
      <TermsModal 
        isOpen={modals.showTerms}
        onClose={() => handleCloseModal('showTerms')}
        type="terms"
      />
      <TermsModal 
        isOpen={modals.showPrivacy}
        onClose={() => handleCloseModal('showPrivacy')}
        type="privacy"
      />
      <TermsModal 
        isOpen={modals.showCompliance}
        onClose={() => handleCloseModal('showCompliance')}
        type="compliance"
      />
    </div>
  );
};
