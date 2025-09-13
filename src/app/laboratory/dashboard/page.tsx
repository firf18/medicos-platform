'use client';

import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LaboratoryStats } from '@/components/laboratory-dashboard/LaboratoryStats';
import { TestResultsList } from '@/components/laboratory-dashboard/TestResultsList';

interface TestResult {
  id: string;
  patientName: string;
  testName: string;
  date: string;
  status: 'pending' | 'completed' | 'critical';
  isCritical: boolean;
}

export default function LaboratoryDashboardPage() {
  const { isAuthenticated, isLaboratory } = useAuth();
  const router = useRouter();
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    // Redirigir si el usuario no está autenticado o no es un laboratorio
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isLaboratory) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLaboratory, router]);

  // Simular carga de datos
  useEffect(() => {
    if (isAuthenticated && isLaboratory) {
      // Simular datos de resultados de pruebas
      const mockResults: TestResult[] = [
        {
          id: '1',
          patientName: 'Ana Silva',
          testName: 'Hemograma completo',
          date: '2025-09-10',
          status: 'completed',
          isCritical: false
        },
        {
          id: '2',
          patientName: 'Luis Martínez',
          testName: 'Perfil lipídico',
          date: '2025-09-10',
          status: 'pending',
          isCritical: false
        },
        {
          id: '3',
          patientName: 'Carlos Rodríguez',
          testName: 'Prueba de función hepática',
          date: '2025-09-09',
          status: 'critical',
          isCritical: true
        },
        {
          id: '4',
          patientName: 'María González',
          testName: 'Examen de orina',
          date: '2025-09-09',
          status: 'completed',
          isCritical: false
        }
      ];
      setTestResults(mockResults);
    }
  }, [isAuthenticated, isLaboratory]);

  if (!isAuthenticated || !isLaboratory) {
    return null; // O un componente de carga
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard de Laboratorio
          </h1>
          
          <LaboratoryStats 
            testResultsCount={127} 
            pendingRequestsCount={8} 
            todayTestsCount={15} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TestResultsList results={testResults} />
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Solicitudes Recientes</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Solicitud de Dr. Juan Pérez</p>
                      <p className="text-sm text-gray-600">Hemograma completo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Hace 2 horas</p>
                      <p className="text-xs text-gray-500">Paciente: Ana Silva</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Solicitud de Dra. María González</p>
                      <p className="text-sm text-gray-600">Perfil lipídico</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Hace 1 día</p>
                      <p className="text-xs text-gray-500">Paciente: Luis Martínez</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Equipo y Calibración</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm">Todos los equipos están calibrados y funcionando correctamente</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm">Próxima calibración: Analizador automático de química clínica - 15/09/2025</p>
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