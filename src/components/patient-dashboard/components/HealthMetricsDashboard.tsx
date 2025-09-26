'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  HeartIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface HealthMetricsDashboardProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface VitalSign {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'temperature' | 'oxygen_saturation' | 'weight' | 'height';
  value: number | string;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface HealthGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
}

export function HealthMetricsDashboard({ userId, darkMode, realTimeData }: HealthMetricsDashboardProps) {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [showAddMetric, setShowAddMetric] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadHealthMetrics();
  }, [userId, selectedTimeframe]);

  const loadHealthMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Calcular fecha de inicio según el timeframe
      const now = new Date();
      const startDate = new Date();
      switch (selectedTimeframe) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Cargar métricas de salud
      const { data: metrics, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', userId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      if (metrics) {
        // Procesar métricas en formato de signos vitales
        const processedVitals: VitalSign[] = [];
        
        metrics.forEach(metric => {
          // Frecuencia cardíaca
          if (metric.heart_rate) {
            processedVitals.push({
              id: `${metric.id}-hr`,
              type: 'heart_rate',
              value: metric.heart_rate,
              unit: 'bpm',
              timestamp: metric.recorded_at,
              status: getVitalStatus('heart_rate', metric.heart_rate),
              trend: getTrend(metrics, 'heart_rate', metric.recorded_at)
            });
          }

          // Presión arterial
          if (metric.systolic_bp && metric.diastolic_bp) {
            processedVitals.push({
              id: `${metric.id}-bp`,
              type: 'blood_pressure',
              value: `${metric.systolic_bp}/${metric.diastolic_bp}`,
              unit: 'mmHg',
              timestamp: metric.recorded_at,
              status: getVitalStatus('blood_pressure', { systolic: metric.systolic_bp, diastolic: metric.diastolic_bp }),
              trend: getTrend(metrics, 'blood_pressure', metric.recorded_at)
            });
          }

          // Temperatura
          if (metric.temperature) {
            processedVitals.push({
              id: `${metric.id}-temp`,
              type: 'temperature',
              value: metric.temperature,
              unit: '°C',
              timestamp: metric.recorded_at,
              status: getVitalStatus('temperature', metric.temperature),
              trend: getTrend(metrics, 'temperature', metric.recorded_at)
            });
          }

          // Saturación de oxígeno
          if (metric.oxygen_saturation) {
            processedVitals.push({
              id: `${metric.id}-spo2`,
              type: 'oxygen_saturation',
              value: metric.oxygen_saturation,
              unit: '%',
              timestamp: metric.recorded_at,
              status: getVitalStatus('oxygen_saturation', metric.oxygen_saturation),
              trend: getTrend(metrics, 'oxygen_saturation', metric.recorded_at)
            });
          }

          // Peso
          if (metric.weight) {
            processedVitals.push({
              id: `${metric.id}-weight`,
              type: 'weight',
              value: metric.weight,
              unit: 'kg',
              timestamp: metric.recorded_at,
              status: 'normal',
              trend: getTrend(metrics, 'weight', metric.recorded_at)
            });
          }
        });

        setVitalSigns(processedVitals);
      }

      // Cargar objetivos de salud
      const { data: goals } = await supabase
        .from('health_goals')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true);

      if (goals) {
        setHealthGoals(goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          target: goal.target_value,
          current: goal.current_value,
          unit: goal.unit,
          deadline: goal.target_date,
          progress: Math.round((goal.current_value / goal.target_value) * 100)
        })));
      }

    } catch (error) {
      console.error('Error loading health metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVitalStatus = (type: string, value: any): 'normal' | 'warning' | 'critical' => {
    switch (type) {
      case 'heart_rate':
        if (value < 60 || value > 100) return 'warning';
        if (value < 50 || value > 120) return 'critical';
        return 'normal';
      
      case 'blood_pressure':
        if (value.systolic > 140 || value.diastolic > 90) return 'warning';
        if (value.systolic > 160 || value.diastolic > 100) return 'critical';
        return 'normal';
      
      case 'temperature':
        if (value > 37.5) return 'warning';
        if (value > 38.5) return 'critical';
        return 'normal';
      
      case 'oxygen_saturation':
        if (value < 95) return 'warning';
        if (value < 90) return 'critical';
        return 'normal';
      
      default:
        return 'normal';
    }
  };

  const getTrend = (metrics: any[], type: string, currentTimestamp: string): 'up' | 'down' | 'stable' => {
    const currentIndex = metrics.findIndex(m => m.recorded_at === currentTimestamp);
    if (currentIndex === -1 || currentIndex === metrics.length - 1) return 'stable';
    
    const currentMetric = metrics[currentIndex];
    const previousMetric = metrics[currentIndex + 1];
    
    if (!currentMetric || !previousMetric) return 'stable';
    
    let currentValue, previousValue;
    
    switch (type) {
      case 'heart_rate':
        currentValue = currentMetric.heart_rate;
        previousValue = previousMetric.heart_rate;
        break;
      case 'temperature':
        currentValue = currentMetric.temperature;
        previousValue = previousMetric.temperature;
        break;
      case 'oxygen_saturation':
        currentValue = currentMetric.oxygen_saturation;
        previousValue = previousMetric.oxygen_saturation;
        break;
      case 'weight':
        currentValue = currentMetric.weight;
        previousValue = previousMetric.weight;
        break;
      default:
        return 'stable';
    }
    
    if (currentValue > previousValue) return 'up';
    if (currentValue < previousValue) return 'down';
    return 'stable';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'heart_rate': return <HeartIcon className="w-6 h-6 text-red-500" />;
      case 'blood_pressure': return <ChartBarIcon className="w-6 h-6 text-blue-500" />;
      case 'temperature': return <div className="w-6 h-6 text-orange-500">🌡️</div>;
      case 'oxygen_saturation': return <div className="w-6 h-6 text-cyan-500">🫁</div>;
      case 'weight': return <div className="w-6 h-6 text-purple-500">⚖️</div>;
      default: return <ChartBarIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getVitalLabel = (type: string) => {
    switch (type) {
      case 'heart_rate': return 'Frecuencia Cardíaca';
      case 'blood_pressure': return 'Presión Arterial';
      case 'temperature': return 'Temperatura';
      case 'oxygen_saturation': return 'Saturación de Oxígeno';
      case 'weight': return 'Peso';
      default: return 'Métrica';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Métricas de Salud
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitoreo en tiempo real de tus signos vitales
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Selector de tiempo */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className={`px-3 py-1 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          
          {/* Botón de actualizar */}
          <button
            onClick={loadHealthMetrics}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Botón de agregar */}
          <button
            onClick={() => setShowAddMetric(true)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de signos vitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vitalSigns.slice(0, 6).map((vital) => (
          <div
            key={vital.id}
            className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getVitalIcon(vital.type)}
                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getVitalLabel(vital.type)}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(vital.timestamp).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vital.status)}`}>
                  {vital.status === 'normal' ? 'Normal' : vital.status === 'warning' ? 'Advertencia' : 'Crítico'}
                </span>
                {getTrendIcon(vital.trend)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {vital.value} <span className="text-sm font-normal text-gray-500">{vital.unit}</span>
              </div>
              <button className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}>
                <EyeIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Objetivos de salud */}
      {healthGoals.length > 0 && (
        <div>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Objetivos de Salud
          </h4>
          <div className="space-y-3">
            {healthGoals.map((goal) => (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {goal.title}
                  </h5>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {goal.progress}%
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Meta: {new Date(goal.deadline).toLocaleDateString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para agregar métrica */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Agregar Métrica de Salud
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Métrica
                </label>
                <select className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option value="heart_rate">Frecuencia Cardíaca</option>
                  <option value="blood_pressure">Presión Arterial</option>
                  <option value="temperature">Temperatura</option>
                  <option value="oxygen_saturation">Saturación de Oxígeno</option>
                  <option value="weight">Peso</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Valor
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ingresa el valor"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMetric(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Implementar guardado de métrica
                  setShowAddMetric(false);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
