/**
 * Optimized Specialty Selection Component - Platform Médicos Elite
 * 
 * Componente optimizado con grid 8x3, navegación por botones y máximo aprovechamiento de pantalla
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight,
  Star,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle,
  Grid3X3,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { AVAILABLE_SPECIALTIES, getSpecialtiesByCategory, SPECIALTY_STATS } from './specialties';
import { SpecialtyConfig, CategoryInfo, COLOR_CLASSES } from './types';

// Iconos para categorías
import { 
  Stethoscope, 
  Activity, 
  Scissors, 
  Baby, 
  Eye, 
  Zap 
} from 'lucide-react';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const GRID_CONFIG = {
  ROWS: 8,
  COLS: 3,
  ITEMS_PER_PAGE: 24, // 8 rows × 3 cols = 24 especialidades por página
  CARD_HEIGHT: 'h-32', // Altura reducida para caber 8 filas
  CARD_WIDTH: 'w-full'
};

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'primary_care',
    name: 'Atención Primaria',
    description: 'Medicina general y cuidado primario',
    icon: Stethoscope,
    color: 'blue',
    count: getSpecialtiesByCategory('primary_care').length
  },
  {
    id: 'internal_medicine',
    name: 'Medicina Interna',
    description: 'Especialidades médicas internas',
    icon: Activity,
    color: 'green',
    count: getSpecialtiesByCategory('internal_medicine').length
  },
  {
    id: 'surgery',
    name: 'Especialidades Quirúrgicas',
    description: 'Cirugías y procedimientos',
    icon: Scissors,
    color: 'orange',
    count: getSpecialtiesByCategory('surgery').length
  },
  {
    id: 'pediatrics',
    name: 'Pediatría Especializada',
    description: 'Cuidado médico pediátrico',
    icon: Baby,
    color: 'pink',
    count: getSpecialtiesByCategory('pediatrics').length
  },
  {
    id: 'diagnostic',
    name: 'Especialidades Diagnósticas',
    description: 'Diagnóstico e imágenes',
    icon: Eye,
    color: 'purple',
    count: getSpecialtiesByCategory('diagnostic').length
  },
  {
    id: 'emergency',
    name: 'Medicina de Emergencias',
    description: 'Atención de urgencias',
    icon: Zap,
    color: 'red',
    count: getSpecialtiesByCategory('emergency').length
  }
];

// ============================================================================
// INTERFACES
// ============================================================================

interface OptimizedSpecialtySelectionProps {
  selectedSpecialty: SpecialtyConfig | null;
  onSpecialtySelect: (specialty: SpecialtyConfig) => void;
  isLoading?: boolean;
}

interface CompactSpecialtyCardProps {
  specialty: SpecialtyConfig;
  isSelected: boolean;
  onSelect: () => void;
}

// ============================================================================
// COMPONENTES
// ============================================================================

const CompactSpecialtyCard: React.FC<CompactSpecialtyCardProps> = ({
  specialty,
  isSelected,
  onSelect
}) => {
  const IconComponent = specialty.icon;
  const colors = COLOR_CLASSES[specialty.color];

  if (specialty.isComingSoon) {
    return (
      <Card className={cn(
        "relative transition-all duration-200 cursor-not-allowed opacity-75",
        "border-dashed border border-gray-300 bg-gray-50",
        GRID_CONFIG.CARD_HEIGHT,
        GRID_CONFIG.CARD_WIDTH
      )}>
        <CardContent className="p-3 h-full flex items-center">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0">
              <IconComponent className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-600 truncate">
                {specialty.name}
              </h4>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mt-1 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Q2 2025
              </Badge>
            </div>
            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="cursor-not-allowed text-xs h-7 px-2"
              >
                Próximamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative transition-all duration-200 cursor-pointer",
      GRID_CONFIG.CARD_HEIGHT,
      GRID_CONFIG.CARD_WIDTH,
      colors.border,
      isSelected 
        ? `${colors.bg} border-2 shadow-lg scale-[1.02]` 
        : "hover:shadow-md border",
      colors.hover
    )}>
      {isSelected && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className={cn("rounded-full p-1", colors.bg)}>
            <CheckCircle className={cn("h-4 w-4", colors.icon)} />
          </div>
        </div>
      )}

      <CardContent className="p-3 h-full flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className={cn("p-2 rounded-lg flex-shrink-0", colors.bg)}>
            <IconComponent className={cn("h-5 w-5", colors.icon)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn("font-medium text-sm truncate", colors.text)}>
              {specialty.name}
            </h4>
            {specialty.id === 'general_medicine' && (
              <Badge className="bg-green-100 text-green-800 border-green-200 mt-1 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            )}
            <p className="text-xs text-gray-500 truncate mt-1">
              {specialty.id === 'general_medicine' ? '25+ Herramientas' : 'En desarrollo'}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={onSelect}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-200 text-xs h-7 px-2",
                isSelected && `${colors.bg} ${colors.text} border-transparent`
              )}
            >
              {isSelected ? "✓" : "Seleccionar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const OptimizedSpecialtySelection: React.FC<OptimizedSpecialtySelectionProps> = ({
  selectedSpecialty,
  onSpecialtySelect,
  isLoading = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('primary_care');
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Obtener especialidades de la categoría seleccionada
  const categorySpecialties = useMemo(() => {
    return Object.values(AVAILABLE_SPECIALTIES).filter(
      specialty => specialty.category === selectedCategory
    );
  }, [selectedCategory]);

  // Calcular paginación
  const totalPages = Math.ceil(categorySpecialties.length / GRID_CONFIG.ITEMS_PER_PAGE);
  const currentSpecialties = useMemo(() => {
    const startIndex = currentPage * GRID_CONFIG.ITEMS_PER_PAGE;
    const endIndex = startIndex + GRID_CONFIG.ITEMS_PER_PAGE;
    return categorySpecialties.slice(startIndex, endIndex);
  }, [categorySpecialties, currentPage]);

  // Resetear página al cambiar categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };

  // Navegación
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Estadísticas de la categoría
  const categoryStats = useMemo(() => {
    const available = categorySpecialties.filter(s => !s.isComingSoon).length;
    const comingSoon = categorySpecialties.filter(s => s.isComingSoon).length;
    return { available, comingSoon, total: categorySpecialties.length };
  }, [categorySpecialties]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Stats compactas */}
      <div className="bg-white px-6 py-2 border-b">
        <div className="flex justify-center gap-8 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{SPECIALTY_STATS.available}</div>
            <div className="text-gray-500">Disponible</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{SPECIALTY_STATS.comingSoon}</div>
            <div className="text-gray-500">Próximamente</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">{SPECIALTY_STATS.total}</div>
            <div className="text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Layout principal - MÁXIMO APROVECHAMIENTO DE PANTALLA */}
      <div className="flex-1 flex px-6 py-4 gap-6">
        {/* Sidebar de categorías - MÁS COMPACTO */}
        <div className="w-64 flex-shrink-0">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categorías</CardTitle>
              <CardDescription className="text-xs">
                Selecciona una categoría médica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                const colors = COLOR_CLASSES[category.color];
                
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3 transition-all duration-200",
                      isActive ? `${colors.bg} ${colors.text}` : "hover:bg-gray-50"
                    )}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={cn(
                        "p-1.5 rounded-md flex-shrink-0",
                        isActive ? colors.bg : "bg-gray-100"
                      )}>
                        <IconComponent className={cn(
                          "h-4 w-4",
                          isActive ? colors.icon : "text-gray-600"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-xs">{category.name}</div>
                        <div className="text-xs opacity-75">{category.count} especialidades</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Área principal de especialidades - GRID 8x3 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-xs text-gray-600">
                {categoryStats.available} disponibles, {categoryStats.comingSoon} próximamente
              </p>
            </div>
            
            {/* Navegación por páginas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-xs text-gray-600 px-2">
                {currentPage + 1} de {totalPages || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Medicina General destacada - Solo en Atención Primaria y primera página */}
          {selectedCategory === 'primary_care' && currentPage === 0 && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">
                      ⭐ Medicina General - Disponible Ahora
                    </h4>
                    <p className="text-xs text-blue-700">
                      Dashboard completo con 25+ características implementadas
                    </p>
                  </div>
                  {selectedSpecialty?.id !== 'general_medicine' && (
                    <Button 
                      onClick={() => {
                        const generalMedicine = AVAILABLE_SPECIALTIES['general_medicine'];
                        if (generalMedicine) onSpecialtySelect(generalMedicine);
                      }}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      Seleccionar
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* GRID 8x3 DE ESPECIALIDADES */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-3 gap-3 h-full"
                 style={{ gridTemplateRows: 'repeat(8, 1fr)' }}>
              {currentSpecialties.map((specialty) => (
                <CompactSpecialtyCard
                  key={specialty.id}
                  specialty={specialty}
                  isSelected={selectedSpecialty?.id === specialty.id}
                  onSelect={() => !specialty.isComingSoon && onSpecialtySelect(specialty)}
                />
              ))}
              
              {/* Llenar espacios vacíos con cards placeholder */}
              {Array.from({ length: GRID_CONFIG.ITEMS_PER_PAGE - currentSpecialties.length }).map((_, index) => (
                <div key={`placeholder-${index}`} className={cn(
                  "border-2 border-dashed border-gray-200 rounded-lg",
                  GRID_CONFIG.CARD_HEIGHT,
                  "flex items-center justify-center"
                )}>
                  <p className="text-xs text-gray-400">Espacio disponible</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OptimizedSpecialtySelection;
