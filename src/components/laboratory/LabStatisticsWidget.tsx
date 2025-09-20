/**
 * Lab Statistics Widget - Red-Salud Platform
 * 
 * Widget especializado para mostrar estadísticas del laboratorio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { 
  TestTube, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LabStats } from '@/types/laboratory.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface LabStatisticsWidgetProps {
  stats: LabStats;
  loading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'yellow' | 'green' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  onClick?: () => void;
}

// ============================================================================
// CONFIGURACIÓN DE COLORES
// ============================================================================

const COLOR_CLASSES = {
  blue: {
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    text: 'text-white',
    iconBg: 'text-blue-100',
    subtitleText: 'text-blue-100'
  },
  yellow: {
    gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    text: 'text-white',
    iconBg: 'text-yellow-100',
    subtitleText: 'text-yellow-100'
  },
  green: {
    gradient: 'bg-gradient-to-r from-green-500 to-green-600',
    text: 'text-white',
    iconBg: 'text-green-100',
    subtitleText: 'text-green-100'
  },
  red: {
    gradient: 'bg-gradient-to-r from-red-500 to-red-600',
    text: 'text-white',
    iconBg: 'text-red-100',
    subtitleText: 'text-red-100'
  }
};

// ============================================================================
// COMPONENTE DE TARJETA ESTADÍSTICA
// ============================================================================

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  onClick 
}: StatCardProps) {
  const colorClasses = COLOR_CLASSES[color];
  
  return (
    <div 
      className={`
        ${colorClasses.gradient} 
        rounded-lg p-6 
        ${colorClasses.text}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
        shadow-lg hover:shadow-xl transition-shadow duration-200
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${colorClasses.iconBg}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className={`text-sm font-medium ${colorClasses.subtitleText}`}>
                {title}
              </dt>
              <dd className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </dd>
              {subtitle && (
                <dd className={`text-xs ${colorClasses.subtitleText} mt-1`}>
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
        
        {trend && (
          <div className="flex flex-col items-end">
            <div className={`flex items-center text-xs ${colorClasses.subtitleText}`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
            <div className={`text-xs ${colorClasses.subtitleText}`}>
              {trend.period}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE SKELETON PARA LOADING
// ============================================================================

function StatCardSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="animate-pulse">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function LabStatisticsWidget({ 
  stats, 
  loading = false, 
  className = '' 
}: LabStatisticsWidgetProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Calcular tendencias simuladas (en producción vendrían de la API)
  const trends = {
    totalTests: { value: 8.2, direction: 'up' as const, period: 'vs mes anterior' },
    pendingResults: { value: 5.1, direction: 'down' as const, period: 'vs ayer' },
    completedToday: { value: 12.5, direction: 'up' as const, period: 'vs ayer' },
    urgentTests: { value: 2.3, direction: 'down' as const, period: 'vs ayer' }
  };

  const handleStatClick = (statType: string) => {
    // En una implementación real, esto podría navegar a una vista detallada
    console.log(`Clicked on ${statType} statistic`);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      <StatCard
        title="Total Análisis"
        value={stats.totalTests}
        subtitle="Este mes"
        icon={TestTube}
        color="blue"
        trend={trends.totalTests}
        onClick={() => handleStatClick('totalTests')}
      />

      <StatCard
        title="Pendientes"
        value={stats.pendingResults}
        subtitle="Requieren atención"
        icon={Clock}
        color="yellow"
        trend={trends.pendingResults}
        onClick={() => handleStatClick('pendingResults')}
      />

      <StatCard
        title="Completados Hoy"
        value={stats.completedToday}
        subtitle="Resultados listos"
        icon={CheckCircle}
        color="green"
        trend={trends.completedToday}
        onClick={() => handleStatClick('completedToday')}
      />

      <StatCard
        title="Urgentes"
        value={stats.urgentTests}
        subtitle="Prioridad alta"
        icon={AlertTriangle}
        color="red"
        trend={trends.urgentTests}
        onClick={() => handleStatClick('urgentTests')}
      />
    </div>
  );
}

// ============================================================================
// COMPONENTE ADICIONAL: MÉTRICAS SECUNDARIAS
// ============================================================================

interface SecondaryMetricsProps {
  averageProcessingTime: number;
  monthlyRevenue: number;
  className?: string;
}

export function SecondaryLabMetrics({ 
  averageProcessingTime, 
  monthlyRevenue, 
  className = '' 
}: SecondaryMetricsProps) {
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {averageProcessingTime}h
        </div>
        <div className="text-sm text-gray-500">
          Tiempo promedio
        </div>
      </div>
      
      <div className="h-8 w-px bg-gray-300"></div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          ${monthlyRevenue.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          Ingresos del mes
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK PERSONALIZADO PARA ESTADÍSTICAS
// ============================================================================

export function useLabStatistics(stats: LabStats) {
  const getEfficiencyScore = () => {
    // Calcular un score de eficiencia basado en métricas clave
    const targetProcessingTime = 24; // horas objetivo
    const efficiencyRatio = Math.max(0, (targetProcessingTime - stats.averageProcessingTime) / targetProcessingTime);
    const urgentRatio = stats.urgentTests / Math.max(1, stats.totalTests);
    const completionRatio = stats.completedToday / Math.max(1, stats.pendingResults + stats.completedToday);
    
    return Math.round((efficiencyRatio * 0.4 + (1 - urgentRatio) * 0.3 + completionRatio * 0.3) * 100);
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const efficiencyScore = getEfficiencyScore();

  return {
    efficiencyScore,
    statusColor: getStatusColor(efficiencyScore),
    isPerformingWell: efficiencyScore >= 70,
    recommendations: {
      reduceProcessingTime: stats.averageProcessingTime > 24,
      prioritizeUrgent: stats.urgentTests > 5,
      increaseCapacity: stats.pendingResults > 20
    }
  };
}
