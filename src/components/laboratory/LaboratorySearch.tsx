'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Loader2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Laboratory {
  id: string;
  name: string;
  legal_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  laboratory_type: string;
  specialties: string[];
  services: string[];
  status: string;
  is_active: boolean;
  created_at: string;
}

interface LaboratorySearchProps {
  onLaboratorySelect?: (laboratory: Laboratory) => void;
  showFilters?: boolean;
  limit?: number;
}

export function LaboratorySearch({ 
  onLaboratorySelect, 
  showFilters = true, 
  limit = 20 
}: LaboratorySearchProps) {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const LABORATORY_TYPES = [
    { value: 'clinical', label: 'Clínico' },
    { value: 'pathology', label: 'Patología' },
    { value: 'research', label: 'Investigación' },
    { value: 'reference', label: 'Referencia' },
    { value: 'specialized', label: 'Especializado' },
    { value: 'mobile', label: 'Móvil' },
  ];

  const VENEZUELAN_STATES = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
    'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
    'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
    'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  const searchLaboratories = async (page = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (searchQuery) params.append('query', searchQuery);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedState) params.append('state', selectedState);
      if (selectedType) params.append('laboratory_type', selectedType);

      const response = await fetch(`/api/laboratories?${params}`);
      const result = await response.json();

      if (result.success) {
        setLaboratories(result.laboratories);
        setTotalCount(result.total_count);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error searching laboratories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchLaboratories(0);
  }, []);

  const handleSearch = () => {
    searchLaboratories(0);
  };

  const handleFilterChange = () => {
    searchLaboratories(0);
  };

  const getLaboratoryTypeLabel = (type: string) => {
    return LABORATORY_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'approved' && isActive) {
      return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    } else if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Buscar Laboratorios
          </CardTitle>
          <CardDescription>
            Encuentre laboratorios médicos registrados en Venezuela
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre o razón social..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENEZUELAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    placeholder="Filtrar por ciudad..."
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Laboratorio</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      {LABORATORY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Apply Filters Button */}
            {showFilters && (
              <Button onClick={handleFilterChange} variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : laboratories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron laboratorios
              </h3>
              <p className="text-gray-600">
                Intente ajustar sus criterios de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {laboratories.length} de {totalCount} laboratorios
              </p>
            </div>

            {/* Laboratory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laboratories.map((laboratory) => (
                <Card 
                  key={laboratory.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onLaboratorySelect?.(laboratory)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {laboratory.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {laboratory.legal_name}
                        </CardDescription>
                      </div>
                      {getStatusBadge(laboratory.status, laboratory.is_active)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="line-clamp-1">
                        {laboratory.city}, {laboratory.state}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>{getLaboratoryTypeLabel(laboratory.laboratory_type)}</span>
                    </div>

                    {laboratory.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{laboratory.phone}</span>
                      </div>
                    )}

                    {laboratory.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{laboratory.email}</span>
                      </div>
                    )}

                    {laboratory.specialties && laboratory.specialties.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Especialidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {laboratory.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {laboratory.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{laboratory.specialties.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => searchLaboratories(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => searchLaboratories(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
