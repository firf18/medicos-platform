'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ChartBarIcon, 
  ArrowArrowArrowTrendingUpIcon, 
  ArrowArrowArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  BeakerIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowPathIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface AdvancedAnalyticsProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
}

interface AnalyticsData {
  healthScore: number;
  medicationAdherence: number;
  appointmentAttendance: number;
  labResultsTrend: 'improving' | 'stable' | 'declining';
  vitalSignsStability: number;
  riskFactors: string[];
  recommendations: string[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export function AdvancedAnalytics({ userId, darkMode, realTimeData }: AdvancedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, selectedTimeframe, selectedMetric]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Calcular fecha de inicio
      const now = new Date();
      const startDate = new Date();
      switch (selectedTimeframe) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Cargar métricas de salud
      const { data: metrics, error: metricsError } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', userId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (metricsError) throw metricsError;

      // Cargar datos de medicamentos
      const { data: medications, error: medsError } = await supabase
        .from('patient_medications')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true);

      if (medsError) throw medsError;

      // Cargar datos de citas
      const { data: appointments, error: appsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .gte('scheduled_at', startDate.toISOString());

      if (appsError) throw appsError;

      // Procesar datos
      if (metrics) {
        const processedMetrics: HealthMetric[] = metrics.map(metric => ({
          id: metric.id,
          type: 'heart_rate',
          value: metric.heart_rate || 0,
          unit: 'bpm',
          timestamp: metric.recorded_at,
          trend: calculateTrend(metrics, 'heart_rate', metric.recorded_at)
        }));

        setHealthMetrics(processedMetrics);
        
        // Generar datos del gráfico
        generateChartData(processedMetrics);
      }

      // Calcular analytics
      const analytics: AnalyticsData = {
        healthScore: calculateHealthScore(metrics, medications, appointments),
        medicationAdherence: calculateMedicationAdherence(medications),
        appointmentAttendance: calculateAppointmentAttendance(appointments),
        labResultsTrend: calculateLabTrend(metrics),
        vitalSignsStability: calculateVitalSignsStability(metrics),
        riskFactors: identifyRiskFactors(metrics, medications),
        recommendations: generateRecommendations(metrics, medications, appointments)
      };

      setAnalyticsData(analytics);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrend = (metrics: any[], type: string, currentTimestamp: string): 'up' | 'down' | 'stable' => {
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
      default:
        return 'stable';
    }
    
    if (currentValue > previousValue) return 'up';
    if (currentValue < previousValue) return 'down';
    return 'stable';
  };

  const calculateHealthScore = (metrics: any[], medications: any[], appointments: any[]): number => {
    let score = 100;
    
    // Penalizar por medicamentos perdidos
    if (medications) {
      score -= medications.filter(m => m.missed_doses > 0).length * 5;
    }
    
    // Penalizar por citas canceladas
    if (appointments) {
      score -= appointments.filter(a => a.status === 'cancelled').length * 3;
    }
    
    // Verificar signos vitales anormales
    if (metrics) {
      metrics.forEach(metric => {
        if (metric.heart_rate < 60 || metric.heart_rate > 100) score -= 2;
        if (metric.temperature > 37.5) score -= 5;
        if (metric.oxygen_saturation < 95) score -= 8;
      });
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const calculateMedicationAdherence = (medications: any[]): number => {
    if (!medications || medications.length === 0) return 100;
    
    const totalDoses = medications.reduce((sum, med) => sum + (med.total_doses || 0), 0);
    const missedDoses = medications.reduce((sum, med) => sum + (med.missed_doses || 0), 0);
    
    return totalDoses > 0 ? Math.round(((totalDoses - missedDoses) / totalDoses) * 100) : 100;
  };

  const calculateAppointmentAttendance = (appointments: any[]): number => {
    if (!appointments || appointments.length === 0) return 100;
    
    const completed = appointments.filter(a => a.status === 'completed').length;
    const total = appointments.length;
    
    return total > 0 ? Math.round((completed / total) * 100) : 100;
  };

  const calculateLabTrend = (metrics: any[]): 'improving' | 'stable' | 'declining' => {
    if (!metrics || metrics.length < 2) return 'stable';
    
    // Simplificado: comparar primeros y últimos valores
    const firstMetric = metrics[0];
    const lastMetric = metrics[metrics.length - 1];
    
    if (lastMetric.heart_rate < firstMetric.heart_rate) return 'improving';
    if (lastMetric.heart_rate > firstMetric.heart_rate) return 'declining';
    return 'stable';
  };

  const calculateVitalSignsStability = (metrics: any[]): number => {
    if (!metrics || metrics.length < 2) return 100;
    
    let stabilityScore = 100;
    const heartRates = metrics.map(m => m.heart_rate).filter(hr => hr);
    
    if (heartRates.length > 1) {
      const variance = calculateVariance(heartRates);
      stabilityScore -= Math.min(variance * 10, 50);
    }
    
    return Math.max(0, Math.round(stabilityScore));
  };

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const identifyRiskFactors = (metrics: any[], medications: any[]): string[] => {
    const risks: string[] = [];
    
    if (metrics) {
      metrics.forEach(metric => {
        if (metric.heart_rate > 100) risks.push('Frecuencia cardíaca elevada');
        if (metric.temperature > 37.5) risks.push('Fiebre');
        if (metric.oxygen_saturation < 95) risks.push('Saturación de oxígeno baja');
      });
    }
    
    if (medications) {
      const missedMeds = medications.filter(m => m.missed_doses > 0);
      if (missedMeds.length > 0) risks.push('Medicamentos perdidos');
    }
    
    return [...new Set(risks)]; // Eliminar duplicados
  };

  const generateRecommendations = (metrics: any[], medications: any[], appointments: any[]): string[] => {
    const recommendations: string[] = [];
    
    if (metrics) {
      const recentMetrics = metrics.slice(-5);
      const avgHeartRate = recentMetrics.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / recentMetrics.length;
      
      if (avgHeartRate > 90) {
        recommendations.push('Considera aumentar la actividad física moderada');
      }
    }
    
    if (medications) {
      const missedMeds = medications.filter(m => m.missed_doses > 0);
      if (missedMeds.length > 0) {
        recommendations.push('Configura recordatorios para medicamentos');
      }
    }
    
    recommendations.push('Mantén un registro regular de tus signos vitales');
    recommendations.push('Programa citas de seguimiento regulares');
    
    return recommendations;
  };

  const generateChartData = (metrics: HealthMetric[]) => {
    if (metrics.length === 0) return;
    
    const labels = metrics.map(m => 
      new Date(m.timestamp).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })
    );
    
    const data = metrics.map(m => m.value);
    
    setChartData({
      labels,
      datasets: [{
        label: 'Frecuencia Cardíaca',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    });
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      timeframe: selectedTimeframe,
      analytics: analyticsData,
      metrics: healthMetrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${userId}-${selectedTimeframe}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'declining': return <ArrowArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
      default: return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
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

  if (!analyticsData) {
    return (
      <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hay datos suficientes para mostrar analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics Avanzados
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Análisis profundo de tu salud
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className={`px-3 py-1 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="7d">7 días</option>
            <option value="30d">30 días</option>
            <option value="90d">90 días</option>
            <option value="1y">1 año</option>
          </select>
          
          <button
            onClick={loadAnalyticsData}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowExport(!showExport)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <HeartIcon className="w-6 h-6 text-red-500" />
            <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(analyticsData.healthScore)}`}>
              {analyticsData.healthScore}%
            </span>
          </div>
          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Puntuación de Salud
          </h4>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Basada en múltiples factores
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <BeakerIcon className="w-6 h-6 text-green-500" />
            <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(analyticsData.medicationAdherence)}`}>
              {analyticsData.medicationAdherence}%
            </span>
          </div>
          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Adherencia Medicamentos
          </h4>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cumplimiento del tratamiento
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(analyticsData.appointmentAttendance)}`}>
              {analyticsData.appointmentAttendance}%
            </span>
          </div>
          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Asistencia a Citas
          </h4>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Puntualidad médica
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
            <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(analyticsData.vitalSignsStability)}`}>
              {analyticsData.vitalSignsStability}%
            </span>
          </div>
          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Estabilidad Vital
          </h4>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Consistencia de signos vitales
          </p>
        </div>
      </div>

      {/* Gráfico de tendencias */}
      {chartData && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tendencias de Salud
          </h4>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gráfico interactivo de tendencias
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {chartData.labels.length} puntos de datos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Factores de riesgo */}
      {analyticsData.riskFactors.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Factores de Riesgo Identificados
          </h4>
          <div className="space-y-2">
            {analyticsData.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {risk}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recomendaciones Personalizadas
        </h4>
        <div className="space-y-2">
          {analyticsData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {recommendation}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de exportación */}
      {showExport && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Exportar Datos
          </h4>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Descargar JSON
            </button>
            <button
              onClick={() => setShowExport(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
