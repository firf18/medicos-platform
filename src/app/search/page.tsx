'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import SearchResultsList from '@/components/search/SearchResultsList';
import { useSearch } from '@/hooks/useSearch';
import { Search, TrendingUp, Clock, Users } from 'lucide-react';

export default function SearchPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Cardiología',
    'Consulta general',
    'Análisis de sangre',
    'Pediatría',
    'Ginecología',
    'Dermatología'
  ]);

  const {
    results,
    loading,
    error,
    search,
    clearSearch
  } = useSearch({
    debounceMs: 300,
    initialFilters: {
      query: initialQuery,
      entityType: initialType as any
    },
    autoSearch: false
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSpecialties();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      search({
        query: initialQuery,
        dateRange: { from: '', to: '' },
        entityType: initialType as any,
        status: '',
        specialty: '',
        location: '',
        urgency: 'all'
      });
    }
  }, [initialQuery, initialType]);

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (filters: any) => {
    search(filters);
    saveRecentSearch(filters.query);
  };

  const handleQuickSearch = (query: string) => {
    search({
      query,
      dateRange: { from: '', to: '' },
      entityType: 'all',
      status: '',
      specialty: '',
      location: '',
      urgency: 'all'
    });
    saveRecentSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Búsqueda Global</h1>
            <p className="mt-2 text-lg text-gray-600">
              Encuentra pacientes, médicos, citas y resultados en un solo lugar
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <AdvancedSearchForm
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={loading}
            specialties={specialties}
            placeholder="Buscar pacientes, médicos, citas, resultados..."
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Resultados o Sugerencias */}
          {results.length > 0 ? (
            <SearchResultsList
              results={results}
              loading={loading}
              groupByType={true}
              emptyMessage="No se encontraron resultados"
            />
          ) : !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Búsquedas Recientes */}
              {recentSearches.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Búsquedas Recientes
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((searchTerm, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(searchTerm)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Search className="h-4 w-4 inline mr-2 text-gray-400" />
                        {searchTerm}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Búsquedas Populares */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Búsquedas Populares
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {popularSearches.map((searchTerm, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(searchTerm)}
                      className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 inline mr-2 text-gray-400" />
                      {searchTerm}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Consejos de Búsqueda */}
          {!results.length && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                Consejos para búsquedas efectivas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Buscar pacientes:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Nombre completo o parcial</li>
                    <li>Correo electrónico</li>
                    <li>Número de teléfono</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Buscar médicos:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Nombre del doctor</li>
                    <li>Especialidad médica</li>
                    <li>Número de licencia</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Buscar citas:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Nombre del paciente</li>
                    <li>Motivo de consulta</li>
                    <li>Filtrar por fechas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Consejos generales:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Usa los filtros avanzados</li>
                    <li>Prueba sinónimos</li>
                    <li>Ajusta el rango de fechas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas rápidas */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Acceso rápido
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.user_metadata?.role === 'doctor' ? 'Mis Pacientes' : 'Mis Citas'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Search className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Búsquedas realizadas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {recentSearches.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Resultados encontrados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {results.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
