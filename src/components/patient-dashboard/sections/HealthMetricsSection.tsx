'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  HeartIcon, 
  ScaleIcon, 
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface HealthMetricsSectionProps {
  userId: string;
}

interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  additional_data: any;
  recorded_at: string;
  source: string;
  notes: string | null;
}

interface MetricSummary {
  type: string;
  label: string;
  icon: any;
  color: string;
  latest_value: number | null;
  latest_unit: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  count: number;
}

export function HealthMetricsSection({ userId }: HealthMetricsSectionProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [metricSummaries, setMetricSummaries] = useState<MetricSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchHealthMetrics();
  }, [userId]);

  const fetchHealthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      setMetrics(data || []);
      generateMetricSummaries(data || []);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMetricSummaries = (metricsData: HealthMetric[]) => {
    const metricTypes = [
      { type: 'weight', label: 'Peso', icon: ScaleIcon, color: 'blue' },
      { type: 'blood_pressure', label: 'Presión Arterial', icon: HeartIcon, color: 'red' },
      { type: 'glucose', label: 'Glucosa', icon: ChartBarIcon, color: 'yellow' },
      { type: 'heart_rate', label: 'Frecuencia Cardíaca', icon: HeartIcon, color: 'green' },
      { type: 'temperature', label: 'Temperatura', icon: ChartBarIcon, color: 'orange' },
      { type: 'oxygen_saturation', label: 'Saturación de Oxígeno', icon: ChartBarIcon, color: 'purple' }
    ];

    const summaries = metricTypes.map(metricType => {
      const typeMetrics = metricsData.filter(m => m.metric_type === metricType.type);
      
      if (typeMetrics.length === 0) {
        return {
          ...metricType,
          latest_value: null,
          latest_unit: '',
          trend: 'stable' as const,
          change_percentage: 0,
          count: 0
        };
      }

      const latest = typeMetrics[0];
      const previous = typeMetrics[1];
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let changePercentage = 0;

      if (previous && latest) {
        const latestValue = metricType.type === 'blood_pressure' 
          ? latest.additional_data?.systolic || latest.value
          : latest.value;
        const previousValue = metricType.type === 'blood_pressure'
          ? previous.additional_data?.systolic || previous.value
          : previous.value;

        changePercentage = ((latestValue - previousValue) / previousValue) * 100;
        trend = changePercentage > 2 ? 'up' : changePercentage < -2 ? 'down' : 'stable';
      }

      return {
        ...metricType,
        latest_value: latest.value,
        latest_unit: latest.unit,
        trend,
        change_percentage: Math.abs(changePercentage),
        count: typeMetrics.length
      };
    });

    setMetricSummaries(summaries.filter(s => s.count > 0));
  };

  const addMetric = async (metricData: any) => {
    try {
      const { error } = await supabase
        .from('health_metrics')
        .insert({
          patient_id: userId,
          ...metricData,
          recorded_at: new Date().toISOString(),
          source: 'manual'
        });

      if (error) throw error;
      fetchHealthMetrics();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding metric:', error);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const formatMetricValue = (metric: HealthMetric) => {
    if (metric.metric_type === 'blood_pressure' && metric.additional_data) {
      return `${metric.additional_data.systolic}/${metric.additional_data.diastolic}`;
    }
    return `${metric.value}`;
  };

  const filteredMetrics = selectedMetricType === 'all' 
    ? metrics 
    : metrics.filter(m => m.metric_type === selectedMetricType);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas de Salud</h1>
          <p className="text-gray-600 mt-1">
            Monitorea tus signos vitales y métricas de salud
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Registrar Métrica</span>
        </button>
      </div>

      {/* Metric Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricSummaries.map((summary) => {
          const Icon = summary.icon;
          return (
            <div key={summary.type} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(summary.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  {summary.trend === 'up' && (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
                  )}
                  {summary.trend === 'down' && (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
                  )}
                  {summary.change_percentage > 0 && (
                    <span className={`text-xs ${
                      summary.trend === 'up' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {summary.change_percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {summary.label}
              </h3>
              
              {summary.latest_value !== null ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.type === 'blood_pressure' 
                      ? formatMetricValue(metrics.find(m => m.metric_type === summary.type)!)
                      : `${summary.latest_value} ${summary.latest_unit}`
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    {summary.count} registros
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Sin registros</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter and Metrics List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Historial de Métricas</h2>
            <select
              value={selectedMetricType}
              onChange={(e) => setSelectedMetricType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las métricas</option>
              {metricSummaries.map(summary => (
                <option key={summary.type} value={summary.type}>
                  {summary.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay métricas registradas</h3>
              <p className="text-gray-600 mb-6">
                Comienza a registrar tus métricas de salud para hacer seguimiento
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Registrar Primera Métrica
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getColorClasses(
                      metricSummaries.find(s => s.type === metric.metric_type)?.color || 'gray'
                    )}`}>
                      {(() => {
                        const Icon = metricSummaries.find(s => s.type === metric.metric_type)?.icon || ChartBarIcon;
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {metricSummaries.find(s => s.type === metric.metric_type)?.label || metric.metric_type}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(metric.recorded_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{metric.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatMetricValue(metric)} {metric.unit}
                    </p>
                    {metric.notes && (
                      <p className="text-sm text-gray-600 mt-1">{metric.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Metric Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Registrar Nueva Métrica</h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad se implementará en la siguiente fase del desarrollo.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}