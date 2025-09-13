'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Heart, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year';
  patients: {
    total: number;
    new: number;
    returning: number;
    trend: number; // percentage change
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
    trend: number;
  };
  conditions: {
    mostCommon: Array<{ name: string; count: number; percentage: number }>;
    chronic: number;
    acute: number;
  };
  satisfaction: {
    average: number;
    responses: number;
    trend: number;
  };
  revenue: {
    total: number;
    trend: number;
    averagePerVisit: number;
  };
  timeMetrics: {
    averageConsultationTime: number; // minutes
    waitTime: number; // minutes
    utilizationRate: number; // percentage
  };
}

interface BasicAnalyticsWidgetProps {
  specialtyId: string;
}

export default function BasicAnalyticsWidget({ specialtyId }: BasicAnalyticsWidgetProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, specialtyId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    // Simular datos de analytics para medicina general
    // En producción, esto vendría de Supabase con consultas agregadas
    const mockAnalytics: AnalyticsData = {
      period: selectedPeriod,
      patients: {
        total: selectedPeriod === 'week' ? 45 : selectedPeriod === 'month' ? 186 : selectedPeriod === 'quarter' ? 542 : 2168,
        new: selectedPeriod === 'week' ? 8 : selectedPeriod === 'month' ? 32 : selectedPeriod === 'quarter' ? 89 : 324,
        returning: selectedPeriod === 'week' ? 37 : selectedPeriod === 'month' ? 154 : selectedPeriod === 'quarter' ? 453 : 1844,
        trend: selectedPeriod === 'week' ? 12.5 : selectedPeriod === 'month' ? 8.3 : selectedPeriod === 'quarter' ? 15.2 : 22.1
      },
      appointments: {
        total: selectedPeriod === 'week' ? 52 : selectedPeriod === 'month' ? 218 : selectedPeriod === 'quarter' ? 642 : 2456,
        completed: selectedPeriod === 'week' ? 47 : selectedPeriod === 'month' ? 198 : selectedPeriod === 'quarter' ? 582 : 2234,
        cancelled: selectedPeriod === 'week' ? 3 : selectedPeriod === 'month' ? 14 : selectedPeriod === 'quarter' ? 42 : 156,
        noShow: selectedPeriod === 'week' ? 2 : selectedPeriod === 'month' ? 6 : selectedPeriod === 'quarter' ? 18 : 66,
        completionRate: 90.4,
        trend: selectedPeriod === 'week' ? 5.2 : selectedPeriod === 'month' ? 3.8 : selectedPeriod === 'quarter' ? 7.1 : 12.3
      },
      conditions: {
        mostCommon: [
          { name: 'Hipertensión', count: 34, percentage: 18.3 },
          { name: 'Diabetes Tipo 2', count: 28, percentage: 15.1 },
          { name: 'Infecciones respiratorias', count: 23, percentage: 12.4 },
          { name: 'Control rutinario', count: 42, percentage: 22.6 },
          { name: 'Dolor musculoesquelético', count: 19, percentage: 10.2 }
        ],
        chronic: selectedPeriod === 'week' ? 18 : selectedPeriod === 'month' ? 74 : selectedPeriod === 'quarter' ? 198 : 756,
        acute: selectedPeriod === 'week' ? 27 : selectedPeriod === 'month' ? 112 : selectedPeriod === 'quarter' ? 344 : 1412
      },
      satisfaction: {
        average: 4.6,
        responses: selectedPeriod === 'week' ? 38 : selectedPeriod === 'month' ? 156 : selectedPeriod === 'quarter' ? 432 : 1654,
        trend: 2.3
      },
      revenue: {
        total: selectedPeriod === 'week' ? 23500 : selectedPeriod === 'month' ? 98750 : selectedPeriod === 'quarter' ? 287650 : 1125400,
        trend: selectedPeriod === 'week' ? 8.7 : selectedPeriod === 'month' ? 6.2 : selectedPeriod === 'quarter' ? 11.4 : 18.9,
        averagePerVisit: 450
      },
      timeMetrics: {
        averageConsultationTime: 28,
        waitTime: 12,
        utilizationRate: 78.5
      }
    };

    setAnalytics(mockAnalytics);
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (trend < 0) return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Esta semana';
      case 'month': return 'Este mes';
      case 'quarter': return 'Este trimestre';
      case 'year': return 'Este año';
      default: return period;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-6">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de período */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Estadísticas</h3>
        <div className="flex space-x-1">
          {[
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mes' },
            { key: 'quarter', label: 'Trimestre' },
            { key: 'year', label: 'Año' }
          ].map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.key as any)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Datos de {getPeriodLabel(selectedPeriod).toLowerCase()}
      </p>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pacientes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Pacientes</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatNumber(analytics.patients.total)}
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                  <span>Nuevos: {formatNumber(analytics.patients.new)}</span>
                  <span>•</span>
                  <span>Recurrentes: {formatNumber(analytics.patients.returning)}</span>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getTrendColor(analytics.patients.trend)}`}>
                {getTrendIcon(analytics.patients.trend)}
                <span className="text-sm font-medium">
                  {Math.abs(analytics.patients.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Citas</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatNumber(analytics.appointments.total)}
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                  <span>Completadas: {analytics.appointments.completionRate}%</span>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getTrendColor(analytics.appointments.trend)}`}>
                {getTrendIcon(analytics.appointments.trend)}
                <span className="text-sm font-medium">
                  {Math.abs(analytics.appointments.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Satisfacción */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-gray-700">Satisfacción</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {analytics.satisfaction.average.toFixed(1)}/5.0
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                  <span>{formatNumber(analytics.satisfaction.responses)} respuestas</span>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getTrendColor(analytics.satisfaction.trend)}`}>
                {getTrendIcon(analytics.satisfaction.trend)}
                <span className="text-sm font-medium">
                  {Math.abs(analytics.satisfaction.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Ingresos</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(analytics.revenue.total)}
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                  <span>Promedio: {formatCurrency(analytics.revenue.averagePerVisit)}</span>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getTrendColor(analytics.revenue.trend)}`}>
                {getTrendIcon(analytics.revenue.trend)}
                <span className="text-sm font-medium">
                  {Math.abs(analytics.revenue.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condiciones más comunes */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Condiciones más frecuentes
          </h4>
          <div className="space-y-2">
            {analytics.conditions.mostCommon.map((condition, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{condition.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{condition.count}</span>
                  <Badge variant="outline" className="text-xs">
                    {condition.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de tiempo */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Métricas de tiempo
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {analytics.timeMetrics.averageConsultationTime} min
              </p>
              <p className="text-xs text-gray-600">Consulta promedio</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {analytics.timeMetrics.waitTime} min
              </p>
              <p className="text-xs text-gray-600">Tiempo de espera</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {analytics.timeMetrics.utilizationRate}%
              </p>
              <p className="text-xs text-gray-600">Utilización</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de citas */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estado de citas
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Completadas</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.appointments.completed / analytics.appointments.total) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {formatNumber(analytics.appointments.completed)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Canceladas</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.appointments.cancelled / analytics.appointments.total) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {formatNumber(analytics.appointments.cancelled)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">No asistieron</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.appointments.noShow / analytics.appointments.total) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {formatNumber(analytics.appointments.noShow)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center text-blue-800">
          <Activity className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            Insights de Medicina General
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Las estadísticas muestran un crecimiento del {Math.abs(analytics.patients.trend).toFixed(1)}% 
          en pacientes. El {(analytics.conditions.chronic / (analytics.conditions.chronic + analytics.conditions.acute) * 100).toFixed(1)}% 
          de las consultas son por condiciones crónicas, típico en medicina general.
        </p>
      </div>
    </div>
  );
}
