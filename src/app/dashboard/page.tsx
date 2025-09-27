'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user } = useAuth();
  const { doctorProfile, specialty, isLoading, isDoctor } = useDoctorAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Redirigir según el tipo de usuario
    if (user.role === 'doctor' || isDoctor) {
      if (specialty) {
        // Redirigir al dashboard específico de la especialidad
        const specialtyRoute = specialty.id === 'medicina_general' 
          ? 'medicina-general' 
          : specialty.id;
        router.push(`/dashboard/${specialtyRoute}`);
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
  }, [user, doctorProfile, specialty, isLoading, isDoctor, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}