/**
 * Professional Info Step Component - Refactored
 * @fileoverview Main professional information step component using modular sub-components
 * @compliance HIPAA-compliant professional data collection with audit trail
 */

'use client';

import { useEffect } from 'react';
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

  // Exponer la función canSubmit globalmente para StepNavigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).professionalInfoFormValidation = {
        canSubmit: () => canSubmit
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).professionalInfoFormValidation;
      }
    };
  }, [canSubmit]);

  const handleSubmit = async () => {
    console.log('🔄 ProfessionalInfoStep.handleSubmit() llamado');
    console.log('📊 Estado actual del formulario:', {
      canSubmit,
      verificationStatus,
      isVerified,
      errors: Object.keys(errors).length,
      formData: {
        documentNumber: formData.documentNumber,
        university: formData.university,
        graduationYear: formData.graduationYear,
        medicalBoard: formData.medicalBoard,
        bio: formData.bio?.length || 0
      }
    });

    // Validar que la verificación esté completa antes de proceder
    if (!canSubmit) {
      let errorMessage = 'Debe completar la información requerida antes de continuar';
      
      // Mensajes de error específicos
      if (!formData.documentNumber || formData.documentNumber.trim().length < 9) {
        errorMessage = 'Debe ingresar una cédula válida (mínimo 9 caracteres)';
      } else if (!formData.university || formData.university.trim().length === 0) {
        errorMessage = 'Debe seleccionar su universidad de medicina';
      } else if (!formData.graduationYear || formData.graduationYear.trim().length === 0) {
        errorMessage = 'Debe ingresar su año de graduación';
      } else if (!formData.medicalBoard || formData.medicalBoard.trim().length === 0) {
        errorMessage = 'Debe seleccionar su colegio de médicos';
      } else if (!formData.bio || formData.bio.trim().length < 50) {
        errorMessage = 'Debe escribir una biografía profesional de al menos 50 caracteres';
      } else if (verificationStatus === 'verifying') {
        errorMessage = 'La verificación de su cédula está en proceso. Espere un momento...';
      } else if (verificationStatus === 'failed' || verificationStatus === 'error') {
        errorMessage = 'La verificación de su cédula falló. Verifique que los datos sean correctos';
      } else if (!isVerified) {
        errorMessage = 'Debe completar la verificación de su cédula antes de continuar';
      }
      
      console.log('❌ Validación falló:', errorMessage);
      onStepError?.('professional_info', errorMessage);
      return;
    }

    console.log('✅ Validación pasó, procediendo con submitForm()');
    const success = await submitForm();
    if (success && onNext) {
      console.log('✅ submitForm exitoso, llamando onNext()');
      onNext();
    } else {
      console.log('❌ submitForm falló');
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
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Información Profesional
            </h2>
            <p className="text-gray-600 text-lg">
              Complete su información profesional y académica para verificar su licencia médica
            </p>
          </div>
        </div>
      </div>


      {/* Formulario mejorado */}
      <div className="space-y-8">
        {/* Document Information Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Verificación de Identidad</h3>
          </div>
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
        </div>

        {/* Academic Information Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Académica</h3>
          </div>
          <AcademicInfoSection
            formData={formData}
            errors={errors}
            onFieldChange={handleInputChange}
          />
        </div>

        {/* Professional Details Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Detalles Profesionales</h3>
          </div>
          <ProfessionalDetailsSection
            formData={formData}
            errors={errors}
            onFieldChange={handleInputChange}
          />
        </div>
      </div>


      {/* Form Validation Errors mejorado */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Por favor corrija los siguientes errores:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Status Indicator mejorado */}
      {!canSubmit && Object.keys(errors).length === 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800">Información requerida:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-amber-700 text-sm">
                {(!formData.documentNumber || formData.documentNumber.trim().length < 9) && (
                  <li>Ingrese una cédula válida (mínimo 9 caracteres)</li>
                )}
                {(!formData.university || formData.university.trim().length === 0) && (
                  <li>Seleccione su universidad de medicina</li>
                )}
                {(!formData.graduationYear || formData.graduationYear.trim().length === 0) && (
                  <li>Ingrese su año de graduación</li>
                )}
                {(!formData.medicalBoard || formData.medicalBoard.trim().length === 0) && (
                  <li>Seleccione su colegio de médicos</li>
                )}
                {(!formData.bio || formData.bio.trim().length < 50) && (
                  <li>Escriba una biografía profesional de al menos 50 caracteres</li>
                )}
                {verificationStatus === 'verifying' && (
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>La verificación de su cédula está en proceso...</span>
                  </li>
                )}
                {(verificationStatus === 'failed' || verificationStatus === 'error') && (
                  <li>La verificación de su cédula falló. Verifique los datos</li>
                )}
                {verificationStatus === 'idle' && formData.documentNumber && formData.documentNumber.trim().length >= 9 && (
                  <li>Esperando verificación automática de la cédula...</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfessionalInfoStep;
