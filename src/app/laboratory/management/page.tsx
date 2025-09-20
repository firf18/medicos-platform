/**
 * Laboratory Management Page - Red-Salud Platform
 * 
 * Página principal de gestión de laboratorio médico refactorizada.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth';
import { 
  TestTube, 
  BarChart3,
  FileText,
  TrendingUp
} from 'lucide-react';

// Hooks y utilidades
import { useLabData, useLabFilters } from '@/hooks/laboratory/useLabData';

// Componentes especializados
import LabStatisticsWidget, { SecondaryLabMetrics } from '@/components/laboratory/LabStatisticsWidget';
import LabFilters from '@/components/laboratory/LabFilters';
import LabTestsTable from '@/components/laboratory/LabTestsTable';
import { 
  PopularTestsWidget, 
  RecentActivityWidget,
  PerformanceMetricsWidget,
  RevenueWidget
} from '@/components/laboratory/LabWidgets';

// Tipos
import { TestStatus } from '@/types/laboratory.types';

// ============================================================================
// CONFIGURACIÓN DE TABS
// ============================================================================

const LAB_TABS = [
  { id: 'overview', label: 'Resumen', icon: BarChart3 },
  { id: 'tests', label: 'Análisis', icon: TestTube },
  { id: 'results', label: 'Resultados', icon: FileText },
  { id: 'analytics', label: 'Estadísticas', icon: TrendingUp }
] as const;

type TabId = typeof LAB_TABS[number]['id'];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function LaboratoryManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  // Datos del laboratorio
  const {
    stats,
    labTests,
    testTypes,
    loading,
    error,
    refetch,
    updateTestStatus
  } = useLabData();
  
  // Filtros para tests
  const {
    filteredTests,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useLabFilters(labTests);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTestClick = (test: any) => {
    console.log('Test clicked:', test);
    // En producción, abrir modal o navegar a detalle
  };

  const handleStatusChange = async (testId: string, newStatus: TestStatus) => {
    try {
      await updateTestStatus(testId, newStatus);
      console.log(`Test ${testId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  const handleDeleteTest = (testId: string) => {
    console.log('Delete test:', testId);
    // En producción, mostrar confirmación y eliminar
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
  };

  const handleSearchChange = (value: string) => {
    updateFilter('search', value);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    updateFilter('dateRange', JSON.stringify({ start, end }));
  };

  // ============================================================================
  // ESTADOS DE LOADING Y ERROR
  // ============================================================================

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar datos del laboratorio
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading && labTests.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Stats skeleton */}
        <LabStatisticsWidget stats={stats} loading={true} />
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TestTube className="h-8 w-8 mr-3 text-blue-600" />
              Panel de Gestión de Laboratorio
            </h1>
            <p className="mt-1 text-gray-600">
              Gestiona análisis clínicos, resultados y reportes del laboratorio
            </p>
          </div>
          
          <SecondaryLabMetrics
            averageProcessingTime={stats.averageProcessingTime}
            monthlyRevenue={stats.monthlyRevenue}
          />
        </div>
      </div>

      {/* Estadísticas principales */}
      <LabStatisticsWidget 
        stats={stats} 
        loading={loading}
      />

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {LAB_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Widgets principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PopularTestsWidget 
                  testTypes={testTypes}
                  loading={loading}
                />
                
                <RecentActivityWidget 
                  labTests={labTests.slice(0, 8)}
                  loading={loading}
                  onTestClick={handleTestClick}
                />
              </div>

              {/* Métricas adicionales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceMetricsWidget 
                  tests={labTests}
                  targetProcessingTime={24}
                />
                
                <RevenueWidget 
                  testTypes={testTypes}
                  completedTests={labTests.filter(t => 
                    ['completed', 'reviewed', 'sent'].includes(t.status)
                  )}
                />
              </div>
            </div>
          )}

          {/* Tab: Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {/* Filtros */}
              <LabFilters
                filters={{
                  statusFilter: filters.status,
                  priorityFilter: filters.priority,
                  categoryFilter: filters.category,
                  searchTerm: filters.search,
                  dateRange: { start: '', end: '' } // Simplificado para el demo
                }}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                onDateRangeChange={handleDateRangeChange}
                onClearFilters={clearFilters}
                totalResults={labTests.length}
                filteredResults={filteredTests.length}
              />

              {/* Tabla de Tests */}
              <LabTestsTable
                tests={filteredTests}
                loading={loading}
                onTestClick={handleTestClick}
                onStatusChange={handleStatusChange}
                onDeleteTest={handleDeleteTest}
              />
            </div>
          )}

          {/* Tab: Results - Placeholder */}
          {activeTab === 'results' && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Gestión de Resultados
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Próximamente: Carga y envío de resultados de laboratorio
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <FileText className="h-4 w-4 mr-2" />
                  Configurar módulo de resultados
                </button>
              </div>
            </div>
          )}

          {/* Tab: Analytics - Placeholder */}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Estadísticas y Reportes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Próximamente: Análisis de productividad y reportes detallados
              </p>
              <div className="mt-6 space-y-3">
                <div className="text-sm text-gray-600">
                  Funcionalidades planificadas:
                </div>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Reportes de productividad mensual</li>
                  <li>• Análisis de tiempos de procesamiento</li>
                  <li>• Métricas de calidad y control</li>
                  <li>• Dashboards personalizables</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}