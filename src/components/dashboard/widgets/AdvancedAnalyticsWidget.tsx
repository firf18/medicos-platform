/**
 * Sistema de Analytics Avanzados para Dashboard Médico
 * Incluye reportes, métricas de rendimiento y análisis predictivo
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  Target,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  performanceMetrics: {
    patientSatisfaction: number;
    appointmentCompletionRate: number;
    averageConsultationTime: number;
    revenueGrowth: number;
    patientRetentionRate: number;
  };
  patientDemographics: {
    ageGroups: { range: string; count: number; percentage: number }[];
    genderDistribution: { gender: string; count: number; percentage: number }[];
    conditions: { condition: string; count: number; trend: 'up' | 'down' | 'stable' }[];
  };
  appointmentAnalytics: {
    dailyAppointments: { date: string; count: number; revenue: number }[];
    weeklyTrends: { week: string; appointments: number; cancellations: number }[];
    peakHours: { hour: string; appointments: number }[];
  };
  financialMetrics: {
    monthlyRevenue: { month: string; revenue: number; growth: number }[];
    averageConsultationFee: number;
    insuranceClaims: { status: string; count: number; amount: number }[];
  };
}

interface AdvancedAnalyticsProps {
  specialtyId: string;
  doctorId?: string;
}

export default function AdvancedAnalytics({ specialtyId, doctorId }: AdvancedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'demographics' | 'appointments' | 'financial'>('performance');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, specialtyId, doctorId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simular datos de analytics avanzados
      const mockData: AnalyticsData = {
        performanceMetrics: {
          patientSatisfaction: 4.8,
          appointmentCompletionRate: 94.2,
          averageConsultationTime: 28.5,
          revenueGrowth: 15.3,
          patientRetentionRate: 87.6
        },
        patientDemographics: {
          ageGroups: [
            { range: '0-18', count: 45, percentage: 15 },
            { range: '19-35', count: 120, percentage: 40 },
            { range: '36-50', count: 90, percentage: 30 },
            { range: '51-65', count: 30, percentage: 10 },
            { range: '65+', count: 15, percentage: 5 }
          ],
          genderDistribution: [
            { gender: 'Femenino', count: 180, percentage: 60 },
            { gender: 'Masculino', count: 120, percentage: 40 }
          ],
          conditions: [
            { condition: 'Hipertensión', count: 85, trend: 'up' },
            { condition: 'Diabetes', count: 45, trend: 'stable' },
            { condition: 'Artritis', count: 30, trend: 'down' },
            { condition: 'Asma', count: 25, trend: 'stable' }
          ]
        },
        appointmentAnalytics: {
          dailyAppointments: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 15) + 5,
            revenue: Math.floor(Math.random() * 2000) + 500
          })),
          weeklyTrends: Array.from({ length: 12 }, (_, i) => ({
            week: `Semana ${i + 1}`,
            appointments: Math.floor(Math.random() * 50) + 30,
            cancellations: Math.floor(Math.random() * 10) + 2
          })),
          peakHours: [
            { hour: '08:00', appointments: 12 },
            { hour: '09:00', appointments: 18 },
            { hour: '10:00', appointments: 22 },
            { hour: '11:00', appointments: 20 },
            { hour: '14:00', appointments: 16 },
            { hour: '15:00', appointments: 19 },
            { hour: '16:00', appointments: 14 }
          ]
        },
        financialMetrics: {
          monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i).toLocaleDateString('es', { month: 'short' }),
            revenue: Math.floor(Math.random() * 50000) + 20000,
            growth: Math.floor(Math.random() * 20) - 5
          })),
          averageConsultationFee: 150,
          insuranceClaims: [
            { status: 'Aprobado', count: 45, amount: 6750 },
            { status: 'Pendiente', count: 12, amount: 1800 },
            { status: 'Rechazado', count: 3, amount: 450 }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`);
    // Implementar exportación real
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics Avanzados
              </CardTitle>
              <CardDescription>
                Análisis detallado de rendimiento y métricas médicas
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.performanceMetrics.patientSatisfaction}</p>
                <p className="text-xs text-gray-500">/5.0</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Completadas</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.performanceMetrics.appointmentCompletionRate}%</p>
                <p className="text-xs text-green-500">+2.1%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.performanceMetrics.averageConsultationTime}min</p>
                <p className="text-xs text-gray-500">por consulta</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crecimiento</p>
                <p className="text-2xl font-bold text-green-600">+{analyticsData.performanceMetrics.revenueGrowth}%</p>
                <p className="text-xs text-gray-500">ingresos</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retención</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.performanceMetrics.patientRetentionRate}%</p>
                <p className="text-xs text-gray-500">pacientes</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demografía de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Demografía de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Distribución por Edad</h4>
                <div className="space-y-2">
                  {analyticsData.patientDemographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center justify-between">
                      <span className="text-sm">{group.range} años</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12">{group.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Distribución por Género</h4>
                <div className="space-y-2">
                  {analyticsData.patientDemographics.genderDistribution.map((gender) => (
                    <div key={gender.gender} className="flex items-center justify-between">
                      <span className="text-sm">{gender.gender}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${gender.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12">{gender.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condiciones Más Comunes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Condiciones Más Comunes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.patientDemographics.conditions.map((condition) => (
                <div key={condition.condition} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      condition.trend === 'up' ? 'bg-red-500' :
                      condition.trend === 'down' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm font-medium">{condition.condition}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{condition.count}</span>
                    {condition.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                    {condition.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                    {condition.trend === 'stable' && <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Horarios Pico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horarios Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.appointmentAnalytics.peakHours.map((hour) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm">{hour.hour}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(hour.appointments / 22) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{hour.appointments}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas Financieras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Métricas Financieras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${analyticsData.financialMetrics.averageConsultationFee}
                </p>
                <p className="text-sm text-gray-500">Tarifa promedio por consulta</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Reclamos de Seguros</h4>
                <div className="space-y-2">
                  {analyticsData.financialMetrics.insuranceClaims.map((claim) => (
                    <div key={claim.status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{claim.status}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{claim.count}</span>
                        <span className="text-xs text-gray-500">${claim.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones y Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Recomendaciones e Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Excelente Rendimiento</h4>
              </div>
              <p className="text-sm text-green-700">
                Tu tasa de satisfacción del paciente (4.8/5) está por encima del promedio de la especialidad.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Oportunidad de Crecimiento</h4>
              </div>
              <p className="text-sm text-blue-700">
                Considera expandir horarios en las horas pico (10:00-11:00) para aumentar ingresos.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Atención Requerida</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Los casos de hipertensión están aumentando. Considera campañas de prevención.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-800">Demografía Saludable</h4>
              </div>
              <p className="text-sm text-purple-700">
                Tu base de pacientes está bien distribuida por edad y género, indicando buena diversidad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}