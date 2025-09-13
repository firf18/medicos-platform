'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Heart, 
  Shield, 
  Activity,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

// Importar widgets específicos de medicina general
import PatientListWidget from '@/components/dashboard/widgets/PatientListWidget';
import AppointmentCalendarWidget from '@/components/dashboard/widgets/AppointmentCalendarWidget';
import VitalSignsWidget from '@/components/dashboard/widgets/VitalSignsWidget';
import PreventionAlertsWidget from '@/components/dashboard/widgets/PreventionAlertsWidget';
import BasicAnalyticsWidget from '@/components/dashboard/widgets/BasicAnalyticsWidget';
import NotificationsWidget from '@/components/dashboard/widgets/NotificationsWidget';

export default function GeneralMedicineDashboard() {
  const [selectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    urgentAlerts: 0,
    pendingReviews: 0
  });

  // Cargar estadísticas del dashboard
  useEffect(() => {
    loadDashboardStats();
  }, [selectedPeriod]);

  const loadDashboardStats = async () => {
    // Simular carga de datos
    // En producción, estos datos vendrían de Supabase
    setDashboardStats({
      totalPatients: 324,
      todayAppointments: 12,
      urgentAlerts: 3,
      pendingReviews: 8
    });
  };

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
          
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>En línea</span>
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Dr. [Nombre]</p>
              <p className="text-xs text-gray-500">Medicina General</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pacientes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalPatients}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.todayAppointments}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertas Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardStats.urgentAlerts}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revisiones Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingReviews}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
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
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Agenda del Día
                </CardTitle>
                <CardDescription>
                  Citas programadas para hoy y próximas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendarWidget specialtyId="medicina_general" />
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

            {/* Widget de Lista de Pacientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Pacientes Recientes
                </CardTitle>
                <CardDescription>
                  Pacientes vistos recientemente y próximas citas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientListWidget />
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha - Widgets Laterales */}
          <div className="space-y-6">
            {/* Widget de Notificaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationsWidget />
              </CardContent>
            </Card>

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

            {/* Widget de Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Estadísticas
                </CardTitle>
                <CardDescription>
                  Métricas de tu práctica médica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicAnalyticsWidget specialtyId="medicina_general" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
