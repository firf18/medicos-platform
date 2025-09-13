'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { 
  Building, 
  Users, 
  Calendar, 
  TrendingUp, 
  Star,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ClinicStats {
  totalDoctors: number;
  activeAppointments: number;
  todayAppointments: number;
  patientsSeen: number;
  averageRating: number;
  monthlyRevenue: number;
}

interface Doctor {
  id: string;
  license_number: string;
  specialty_id: number;
  is_available: boolean;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  specialties?: {
    name?: string;
  };
  appointmentCount?: number;
  rating?: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'doctor_joined' | 'schedule_change';
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'info';
}

export default function ClinicManagementPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClinicStats>({
    totalDoctors: 0,
    activeAppointments: 0,
    todayAppointments: 0,
    patientsSeen: 0,
    averageRating: 0,
    monthlyRevenue: 0
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'schedule' | 'analytics'>('overview');
  
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchClinicData();
    }
  }, [user]);

  const fetchClinicData = async () => {
    try {
      setLoading(true);

      // Obtener médicos de la clínica (simulado - necesitaríamos tabla clinic_doctors)
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select(`
          id,
          license_number,
          specialty_id,
          profiles!inner(first_name, last_name, email, phone),
          specialties!inner(name)
        `)
        .limit(20);

      // Simular datos para el dashboard
      const mockDoctors = (doctorsData || []).map(doctor => ({
        ...doctor,
        is_available: Math.random() > 0.3,
        appointmentCount: Math.floor(Math.random() * 50) + 10,
        rating: parseFloat((4 + Math.random()).toFixed(1))
      }));

      setDoctors(mockDoctors);

      // Calcular estadísticas
      const totalDoctors = mockDoctors.length;
      
      setStats({
        totalDoctors,
        activeAppointments: totalDoctors * 8, // Promedio 8 citas por doctor
        todayAppointments: totalDoctors * 3, // Promedio 3 citas hoy por doctor
        patientsSeen: totalDoctors * 150, // Promedio 150 pacientes por doctor
        averageRating: 4.3,
        monthlyRevenue: totalDoctors * 25000 // Simulado
      });

      // Actividad reciente simulada
      setRecentActivity([
        {
          id: '1',
          type: 'appointment',
          description: 'Nueva cita programada con Dr. García',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'doctor_joined',
          description: 'Dr. Martínez se unió al equipo',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'info'
        },
        {
          id: '3',
          type: 'schedule_change',
          description: 'Cambio de horario en consultorio 3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: 'warning'
        }
      ]);

    } catch (error) {
      console.error('Error fetching clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'doctor_joined': return <Users className="h-4 w-4" />;
      case 'schedule_change': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building className="h-8 w-8 mr-3 text-blue-600" />
              Panel de Gestión de Clínica
            </h1>
            <p className="mt-1 text-gray-600">
              Administra médicos, horarios y operaciones de la clínica
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <div className="flex items-center text-yellow-600">
                <Star className="h-4 w-4 mr-1" />
                {stats.averageRating}/5.0
              </div>
              <div className="text-gray-500">Calificación promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'doctors', label: 'Médicos', icon: Users },
              { id: 'schedule', label: 'Horarios', icon: Calendar },
              { id: 'analytics', label: 'Análisis', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-blue-100">
                          Médicos Activos
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.totalDoctors}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-green-100">
                          Citas Hoy
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.todayAppointments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-purple-100">
                          Pacientes Atendidos
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.patientsSeen.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividad Reciente y Médicos Destacados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Actividad Reciente */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Actividad Reciente
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 mt-1 ${getStatusColor(activity.status)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Médicos Destacados */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Médicos Destacados
                  </h3>
                  <div className="space-y-3">
                    {doctors.slice(0, 3).map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doctor.specialties?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            <span className="text-xs">{doctor.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {doctor.appointmentCount} citas
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Doctors */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Equipo Médico ({doctors.length})
                </h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Médico
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        doctor.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doctor.is_available ? 'Disponible' : 'No disponible'}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900">
                      Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{doctor.specialties?.name}</p>
                    <p className="text-xs text-gray-500 mb-4">Lic: {doctor.license_number}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-yellow-600">
                        <Star className="h-4 w-4 mr-1" />
                        {doctor.rating}/5.0
                      </div>
                      <div className="text-gray-600">
                        {doctor.appointmentCount} citas
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Schedule - Placeholder */}
          {activeTab === 'schedule' && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Gestión de Horarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                Próximamente: Gestión de horarios y consultorios
              </p>
            </div>
          )}

          {/* Tab: Analytics - Placeholder */}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Análisis y Reportes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Próximamente: Reportes de rendimiento y análisis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
