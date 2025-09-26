'use client';

import { useAuth } from '@/providers/auth';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, Users, FileText, Clock, Plus, ArrowRight } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  recentPatients: any[];
  upcomingAppointments: any[];
}

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  patients?: {
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
}


export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    recentPatients: [],
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [isNewDoctor, setIsNewDoctor] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      checkIfNewDoctor();
      fetchDashboardData();
    }
  }, [user]);

  const checkIfNewDoctor = async () => {
    try {
      // Verificar si es un médico recién registrado
      const { data: doctorData, error } = await supabase
        .from('doctors')
        .select('created_at')
        .eq('id', user?.id)
        .single();

      if (!error && doctorData) {
        const createdAt = new Date(doctorData.created_at);
        const now = new Date();
        const hoursSinceRegistration = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        // Si se registró hace menos de 24 horas, mostrar mensaje de bienvenida
        setIsNewDoctor(hoursSinceRegistration < 24);
      }
    } catch (error) {
      console.error('Error checking doctor registration date:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Obtener total de pacientes del doctor
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (patientsError) throw patientsError;

      // Obtener citas del día actual
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, patients(*, profiles(*))')
        .eq('doctor_id', user?.id || '')
        .gte('scheduled_at', `${today}T00:00:00`)
        .lt('scheduled_at', `${today}T23:59:59`)
        .order('scheduled_at', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Obtener próximas citas (próximos 7 días)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data: upcomingAppointments, error: upcomingError } = await supabase
        .from('appointments')
        .select('*, patients(*, profiles(*))')
        .eq('doctor_id', user?.id || '')
        .gte('scheduled_at', new Date().toISOString())
        .lte('scheduled_at', nextWeek.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (upcomingError) throw upcomingError;

      // Contar total de pacientes únicos
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments?.length || 0,
        pendingAppointments: (upcomingAppointments as Appointment[])?.filter(apt => apt.status === 'scheduled').length || 0,
        recentPatients: patients || [],
        upcomingAppointments: upcomingAppointments || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        {isNewDoctor ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido a Red-Salud, Dr. {user?.user_metadata?.first_name || 'Médico'}!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Tu registro se ha completado exitosamente. Estás listo para comenzar a atender pacientes.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-green-800 font-medium">
                🎉 ¡Felicidades! Tu cuenta médica está activa y verificada.
              </p>
              <p className="text-green-700 text-sm mt-2">
                Puedes comenzar a gestionar citas, pacientes y expedientes médicos desde este dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, Dr. {user?.user_metadata?.first_name || 'Médico'}!
            </h1>
            <p className="mt-1 text-gray-600">
              Aquí tienes un resumen de tu actividad médica.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Pacientes
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.totalPatients}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Citas Hoy
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.todayAppointments}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Citas Pendientes
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.pendingAppointments}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Expedientes
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats.totalPatients}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Próximas Citas
            </h3>
          </div>
          <div className="px-6 py-4">
            {stats.upcomingAppointments.length > 0 ? (
              <ul className="space-y-3">
                {stats.upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {appointment.patients?.profiles?.first_name?.[0]}
                          {appointment.patients?.profiles?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patients?.profiles?.first_name} {appointment.patients?.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.scheduled_at).toLocaleDateString()} a las {new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' :
                       appointment.status === 'scheduled' ? 'Programada' : appointment.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No hay citas programadas</p>
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/doctor/appointments"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver todas las citas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pacientes Recientes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pacientes Recientes
            </h3>
          </div>
          <div className="px-6 py-4">
            {stats.recentPatients.length > 0 ? (
              <ul className="space-y-3">
                {stats.recentPatients.map((patient) => (
                  <li key={patient.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {patient.profiles?.first_name?.[0]}
                          {patient.profiles?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.profiles?.first_name} {patient.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient.profiles?.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No hay pacientes registrados</p>
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/doctor/patients"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver todos los pacientes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/doctor/appointments/new"
            className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Link>
          <Link
            href="/doctor/patients"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Users className="mr-2 h-4 w-4" />
            Gestionar Pacientes
          </Link>
          <Link
            href="/doctor/records"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="mr-2 h-4 w-4" />
            Expedientes
          </Link>
        </div>
      </div>
    </div>
  );
}
