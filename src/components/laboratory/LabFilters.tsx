/**
 * Lab Filters Component - Red-Salud Platform
 * 
 * Componente especializado para filtros del laboratorio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { Search, Filter, X, Calendar, Download } from 'lucide-react';
import { TestStatus, TestPriority, TestCategory } from '@/types/laboratory.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface LabFiltersProps {
  filters: {
    statusFilter: string;
    priorityFilter: string;
    categoryFilter: string;
    searchTerm: string;
    dateRange: { start: string; end: string };
  };
  onFilterChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onClearFilters: () => void;
  totalResults: number;
  filteredResults: number;
  className?: string;
}

interface QuickFilterProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

// ============================================================================
// DATOS DE CONFIGURACIÓN
// ============================================================================

const STATUS_OPTIONS: { value: string; label: string; color?: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'received', label: 'Recibidos', color: 'bg-gray-100' },
  { value: 'registered', label: 'Registrados', color: 'bg-blue-100' },
  { value: 'processing', label: 'Procesando', color: 'bg-indigo-100' },
  { value: 'completed', label: 'Completados', color: 'bg-green-100' },
  { value: 'reviewed', label: 'Revisados', color: 'bg-emerald-100' },
  { value: 'sent', label: 'Enviados', color: 'bg-purple-100' },
  { value: 'rejected', label: 'Rechazados', color: 'bg-red-100' }
];

const PRIORITY_OPTIONS: { value: string; label: string; color?: string }[] = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100' },
  { value: 'stat', label: 'STAT', color: 'bg-red-200' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100' },
  { value: 'low', label: 'Baja', color: 'bg-green-100' }
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'Hematología', label: 'Hematología' },
  { value: 'Bioquímica', label: 'Bioquímica' },
  { value: 'Microbiología', label: 'Microbiología' },
  { value: 'Inmunología', label: 'Inmunología' },
  { value: 'Endocrinología', label: 'Endocrinología' },
  { value: 'Genética', label: 'Genética' },
  { value: 'Toxicología', label: 'Toxicología' }
];

// ============================================================================
// COMPONENTE DE FILTRO RÁPIDO
// ============================================================================

function QuickFilter({ label, isActive, onClick, count }: QuickFilterProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
        ${isActive 
          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {label}
      {count !== undefined && (
        <span className={`
          ml-2 px-2 py-0.5 text-xs rounded-full
          ${isActive ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-600'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function LabFilters({
  filters,
  onFilterChange,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
  totalResults,
  filteredResults,
  className = ''
}: LabFiltersProps) {
  
  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'string') return value !== 'all' && value !== '';
    if (typeof value === 'object') return value.start !== '' || value.end !== '';
    return false;
  });

  const handleExport = () => {
    // En producción, implementar exportación de datos filtrados
    console.log('Exporting filtered results...');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda y filtros principales */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Campo de búsqueda */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar paciente, médico o tipo de análisis..."
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              placeholder-gray-500 text-sm
            "
          />
          {filters.searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtro por estado */}
        <select
          value={filters.statusFilter}
          onChange={(e) => onFilterChange('statusFilter', e.target.value)}
          className="
            border border-gray-300 rounded-md px-3 py-2 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm min-w-48
          "
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Filtro por prioridad */}
        <select
          value={filters.priorityFilter}
          onChange={(e) => onFilterChange('priorityFilter', e.target.value)}
          className="
            border border-gray-300 rounded-md px-3 py-2 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm min-w-48
          "
        >
          {PRIORITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Filtro por categoría */}
        <select
          value={filters.categoryFilter}
          onChange={(e) => onFilterChange('categoryFilter', e.target.value)}
          className="
            border border-gray-300 rounded-md px-3 py-2 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm min-w-48
          "
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros de fecha y acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Rango de fechas */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onDateRangeChange(e.target.value, filters.dateRange.end)}
              className="
                border border-gray-300 rounded-md px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-sm
              "
            />
            <span className="text-gray-500 text-sm">hasta</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onDateRangeChange(filters.dateRange.start, e.target.value)}
              className="
                border border-gray-300 rounded-md px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-sm
              "
            />
          </div>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="
                inline-flex items-center px-3 py-2 border border-gray-300 rounded-md
                text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Resultados y exportar */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredResults.toLocaleString()}</span>
            {filteredResults !== totalResults && (
              <span> de {totalResults.toLocaleString()}</span>
            )}
            <span> análisis</span>
          </div>

          <button
            onClick={handleExport}
            disabled={filteredResults === 0}
            className="
              inline-flex items-center px-3 py-2 border border-gray-300 rounded-md
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Filtros rápidos:</span>
        
        <QuickFilter
          label="Urgentes"
          isActive={filters.priorityFilter === 'urgent'}
          onClick={() => onFilterChange('priorityFilter', 
            filters.priorityFilter === 'urgent' ? 'all' : 'urgent'
          )}
        />
        
        <QuickFilter
          label="Pendientes"
          isActive={['received', 'registered', 'processing'].includes(filters.statusFilter)}
          onClick={() => onFilterChange('statusFilter', 
            ['received', 'registered', 'processing'].includes(filters.statusFilter) ? 'all' : 'processing'
          )}
        />
        
        <QuickFilter
          label="Completados hoy"
          isActive={filters.statusFilter === 'completed'}
          onClick={() => onFilterChange('statusFilter', 
            filters.statusFilter === 'completed' ? 'all' : 'completed'
          )}
        />
        
        <QuickFilter
          label="Bioquímica"
          isActive={filters.categoryFilter === 'Bioquímica'}
          onClick={() => onFilterChange('categoryFilter', 
            filters.categoryFilter === 'Bioquímica' ? 'all' : 'Bioquímica'
          )}
        />
        
        <QuickFilter
          label="Hematología"
          isActive={filters.categoryFilter === 'Hematología'}
          onClick={() => onFilterChange('categoryFilter', 
            filters.categoryFilter === 'Hematología' ? 'all' : 'Hematología'
          )}
        />
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-800">
                Filtros activos aplicados
              </span>
            </div>
            <span className="text-xs text-blue-600">
              Mostrando {filteredResults} de {totalResults} resultados
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: SELECTOR DE VISTA
// ============================================================================

interface ViewSelectorProps {
  currentView: 'table' | 'cards' | 'timeline';
  onViewChange: (view: 'table' | 'cards' | 'timeline') => void;
  className?: string;
}

export function LabViewSelector({ currentView, onViewChange, className = '' }: ViewSelectorProps) {
  const views = [
    { id: 'table', label: 'Tabla', icon: '📋' },
    { id: 'cards', label: 'Tarjetas', icon: '🃏' },
    { id: 'timeline', label: 'Línea de tiempo', icon: '📅' }
  ] as const;

  return (
    <div className={`flex border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors duration-200
            ${currentView === view.id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-300 last:border-r-0'
            }
          `}
        >
          <span className="mr-2">{view.icon}</span>
          {view.label}
        </button>
      ))}
    </div>
  );
}
