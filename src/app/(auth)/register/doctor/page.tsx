import DoctorRegistrationWizard from '@/components/auth/doctor-registration/DoctorRegistrationWizard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro de Médico - Red-Salud',
  description: 'Regístrate como médico en Red-Salud para comenzar a atender pacientes',
};

export default function DoctorRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorRegistrationWizard />
    </div>
  );
}