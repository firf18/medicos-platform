/**
 * Improved Specialty Selection Component - Platform Médicos Elite
 * 
 * Componente mejorado con scroll horizontal, categorías verticales y 40 especialidades
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Star,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle
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
// CONFIGURACIÓN DE CATEGORÍAS
// ============================================================================

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

interface ImprovedSpecialtySelectionProps {
  selectedSpecialty: SpecialtyConfig | null;
  onSpecialtySelect: (specialty: SpecialtyConfig) => void;
  isLoading?: boolean;
}

interface SpecialtyCardMiniProps {
  specialty: SpecialtyConfig;
  isSelected: boolean;
  onSelect: () => void;
}

// ============================================================================
// COMPONENTES
// ============================================================================

const SpecialtyCardMini: React.FC<SpecialtyCardMiniProps> = ({
  specialty,
  isSelected,
  onSelect
}) => {
  const IconComponent = specialty.icon;
  const colors = COLOR_CLASSES[specialty.color];

  if (specialty.isComingSoon) {
    return (
      <Card className={cn(
        "relative transition-all duration-300 cursor-not-allowed opacity-75 flex-shrink-0",
        "border-dashed border-2 border-gray-300 bg-gray-50 w-80 h-64"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-100">
              <IconComponent className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-600">{specialty.name}</CardTitle>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Q2 2025
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-4">
            {specialty.description}
          </CardDescription>
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-600 mb-3">
              Dashboard especializado en desarrollo
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              disabled
              className="cursor-not-allowed text-xs"
            >
              Próximamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative transition-all duration-300 cursor-pointer flex-shrink-0 w-80 h-64",
      colors.border,
      isSelected 
        ? `${colors.bg} border-2 shadow-lg scale-105` 
        : "hover:shadow-md border-2",
      colors.hover
    )}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={cn("rounded-full p-1", colors.bg)}>
            <CheckCircle className={cn("h-6 w-6", colors.icon)} />
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", colors.bg)}>
            <IconComponent className={cn("h-6 w-6", colors.icon)} />
          </div>
          <div className="flex-1">
            <CardTitle className={cn("text-lg", colors.text)}>
              {specialty.name}
            </CardTitle>
            {specialty.id === 'general_medicine' && (
              <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                <Star className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-sm mb-4">
          {specialty.description}
        </CardDescription>

        <div className="space-y-3">
          {/* Características disponibles */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Características:</p>
            <div className="flex flex-wrap gap-1">
              {specialty.id === 'general_medicine' ? (
                <>
                  <Badge variant="secondary" className="text-xs">25+ Herramientas</Badge>
                  <Badge variant="secondary" className="text-xs">IA Integrada</Badge>
                  <Badge variant="secondary" className="text-xs">Telemedicina</Badge>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-xs">Básicas</Badge>
                  <Badge variant="outline" className="text-xs">En desarrollo</Badge>
                </>
              )}
            </div>
          </div>

          {/* Botón de selección */}
          <Button
            onClick={onSelect}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full transition-all duration-200",
              isSelected && `${colors.bg} ${colors.text} border-transparent`
            )}
          >
            {isSelected ? "Seleccionada" : "Seleccionar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ImprovedSpecialtySelection: React.FC<ImprovedSpecialtySelectionProps> = ({
  selectedSpecialty,
  onSpecialtySelect,
  isLoading = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('primary_care');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Obtener especialidades de la categoría seleccionada
  const categorySpecialties = useMemo(() => {
    return Object.values(AVAILABLE_SPECIALTIES).filter(
      specialty => specialty.category === selectedCategory
    );
  }, [selectedCategory]);

  // Estadísticas de la categoría
  const categoryStats = useMemo(() => {
    const available = categorySpecialties.filter(s => !s.isComingSoon).length;
    const comingSoon = categorySpecialties.filter(s => s.isComingSoon).length;
    return { available, comingSoon, total: categorySpecialties.length };
  }, [categorySpecialties]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Selecciona tu Especialidad Médica
        </h2>
        <p className="text-gray-600 mb-4">
          Configura tu dashboard especializado con las mejores herramientas
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{SPECIALTY_STATS.available}</div>
            <div className="text-gray-500">Disponible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{SPECIALTY_STATS.comingSoon}</div>
            <div className="text-gray-500">Próximamente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{SPECIALTY_STATS.total}</div>
            <div className="text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Layout principal con categorías en sidebar */}
      <div className="flex gap-6">
        {/* Sidebar de categorías - VERTICAL */}
        <Card className="w-80 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Categorías</CardTitle>
            <CardDescription>
              Selecciona una categoría médica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              const colors = COLOR_CLASSES[category.color];
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-4 transition-all duration-200",
                    isActive ? `${colors.bg} ${colors.text}` : "hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      isActive ? colors.bg : "bg-gray-100"
                    )}>
                      <IconComponent className={cn(
                        "h-5 w-5",
                        isActive ? colors.icon : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs opacity-75">{category.count} especialidades</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Área principal de especialidades */}
        <div className="flex-1 space-y-4">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {categoryStats.available} disponibles, {categoryStats.comingSoon} próximamente
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Medicina General destacada - Solo en Atención Primaria */}
          {selectedCategory === 'primary_care' && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-blue-900">
                      ⭐ Medicina General - Disponible Ahora
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      Dashboard completo con 25+ características implementadas
                    </CardDescription>
                  </div>
                  {selectedSpecialty?.id !== 'general_medicine' && (
                    <Button 
                      onClick={() => {
                        const generalMedicine = AVAILABLE_SPECIALTIES['general_medicine'];
                        if (generalMedicine) onSpecialtySelect(generalMedicine);
                      }}
                      className="flex-shrink-0"
                    >
                      Seleccionar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Lista de especialidades con SCROLL HORIZONTAL */}
          <div className="relative">
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex space-x-4 pb-4">
                {categorySpecialties.map((specialty) => (
                  <SpecialtyCardMini
                    key={specialty.id}
                    specialty={specialty}
                    isSelected={selectedSpecialty?.id === specialty.id}
                    onSelect={() => !specialty.isComingSoon && onSpecialtySelect(specialty)}
                  />
                ))}
                {categorySpecialties.length === 0 && (
                  <div className="text-center py-12 w-full">
                    <p className="text-gray-500">No hay especialidades en esta categoría</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Especialidad seleccionada */}
      {selectedSpecialty && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-800">
              <div className="p-2 rounded-lg bg-green-100">
                <selectedSpecialty.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">
                  {selectedSpecialty.name} seleccionada
                </p>
                <p className="text-sm text-green-600">
                  {selectedSpecialty.isComingSoon 
                    ? 'Esta especialidad estará disponible próximamente'
                    : 'Dashboard completamente configurado y listo para usar'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedSpecialtySelection;
