'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Building,
  UserCheck,
  FileText,
  Database
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalClinics: number;
  monthlyAppointments: number;
  systemUptime: number;
  securityAlerts: number;
  dataIntegrity: number;
}

interface UserActivity {
  id: string;
  user_type: string;
  action: string;
  timestamp: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_denied' | 'data_access' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalClinics: 0,
    monthlyAppointments: 0,
    systemUptime: 0,
    securityAlerts: 0,
    dataIntegrity: 0
  });
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user, timeRange, fetchAdminData]);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener estadísticas reales
      const [
        { count: totalUsers },
        { count: totalDoctors },
        { count: totalPatients },
        { count: totalClinics }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('new_clinics').select('*', { count: 'exact', head: true })
      ]);

      // Obtener citas del mes actual
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { count: monthlyAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${currentMonth}-01`);

      setStats({
        totalUsers: totalUsers || 0,
        totalDoctors: totalDoctors || 0,
        totalPatients: totalPatients || 0,
        totalClinics: totalClinics || 0,
        monthlyAppointments: monthlyAppointments || 0,
        systemUptime: 99.87,
        securityAlerts: 3,
        dataIntegrity: 99.95
      });

      // Simular actividad de usuarios
      const mockUserActivity: UserActivity[] = [
        {
          id: '1',
          user_type: 'doctor',
          action: 'Creó nueva cita',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          details: 'Dr. García programó cita con paciente María López',
          status: 'success'
        },
        {
          id: '2',
          user_type: 'patient',
          action: 'Actualizó perfil',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          details: 'Juan Pérez actualizó información de contacto',
          status: 'success'
        },
        {
          id: '3',
          user_type: 'admin',
          action: 'Modificó configuración',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          details: 'Configuración de seguridad actualizada',
          status: 'warning'
        },
        {
          id: '4',
          user_type: 'clinic',
          action: 'Registro fallido',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          details: 'Intento de registro con datos inválidos',
          status: 'error'
        }
      ];

      // Simular eventos de seguridad
      const mockSecurityEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login_attempt',
          severity: 'medium',
          description: 'Múltiples intentos de login fallidos desde IP 192.168.1.100',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'permission_denied',
          severity: 'low',
          description: 'Usuario intentó acceder a datos sin permisos',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          resolved: true
        },
        {
          id: '3',
          type: 'data_access',
          severity: 'high',
          description: 'Acceso inusual a datos sensibles detectado',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          resolved: true
        }
      ];

      // Métricas del sistema
      const mockSystemMetrics: SystemMetric[] = [
        { name: 'CPU Usage', value: 45, unit: '%', status: 'good', trend: 'stable' },
        { name: 'Memory Usage', value: 67, unit: '%', status: 'warning', trend: 'up' },
        { name: 'Disk Usage', value: 23, unit: '%', status: 'good', trend: 'down' },
        { name: 'API Response Time', value: 125, unit: 'ms', status: 'good', trend: 'stable' },
        { name: 'Database Connections', value: 45, unit: '', status: 'good', trend: 'stable' },
        { name: 'Active Sessions', value: 234, unit: '', status: 'good', trend: 'up' }
      ];

      setUserActivity(mockUserActivity);
      setSecurityEvents(mockSecurityEvents);
      setSystemMetrics(mockSystemMetrics);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success': case 'good': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'error': case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Panel de Administración Avanzado
            </h1>
            <p className="mt-1 text-gray-600">
              Monitoreo del sistema, usuarios, seguridad y rendimiento
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | '90d')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-100">Total Usuarios</dt>
                <dd className="text-2xl font-bold">{stats.totalUsers}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-100">Médicos Activos</dt>
                <dd className="text-2xl font-bold">{stats.totalDoctors}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-100">Citas Este Mes</dt>
                <dd className="text-2xl font-bold">{stats.monthlyAppointments}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-orange-100">Uptime Sistema</dt>
                <dd className="text-2xl font-bold">{stats.systemUptime}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Metrics */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Métricas del Sistema
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className={`${getStatusBg(metric.status)} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                    <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Alertas de Seguridad
          </h3>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                    {event.severity.toUpperCase()}
                  </span>
                  <div className="flex items-center">
                    {event.resolved ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-900 mb-1">{event.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Actividad Reciente de Usuarios
        </h3>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {activity.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {activity.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : activity.status === 'warning' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Resumen de Salud del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Sistema Operativo</h4>
            <p className="text-sm text-gray-600">Todos los servicios funcionando correctamente</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Alertas Menores</h4>
            <p className="text-sm text-gray-600">{stats.securityAlerts} alertas de seguridad pendientes</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Integridad de Datos</h4>
            <p className="text-sm text-gray-600">{stats.dataIntegrity}% de integridad mantenida</p>
          </div>
        </div>
      </div>
    </div>
  );
}
