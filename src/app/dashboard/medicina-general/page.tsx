'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Heart, 
  Shield, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Pill,
  Microscope,
  Phone,
  Video,
  Plus,
  Settings,
  Bell,
  BarChart3,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Importar widgets específicos de medicina general
import PatientListWidget from '@/components/dashboard/widgets/PatientListWidget';
import AppointmentCalendarWidget from '@/components/dashboard/widgets/AppointmentCalendarWidget';
import VitalSignsWidget from '@/components/dashboard/widgets/VitalSignsWidget';
import PreventionAlertsWidget from '@/components/dashboard/widgets/PreventionAlertsWidget';
import BasicAnalyticsWidget from '@/components/dashboard/widgets/BasicAnalyticsWidget';
import NotificationsWidget from '@/components/dashboard/widgets/NotificationsWidget';
import AdvancedAnalyticsWidget from '@/components/dashboard/widgets/AdvancedAnalyticsWidget';
import PatientManagementWidget from '@/components/dashboard/widgets/PatientManagementWidget';

// Importar nuevos widgets avanzados
import IntelligentNotificationsWidget from '@/components/dashboard/widgets/IntelligentNotificationsWidget';
import TelemedicineWidget from '@/components/dashboard/widgets/TelemedicineWidget';
import AIAssistantWidget from '@/components/dashboard/widgets/AIAssistantWidget';
import AutomatedReportsWidget from '@/components/dashboard/widgets/AutomatedReportsWidget';
import SecurityComplianceWidget from '@/components/dashboard/widgets/SecurityComplianceWidget';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  urgentAlerts: number;
  pendingReviews: number;
  completedAppointments: number;
  averageRating: number;
  monthlyRevenue: number;
  upcomingAppointments: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'prescription' | 'lab_result';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'urgent';
}

export default function GeneralMedicineDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    urgentAlerts: 0,
    pendingReviews: 0,
    completedAppointments: 0,
    averageRating: 0,
    monthlyRevenue: 0,
    upcomingAppointments: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewDoctor, setIsNewDoctor] = useState(false);
  
  const supabase = createClient();

  // Cargar estadísticas del dashboard
  useEffect(() => {
    if (user) {
      loadDashboardStats();
      loadRecentActivity();
      checkIfNewDoctor();
    }
  }, [selectedPeriod, user]);

  const checkIfNewDoctor = async () => {
    try {
      const { data: doctorData, error } = await supabase
        .from('doctors')
        .select('created_at')
        .eq('id', user?.id)
        .single();

      if (!error && doctorData) {
        const createdAt = new Date(doctorData.created_at);
        const now = new Date();
        const hoursSinceRegistration = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        setIsNewDoctor(hoursSinceRegistration < 24);
      }
    } catch (error) {
      console.error('Error checking doctor registration date:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Por ahora usar datos simulados hasta que se configure correctamente la base de datos
      // En producción, estos datos vendrían de Supabase
      setDashboardStats({
        totalPatients: 324,
        todayAppointments: 12,
        urgentAlerts: 3,
        pendingReviews: 8,
        completedAppointments: 8,
        averageRating: 4.8,
        monthlyRevenue: 12500,
        upcomingAppointments: 15
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Fallback a datos simulados si hay error
      setDashboardStats({
        totalPatients: 324,
        todayAppointments: 12,
        urgentAlerts: 3,
        pendingReviews: 8,
        completedAppointments: 8,
        averageRating: 4.8,
        monthlyRevenue: 12500,
        upcomingAppointments: 15
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Por ahora usar datos simulados hasta que se configure correctamente la base de datos
      // En producción, estos datos vendrían de Supabase
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Cita con María González',
          description: 'Consulta de seguimiento completada',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'prescription',
          title: 'Receta para Juan Pérez',
          description: 'Medicamento: Metformina 500mg',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'appointment',
          title: 'Cita con Ana Rodríguez',
          description: 'Control de presión arterial programado',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: '4',
          type: 'lab_result',
          title: 'Resultados de Laboratorio',
          description: 'Análisis de sangre - Carlos López',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '5',
          type: 'prescription',
          title: 'Receta para Laura Martínez',
          description: 'Medicamento: Losartán 50mg',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ];

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Actividad simulada como fallback
      setRecentActivity([
        {
          id: '1',
          type: 'appointment',
          title: 'Cita con María González',
          description: 'Consulta de seguimiento completada',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'prescription',
          title: 'Receta para Juan Pérez',
          description: 'Medicamento: Metformina 500mg',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de medicina general...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard - Medicina General
              </h1>
              <p className="text-gray-600">
                Red-Salud • Atención médica integral y preventiva
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Selector de período */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="text-xs"
                >
                  {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
                </Button>
              ))}
            </div>

            {/* Estado de conexión y perfil */}
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>En línea</span>
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Dr. {user?.user_metadata?.first_name || 'Médico'} {user?.user_metadata?.last_name || ''}
                </p>
                <p className="text-xs text-gray-500">Medicina General</p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de bienvenida para nuevos doctores */}
      {isNewDoctor && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>¡Bienvenido a Red-Salud!</strong> Tu cuenta está activa y lista para usar. 
                Puedes comenzar a gestionar pacientes y citas desde este dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas Rápidas */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Pacientes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pacientes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalPatients}</p>
                  <p className="text-xs text-gray-500 mt-1">+12% este mes</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citas Hoy */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.todayAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">{dashboardStats.completedAppointments} completadas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas Urgentes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertas Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardStats.urgentAlerts}</p>
                  <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calificación Promedio */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Calificación</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageRating}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <Star className="h-3 w-3 text-gray-300" />
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas Adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximas Citas</p>
                  <p className="text-xl font-bold text-gray-900">{dashboardStats.upcomingAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">Próximos 7 días</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expedientes</p>
                  <p className="text-xl font-bold text-gray-900">{dashboardStats.totalPatients}</p>
                  <p className="text-xs text-gray-500 mt-1">Activos</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                  <p className="text-xl font-bold text-gray-900">${dashboardStats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">+8% vs mes anterior</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal de Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Widgets Principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Widget de Agenda de Citas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Agenda del Día
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva Cita
                  </Button>
                </CardTitle>
                <CardDescription>
                  Citas programadas para hoy y próximas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendarWidget specialtyId="medicina_general" />
              </CardContent>
            </Card>

            {/* Widget de Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas acciones y eventos en tu práctica médica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'appointment' && (
                            <Calendar className="h-5 w-5 text-blue-600" />
                          )}
                          {activity.type === 'prescription' && (
                            <Pill className="h-5 w-5 text-green-600" />
                          )}
                          {activity.type === 'lab_result' && (
                            <Microscope className="h-5 w-5 text-purple-600" />
                          )}
                          {activity.type === 'patient' && (
                            <Users className="h-5 w-5 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {activity.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {activity.status === 'pending' && (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          {activity.status === 'urgent' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">No hay actividad reciente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Widget de Signos Vitales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Monitor de Signos Vitales
                </CardTitle>
                <CardDescription>
                  Seguimiento de signos vitales de pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VitalSignsWidget />
              </CardContent>
            </Card>

            {/* Widget de Gestión de Pacientes */}
            <PatientManagementWidget specialtyId="medicina_general" limit={8} />
          </div>

          {/* Columna Derecha - Widgets Laterales */}
          <div className="space-y-6">
                {/* Widget de Notificaciones Inteligentes */}
                <IntelligentNotificationsWidget />

            {/* Widget de Alertas Preventivas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Medicina Preventiva
                </CardTitle>
                <CardDescription>
                  Recordatorios de vacunas y chequeos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreventionAlertsWidget />
              </CardContent>
            </Card>

            {/* Widget de Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Acceso rápido a funciones comunes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nueva Cita
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Nuevo Paciente
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Pill className="h-4 w-4 mr-2" />
                    Nueva Receta
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Expediente Médico
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Consulta Telefónica
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Videoconsulta
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Widget de Estadísticas Avanzadas */}
            <AdvancedAnalyticsWidget specialtyId="medicina_general" period="month" />

            {/* Widget de Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Ubicación
                </CardTitle>
                <CardDescription>
                  Consultorio principal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Consultorio Central</p>
                  <p className="text-xs text-gray-500">Av. Principal 123, Centro</p>
                  <p className="text-xs text-gray-500">Caracas, Venezuela</p>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    Ver en Mapa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </div>

          {/* Sección de Widgets Avanzados */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Herramientas Avanzadas</h2>
              <p className="text-gray-600">Funcionalidades profesionales para una práctica médica moderna</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Telemedicina */}
              <TelemedicineWidget />

              {/* Asistente de IA */}
              <AIAssistantWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Reportes Automáticos */}
              <AutomatedReportsWidget />

              {/* Seguridad y Cumplimiento */}
              <SecurityComplianceWidget />
            </div>
          </div>
        </div>
      );
    }
