'use client';

import { useAuth } from '@/features/auth/contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.user_metadata?.first_name || 'Paciente'}!
        </h1>
        <p className="mt-1 text-gray-600">
          Aquí puedes gestionar tus citas y acceder a tu historial médico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Próxima cita */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Próxima cita</h2>
          <div className="mt-4 text-center py-8 text-gray-500">
            No tienes citas programadas
          </div>
          <div className="mt-4">
            <a
              href="/patient/doctors"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Buscar médico
            </a>
          </div>
        </div>

        {/* Historial reciente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Historial reciente</h2>
          <div className="mt-4 text-center py-8 text-gray-500">
            No hay registros recientes
          </div>
          <div className="mt-4">
            <a
              href="/patient/medical-history"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver historial completo
            </a>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Acciones rápidas</h2>
          <div className="mt-4 space-y-3">
            <a
              href="/patient/doctors"
              className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              📅 Pedir cita
            </a>
            <a
              href="/patient/prescriptions"
              className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              💊 Ver recetas
            </a>
            <a
              href="/patient/profile"
              className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              👤 Ver perfil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
