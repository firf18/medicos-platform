'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CalendarIcon, 
  BeakerIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardOverviewProps {
  userId: string;
}

interface OverviewStats {
  upcomingAppointments: number;
  activeMedications: number;
  pendingResults: number;
  unreadNotifications: number;
  activeHealthPlans: number;
  recentMetrics: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [stats, setStats] = useState<OverviewStats>({
    upcomingAppointments: 0,
    activeMedications: 0,
    pendingResults: 0,
    unreadNotifications: 0,
    activeHealthPlans: 0,
    recentMetrics: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Fetch stats in parallel
        const [
          appointmentsResult,
          medicationsResult,
          documentsResult,
          notificationsResult,
          healthPlansResult,
          metricsResult
        ] = await Promise.all([
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('status', 'scheduled')
            .gte('scheduled_at', new Date().toISOString()),
          
          supabase
            .from('patient_medications')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('is_active', true),
          
          supabase
            .from('medical_documents')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('document_type', 'lab_result')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          
          supabase
            .from('patient_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('is_read', false),
          
          supabase
            .from('health_plans')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('status', 'active'),
          
          supabase
            .from('health_metrics')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        setStats({
          upcomingAppointments: appointmentsResult.count || 0,
          activeMedications: medicationsResult.count || 0,
          pendingResults: documentsResult.count || 0,
          unreadNotifications: notificationsResult.count || 0,
          activeHealthPlans: healthPlansResult.count || 0,
          recentMetrics: metricsResult.count || 0
        });

        // Fetch recent activity
        const { data: activities } = await supabase
          .from('patient_notifications')
          .select('*')
          .eq('patient_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activities) {
          setRecentActivity(activities.map(activity => ({
            id: activity.id,
            type: activity.notification_type,
            title: activity.title,
            description: activity.message,
            date: activity.created_at,
            priority: activity.priority
          })));
        }

      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [userId, supabase]);

  const statCards = [
    {
      title: 'Próximas Citas',
      value: stats.upcomingAppointments,
      icon: CalendarIcon,
      color: 'bg-blue-500',
      description: 'citas programadas'
    },
    {
      title: 'Medicamentos Activos',
      value: stats.activeMedications,
      icon: BeakerIcon,
      color: 'bg-green-500',
      description: 'medicamentos actuales'
    },
    {
      title: 'Resultados Pendientes',
      value: stats.pendingResults,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      description: 'resultados nuevos'
    },
    {
      title: 'Notificaciones',
      value: stats.unreadNotifications,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      description: 'sin leer'
    },
    {
      title: 'Planes de Salud',
      value: stats.activeHealthPlans,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      description: 'planes activos'
    },
    {
      title: 'Métricas Recientes',
      value: stats.recentMetrics,
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      description: 'esta semana'
    }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido a tu Portal de Salud!</h1>
        <p className="text-blue-100">
          Aquí tienes un resumen de tu información médica y actividad reciente.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getPriorityColor(activity.priority)}`}>
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CalendarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Agendar Cita</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BeakerIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Ver Medicamentos</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentTextIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Descargar Resultados</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Registrar Métrica</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
