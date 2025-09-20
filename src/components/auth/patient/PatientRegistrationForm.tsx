/**
 * Patient Registration Form - Red-Salud Platform
 * 
 * Componente especializado para registro de pacientes.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth';
import { BaseRegistrationForm } from '../shared/BaseRegistrationForm';
import { PersonalInfoFields, type PersonalInfoData } from '../shared/PersonalInfoFields';
import { PatientHealthFields, type PatientHealthData } from './PatientHealthFields';
import { FormNavigationButtons } from '../shared/FormNavigationButtons';

interface PatientRegistrationData extends PersonalInfoData, PatientHealthData {}

export function PatientRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientRegistrationData>({
    // Información personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Información de salud
    dateOfBirth: '',
    bloodType: '',
    allergies: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();

  const handlePersonalInfoChange = (field: keyof PersonalInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleHealthInfoChange = (field: keyof PatientHealthData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePersonalInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un correo electrónico válido';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validatePersonalInfo()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validatePersonalInfo()) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    
    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: 'patient',
          // Información específica del paciente
          dateOfBirth: formData.dateOfBirth,
          bloodType: formData.bloodType,
          allergies: formData.allergies,
        }
      );
      
      if (signUpError) {
        setErrors({ general: signUpError.message || 'Error al crear la cuenta' });
        return;
      }
      
      // El AuthContext manejará la redirección después del registro exitoso
    } catch (err) {
      setErrors({ general: 'Ocurrió un error inesperado' });
      console.error('Patient registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoFields
            data={formData}
            onChange={handlePersonalInfoChange}
            errors={errors}
            disabled={isLoading}
          />
        );
      case 2:
        return (
          <PatientHealthFields
            data={formData}
            onChange={handleHealthInfoChange}
            errors={errors}
            disabled={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <BaseRegistrationForm
      title="Crear cuenta de paciente"
      subtitle="Únete a nuestra plataforma médica y accede a atención profesional"
      error={errors.general}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      {renderStepContent()}
      
      <FormNavigationButtons
        currentStep={currentStep}
        totalSteps={2}
        onPrevious={handlePrevStep}
        onNext={handleNextStep}
        isLoading={isLoading}
        nextButtonText={currentStep === 2 ? 'Crear cuenta' : 'Siguiente'}
        canGoNext={currentStep === 1 ? validatePersonalInfo() : true}
        canGoPrevious={currentStep > 1}
      />
    </BaseRegistrationForm>
  );
}
