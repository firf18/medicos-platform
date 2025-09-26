import React from 'react';
import { LaboratoryRegistration } from '@/components/laboratory/LaboratoryRegistration';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro de Laboratorio | Platform Médicos',
  description: 'Registre su laboratorio médico en nuestra plataforma y forme parte de la red de laboratorios verificados de Venezuela.',
};

export default function LaboratoryRegisterPage() {
  return (
    <div className="min-h-screen">
      <LaboratoryRegistration 
        onSuccess={(registrationId) => {
          console.log('Registration successful:', registrationId);
        }}
        onError={(error) => {
          console.error('Registration error:', error);
        }}
      />
    </div>
  );
}
