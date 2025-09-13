'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, User, Building, TestTube } from 'lucide-react';

export interface SearchFilters {
  query: string;
  dateRange: {
    from: string;
    to: string;
  };
  entityType: 'all' | 'patients' | 'doctors' | 'appointments' | 'lab_results';
  status: string;
  specialty: string;
  location: string;
  urgency: 'all' | 'high' | 'medium' | 'low';
}

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  specialties?: Array<{ id: string; name: string }>;
  placeholder?: string;
  entityTypes?: Array<{ value: string; label: string; icon?: React.ReactNode }>;
}

export default function AdvancedSearchForm({
  onSearch,
  onClear,
  loading = false,
  specialties = [],
  placeholder = "Buscar pacientes, médicos, citas...",
  entityTypes = [
    { value: 'all', label: 'Todo', icon: <Search className="h-4 w-4" /> },
    { value: 'patients', label: 'Pacientes', icon: <User className="h-4 w-4" /> },
    { value: 'doctors', label: 'Médicos', icon: <Building className="h-4 w-4" /> },
    { value: 'appointments', label: 'Citas', icon: <Calendar className="h-4 w-4" /> },
    { value: 'lab_results', label: 'Laboratorios', icon: <TestTube className="h-4 w-4" /> }
  ]
}: AdvancedSearchFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: { from: '', to: '' },
    entityType: 'all',
    status: '',
    specialty: '',
    location: '',
    urgency: 'all'
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      dateRange: { from: '', to: '' },
      entityType: 'all',
      status: '',
      specialty: '',
      location: '',
      urgency: 'all'
    };
    setFilters(clearedFilters);
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'object') {
      return Object.values(value).some(v => v !== '');
    }
    return value !== '' && value !== 'all';
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Búsqueda Principal */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              showAdvanced || hasActiveFilters
                ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {Object.values(filters).filter(value => {
                  if (typeof value === 'object') {
                    return Object.values(value).some(v => v !== '');
                  }
                  return value !== '' && value !== 'all';
                }).length}
              </span>
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros Avanzados */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo de Entidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar en
                </label>
                <select
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {entityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => 
                    handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => 
                    handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Especialidad */}
              {specialties.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad
                  </label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => handleFilterChange('specialty', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las especialidades</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ciudad, región..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Urgencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={filters.urgency}
                  onChange={(e) => handleFilterChange('urgency', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>

            {/* Resumen de filtros activos */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Filtros activos:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.query && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Búsqueda: &ldquo;{filters.query}&rdquo;
                    </span>
                  )}
                  {filters.entityType !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Tipo: {entityTypes.find(t => t.value === filters.entityType)?.label}
                    </span>
                  )}
                  {filters.dateRange.from && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Desde: {filters.dateRange.from}
                    </span>
                  )}
                  {filters.dateRange.to && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Hasta: {filters.dateRange.to}
                    </span>
                  )}
                  {filters.specialty && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Especialidad: {specialties.find(s => s.id === filters.specialty)?.name}
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Estado: {filters.status}
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ubicación: {filters.location}
                    </span>
                  )}
                  {filters.urgency !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Prioridad: {filters.urgency}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
