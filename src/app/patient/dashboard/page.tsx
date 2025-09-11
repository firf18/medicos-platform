import { Suspense } from 'react';
import { PatientDashboardContent } from '@/components/patient-dashboard/PatientDashboardContent';
import { PatientDashboardSkeleton } from '@/components/patient-dashboard/PatientDashboardSkeleton';

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PatientDashboardSkeleton />}>
        <PatientDashboardContent />
      </Suspense>
    </div>
  );
}
