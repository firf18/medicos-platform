'use client';

import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClinicStats } from '@/components/clinic-dashboard/ClinicStats';
import { DoctorsList } from '@/components/clinic-dashboard/DoctorsList';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  isAvailable: boolean;
}

export default function ClinicDashboardPage() {
  const { isAuthenticated, isClinic } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Redirigir si el usuario no está autenticado o no es una clínica
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isClinic) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isClinic, router]);

  // Simular carga de datos
  useEffect(() => {
    if (isAuthenticated && isClinic) {
      // Simular datos de médicos
      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Juan Pérez',
          specialty: 'Cardiología',
          phone: '+58 212-555-1234',
          email: 'juan.perez@clinic.com',
          isAvailable: true
        },
        {
          id: '2',
          name: 'Dra. María González',
          specialty: 'Pediatría',
          phone: '+58 212-555-5678',
          email: 'maria.gonzalez@clinic.com',
          isAvailable: false
        },
        {
          id: '3',
          name: 'Dr. Carlos Rodríguez',
          specialty: 'Dermatología',
          phone: '+58 212-555-9012',
          email: 'carlos.rodriguez@clinic.com',
          isAvailable: true
        }
      ];
      setDoctors(mockDoctors);
    }
  }, [isAuthenticated, isClinic]);

  if (!isAuthenticated || !isClinic) {
    return null; // O un componente de carga
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard de Clínica
          </h1>
          
          <ClinicStats 
            doctorsCount={12} 
            appointmentsCount={24} 
            clinicsCount={3} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DoctorsList doctors={doctors} />
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Citas Programadas</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Consulta General</p>
                      <p className="text-sm text-gray-600">Dr. Juan Pérez</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Hoy, 9:00 AM</p>
                      <p className="text-xs text-gray-500">Paciente: Ana Silva</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Revisión Pediátrica</p>
                      <p className="text-sm text-gray-600">Dra. María González</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Mañana, 10:30 AM</p>
                      <p className="text-xs text-gray-500">Paciente: Luis Martínez</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Notificaciones</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm">Nueva solicitud de asociación de Dr. Roberto Jiménez</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm">Recordatorio: Reunión de directivos mañana a las 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}