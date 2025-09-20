/**
 * Lab Widgets - Red-Salud Platform
 * 
 * Widgets especializados para dashboard de laboratorio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { 
  FlaskConical, 
  Microscope, 
  TrendingUp, 
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { TestType, LabTest } from '@/types/laboratory.types';
import { 
  getStatusColor, 
  getPriorityColor, 
  getPriorityText,
  formatTestDate,
  getCategoryColor
} from '@/lib/laboratory/lab-utils';
import { getStatusIcon } from './LabIcons';

// ============================================================================
// WIDGET: ANÁLISIS MÁS SOLICITADOS
// ============================================================================

interface PopularTestsWidgetProps {
  testTypes: TestType[];
  loading?: boolean;
  className?: string;
}

export function PopularTestsWidget({ 
  testTypes, 
  loading = false, 
  className = '' 
}: PopularTestsWidgetProps) {
  
  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-100 rounded w-20"></div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedTests = testTypes
    .slice()
    .sort((a, b) => b.tests_count - a.tests_count)
    .slice(0, 6);

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FlaskConical className="h-5 w-5 mr-2" />
        Análisis Más Solicitados
      </h3>
      
      <div className="space-y-3">
        {sortedTests.map((testType, index) => (
          <div key={testType.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 text-sm font-medium text-gray-500 w-6">
                #{index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {testType.name}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`
                    inline-block px-2 py-0.5 text-xs rounded-full
                    ${getCategoryColor(testType.category)}
                  `}>
                    {testType.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {testType.processing_time}h procesamiento
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600">
                {testType.tests_count}
              </p>
              <p className="text-xs text-gray-500">
                ${testType.price}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total este mes:
          </span>
          <span className="font-medium text-gray-900">
            {sortedTests.reduce((sum, test) => sum + test.tests_count, 0)} análisis
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">
            Ingresos estimados:
          </span>
          <span className="font-medium text-green-600">
            ${sortedTests.reduce((sum, test) => sum + (test.tests_count * test.price), 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WIDGET: ACTIVIDAD RECIENTE
// ============================================================================

interface RecentActivityWidgetProps {
  labTests: LabTest[];
  loading?: boolean;
  onTestClick?: (test: LabTest) => void;
  className?: string;
}

export function RecentActivityWidget({ 
  labTests, 
  loading = false, 
  onTestClick,
  className = '' 
}: RecentActivityWidgetProps) {
  
  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentTests = labTests
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Microscope className="h-5 w-5 mr-2" />
        Actividad Reciente
      </h3>
      
      <div className="space-y-3">
        {recentTests.map((test) => (
          <div 
            key={test.id} 
            className={`
              flex items-center justify-between p-2 rounded-lg transition-colors duration-150
              ${onTestClick ? 'cursor-pointer hover:bg-white' : ''}
            `}
            onClick={() => onTestClick?.(test)}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                flex-shrink-0 p-1 rounded
                ${getStatusColor(test.status).split(' ')[0]}
              `}>
                {getStatusIcon(test.status)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {test.test_type}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {test.patient_name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTestDate(test.created_at, true)}
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <span className={`
                inline-flex px-2 py-1 text-xs font-semibold rounded-full
                ${getPriorityColor(test.priority)}
              `}>
                {getPriorityText(test.priority)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {recentTests.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No hay actividad reciente</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WIDGET: MÉTRICAS DE RENDIMIENTO
// ============================================================================

interface PerformanceMetricsWidgetProps {
  tests: LabTest[];
  targetProcessingTime: number;
  className?: string;
}

export function PerformanceMetricsWidget({ 
  tests, 
  targetProcessingTime = 24,
  className = '' 
}: PerformanceMetricsWidgetProps) {
  
  const completedTests = tests.filter(t => 
    ['completed', 'reviewed', 'sent'].includes(t.status)
  );
  
  const onTimeTests = completedTests.filter(test => {
    const created = new Date(test.created_at);
    const expected = new Date(test.expected_completion);
    const actualHours = (expected.getTime() - created.getTime()) / (1000 * 60 * 60);
    return actualHours <= targetProcessingTime;
  });
  
  const onTimePercentage = completedTests.length > 0 
    ? Math.round((onTimeTests.length / completedTests.length) * 100)
    : 0;
  
  const avgProcessingTime = completedTests.length > 0
    ? Math.round(
        completedTests.reduce((sum, test) => {
          const created = new Date(test.created_at);
          const expected = new Date(test.expected_completion);
          return sum + (expected.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0) / completedTests.length
      )
    : 0;
  
  const urgentTests = tests.filter(t => t.priority === 'urgent' || t.priority === 'stat');
  const urgentCompleted = urgentTests.filter(t => ['completed', 'reviewed', 'sent'].includes(t.status));
  const urgentCompletionRate = urgentTests.length > 0
    ? Math.round((urgentCompleted.length / urgentTests.length) * 100)
    : 0;

  const metrics = [
    {
      label: 'Puntualidad',
      value: `${onTimePercentage}%`,
      target: '≥85%',
      status: onTimePercentage >= 85 ? 'good' : onTimePercentage >= 70 ? 'warning' : 'poor',
      description: 'Tests completados a tiempo'
    },
    {
      label: 'Tiempo Promedio',
      value: `${avgProcessingTime}h`,
      target: `≤${targetProcessingTime}h`,
      status: avgProcessingTime <= targetProcessingTime ? 'good' : avgProcessingTime <= targetProcessingTime * 1.2 ? 'warning' : 'poor',
      description: 'Tiempo de procesamiento'
    },
    {
      label: 'Urgentes',
      value: `${urgentCompletionRate}%`,
      target: '≥95%',
      status: urgentCompletionRate >= 95 ? 'good' : urgentCompletionRate >= 80 ? 'warning' : 'poor',
      description: 'Completión de urgentes'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Métricas de Rendimiento
      </h3>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {metric.label}
                </span>
                <span className={`
                  text-lg font-bold px-2 py-1 rounded
                  ${getStatusColor(metric.status)}
                `}>
                  {metric.value}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {metric.description}
                </span>
                <span className="text-xs text-gray-400">
                  Objetivo: {metric.target}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {completedTests.length}
            </div>
            <div className="text-xs text-gray-500">
              Completados
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {tests.filter(t => ['received', 'registered', 'processing'].includes(t.status)).length}
            </div>
            <div className="text-xs text-gray-500">
              En proceso
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WIDGET: INGRESOS Y FACTURACIÓN
// ============================================================================

interface RevenueWidgetProps {
  testTypes: TestType[];
  completedTests: LabTest[];
  className?: string;
}

export function RevenueWidget({ 
  testTypes, 
  completedTests,
  className = '' 
}: RevenueWidgetProps) {
  
  const calculateRevenue = () => {
    return completedTests.reduce((total, test) => {
      const testType = testTypes.find(tt => tt.name === test.test_type);
      return total + (testType?.price || 0);
    }, 0);
  };

  const todayRevenue = completedTests
    .filter(test => {
      const today = new Date();
      const testDate = new Date(test.created_at);
      return testDate.toDateString() === today.toDateString();
    })
    .reduce((total, test) => {
      const testType = testTypes.find(tt => tt.name === test.test_type);
      return total + (testType?.price || 0);
    }, 0);

  const monthlyRevenue = calculateRevenue();
  const avgDailyRevenue = monthlyRevenue / 30; // Simulado

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <DollarSign className="h-5 w-5 mr-2" />
        Ingresos
      </h3>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            ${monthlyRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            Este mes
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-600">
              ${todayRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Hoy
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-purple-600">
              ${Math.round(avgDailyRevenue).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Promedio diario
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">
            Top 3 generadores de ingresos:
          </div>
          {testTypes
            .slice()
            .sort((a, b) => (b.tests_count * b.price) - (a.tests_count * a.price))
            .slice(0, 3)
            .map((testType, index) => (
              <div key={testType.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">
                  {index + 1}. {testType.name}
                </span>
                <span className="font-medium text-green-600">
                  ${(testType.tests_count * testType.price).toLocaleString()}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
