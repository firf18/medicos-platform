'use client';

import { Suspense } from 'react';
import PatientsSection from '@/components/dashboard/sections/PatientsSection';
import { useAuth } from '@/features/auth/contexts/AuthContext';

export default function DoctorPatientsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // El middleware se encargará de redirigir
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }>
          <PatientsSection />
        </Suspense>
      </div>
    </div>
  );
}