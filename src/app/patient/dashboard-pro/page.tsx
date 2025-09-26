import { Suspense } from 'react';
import { ProfessionalDashboard } from '@/components/patient-dashboard/ProfessionalDashboard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProfessionalDashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login/pacientes');
  }

  // Verify user is a patient
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  const userType = profile?.user_type || user.user_metadata?.role || 'patient';
  
  if (userType !== 'patient') {
    redirect('/auth/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Cargando Dashboard Profesional...</h2>
            <p className="text-gray-500 mt-2">Preparando tu experiencia de salud personalizada</p>
          </div>
        </div>
      }>
        <ProfessionalDashboard user={user} />
      </Suspense>
    </div>
  );
}
