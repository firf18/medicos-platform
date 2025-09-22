'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { getSpecialtyById } from '@/lib/medical-specialties/specialty-utils';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Redirigir al dashboard específico según el tipo de usuario y especialidad
    if (user.role === 'doctor') {
      const specialtyId = user.specialtyId;
      const specialty = getSpecialtyById(specialtyId);
      
      if (specialty) {
        // Redirigir al dashboard específico de la especialidad
        router.push(`/dashboard/${specialtyId}`);
      } else {
        // Si no hay especialidad definida, ir a medicina general por defecto
        router.push('/dashboard/medicina-general');
      }
    } else if (user.role === 'patient') {
      router.push('/patient/dashboard');
    } else if (user.role === 'clinic') {
      router.push('/clinic/dashboard');
    } else if (user.role === 'laboratory') {
      router.push('/laboratory/dashboard');
    } else {
      // Rol no reconocido, redirigir a login
      router.push('/auth/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}