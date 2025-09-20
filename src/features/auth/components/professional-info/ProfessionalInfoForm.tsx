/**
 * Componente Principal de Información Profesional - Refactorizado
 * 
 * Componente optimizado que coordina los diferentes aspectos
 * de la información profesional del médico.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Award, Building } from 'lucide-react';

// Componentes especializados
import { EducationFields } from './EducationFields';
import { LicenseFields } from './LicenseFields';
import { ExperienceFields } from './ExperienceFields';
import { BiographyField } from './BiographyField';

// Hook y tipos
import { useProfessionalInfoForm } from '../../hooks/useProfessionalInfoForm';
import type { StepComponentProps } from '../../types/doctor-registration';

export const ProfessionalInfoForm: React.FC<StepComponentProps> = ({
  data,
  onDataChange,
  onStepComplete,
  onStepError,
  formErrors,
  isLoading = false
}) => {
  const {
    formData,
    fieldTouched,
    validationErrors,
    handleInputChange,
    handleFieldBlur,
    validateAllFields,
    isFormValid
  } = useProfessionalInfoForm({
    initialData: data,
    onDataChange,
    onStepComplete,
    onStepError,
    formErrors
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
          <GraduationCap className="h-6 w-6 mr-2" />
          Información Profesional
        </h2>
        <p className="text-gray-600 mt-2">
          Proporciona detalles sobre tu formación y experiencia médica
        </p>
      </div>

      {/* Información Educativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Formación Académica
          </CardTitle>
          <CardDescription>
            Información sobre tu educación médica y universidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EducationFields
            formData={formData}
            fieldTouched={fieldTouched}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onFieldBlur={handleFieldBlur}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Información de Licencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Licencia Médica
          </CardTitle>
          <CardDescription>
            Detalles de tu licencia profesional y colegiación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LicenseFields
            formData={formData}
            fieldTouched={fieldTouched}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onFieldBlur={handleFieldBlur}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Experiencia Profesional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Experiencia Profesional
          </CardTitle>
          <CardDescription>
            Tu trayectoria y experiencia en el campo médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExperienceFields
            formData={formData}
            fieldTouched={fieldTouched}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onFieldBlur={handleFieldBlur}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Biografía Profesional */}
      <Card>
        <CardHeader>
          <CardTitle>Biografía Profesional</CardTitle>
          <CardDescription>
            Describe brevemente tu experiencia y enfoque médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BiographyField
            formData={formData}
            fieldTouched={fieldTouched}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onFieldBlur={handleFieldBlur}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Información de Seguridad */}
      <Alert className="border-blue-200 bg-blue-50">
        <Award className="h-4 w-4" />
        <AlertDescription className="text-blue-800">
          <span className="font-medium">Verificación profesional:</span> Toda la información será 
          verificada con los organismos competentes (MPPS, Colegios de Médicos) para garantizar 
          la autenticidad de las credenciales.
        </AlertDescription>
      </Alert>

      {/* Debug Info - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Form Valid: {isFormValid ? 'Yes' : 'No'}</p>
          <p>Errors: {Object.keys(validationErrors).length}</p>
          <p>Touched Fields: {Object.keys(fieldTouched).filter(k => fieldTouched[k]).length}</p>
        </div>
      )}
    </div>
  );
};