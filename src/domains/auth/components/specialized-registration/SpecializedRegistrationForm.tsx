/**
 * Specialized Registration Form Component
 * @fileoverview Main component that integrates all user-type specific registration forms
 * @compliance HIPAA-compliant multi-user type registration
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, UserPlus, Building, FlaskConical, Heart } from 'lucide-react';
import Link from 'next/link';
import { AUTH_ROUTES } from '@/lib/routes';
import { UserType, USER_TYPE_CONFIG } from '../../types/specialized-registration.types';
import { useSpecializedRegistration } from '../../hooks/useSpecializedRegistration';
import { PatientRegistrationForm } from './PatientRegistrationForm';
import { DoctorRegistrationForm } from './DoctorRegistrationForm';
import { ClinicRegistrationForm } from './ClinicRegistrationForm';
import { LaboratoryRegistrationForm } from './LaboratoryRegistrationForm';

// Mock specialties data - should be fetched from API
const MEDICAL_SPECIALTIES = [
  { id: '1', name: 'Medicina General' },
  { id: '2', name: 'Cardiología' },
  { id: '3', name: 'Pediatría' },
  { id: '4', name: 'Ginecología' },
  { id: '5', name: 'Traumatología' },
  { id: '6', name: 'Dermatología' },
  { id: '7', name: 'Oftalmología' },
  { id: '8', name: 'Psiquiatría' },
  { id: '9', name: 'Neurología' },
  { id: '10', name: 'Medicina Interna' }
];

interface SpecializedRegistrationFormProps {
  initialUserType?: UserType;
  onSuccess?: (userType: UserType, userId: string) => void;
  onError?: (error: string) => void;
}

export const SpecializedRegistrationForm: React.FC<SpecializedRegistrationFormProps> = ({
  initialUserType = 'patient',
  onSuccess,
  onError
}) => {
  const {
    userType,
    formData,
    errors,
    isLoading,
    handleUserTypeChange,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    getCompletionPercentage,
    canSubmit,
    userTypeConfig
  } = useSpecializedRegistration({
    initialUserType,
    onSuccess,
    onError
  });

  const completionPercentage = getCompletionPercentage();

  // Icons for user types
  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case 'patient':
        return <Heart className="h-5 w-5" />;
      case 'doctor':
        return <UserPlus className="h-5 w-5" />;
      case 'clinic':
        return <Building className="h-5 w-5" />;
      case 'laboratory':
        return <FlaskConical className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Link 
            href={AUTH_ROUTES.REGISTER} 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a opciones de registro
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {userTypeConfig.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getUserTypeIcon(userType)}
              </div>
            </div>
            <CardDescription>
              {userTypeConfig.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de Usuario</Label>
              <Select
                value={userType}
                onValueChange={(value) => handleUserTypeChange(value as UserType)}
                disabled={isLoading}
              >
                <SelectTrigger id="userType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Paciente
                    </div>
                  </SelectItem>
                  <SelectItem value="doctor">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Médico
                    </div>
                  </SelectItem>
                  <SelectItem value="clinic">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Clínica
                    </div>
                  </SelectItem>
                  <SelectItem value="laboratory">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Laboratorio
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso del formulario</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            {/* Dynamic Form Based on User Type */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {userType === 'patient' && (
                <PatientRegistrationForm
                  data={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                />
              )}

              {userType === 'doctor' && (
                <DoctorRegistrationForm
                  data={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  specialties={MEDICAL_SPECIALTIES}
                />
              )}

              {userType === 'clinic' && (
                <ClinicRegistrationForm
                  data={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                />
              )}

              {userType === 'laboratory' && (
                <LaboratoryRegistrationForm
                  data={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                />
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit() || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </div>
            </form>

            {/* Terms and Privacy */}
            <p className="text-xs text-center text-gray-500">
              Al registrarte, aceptas nuestros{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Política de Privacidad
              </Link>
            </p>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link href={AUTH_ROUTES.LOGIN} className="text-blue-600 hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
