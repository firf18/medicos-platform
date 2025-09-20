/**
 * Role Selector Component - Red-Salud Platform
 * 
 * Componente especializado para selección de rol de usuario médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { useRouter } from 'next/navigation';

export type UserRole = 'patient' | 'doctor' | 'clinic' | 'laboratory';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  redirectPath?: string;
}

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'patient',
    title: 'Paciente',
    description: 'Buscar y agendar citas con médicos'
  },
  {
    role: 'doctor',
    title: 'Médico',
    description: 'Atender pacientes y gestionar citas',
    redirectPath: '/auth/register/doctor'
  },
  {
    role: 'clinic',
    title: 'Clínica',
    description: 'Gestionar múltiples médicos y servicios',
    redirectPath: '/auth/register/clinic'
  },
  {
    role: 'laboratory',
    title: 'Laboratorio',
    description: 'Procesar exámenes y entregar resultados',
    redirectPath: '/auth/register/laboratory'
  }
];

export function RoleSelector({ selectedRole, onRoleChange, disabled = false }: RoleSelectorProps) {
  const router = useRouter();

  const handleRoleClick = (role: UserRole, redirectPath?: string) => {
    if (disabled) return;
    
    onRoleChange(role);
    
    // Si el rol tiene una ruta específica, redirigir
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  return (
    <div className="sm:col-span-6">
      <label className="block text-sm font-medium text-gray-700 mb-4">
        Tipo de cuenta
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLE_OPTIONS.map((option) => (
          <div
            key={option.role}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
              selectedRole === option.role
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                : 'border-gray-300 bg-white hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRoleClick(option.role, option.redirectPath)}
          >
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id={`${option.role}-role`}
                  name="role"
                  type="radio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={selectedRole === option.role}
                  onChange={() => {}}
                  disabled={disabled}
                />
              </div>
              <label htmlFor={`${option.role}-role`} className="ml-3">
                <span className="block text-sm font-medium text-gray-700">
                  {option.title}
                </span>
                <span className="block text-sm text-gray-500">
                  {option.description}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
