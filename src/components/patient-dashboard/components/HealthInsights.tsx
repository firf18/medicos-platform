'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  BeakerIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface HealthInsightsProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  category: 'medication' | 'vitals' | 'appointments' | 'lifestyle' | 'general';
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
}

export function HealthInsights({ userId, darkMode, realTimeData }: HealthInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadHealthInsights();
  }, [userId]);

  const loadHealthInsights = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos recientes para generar insights
      const [metricsResult, medicationsResult, appointmentsResult] = await Promise.all([
        supabase
          .from('health_metrics')
          .select('*')
          .eq('patient_id', userId)
          .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('recorded_at', { ascending: false }),
        
        supabase
          .from('patient_medications')
          .select('*')
          .eq('patient_id', userId)
          .eq('is_active', true),
        
        supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', userId)
          .gte('scheduled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const metrics = metricsResult.data || [];
      const medications = medicationsResult.data || [];
      const appointments = appointmentsResult.data || [];

      // Generar insights basados en los datos
      const generatedInsights = generateInsights(metrics, medications, appointments);
      setInsights(generatedInsights);

      // Generar tendencias
      const generatedTrends = generateTrends(metrics);
      setTrends(generatedTrends);

    } catch (error) {
      console.error('Error loading health insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (metrics: any[], medications: any[], appointments: any[]): Insight[] => {
    const insights: Insight[] = [];
    const now = new Date();

    // Insight sobre medicamentos
    const missedMeds = medications.filter(m => m.missed_doses > 0);
    if (missedMeds.length > 0) {
      insights.push({
        id: 'medication-adherence',
        type: 'warning',
        title: 'Adherencia a Medicamentos',
        description: `Has perdido ${missedMeds.length} dosis de medicamentos en los últimos días.`,
        category: 'medication',
        priority: 'high',
        timestamp: now.toISOString(),
        actionable: true,
        actionText: 'Configurar recordatorios',
        actionUrl: '/medications/reminders'
      });
    } else if (medications.length > 0) {
      insights.push({
        id: 'medication-excellent',
        type: 'positive',
        title: 'Excelente Adherencia',
        description: 'Has tomado todos tus medicamentos correctamente. ¡Sigue así!',
        category: 'medication',
        priority: 'low',
        timestamp: now.toISOString(),
        actionable: false
      });
    }

    // Insight sobre signos vitales
    if (metrics.length > 0) {
      const recentMetrics = metrics.slice(0, 5);
      const avgHeartRate = recentMetrics.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / recentMetrics.length;
      
      if (avgHeartRate > 90) {
        insights.push({
          id: 'heart-rate-elevated',
          type: 'warning',
          title: 'Frecuencia Cardíaca Elevada',
          description: `Tu frecuencia cardíaca promedio es ${Math.round(avgHeartRate)} bpm, por encima del rango normal.`,
          category: 'vitals',
          priority: 'medium',
          timestamp: now.toISOString(),
          actionable: true,
          actionText: 'Consultar con médico',
          actionUrl: '/appointments/schedule'
        });
      } else if (avgHeartRate >= 60 && avgHeartRate <= 80) {
        insights.push({
          id: 'heart-rate-optimal',
          type: 'positive',
          title: 'Frecuencia Cardíaca Óptima',
          description: `Tu frecuencia cardíaca promedio de ${Math.round(avgHeartRate)} bpm está en el rango ideal.`,
          category: 'vitals',
          priority: 'low',
          timestamp: now.toISOString(),
          actionable: false
        });
      }
    }

    // Insight sobre citas
    const upcomingAppointments = appointments.filter(a => 
      new Date(a.scheduled_at) > now && a.status === 'scheduled'
    );
    
    if (upcomingAppointments.length === 0) {
      insights.push({
        id: 'no-upcoming-appointments',
        type: 'recommendation',
        title: 'Sin Citas Programadas',
        description: 'No tienes citas médicas programadas. Considera programar una consulta de seguimiento.',
        category: 'appointments',
        priority: 'medium',
        timestamp: now.toISOString(),
        actionable: true,
        actionText: 'Programar cita',
        actionUrl: '/appointments/schedule'
      });
    }

    // Insight sobre actividad física (simulado)
    insights.push({
      id: 'activity-recommendation',
      type: 'recommendation',
      title: 'Actividad Física',
      description: 'Se recomienda realizar al menos 30 minutos de actividad física moderada diaria.',
      category: 'lifestyle',
      priority: 'medium',
      timestamp: now.toISOString(),
      actionable: true,
      actionText: 'Ver rutinas',
      actionUrl: '/lifestyle/exercise'
    });

    // Insight de logro
    if (metrics.length >= 7) {
      insights.push({
        id: 'consistent-monitoring',
        type: 'achievement',
        title: 'Monitoreo Consistente',
        description: 'Has registrado tus métricas de salud durante 7 días consecutivos. ¡Excelente compromiso!',
        category: 'general',
        priority: 'low',
        timestamp: now.toISOString(),
        actionable: false
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateTrends = (metrics: any[]): HealthTrend[] => {
    const trends: HealthTrend[] = [];
    
    if (metrics.length < 2) return trends;

    // Tendencia de frecuencia cardíaca
    const heartRates = metrics.map(m => m.heart_rate).filter(hr => hr);
    if (heartRates.length >= 2) {
      const firstHalf = heartRates.slice(0, Math.floor(heartRates.length / 2));
      const secondHalf = heartRates.slice(Math.floor(heartRates.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, hr) => sum + hr, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, hr) => sum + hr, 0) / secondHalf.length;
      
      const change = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      trends.push({
        metric: 'Frecuencia Cardíaca',
        trend: change > 5 ? 'declining' : change < -5 ? 'improving' : 'stable',
        change: Math.abs(change),
        period: 'Últimos 30 días',
        significance: Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low'
      });
    }

    return trends;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'recommendation': return <LightBulbIcon className="w-6 h-6 text-blue-500" />;
      case 'achievement': return <StarIcon className="w-6 h-6 text-purple-500" />;
      default: return <ChartBarIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-500 bg-green-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'recommendation': return 'border-blue-500 bg-blue-50';
      case 'achievement': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return <BeakerIcon className="w-4 h-4" />;
      case 'vitals': return <HeartIcon className="w-4 h-4" />;
      case 'appointments': return <CalendarIcon className="w-4 h-4" />;
      case 'lifestyle': return <ChartBarIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'declining': return <ArrowTrendingUpIcon className="w-5 h-5 text-red-500 rotate-180" />;
      default: return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'Todos', count: insights.length },
    { key: 'medication', label: 'Medicamentos', count: insights.filter(i => i.category === 'medication').length },
    { key: 'vitals', label: 'Signos Vitales', count: insights.filter(i => i.category === 'vitals').length },
    { key: 'appointments', label: 'Citas', count: insights.filter(i => i.category === 'appointments').length },
    { key: 'lifestyle', label: 'Estilo de Vida', count: insights.filter(i => i.category === 'lifestyle').length }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Insights de Salud
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Análisis inteligente de tu salud
          </p>
        </div>
        
        <button
          onClick={loadHealthInsights}
          className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowPathIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Tendencias */}
      {trends.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tendencias de Salud
          </h4>
          <div className="space-y-2">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trend.trend)}
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {trend.metric}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    trend.trend === 'improving' ? 'bg-green-100 text-green-800' :
                    trend.trend === 'declining' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trend.trend === 'improving' ? 'Mejorando' :
                     trend.trend === 'declining' ? 'Empeorando' : 'Estable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de insights */}
      <div className="space-y-3">
        {filteredInsights.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <LightBulbIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay insights disponibles</p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)} ${
                darkMode ? 'bg-gray-700' : 'bg-white'
              } hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setShowDetails(showDetails === insight.id ? null : insight.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {insight.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {insight.priority === 'high' ? 'Alta' :
                         insight.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(insight.timestamp).toLocaleDateString('es-ES')}
                    </span>
                    
                    {insight.actionable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (insight.actionUrl) {
                            window.location.href = insight.actionUrl;
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {insight.actionText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
