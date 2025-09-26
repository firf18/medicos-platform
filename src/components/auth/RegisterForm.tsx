/**
 * ⚠️ REFACTORIZADO: Register Form - Red-Salud Platform
 * 
 * Este archivo ha sido refactorizado en componentes especializados por responsabilidad.
 * Mantiene compatibilidad hacia atrás mientras redirige a los nuevos componentes modulares.
 * 
 * @deprecated Usar componentes específicos por rol desde ./[role]/[Role]RegistrationForm.tsx
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PatientRegistrationForm } from './patient/PatientRegistrationForm';
import { RoleSelector, type UserRole } from './shared/RoleSelector';
import { BaseRegistrationForm } from './shared/BaseRegistrationForm';

/**
 * Componente principal de registro que determina qué formulario específico mostrar
 * basado en el rol seleccionado o la ruta actual.
 */
export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  // Detectar el rol desde los parámetros de URL o ruta
  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    const currentPath = window.location.pathname;

    if (roleParam && ['patient', 'doctor', 'clinic', 'laboratory'].includes(roleParam)) {
      setSelectedRole(roleParam);
    } else if (currentPath.includes('/doctor')) {
      setSelectedRole('doctor');
    } else if (currentPath.includes('/clinic')) {
      setSelectedRole('clinic');
    } else if (currentPath.includes('/laboratory')) {
      setSelectedRole('laboratory');
    }
  }, [searchParams]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    
    // Redirigir a la ruta específica del rol si existe
    const roleRoutes: Record<UserRole, string> = {
      patient: '/auth/register?role=patient',
      doctor: '/auth/register/doctor',
      clinic: '/auth/register/clinic',
      laboratory: '/auth/register/laboratory'
    };

    if (roleRoutes[role] !== window.location.pathname + window.location.search) {
      router.push(roleRoutes[role]);
    }
  };

  // Renderizar el formulario específico basado en el rol
  const renderRoleSpecificForm = () => {
    switch (selectedRole) {
      case 'patient':
        return <PatientRegistrationForm />;
      
      case 'doctor':
        // Redirigir al formulario especializado de médicos
        router.push('/auth/register/doctor');
        return (
          <BaseRegistrationForm
            title="Redirigiendo..."
            onSubmit={() => {}}
          >
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Redirigiendo al formulario de registro médico...</p>
            </div>
          </BaseRegistrationForm>
        );
      
      case 'clinic':
        // Redirigir al formulario especializado de clínicas
        router.push('/auth/register/clinic');
        return (
          <BaseRegistrationForm
            title="Redirigiendo..."
            onSubmit={() => {}}
          >
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Redirigiendo al formulario de registro de clínica...</p>
            </div>
          </BaseRegistrationForm>
        );
      
      case 'laboratory':
        // Redirigir al formulario especializado de laboratorios
        router.push('/auth/register/laboratory');
        return (
          <BaseRegistrationForm
            title="Redirigiendo..."
            onSubmit={() => {}}
          >
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Redirigiendo al formulario de registro de laboratorio...</p>
            </div>
          </BaseRegistrationForm>
        );
      
      default:
        // Mostrar selector de rol si no hay uno específico
        return (
          <BaseRegistrationForm
            title="Crear una cuenta"
            subtitle="Selecciona el tipo de cuenta que deseas crear"
            onSubmit={() => {}}
          >
            <RoleSelector
              selectedRole={selectedRole}
              onRoleChange={handleRoleChange}
            />
          </BaseRegistrationForm>
        );
    }
  };

  return renderRoleSpecificForm();
}

// Exportar tipos para compatibilidad
export type { UserRole } from './shared/RoleSelector';
